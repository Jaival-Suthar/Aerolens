import React, { useState, useRef } from "react";
import ClientTable from "./components/clientTable";
import ClientAddEdit from "./components/clientAddEdit";
import ClientDelete from "./components/clientDelete";
import ClientContactsView from "../Contact/components/clientContactsView";
import { Toast } from "primereact/toast";
import { SplitButton } from "primereact/splitbutton";
import { VIEW_MODES, getMenuItems } from "../Contact/constants/contactConstants";
import DepartmentTable from "../Department/components/departmentTable";
import AddButton from "../../shared/AddButton";
import EditButton from "../../shared/EditButton";
import DeleteButton from "../../shared/DeleteButton";
import { createClient, updateClient, deleteClient } from "./services/clientService";
import { ClientType } from "./types/clientTypes";


// type ClientType = {
//   clientId?: string | number;
//   clientName: string;
//   address: string;
// };

const Client: React.FC = () => {
  // --- State ---
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editClient, setEditClient] = useState<ClientType | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientType | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState<string>(VIEW_MODES.TABLE);

  const toast = useRef<Toast | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // --- Feedback ---
  const showToast = (severity: "success" | "error", summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail });
  };

  // --- Actions ---
  const handleBackToClients = () => {
    setActiveView(VIEW_MODES.TABLE);
    setSelectedClient(null);
  };

  const menuItems = getMenuItems((view: string) => {
    if ((view === VIEW_MODES.CONTACTS || view === VIEW_MODES.DEPARTMENT) && !selectedClient) {
      alert("Select a client first.");
      return;
    }
    setActiveView(view);
  });

  const handleAdd = () => {
    setDialogMode("add");
    setEditClient({ clientName: "", address: "" });
    setDialogVisible(true);
  };

  const onSaveClient = async (client: ClientType) => {
    setLoading(true);
    try {
      if (dialogMode === "add") {
        await createClient({
          name: client.clientName.trim(),
          address: client.address.trim(),
        });
        showToast("success", "Success", "Client added successfully");
      } else {
        const clientIdNum = Number(client.clientId);
        if (!clientIdNum || isNaN(clientIdNum)) {
          showToast("error", "Error", "Invalid client ID. Cannot update client.");
          return;
        }

        const trimmedName = client.clientName.trim();
        const trimmedAddress = client.address.trim();

        if (!trimmedName && !trimmedAddress) {
          showToast("error", "Error", "Provide a name or address to update.");
          return;
        }

        // Always provide both fields to satisfy the required type
        await updateClient({
          id: clientIdNum,
          name: trimmedName,
          address: trimmedAddress,
        });
        showToast("success", "Success", "Client updated successfully");
      }

      setRefreshTrigger((prev) => prev + 1);
      setDialogVisible(false);
      setEditClient(null);
    } catch (error) {
      console.error("Save client error:", error);
      showToast("error", "Error", "Failed to save client. Retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: ClientType) => {
    setDialogMode("edit");
    setEditClient(client);
    setDialogVisible(true);
  };

  const handleDeleteSelected = () => {
    if (selectedClient) {
      setClientToDelete(selectedClient);
      setDeleteDialogVisible(true);
    }
  };

  const handleEditSelected = () => {
    if (selectedClient) handleEdit(selectedClient);
  };

  const onDeleteClient = async (client?: ClientType | null) => {
    if (!client || client.clientId === undefined) {
      showToast("error", "Error", "Invalid client selected.");
      return;
    }
    setLoading(true);
    try {
      await deleteClient(Number(client.clientId));
      showToast("success", "Success", "Client deleted successfully");
      setRefreshTrigger((prev) => prev + 1);
      setSelectedClient(null);
      setDeleteDialogVisible(false);
      setClientToDelete(null);
    } catch (error) {
      console.error("Delete client error:", error);
      showToast("error", "Error", "Failed to delete client. Retry.");
    } finally {
      setLoading(false);
    }
  };

  const onSelectionChange = (client: ClientType | null) => {
    setSelectedClient(client);
  };

  // --- Render ---
  return (
    <>
      <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
        <Toast ref={toast} />

        <div className="flex justify-content-between align-items-center mb-4 w-full">
          {activeView === VIEW_MODES.TABLE && (
            <>
              <div className="flex align-items-center gap-3">
                <SplitButton
                  icon="pi pi-cog"
                  model={menuItems}
                  tooltip="Settings"
                  tooltipOptions={{ position: "bottom" }}
                  disabled={!selectedClient || loading}
                  aria-label="Settings"
                />
              </div>
              <div className="flex gap-2 mr-6">
                <AddButton onClick={handleAdd} disabled={loading} />
                <EditButton onClick={handleEditSelected} disabled={!selectedClient || loading} />
                <DeleteButton onClick={handleDeleteSelected} disabled={!selectedClient || loading} />
              </div>
            </>
          )}
        </div>

        <div className="card">
          {activeView === VIEW_MODES.TABLE && (
            <ClientTable
              onEdit={handleEdit}
              refreshTrigger={refreshTrigger}
              selectedClient={selectedClient}
              onSelectionChange={onSelectionChange}
              loading={loading}
            />
          )}

          {activeView === VIEW_MODES.CONTACTS && selectedClient && (
            <ClientContactsView selectedClient={selectedClient} onBackClick={handleBackToClients} />
          )}

          {activeView === VIEW_MODES.DEPARTMENT && selectedClient && (
            <DepartmentTable
              clientId={selectedClient.clientId}
              clientName={selectedClient.clientName}
              onBackClick={handleBackToClients}
            />
          )}
        </div>

        {dialogVisible && (
          <ClientAddEdit
            visible={dialogVisible}
            onHide={() => {
              setDialogVisible(false);
              setEditClient(null);
            }}
            onSave={onSaveClient}
            mode={dialogMode}
            client={editClient}
            loading={loading}
          />
        )}

        {deleteDialogVisible && (
          <ClientDelete
            visible={deleteDialogVisible}
            onHide={() => {
              setDeleteDialogVisible(false);
              setClientToDelete(null);
            }}
            onDelete={onDeleteClient}
            client={clientToDelete}
            loading={loading}
          />
        )}
      </div>
    </>
  );
};

export default Client;
