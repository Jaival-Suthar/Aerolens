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

// Create new client
export const createClient = async ({ name, address }) => {
  try {
    const response = await fetch(`${API_URL}/client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address }),
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Read error response text
      console.error("Create client failed:", response.status, errorBody);
      throw new Error(`Failed to create client: ${response.status} ${errorBody}`);
    }

    const json = await response.json();
    console.log("Create client succeeded:", json);
    return json;
  } catch (error) {
    console.error("Error in createClient:", error);
    throw error;
  }
};


// Update existing client
export const updateClient = async ({ id, name, address }) => {
  // Question every requirement
  if (!id || typeof id !== "number") {
    throw new Error("Client ID is required and must be a number for update");
  }
  if (!name && !address) {
    throw new Error("At least one of 'name' or 'address' must be provided for update");
  }
  // Simplify payload
  const body = {};
  if (name) body.name = name;
  if (address) body.address = address;

  const url = `${API_URL}/client/${id}`;
  console.log("PATCHing client with URL:", url, "Payload:", body);

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch {
        errorText = "Unknown error";
      }
      console.error("Update failed at physics level:", response.status, errorText);
      throw new Error(`Failed to update client: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("PATCH succeeded:", data);
    return data;
  } catch (error) {
    // No excuses
    console.error("Mission-critical failure in updateClient:", error);
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
