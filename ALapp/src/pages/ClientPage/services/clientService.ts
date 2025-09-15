const API_URL: string = import.meta.env.VITE_BASE_URL;
import type { ClientType, ClientsApiResponse } from "../types/clientTypes";

// Fetch paginated clients
export const getClients = async (
  page = 1,
  limit = 10
): Promise<ClientsApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/client?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.status} ${await response.text()}`);
    }

    const json: ClientsApiResponse = await response.json();
    return json;
  } catch (error) {
    console.error("Error in getClients:", error);
    throw error;
  }
};

// Create new client
export const createClient = async (payload: {
  name: string;
  address: string;
}): Promise<ClientType> => {
  try {
    if (!payload.name || !payload.address) {
      throw new Error("Name and address are required to create a client");
    }

    const response = await fetch(`${API_URL}/client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to create client: ${response.status} ${errorBody}`);
    }

    const data: ClientType = await response.json();
    return data;
  } catch (error) {
    console.error("Error in createClient:", error);
    throw error;
  }
};

// Update existing client
export const updateClient = async (payload: {
  id: number;
  name?: string;
  address?: string;
}): Promise<ClientType> => {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Failed to update client: ${response.status} ${errorText}`);
    }

    const data: ClientType = await response.json();
    return data;
  } catch (error) {
    console.error("Error in updateClient:", error);
    throw error;
  }
};

// Delete client by ID
export const deleteClient = async (id: number): Promise<void> => {
  if (!id || typeof id !== "number") {
    throw new Error("Valid client ID is required for deletion");
  }
  try {
    const response = await fetch(`${API_URL}/client/${id}`, {
      method: "DELETE",
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
