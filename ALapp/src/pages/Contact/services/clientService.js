const API_URL = import.meta.env.VITE_BASE_URL;

// Fetch paginated clients
export const getClients = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_URL}/client?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch clients");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};