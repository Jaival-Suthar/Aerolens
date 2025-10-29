import { LookupApiResponse } from '../types/lookupTypes';

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

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

export const lookupService = {
  /**
   * 🔹 Get all lookups with pagination
   */
  async getAll(accessToken: string, page = 1, limit = 10): Promise<LookupApiResponse> {
    const url = `${API_BASE_URL}/lookup?page=${page}&limit=${limit}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    return checkStatus(res);
  },

  /**
   * 🔹 Get a single lookup entry by key
   */
  async getByKey(accessToken: string, lookupKey: number): Promise<LookupApiResponse> {
    if (lookupKey <= 0) throw new Error('Invalid lookupKey provided');

    const url = `${API_BASE_URL}/lookup/${lookupKey}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    return checkStatus(res);
  },

  /**
   * 🔹 Create a new lookup entry
   */
  async create(accessToken: string, payload: { tag: string; value: string }): Promise<LookupApiResponse> {
    if (!payload.tag?.trim() || !payload.value?.trim()) {
      throw new Error('Payload validation failed: tag and value are required');
    }

    const url = `${API_BASE_URL}/lookup`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    return checkStatus(res);
  },

  /**
   * 🔹 Delete a lookup entry by key
   */
  async delete(accessToken: string, lookupKey: number): Promise<LookupApiResponse> {
    if (lookupKey <= 0) throw new Error('Invalid lookupKey provided');

    const url = `${API_BASE_URL}/lookup/${lookupKey}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    return checkStatus(res);
  },
};
