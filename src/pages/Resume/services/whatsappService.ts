/**
 * WhatsApp resume sharing — ATS backend contract (app.use('/whatsapp', whatsappRoutes)).
 *
 * Supported routes (source of truth):
 *   GET  {BASE}/whatsapp/groups
 *   POST {BASE}/whatsapp/send-resume  body: { candidateId, groupId, customMessage? | message? }
 *   GET  {BASE}/whatsapp/shares/:queueId — queue row + message log rows (poll after send-resume)
 *
 * FE sends only candidateId, groupId, and optional note as customMessage (plain text, max 1024).
 * Never send phone numbers — recipients are resolved server-side from groupId.
 *
 * If WhatsApp routes live on a different origin/path than the rest of the API, set
 * VITE_WHATSAPP_API_BASE_URL (e.g. same host but different prefix). Otherwise VITE_BASE_URL is used.
 */

import type {
  QueueWhatsAppSendResumePayload,
  WhatsAppGroup,
  WhatsAppGroupsData,
} from "../types/resumeTypes";
import { ApiEnvelope } from "../types/whatsappTypes";

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

function whatsappApiOrigin(): string {
  const dedicated = import.meta.env.VITE_WHATSAPP_API_BASE_URL?.trim();
  const base = (dedicated || import.meta.env.VITE_BASE_URL || "").trim();
  return trimTrailingSlashes(base);
}

/** Absolute URL for a path that must start with `/`. */
function whatsappUrl(path: string): string {
  const origin = whatsappApiOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

function makeHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  return headers;
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Normalize one group row from API (handles groupId vs id vs snake_case). */
function normalizeWhatsAppGroup(raw: unknown): WhatsAppGroup | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = o.groupId ?? o.group_id ?? o.id;
  const groupId = typeof id === "number" ? id : Number(id);
  if (!Number.isFinite(groupId)) return null;
  const name = o.groupName ?? o.group_name;
  const groupName =
    typeof name === "string" && name.trim() ? name.trim() : `Group ${groupId}`;
  return { groupId, groupName };
}

function parseQueued(data: unknown): boolean {
  if (data === true) return true;
  if (data && typeof data === "object" && "queued" in data) {
    const q = (data as { queued: unknown }).queued;
    return q === true || q === "true";
  }
  return false;
}

function parseQueueId(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const id = o.queueId ?? o.queue_id;
  const n = typeof id === "number" ? id : Number(id);
  return Number.isFinite(n) ? n : null;
}

export interface WhatsAppQueueRow {
  id: number;
  candidateId: number;
  groupId: number;
  status: string;
  retryCount: number;
  createdAt: string;
  processedAt: string | null;
}

export interface WhatsAppMessageLogRow {
  messageLogId: number;
  candidateId: number;
  groupId: number;
  memberId: number;
  phoneNumber: string;
  messageStatus: string;
  metaMessageId: string | null;
  errorMessage: string | null;
  sentAt: string;
  deliveredAt: string | null;
}

export interface WhatsAppShareLogData {
  queue: WhatsAppQueueRow;
  messages: WhatsAppMessageLogRow[];
}

function readString(v: unknown): string {
  return typeof v === "string" ? v : v != null ? String(v) : "";
}

function readNullableString(v: unknown): string | null {
  if (v == null) return null;
  const s = typeof v === "string" ? v : String(v);
  return s;
}

function readFiniteNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  return NaN;
}

function normalizeQueueRow(raw: unknown): WhatsAppQueueRow | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = readFiniteNumber(o.id ?? o.queueId ?? o.queue_id);
  const candidateId = readFiniteNumber(o.candidateId ?? o.candidate_id);
  const groupId = readFiniteNumber(o.groupId ?? o.group_id);
  if (!Number.isFinite(id) || !Number.isFinite(candidateId) || !Number.isFinite(groupId)) return null;
  const retryCount = readFiniteNumber(o.retryCount ?? o.retry_count);
  return {
    id,
    candidateId,
    groupId,
    status: readString(o.status),
    retryCount: Number.isFinite(retryCount) ? retryCount : 0,
    createdAt: readString(o.createdAt ?? o.created_at),
    processedAt: readNullableString(o.processedAt ?? o.processed_at),
  };
}

function normalizeMessageLogRow(raw: unknown): WhatsAppMessageLogRow | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const messageLogId = readFiniteNumber(o.messageLogId ?? o.message_log_id ?? o.id);
  const candidateId = readFiniteNumber(o.candidateId ?? o.candidate_id);
  const groupId = readFiniteNumber(o.groupId ?? o.group_id);
  const memberId = readFiniteNumber(o.memberId ?? o.member_id);
  if (
    !Number.isFinite(messageLogId) ||
    !Number.isFinite(candidateId) ||
    !Number.isFinite(groupId) ||
    !Number.isFinite(memberId)
  ) {
    return null;
  }
  return {
    messageLogId,
    candidateId,
    groupId,
    memberId,
    phoneNumber: readString(o.phoneNumber ?? o.phone_number),
    messageStatus: readString(o.messageStatus ?? o.message_status),
    metaMessageId: readNullableString(o.metaMessageId ?? o.meta_message_id),
    errorMessage: readNullableString(o.errorMessage ?? o.error_message),
    sentAt: readString(o.sentAt ?? o.sent_at),
    deliveredAt: readNullableString(o.deliveredAt ?? o.delivered_at),
  };
}

