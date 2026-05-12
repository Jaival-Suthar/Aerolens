/**
 * Offer module API service.
 * Endpoints: GET /offers, POST /offers/:candidateId, GET /offers/form-data
 */

import type {
  OfferTableRow,
  CreateOfferPayload,
  OfferFormDataResponse,
  OfferActionResponse,
  TerminateOfferPayload,
  ReviseOfferPayload,
  UpdateOfferStatusPayload,
  OfferDetailsPayload,
  ActiveOfferData,
} from "../types/offerTypes";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

function makeHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  return headers;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers);
  if (accessToken && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(url, { ...options, headers, credentials: "include" });
  if (!res.ok) {
    let err: unknown;
    try { err = await res.json(); } catch { err = { message: res.statusText }; }
    throw err;
  }
  if (res.status === 204) return {} as T;
  const data = await res.json();
  return (data.data ?? data) as T;
}

/** GET /offers — list for Offer table (Onboarding page). */
export async function getOffers(accessToken: string | null): Promise<OfferTableRow[]> {
  const data = await apiFetch<OfferTableRow[] | { offers?: OfferTableRow[] }>("/offers", { method: "GET" }, accessToken ?? undefined);
  if (Array.isArray(data)) return data;
  return (data as { offers?: OfferTableRow[] }).offers ?? [];
}

/** POST /offers/:candidateId — create offer (Initiate Onboarding Save). */
export async function createOffer(
  accessToken: string | null,
  candidateId: number,
  payload: CreateOfferPayload
): Promise<unknown> {
  return apiFetch(`/offers/${candidateId}`, { method: "POST", body: JSON.stringify(payload) }, accessToken ?? undefined);
}

/** PATCH /offers/:offerId — update existing offer fields (sync form data before document generation). */
export async function updateOffer(
  accessToken: string | null,
  offerId: number,
  payload: Partial<CreateOfferPayload>
): Promise<unknown> {
  return apiFetch(`/offers/${offerId}`, { method: "PATCH", body: JSON.stringify(payload) }, accessToken ?? undefined);
}

/** GET /offers/form-data — lookup data for Initiate Onboarding form. */
export async function getOfferFormData(accessToken: string | null): Promise<OfferFormDataResponse> {
  return apiFetch<OfferFormDataResponse>("/offers/form-data", { method: "GET" }, accessToken ?? undefined);
}

/** GET /offers/by-candidate/:candidateId — returns the active (PENDING) offer with doc info, or null. */
export async function getActiveOfferForCandidate(
  candidateId: number,
  accessToken: string | null
): Promise<ActiveOfferData | null> {
  return apiFetch<ActiveOfferData | null>(
    `/offers/by-candidate/${candidateId}`,
    { method: "GET" },
    accessToken ?? undefined
  );
}

/** GET /offers/:offerId/details — full offer + revision history for view dialog. */
export async function getOfferDetails(offerId: number, accessToken: string | null): Promise<OfferDetailsPayload> {
  return apiFetch<OfferDetailsPayload>(`/offers/${offerId}/details`, { method: "GET" }, accessToken ?? undefined);
}

/** DELETE /offers/:offerId — soft delete. */
export async function deleteOffer(offerId: number, accessToken: string | null): Promise<OfferActionResponse> {
  const raw = await apiFetch<OfferActionResponse | { data?: OfferActionResponse }>(
    `/offers/${offerId}`,
    { method: "DELETE" },
    accessToken ?? undefined
  );
  return (raw as { data?: OfferActionResponse }).data ?? (raw as OfferActionResponse);
}

/** POST /offers/:offerId/terminate */
export async function terminateOffer(
  offerId: number,
  payload: TerminateOfferPayload,
  accessToken: string | null
): Promise<OfferActionResponse> {
  const raw = await apiFetch<OfferActionResponse | { data?: OfferActionResponse }>(
    `/offers/${offerId}/terminate`,
    { method: "POST", body: JSON.stringify(payload) },
    accessToken ?? undefined
  );
  return (raw as { data?: OfferActionResponse }).data ?? (raw as OfferActionResponse);
}

/** POST /offers/:offerId/revise */
export async function reviseOffer(
  offerId: number,
  payload: ReviseOfferPayload,
  accessToken: string | null
): Promise<OfferActionResponse> {
  const raw = await apiFetch<OfferActionResponse | { data?: OfferActionResponse }>(
    `/offers/${offerId}/revise`,
    { method: "POST", body: JSON.stringify(payload) },
    accessToken ?? undefined
  );
  return (raw as { data?: OfferActionResponse }).data ?? (raw as OfferActionResponse);
}

