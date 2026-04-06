/**
 * WhatsApp resume sharing — backend queue API (/whatsapp/*).
 * FE sends only candidateId, groupId, and optional customMessage (plain text, max 1024).
 * Never sends phone numbers; recipients are resolved server-side from the group.
 */

import type {
  QueueWhatsAppSendResumePayload,
  WhatsAppGroupsData,
} from "../types/resumeTypes";
import { ApiEnvelope } from "../types/whatsappTypes";
const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

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

/** GET /whatsapp/groups — active groups for the share dropdown. */
export async function getWhatsAppGroups(accessToken: string | null): Promise<WhatsAppGroupsData> {
  if (!accessToken) throw new Error("Access token is required");

  const res = await fetch(`${API_BASE_URL}/whatsapp/groups`, {
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
  if (!data || !Array.isArray(data.groups)) {
    return { groups: [] };
  }
  return { groups: data.groups };
}

/**
 * GET /whatsapp/candidates/:candidateId/share-preview — template body text ({{1}}–{{8}}) as the server will send.
 * Returns null if the route is missing or errors (caller should use client fallback).
 */
export async function getWhatsAppSharePreviewText(
  accessToken: string | null,
  candidateId: number
): Promise<string | null> {
  if (!accessToken) return null;

  const res = await fetch(`${API_BASE_URL}/whatsapp/candidates/${candidateId}/share-preview`, {
    method: "GET",
    headers: makeHeaders(accessToken),
    credentials: "include",
  });

  const body = (await readJson(res)) as ApiEnvelope<Record<string, unknown>> | null;

  if (!res.ok || !body || typeof body !== "object") {
    return null;
  }

  const env = body as ApiEnvelope<Record<string, unknown>>;
  if (env.success === false) return null;

  const data = env.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["body", "preview", "text", "candidateDetails", "templateBody"]) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return null;
}

export interface QueueWhatsAppSendResumeResponse {
  queued: boolean;
  /** Top-level API message for UI (e.g. toast detail). */
  message?: string;
}

/** POST /whatsapp/send-resume — queues template send; 200 + queued === true means accepted, not delivered yet. */
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

  const res = await fetch(`${API_BASE_URL}/whatsapp/send-resume`, {
    method: "POST",
    headers: makeHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(jsonBody),
  });

  const body = (await readJson(res)) as ApiEnvelope<{ queued?: boolean }> | null;

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

  const env = body as ApiEnvelope<{ queued?: boolean }>;
  if (env.success === false) {
    throw new Error(env.message || "Failed to queue WhatsApp share");
  }

  if (!env.data?.queued) {
    throw new Error(env.message || "WhatsApp share was not queued. Please try again.");
  }

  return {
    queued: true,
    message: typeof env.message === "string" ? env.message : undefined,
  };
}
