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

/** GET /offers/form-data — lookup data for Initiate Onboarding form. */
export async function getOfferFormData(accessToken: string | null): Promise<OfferFormDataResponse> {
  return apiFetch<OfferFormDataResponse>("/offers/form-data", { method: "GET" }, accessToken ?? undefined);
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
