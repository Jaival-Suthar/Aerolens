import React, { useState, useRef, useCallback } from "react";
import { Toast } from "primereact/toast";
import { SplitButton } from "primereact/splitbutton";
import { DataTable } from "primereact/datatable";
import { FaCog } from "react-icons/fa";
import ClientTable from "./components/clientTable";
import ClientAddEdit from "./components/clientAddEdit";
import ClientDelete from "./components/clientDelete";
import ClientContactsView from "../Contact/components/clientContactsView";
import DepartmentTable from "../Department/components/departmentTable";
import AddButton from "../../shared/AddButton";
import EditButton from "../../shared/EditButton";
import DeleteButton from "../../shared/DeleteButton";
import ExportExcelButton from "../../shared/ExportExcelButton";
import { createClient, updateClient, deleteClient } from "./services/clientService";
import { VIEW_MODES, getMenuItems } from "../Contact/constants/contactConstants";
import { ClientType, ClientAddType } from "./types/clientTypes";
import { useAuth } from '../../shared/auth/AuthContext';

const Client: React.FC = () => {
  // --- Dialog States ---
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const { accessToken } = useAuth();
  // --- Data States ---
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [editClient, setEditClient] = useState<ClientAddType | ClientType | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientType | null>(null);

  // --- UI States ---
  const [activeView, setActiveView] = useState<string>(VIEW_MODES.TABLE);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- Refs ---
  const toast = useRef<Toast | null>(null);
  const dt = useRef<React.ElementRef<typeof DataTable>>(null);

  // --- Toast Helper ---
  const showToast = useCallback(
    (severity: "success" | "error", summary: string, detail: string) => {
      toast.current?.show({ severity, summary, detail });
    },
    []
  );

  // --- Dialog Handlers ---
  const openAddDialog = useCallback(() => {
    setDialogMode("add");
    setEditClient({ clientName: "", address: "" });
    setDialogVisible(true);
  }, []);

  const closeAddEditDialog = useCallback(() => {
    setDialogVisible(false);
    setEditClient(null);
  }, []);

  const openEditDialog = useCallback((client: ClientType) => {
    setDialogMode("edit");
    setEditClient(client);
    setDialogVisible(true);
  }, []);

  const openDeleteDialog = useCallback(() => {
    if (selectedClient) {
      setClientToDelete(selectedClient);
      setDeleteDialogVisible(true);
    }
  }, [selectedClient]);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogVisible(false);
    setClientToDelete(null);
  }, []);

  // --- View Navigation ---
  const handleBackToClients = useCallback(() => {
    setActiveView(VIEW_MODES.TABLE);
    setSelectedClient(null);
  }, []);

  const menuItems = getMenuItems((view: string) => {
    if ((view === VIEW_MODES.CONTACTS || view === VIEW_MODES.DEPARTMENT) && !selectedClient) {
      alert("Select a client first.");
      return;
    }
    setActiveView(view);
  });

  // --- API Handlers ---
  const handleSaveClient = useCallback(
  async (client: ClientType | ClientAddType) => {
    setLoading(true);
    try {
      if (dialogMode === "add") {
        const newClient = client as ClientAddType;
        await createClient(accessToken, {
          name: newClient.clientName.trim(),
          address: newClient.address.trim(),
        });
        showToast("success", "Success", "Client added successfully");
      } else {
        const existingClient = client as ClientType;
        if (!existingClient.clientId) {
          throw new Error("Invalid client ID");
        }
        await updateClient(accessToken, {
          id: existingClient.clientId,
          name: existingClient.clientName.trim(),
          address: existingClient.address.trim(),
        });
        showToast("success", "Success", "Client updated successfully");
      }
      setRefreshTrigger((prev) => prev + 1);
      closeAddEditDialog();
    } catch (error) {
      console.error("Save client error:", error);
      showToast("error", "Error", "Failed to save client. Retry.");
    } finally {
      setLoading(false);
    }
  },
  [dialogMode, showToast, closeAddEditDialog, accessToken]
);


  const handleDeleteClient = useCallback(
  async (client?: ClientType | null) => {
    if (!client || client.clientId === undefined) {
      showToast("error", "Error", "Invalid client selected.");
      return;
    }
    setLoading(true);
    try {
      await deleteClient(accessToken, Number(client.clientId));
      showToast("success", "Success", "Client deleted successfully");
      setRefreshTrigger((prev) => prev + 1);
      setSelectedClient(null);
      closeDeleteDialog();
    } catch (error) {
      console.error("Delete client error:", error);
      showToast("error", "Error", "Failed to delete client. Retry.");
    } finally {
      setLoading(false);
    }
  },
  [showToast, closeDeleteDialog, accessToken]
);


  const handleEditSelected = useCallback(() => {
    if (selectedClient) {
      openEditDialog(selectedClient);
    }
  }, [selectedClient, openEditDialog]);

  // --- Render ---
  const isTableView = activeView === VIEW_MODES.TABLE;
  const isContactsView = activeView === VIEW_MODES.CONTACTS && selectedClient;
  const isDepartmentView = activeView === VIEW_MODES.DEPARTMENT && selectedClient;
  const handleSelectionChange = useCallback((client: ClientType | null) => {
  setSelectedClient(client);
}, []);


  return (
    <div
      className="dashboard-container shadow-3 p-4"
      style={{ width: "100%", maxWidth: "100%" }}
    >
      <Toast ref={toast} />

      {isTableView && (
        <div className="flex justify-content-between align-items-center mb-4 w-full">
          <div className="flex align-items-center gap-3">
            <SplitButton
              icon={<FaCog style={{ fontSize: 16 }} />}
              model={menuItems}
              tooltip="Settings"
              tooltipOptions={{ position: "bottom" }}
              disabled={!selectedClient || loading}
              aria-label="Settings"
              data-testid="SettingsBtn"
            />
          </div>
          <div className="flex gap-2 mr-6">
            <ExportExcelButton dtRef={dt} />
            <AddButton
              onClick={openAddDialog}
              disabled={loading}
              data-testid="AddBtn"
            />
            <EditButton
              onClick={handleEditSelected}
              disabled={!selectedClient || loading}
              data-testid="EditBtn"
            />
            <DeleteButton
              onClick={openDeleteDialog}
              disabled={!selectedClient || loading}
              data-testid="DeleteBtn"
            />
          </div>
        </div>
      )}

      <div className="card">
        {isTableView && (
          <ClientTable
            dtRef={dt}
            onEdit={openEditDialog}
            refreshTrigger={refreshTrigger}
            selectedClient={selectedClient}
            onSelectionChange={handleSelectionChange}
            loading={loading}
          />
        )}

        {isContactsView && (
          <ClientContactsView
            selectedClient={selectedClient}
            onBackClick={handleBackToClients}
          />
        )}

        {isDepartmentView && (
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
          onHide={closeAddEditDialog}
          onSave={handleSaveClient}
          mode={dialogMode}
          client={editClient}
          loading={loading}
        />
      )}

      {deleteDialogVisible && (
        <ClientDelete
          visible={deleteDialogVisible}
          onHide={closeDeleteDialog}
          onDelete={handleDeleteClient}
          client={clientToDelete}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Client;