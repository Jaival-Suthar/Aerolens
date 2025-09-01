import React, { useEffect, useState } from "react";
import ClientForm from "./ClientForm";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// PrimeReact imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

const API_URL = import.meta.env.VITE_BASE_URL;

interface Client {
  clientId: number;
  clientName: string;
  adress: string;
}

const ClientTable: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // ✅ Fetch clients from API
  const fetchClients = async (page = 1, limit = 10) => {
    try {
      const response = await fetch(`${API_URL}/client?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error(`Failed to fetch clients: ${response.statusText}`);
      console.log("API_URL:", API_URL);
      const result = await response.json();
  
      if (result?.data && Array.isArray(result.data)) {
        setClients(result.data);
        // setPagination(result.pagination); // <- if you want to use pagination
      } else {
        console.error("Unexpected response structure:", result);
        setClients([]); // fallback to empty
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    }
  };
  

  useEffect(() => {
    fetchClients();
  }, []);

  // ✅ Add or Update client
  const handleSubmit = async (client: { clientId?: number; clientName: string; adress: string }) => {
    try {
      if (editingClient) {
        // 🔄 Update client
        const response = await fetch(`${API_URL}/client/${editingClient.clientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(client),
        });

        if (!response.ok) throw new Error("Failed to update client");

        await fetchClients(); // reload list
      } else {
        // ➕ Add new client
        const response = await fetch(`${API_URL}/client`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(client),
        });

        if (!response.ok) throw new Error("Failed to add client");

        await fetchClients(); // reload list
      }
    } catch (error) {
      console.error("Error saving client:", error);
    }

    setShowForm(false);
    setEditingClient(null);
  };

  // ✅ Delete client
  const confirmDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/client/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete client");

      setClients((prev) => prev.filter((c) => c.clientId !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEdit = () => {
    if (!selectedClient) {
      alert("Please select a client to edit");
      return;
    }
    setEditingClient(selectedClient);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (!selectedClient) {
      alert("Please select a client to delete");
      return;
    }
    setShowDeleteConfirm(selectedClient.clientId);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Client Table</h2>

      {/* ✅ Toolbar */}
      <div className="flex gap-2 mb-3">
        <Button label="Add" icon="pi pi-plus" severity="success" onClick={handleAdd} />
        <Button label="Edit" icon="pi pi-pencil" severity="info" onClick={handleEdit} />
        <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={handleDelete} />
      </div>

      {/* ✅ DataTable */}
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
          setEditingClient(e.data as Client);
          setShowForm(true);
        }}
      >
        <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
        <Column field="clientId" header="Client ID" sortable />
        <Column field="clientName" header="Client Name" sortable />
        <Column field="adress" header="Address" sortable />
      </DataTable>

      {/* ✅ Add/Edit Client Dialog */}
      <Dialog
        header={editingClient ? "Edit Client" : "Add Client"}
        visible={showForm}
        style={{ width: "400px" }}
        modal
        draggable={false}
        onHide={() => setShowForm(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              onClick={() => setShowForm(false)}
            />
          </div>
        }
      >
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
      </Dialog>

      {/* ✅ Delete Confirmation */}
      <Dialog
        header="Confirm Delete"
        visible={showDeleteConfirm !== null}
        style={{ width: "350px" }}
        modal
        onHide={() => setShowDeleteConfirm(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="No"
              icon="pi pi-times"
              severity="secondary"
              onClick={() => setShowDeleteConfirm(null)}
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              severity="danger"
              onClick={() => confirmDelete(showDeleteConfirm!)}
            />
          </div>
        }
      >
        <p>Are you sure you want to delete this client?</p>
      </Dialog>
    </div>
  );
};

export default ClientTable;
