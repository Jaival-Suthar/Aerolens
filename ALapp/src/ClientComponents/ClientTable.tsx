import React, { useEffect, useState } from "react";
import ClientForm from "./ClientForm";

interface Client {
  clientId: number;
  clientName: string;
  location: string;
}

const ClientTable: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([
    { clientId: 1, clientName: "Test Client 1", location: "New York" },
    { clientId: 2, clientName: "Test Client 2", location: "California" }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const fetchClients = async () => {
    try {
      console.log("Fetching clients...");
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
    console.log("Current clients:", clients);
  }, []);

  const handleSubmit = async (client: {
    clientId: string;
    clientName: string;
    location: string;
  }) => {
    try {
      if (editingClient) {
        setClients((prev) =>
          prev.map((c) =>
            c.clientId === editingClient.clientId
              ? { ...client, clientId: Number(client.clientId) }
              : c
          )
        );
      } else {
        setClients((prev) => [
          ...prev,
          { ...client, clientId: Number(client.clientId) },
        ]);
      }

      setShowForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const confirmDelete = async (id: number) => {
    try {
      setClients((prev) => prev.filter((c) => c.clientId !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Client Table</h2>

      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", minWidth: "300px" }}>
            <h3>{editingClient ? "Edit Client" : "Add Client"}</h3>
            <ClientForm
              onSubmit={handleSubmit}
              initialData={
                editingClient
                  ? {
                      clientId: String(editingClient.clientId),
                      clientName: editingClient.clientName,
                      location: editingClient.location,
                    }
                  : undefined
              }
            />
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showDeleteConfirm !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
            <h3>Delete this client?</h3>
            <button onClick={() => confirmDelete(showDeleteConfirm)}>Yes</button>
            <button onClick={() => setShowDeleteConfirm(null)}>No</button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setShowForm(true);
          setEditingClient(null);
        }}
      >
        Add Client
      </button>

      <table border={1} style={{ width: "100%", marginTop: "10px" }}>
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
                  <button
                    onClick={() => {
                      setEditingClient(client);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(client.clientId)}
                    style={{ marginLeft: "5px" }}
                  >
                    Delete
                  </button>
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