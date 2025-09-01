import React, { useEffect, useState } from "react";
import ClientForm from "./ClientForm";
import "primereact/resources/themes/saga-blue/theme.css"; // Theme
import "primereact/resources/primereact.min.css"; // Core
import "primeicons/primeicons.css"; // Icons

// PrimeReact imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

interface Client {
  clientId: number;
  clientName: string;
  adress: string;
}

const ClientTable: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([
    { clientId: 1, clientName: "Test Client 1", adress: "New York" },
    { clientId: 2, clientName: "Test Client 2", adress: "California" },
  ]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
  const handleSubmit = (client: { clientName: string; adress: string }) => {
    if (editingClient) {
      // 🔄 update existing client
      setClients((prev) =>
        prev.map((c) =>
          c.clientId === editingClient.clientId
            ? { ...c, ...client } // keep same clientId, update fields
            : c
        )
      );
    } else {
      // ➕ add new client with temp ID (backend will overwrite)
      setClients((prev) => [
        ...prev,
        { ...client, clientId: Date.now() },
      ]);
    }
  
    setShowForm(false);
    setEditingClient(null);
  };
  

  const confirmDelete = async (id: number) => {
    try {
      setClients((prev) => prev.filter((c) => c.clientId !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  // ✅ Toolbar Actions
  const handleAdd = async () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEdit = async () => {
    if (!selectedClient) {
      alert("Please select a client to edit");
      return;
    }
    setEditingClient(selectedClient);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!selectedClient) {
      alert("Please select a client to delete");
      return;
    }
    setShowDeleteConfirm(selectedClient.clientId);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Client Table</h2>

      {/* ✅ Action Buttons outside table */}
      <div className="flex gap-2 mb-3">
        <Button label="Add" icon="pi pi-plus" severity="success" onClick={handleAdd} />
        <Button label="Edit" icon="pi pi-pencil" severity="info" onClick={handleEdit} />
        <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={handleDelete} />
      </div>

      {/* ✅ DataTable with row selection */}
      <DataTable
        value={clients}
        paginator
        rows={5}
        responsiveLayout="scroll"
        selectionMode="single"
        selection={selectedClient}
        onSelectionChange={(e) => setSelectedClient(e.value as Client | null)}
        dataKey="clientId"
        onRowDoubleClick={(e) => {
          setEditingClient(e.data as Client);   // e.data contains the row’s client
          setShowForm(true);
        }}
      >
        <Column selectionMode="single" headerStyle={{ width: "3rem" }}></Column>
        <Column field="clientId" header="Client ID" sortable />
        <Column field="clientName" header="Client Name" sortable />
        <Column field="adress" header="Address" sortable />
      </DataTable>

      {/* Add/Edit Client Modal */}
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
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "300px",
            }}
          >
            <h3>{editingClient ? "Edit Client" : "Add Client"}</h3>
            <ClientForm
              onSubmit={handleSubmit}
              initialData={
                editingClient
                  ? {
                      
                      clientName: editingClient.clientName,
                      adress: editingClient.adress,
                    }
                  : undefined
              }
            />
            <Button
              label="Cancel"
              severity="secondary"
              onClick={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>Delete this client?</h3>
            <Button
              label="Yes"
              icon="pi pi-check"
              severity="danger"
              onClick={() => confirmDelete(showDeleteConfirm)}
            />
            <Button
              label="No"
              icon="pi pi-times"
              severity="secondary"
              onClick={() => setShowDeleteConfirm(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientTable;