/** POST /offers/:offerId/status */
export async function updateOfferStatus(
  offerId: number,
  payload: UpdateOfferStatusPayload,
  accessToken: string | null
): Promise<OfferActionResponse> {
  const raw = await apiFetch<OfferActionResponse | { data?: OfferActionResponse }>(
    `/offers/${offerId}/status`,
    { method: "POST", body: JSON.stringify(payload) },
    accessToken ?? undefined
  );
  return (raw as { data?: OfferActionResponse }).data ?? (raw as OfferActionResponse);
}

/** GET /offers/deletions — soft-deleted offers. */
export async function getDeletedOffers(
  accessToken: string | null
): Promise<import("../types/offerTypes").OfferDeletedResponse> {
  const url = `${API_BASE_URL}/offers/deletions`;
  const res = await fetch(url, {
    method: "GET",
    headers: makeHeaders(accessToken ?? undefined),
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch deleted offers");
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch deleted offers");
  return data;
}

/** POST /offers/:offerId/document — generate (or return existing) document. */
export async function generateOnboardingDocument(
  offerId: number,
  accessToken: string | null,
  signal?: AbortSignal
): Promise<import("../../Resume/types/resumeTypes").OnboardingDocument> {
  return apiFetch(
    `/offers/${offerId}/document`,
    { method: "POST", signal },
    accessToken ?? undefined
  );
}

type ContractorAttachments = {
  professionalPhoto: File | null;
  aadhaarFront: File | null;
  aadhaarBack: File | null;
  panCard: File | null;
};

function buildAttachmentFormData(attachments: ContractorAttachments): FormData {
  const fd = new FormData();
  if (attachments.professionalPhoto) fd.append("professionalPhoto", attachments.professionalPhoto);
  if (attachments.aadhaarFront)      fd.append("aadhaarFront",      attachments.aadhaarFront);
  if (attachments.aadhaarBack)       fd.append("aadhaarBack",        attachments.aadhaarBack);
  if (attachments.panCard)           fd.append("panCard",            attachments.panCard);
  return fd;
}

async function fetchWithAttachments<T>(
  url: string,
  attachments: ContractorAttachments,
  accessToken: string | null,
  signal?: AbortSignal
): Promise<T> {
  const fd = buildAttachmentFormData(attachments);
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    headers,
    body: fd,
    credentials: "include",
    signal,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Request failed");
  return data.data;
}

/** POST /offers/:offerId/document/with-attachments — contractor generate with images. */
export async function generateWithAttachments(
  offerId: number,
  accessToken: string | null,
  attachments: ContractorAttachments,
  signal?: AbortSignal
): Promise<import("../../Resume/types/resumeTypes").OnboardingDocument> {
  return fetchWithAttachments(`/offers/${offerId}/document/with-attachments`, attachments, accessToken, signal);
}

/** POST /offers/:offerId/document/regenerate-with-attachments — contractor regenerate with images. */
export async function regenerateWithAttachments(
  offerId: number,
  accessToken: string | null,
  attachments: ContractorAttachments
): Promise<import("../../Resume/types/resumeTypes").OnboardingDocument> {
  return fetchWithAttachments(`/offers/${offerId}/document/regenerate-with-attachments`, attachments, accessToken);
}

/** POST /offers/:offerId/document/regenerate — force regenerate. */
export async function regenerateOnboardingDocument(
  offerId: number,
  accessToken: string | null
): Promise<import("../../Resume/types/resumeTypes").OnboardingDocument> {
  return apiFetch(
    `/offers/${offerId}/document/regenerate`,
    { method: "POST" },
    accessToken ?? undefined
  );
}

/** GET /offers/:offerId/document — retrieve existing doc info (null if none). */
export async function getOnboardingDocument(
  offerId: number,
  accessToken: string | null
): Promise<import("../../Resume/types/resumeTypes").OnboardingDocument | null> {
  return apiFetch(
    `/offers/${offerId}/document`,
    { method: "GET" },
    accessToken ?? undefined
  );
}

/** GET /offers/:offerId/document/download — fetch Blob for download / preview. */
export async function downloadOnboardingDocument(
  offerId: number,
  accessToken: string | null
): Promise<Blob> {
  const url = `${API_BASE_URL}/offers/${offerId}/document/download`;
  const res = await fetch(url, {
    headers: makeHeaders(accessToken ?? undefined),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to download document");
  return res.blob();
}

export async function restoreOffer(
  accessToken: string | null,
  offerId: number
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/offers/${offerId}/restore`, {
    method: "PATCH",
    headers: makeHeaders(accessToken ?? undefined),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to restore offer");
  return data;
}
