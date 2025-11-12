const API_URL = import.meta.env.VITE_BASE_URL;
// Helper to create headers with token if provided
const makeHeaders = (accessToken) => {
    const headers = { "Content-Type": "application/json" };
    if (accessToken)
        headers["Authorization"] = `Bearer ${accessToken}`;
    return headers;
};
// Fetch paginated clients
export const getClients = async (accessToken, page = 1, limit = 10) => {
    try {
        const response = await fetch(`${API_URL}/client?page=${page}&limit=${limit}`, {
            credentials: "include",
            headers: makeHeaders(accessToken || undefined),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch clients: ${response.status} ${await response.text()}`);
        }
        const json = await response.json();
        return json;
    }
    catch (error) {
        console.error("Error in getClients:", error);
        throw error;
    }
};
// Create new client
export const createClient = async (accessToken, payload) => {
    try {
        if (!payload.name || !payload.address) {
            throw new Error("Name and address are required to create a client");
        }
        const response = await fetch(`${API_URL}/client`, {
            method: "POST",
            headers: makeHeaders(accessToken || undefined),
            credentials: "include",
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to create client: ${response.status} ${errorBody}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error in createClient:", error);
        throw error;
    }
};
// Update existing client
export const updateClient = async (accessToken, payload) => {
    const { id, name, address } = payload;
    if (!id || typeof id !== "number") {
        throw new Error("Client ID is required and must be a number for update");
    }
    if (!name && !address) {
        throw new Error("At least one of 'name' or 'address' must be provided for update");
    }
    const body = {};
    if (name)
        body.name = name;
    if (address)
        body.address = address;
    try {
        const url = `${API_URL}/client/${id}`;
        const response = await fetch(url, {
            method: "PATCH",
            headers: makeHeaders(accessToken || undefined),
            credentials: "include",
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error");
            throw new Error(`Failed to update client: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error in updateClient:", error);
        throw error;
    }
};
// Delete client by ID
export const deleteClient = async (accessToken, id) => {
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
    }
    catch (error) {
        console.error("Error in deleteClient:", error);
        throw error;
    }
};
