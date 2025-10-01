import { LookupApiResponse } from '../types/lookupTypes';

// ✅ Load backend URL from environment
const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;
console.log("✅ API_BASE_URL:", API_BASE_URL);

/**
 * ✅ Checks response status and returns parsed JSON or throws an error
 */
async function checkStatus(res: Response): Promise<LookupApiResponse> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP error! status: ${res.status}, body: ${errorText}`);
  }
  return res.json();
}

/**
 * ✅ Lookup Service — Handles all API calls related to Lookup
 */
export const lookupService = {
  /**
   * 🔹 Get all lookup entries (paginated)
   * @param page Current page number (default: 1)
   * @param limit Records per page (default: 10)
   */
  async getAll(page = 1, limit = 10): Promise<LookupApiResponse> {
    const url = `${API_BASE_URL}/lookup?page=${page}&limit=${limit}`;
    console.log("📡 GET:", url);

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    return checkStatus(res);
  },

  /**
   * 🔹 Get a single lookup entry by key
   * @param lookupKey The lookup key to retrieve
   */
  async getByKey(lookupKey: number): Promise<LookupApiResponse> {
    if (lookupKey <= 0) throw new Error('Invalid lookupKey provided');

    const url = `${API_BASE_URL}/lookup/${lookupKey}`;
    console.log("📡 GET BY KEY:", url);

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    return checkStatus(res);
  },

  /**
   * 🔹 Create a new lookup entry
   * @param payload Object containing tag and value
   */
  async create(payload: { tag: string; value: string }): Promise<LookupApiResponse> {
    if (!payload.tag?.trim() || !payload.value?.trim()) {
      throw new Error('Payload validation failed: tag and value are required');
    }

    const url = `${API_BASE_URL}/lookup`;
    console.log("📡 POST:", url, payload);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return checkStatus(res);
  },

  /**
   * 🔹 Delete a lookup entry by key
   * @param lookupKey ID of the lookup to delete
   */
  async delete(lookupKey: number): Promise<LookupApiResponse> {
    if (lookupKey <= 0) throw new Error('Invalid lookupKey provided');

    const url = `${API_BASE_URL}/lookup/${lookupKey}`;
    console.log("📡 DELETE:", url);

    const res = await fetch(url, { method: 'DELETE' });
    return checkStatus(res);
  },
};
