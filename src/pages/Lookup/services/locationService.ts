import { LocationApiResponse } from "../types/locationTypes";

const API_BASE_URL: string = import.meta.env.VITE_PREPROD_URL;

/**
 * Common headers generator
 */
const makeHeaders = (accessToken?: string, isFormData = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

/**
 * Common response handler
 */
async function checkStatus(res: Response): Promise<LocationApiResponse> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

/**
 * Location API Service
 */
export const locationService = {
  /**
   * Get all locations
   */
  async getAll(accessToken: string): Promise<LocationApiResponse> {
    const url = `${API_BASE_URL}/location`;
    const res = await fetch(url, {
      method: "GET",
      headers: makeHeaders(accessToken),
    });
    return checkStatus(res);
  },

  /**
   * Get location by ID
   */
  async getById(accessToken: string, locationId: number): Promise<LocationApiResponse> {
    if (!locationId || locationId <= 0) {
      throw new Error("Invalid locationId provided");
    }

    const url = `${API_BASE_URL}/location/${locationId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: makeHeaders(accessToken),
    });
    return checkStatus(res);
  },

  /**
   * Create a new location
   */
  async create(
    accessToken: string,
    payload: { city: string; country: string; state?: string }
  ): Promise<LocationApiResponse> {
    if (!payload.city?.trim() || !payload.country?.trim()) {
      throw new Error("Validation failed: city & country are required");
    }

    const url = `${API_BASE_URL}/location`;
    const res = await fetch(url, {
      method: "POST",
      headers: makeHeaders(accessToken),
      body: JSON.stringify(payload),
    });
    return checkStatus(res);
  },

  /**
   * Update (PATCH) a location
   */
  async patch(
    accessToken: string,
    locationId: number,
    payload: Partial<{ city: string; country: string; state: string }>
  ): Promise<LocationApiResponse> {
    if (!locationId || locationId <= 0) {
      throw new Error("Invalid locationId provided");
    }

    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("At least one field must be provided for update");
    }

    const url = `${API_BASE_URL}/location/${locationId}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: makeHeaders(accessToken),
      body: JSON.stringify(payload),
    });
    return checkStatus(res);
  },

  /**
   * Delete location
   */
  async delete(accessToken: string, locationId: number): Promise<LocationApiResponse> {
    if (!locationId || locationId <= 0) {
      throw new Error("Invalid locationId provided");
    }

    const url = `${API_BASE_URL}/location/${locationId}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: makeHeaders(accessToken),
    });
    return checkStatus(res);
  },
};
