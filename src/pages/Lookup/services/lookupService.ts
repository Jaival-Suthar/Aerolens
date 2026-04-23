import { LookupApiResponse } from "../types/lookupTypes";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

/**
 * ✅ Build headers safely for both JSON and FormData requests
 */
const makeHeaders = (accessToken?: string, isFormData = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

/**
 * ✅ Common response handler
 */
async function checkStatus(res: Response): Promise<LookupApiResponse> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

/**
 * 🔹 Lookup API Service
 */
export const lookupService = {
  /**
   * Get all lookups with pagination
   */
  async getAll(accessToken: string): Promise<LookupApiResponse> {
    const url = `${API_BASE_URL}/lookup?page=1&limit=1000`; // ← Fetch all
    const res = await fetch(url, {
      method: "GET",
      headers: makeHeaders(accessToken),
    });
    return checkStatus(res);
  },
  // async getAll(accessToken: string, page = 1, limit = 10): Promise<LookupApiResponse> {
  //   const url = `${API_BASE_URL}/lookup?page=${page}&limit=${limit}`;
  //   const res = await fetch(url, {
  //     method: "GET",
  //     headers: makeHeaders(accessToken),
  //     // ❌ no credentials: 'include' — prevents cookie-based reauth conflicts
  //   });
  //   return checkStatus(res);
  // },

  /**
   * Get a single lookup by key
   */
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

  /**
   * Create a new lookup entry
   */
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

  /**
   * Update an existing lookup entry
   */
  // ... (rest of the file remains the same)

  /**
   * Update an existing lookup entry (PATCH - partial update)
   */
  async patch(
    accessToken: string,
    lookupKey: number,
    payload: { value: string } // Only value is required for partial update
  ): Promise<LookupApiResponse> {
    if (!lookupKey || lookupKey <= 0) {
      throw new Error("Invalid lookupKey provided");
    }
    if (!payload?.value?.trim()) {
      throw new Error("Payload validation failed: value is required for patch");
    }

    const url = `${API_BASE_URL}/lookup/${lookupKey}`;
    const res = await fetch(url, {
      method: "PATCH", // <--- CHANGE: Use PATCH method
      headers: makeHeaders(accessToken),
      body: JSON.stringify(payload),
    });
    return checkStatus(res);
  },

  /**
   * Delete a lookup entry
   */
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
};
