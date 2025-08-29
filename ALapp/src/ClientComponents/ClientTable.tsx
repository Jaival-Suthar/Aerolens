import React, { useEffect, useState } from "react";

interface Client {
  clientId: number;
  clientName: string;
  location: string;
}

const ClientTable: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);

  // Placeholder: Fetch clients from API
  const fetchClients = async () => {
    try {
      // TODO: Replace with your real API call
      // Example: const response = await fetch("/api/clients");
      // const data = await response.json();
      // setClients(data);

      console.log("Fetching clients...");
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Placeholder: Add client
  const handleAdd = async () => {
    try {
      // TODO: Replace with your real API POST call
      console.log("Adding client...");
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  // Placeholder: Edit client
  const handleEdit = async (id: number) => {
    try {
      // TODO: Replace with your real API PUT call
      console.log("Editing client with id:", id);
    } catch (error) {
      console.error("Error editing client:", error);
    }
  };

  // Placeholder: Delete client
  const handleDelete = async (id: number) => {
    try {
      // TODO: Replace with your real API DELETE call
      console.log("Deleting client with id:", id);
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  return (
    <div>
      <h2>Client Table</h2>
      <button onClick={handleAdd}>Add Client</button>
      <table border={1} cellPadding={5} style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Client ID</th>
            <th>Client Name</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <tr key={client.clientId}>
                <td>{client.clientId}</td>
                <td>{client.clientName}</td>
                <td>{client.location}</td>
                <td>
                  <button onClick={() => handleEdit(client.clientId)}>Edit</button>
                  <button onClick={() => handleDelete(client.clientId)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No clients available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
