const API_URL: string = import.meta.env.VITE_BASE_URL;
import type { ClientType, ClientsApiResponse } from "../types/clientTypes";

// Helper to create headers with token if provided
const makeHeaders = (accessToken?: string) => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

// Add a new function to fetch ALL clients without pagination
export const getAllClients = async (
  accessToken: string | null
): Promise<ClientType[]> => {
  try {
    const response = await fetch(
      `${API_URL}/client?page=1&limit=10000`, // Fetch large limit to get all
      {
        credentials: "include",
        headers: makeHeaders(accessToken || undefined),
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch clients: ${response.status} ${await response.text()}`
      );
    }
    const json: ClientsApiResponse = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error in getAllClients:", error);
    throw error;
  }
};
// Fetch paginated clients
export const getClients = async (
  accessToken: string | null,
  page = 1,
  limit = 10
): Promise<ClientsApiResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/client?page=${page}&limit=${limit}`,
      {
        credentials: "include",
        headers: makeHeaders(accessToken || undefined),
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch clients: ${response.status} ${await response.text()}`
      );
    }
    const json: ClientsApiResponse = await response.json();
    return json;
  } catch (error) {
    console.error("Error in getClients:", error);
    throw error;
  }
};

// Create new client
export const createClient = async (
  accessToken: string | null,
  payload: { name: string; address: string }
): Promise<ClientType> => {
  const response = await fetch(`${API_URL}/client`, {
    method: "POST",
    headers: makeHeaders(accessToken || undefined),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json();
    throw errorJson; // 🔥 THIS IS THE KEY
  }

  return response.json();
};


// Update existing client
export const updateClient = async (
  accessToken: string | null,
  payload: { id: number; name?: string; address?: string }
): Promise<ClientType> => {
  const { id, name, address } = payload;

  if (!id || typeof id !== "number") {
    throw new Error("Client ID is required and must be a number for update");
  }
  if (!name && !address) {
    throw new Error("At least one of 'name' or 'address' must be provided for update");
  }

  const body: Partial<{ name: string; address: string }> = {};
  if (name) body.name = name;
  if (address) body.address = address;

  try {
    const url = `${API_URL}/client/${id}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: makeHeaders(accessToken || undefined),
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorJson = await response.json();
      throw errorJson;
    }

    const data: ClientType = await response.json();
    return data;
  } catch (error) {
    console.error("Error in updateClient:", error);
    throw error;
  }
};

// Delete client by ID
export const deleteClient = async (
  accessToken: string | null,
  id: number
): Promise<void> => {
  if (!id || typeof id !== "number") {
    throw new Error("Valid client ID is required for deletion");
  }
  try {
    const response = await fetch(`${API_URL}/client/${id}`, {
      method: "DELETE",
      headers: makeHeaders(accessToken || undefined),
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete client: ${errorText}`);
    }
  } catch (error) {
    console.error("Error in deleteClient:", error);
    throw error;
  }
};