/** GET /whatsapp/groups — active groups for the share dropdown. */
export async function getWhatsAppGroups(accessToken: string | null): Promise<WhatsAppGroupsData> {
  if (!accessToken) throw new Error("Access token is required");

  const res = await fetch(whatsappUrl("/whatsapp/groups"), {
    method: "GET",
    headers: makeHeaders(accessToken),
    credentials: "include",
  });

  const body = (await readJson(res)) as ApiEnvelope<WhatsAppGroupsData> | null;

  if (!res.ok) {
    const msg =
      body && typeof body === "object" && typeof (body as ApiEnvelope<unknown>).message === "string"
        ? (body as ApiEnvelope<unknown>).message
        : res.statusText;
    throw new Error(msg || "Failed to load WhatsApp groups");
  }

  if (!body || typeof body !== "object") {
    throw new Error("Invalid response from server");
  }

  const env = body as ApiEnvelope<WhatsAppGroupsData>;
  if (env.success === false) {
    throw new Error(env.message || "Failed to load WhatsApp groups");
  }

  const data = env.data ?? (body as unknown as WhatsAppGroupsData);
  const rawList: unknown[] = data && Array.isArray(data.groups) ? data.groups : [];
  const groups = rawList.map(normalizeWhatsAppGroup).filter((g): g is WhatsAppGroup => g != null);

  return { groups };
}

export interface QueueWhatsAppSendResumeResponse {
  queued: boolean;
  /** From data.queueId — use with GET /whatsapp/shares/:queueId */
  queueId: number | null;
  /** Top-level API message for UI (e.g. toast detail). */
  message?: string;
}

/** POST /whatsapp/send-resume — queues template send; 200 + data.queued === true means accepted, not delivered. */
export async function queueWhatsAppSendResume(
  accessToken: string | null,
  payload: QueueWhatsAppSendResumePayload
): Promise<QueueWhatsAppSendResumeResponse> {
  if (!accessToken) throw new Error("Access token is required");

  const jsonBody: Record<string, unknown> = {
    candidateId: payload.candidateId,
    groupId: payload.groupId,
  };
  const note = payload.customMessage?.trim();
  if (note) jsonBody.customMessage = note;

  const res = await fetch(whatsappUrl("/whatsapp/send-resume"), {
    method: "POST",
    headers: makeHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(jsonBody),
  });

  const body = (await readJson(res)) as ApiEnvelope<unknown> | null;

  if (!res.ok) {
    const msg =
      body && typeof body === "object" && typeof (body as ApiEnvelope<unknown>).message === "string"
        ? (body as ApiEnvelope<unknown>).message
        : res.statusText;
    throw new Error(msg || "Failed to queue WhatsApp share");
  }

  if (!body || typeof body !== "object") {
    throw new Error("Invalid response from server");
  }

  const env = body as ApiEnvelope<unknown>;
  if (env.success === false) {
    throw new Error(env.message || "Failed to queue WhatsApp share");
  }

  if (!parseQueued(env.data)) {
    throw new Error(env.message || "WhatsApp share was not queued. Please try again.");
  }

  return {
    queued: true,
    queueId: parseQueueId(env.data),
    message: typeof env.message === "string" ? env.message : undefined,
  };
}

/** GET /whatsapp/shares/:queueId — poll until queue.status is DONE or FAILED. */
export async function getWhatsAppShareLog(
  accessToken: string | null,
  queueId: number
): Promise<WhatsAppShareLogData> {
  if (!accessToken) throw new Error("Access token is required");

  const res = await fetch(whatsappUrl(`/whatsapp/shares/${queueId}`), {
    method: "GET",
    headers: makeHeaders(accessToken),
    credentials: "include",
  });

  const body = (await readJson(res)) as ApiEnvelope<Record<string, unknown>> | null;

  if (!res.ok) {
    const msg =
      body && typeof body === "object" && typeof (body as ApiEnvelope<unknown>).message === "string"
        ? (body as ApiEnvelope<unknown>).message
        : res.statusText;
    throw new Error(msg || "Failed to load WhatsApp share log");
  }

  if (!body || typeof body !== "object") {
    throw new Error("Invalid response from server");
  }

  const env = body as ApiEnvelope<Record<string, unknown>>;
  if (env.success === false) {
    throw new Error(env.message || "Failed to load WhatsApp share log");
  }

  const data = env.data;
  if (!data || typeof data !== "object") {
    throw new Error("Invalid share log payload");
  }

  const d = data as Record<string, unknown>;
  const queue = normalizeQueueRow(d.queue);
  if (!queue) {
    throw new Error("Invalid queue row in share log response");
  }

  const rawMessages = d.messages;
  const messages: WhatsAppMessageLogRow[] = Array.isArray(rawMessages)
    ? rawMessages.map(normalizeMessageLogRow).filter((m): m is WhatsAppMessageLogRow => m != null)
    : [];

  return { queue, messages };
}
