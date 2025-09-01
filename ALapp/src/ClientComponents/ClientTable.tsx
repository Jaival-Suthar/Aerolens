import React, { useEffect, useState } from "react";
import ClientForm from "./ClientForm";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

const API_URL = import.meta.env.VITE_BASE_URL;

interface Client {
  clientId: number;
  clientName: string;
  address: string;
}

const ClientTable: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Fetch clients
  const fetchClients = async (page = 1, limit = 10) => {
    try {
      const res = await fetch(`${API_URL}/client?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch clients");
      const result = await res.json();
      setClients(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      setClients([]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Add or update client
  const handleSubmit = async (clientData: { clientName: string; address: string }) => {
    try {
      if (editingClient) {
        const res = await fetch(`${API_URL}/client/${editingClient.clientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientData),
        });
        if (!res.ok) throw new Error("Failed to update client");
      } else {
        const res = await fetch(`${API_URL}/client`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientData),
        });
        if (!res.ok) throw new Error("Failed to add client");
      }
      setShowForm(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      console.error(err);
      alert("Error saving client. Check console.");
    }
  };

  const confirmDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/client/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete client");
      setClients((prev) => prev.filter((c) => c.clientId !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEdit = () => {
    if (!selectedClient) return alert("Select a client to edit");
    setEditingClient(selectedClient);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (!selectedClient) return alert("Select a client to delete");
    setShowDeleteConfirm(selectedClient.clientId);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Client Table</h2>
      <div className="flex gap-2 mb-3">
        <Button label="Add" icon="pi pi-plus" severity="success" onClick={handleAdd} />
        <Button label="Edit" icon="pi pi-pencil" severity="info" onClick={handleEdit} />
        <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={handleDelete} />
      </div>

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
        <Column field="address" header="Address" sortable />
      </DataTable>

      {/* Add/Edit Dialog */}
      <Dialog
        header={editingClient ? "Edit Client" : "Add Client"}
        visible={showForm}
        style={{ width: "400px" }}
        modal
        draggable={false}
        onHide={() => setShowForm(false)}
      >
        <ClientForm
          onSubmit={handleSubmit}
          initialData={
            editingClient
              ? { clientName: editingClient.clientName, address: editingClient.address }
              : undefined
          }
          onCancel={() => setShowForm(false)}
        />
      </Dialog>

      {/* Delete Confirmation */}
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
