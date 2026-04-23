import { LookupApiResponse, LookupDeletedResponse } from "../types/lookupTypes";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

const makeHeaders = (accessToken?: string, isFormData = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

async function checkStatus(res: Response): Promise<LookupApiResponse> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const lookupService = {
  async getAll(accessToken: string): Promise<LookupApiResponse> {
    const url = `${API_BASE_URL}/lookup?page=1&limit=1000`;
    const res = await fetch(url, {
      method: "GET",
      headers: makeHeaders(accessToken),
    });
    return checkStatus(res);
  },

  async getByKey(accessToken: string, lookupKey: number): Promise<LookupApiResponse> {
    if (!lookupKey || lookupKey <= 0) {
      throw new Error("Invalid lookupKey provided");
    }
    const url = `${API_BASE_URL}/lookup/${lookupKey}`;
    const res = await fetch(url, {
      method: "GET",
      headers: makeHeaders(accessToken),
    });
    return checkStatus(res);
  },

  async create(
    accessToken: string,
    payload: { tag: string; value: string }
  ): Promise<LookupApiResponse> {
    if (!payload?.tag?.trim() || !payload?.value?.trim()) {
      throw new Error("Payload validation failed: tag and value are required");
    }
    const url = `${API_BASE_URL}/lookup`;
    const res = await fetch(url, {
      method: "POST",
      headers: makeHeaders(accessToken),
      body: JSON.stringify(payload),
    });
    return checkStatus(res);
  },

  async patch(
    accessToken: string,
    lookupKey: number,
    payload: { value: string }
  ): Promise<LookupApiResponse> {
    if (!lookupKey || lookupKey <= 0) {
      throw new Error("Invalid lookupKey provided");
    }
    if (!payload?.value?.trim()) {
      throw new Error("Payload validation failed: value is required for patch");
    }
    const url = `${API_BASE_URL}/lookup/${lookupKey}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: makeHeaders(accessToken),
      body: JSON.stringify(payload),
    });
    return checkStatus(res);
  },

  async delete(accessToken: string, lookupKey: number): Promise<LookupApiResponse> {
    if (!lookupKey || lookupKey <= 0) {
      throw new Error("Invalid lookupKey provided");
    }
    const url = `${API_BASE_URL}/lookup/${lookupKey}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: makeHeaders(accessToken),
    });
    return checkStatus(res);
  },

  async getDeleted(accessToken: string): Promise<LookupDeletedResponse> {
    const url = `${API_BASE_URL}/lookup/deletions`;
    const res = await fetch(url, {
      method: "GET",
      headers: makeHeaders(accessToken),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    return res.json();
  },
};
