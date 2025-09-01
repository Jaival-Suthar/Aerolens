const API_URL = import.meta.env.VITE_BASE_URL;

// Fetch paginated clients
export const getClients = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_URL}/client`);
    if (!response.ok) throw new Error("Failed to fetch clients");
    return await response.json(); // { data: [...], pagination: {...} }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Create new client
export const createClient = async ({ name, address }) => {
  try {
    const response = await fetch(`${API_URL}/client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address }),
    });
    if (!response.ok) throw new Error("Failed to create client");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Update existing client
export const updateClient = async ({ id, name, address }) => {
  try {
    const response = await fetch(`${API_URL}/client`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, address }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Failed to update client: " + errorText);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Delete client by ID
export const deleteClient = async (id) => {
  try {
    const response = await fetch(`${API_URL}/client/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Failed to delete client: " + errorText);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
