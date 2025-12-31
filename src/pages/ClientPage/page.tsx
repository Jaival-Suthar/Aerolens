import React, { useState, useRef, useCallback, useEffect } from "react";
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
import { createClient, updateClient, deleteClient, getClients } from "./services/clientService";
import { VIEW_MODES, getMenuItems } from "../Contact/constants/contactConstants";
import { ClientType, ClientAddType } from "./types/clientTypes";
import { useAuth } from '../../shared/auth/AuthContext';
import { useSearchParams } from 'react-router-dom';
import SearchButton from '../../shared/SearchButton';
import { FilterMatchMode } from 'primereact/api';

const Client: React.FC = () => {
  // --- Dialog States ---
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const { accessToken } = useAuth();

  // --- Data States ---
  const [editClient, setEditClient] = useState<ClientAddType | ClientType | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientType | null>(null);

  // --- UI States ---
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || VIEW_MODES.TABLE;
  const selectedClientId = searchParams.get('clientId');
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
 
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

  // ✅ *** ADD THIS - Load client from URL on refresh ***
  useEffect(() => {
    const loadClientFromUrl = async () => {
      if (selectedClientId && !selectedClient && activeView !== VIEW_MODES.TABLE) {
        setLoading(true);
        try {
          const response = await getClients(accessToken, 1, 1000);
          const client = response.data.find((c: ClientType) => c.clientId === Number(selectedClientId));

          if (client) {
            setSelectedClient(client);
          } else {
            showToast('error', 'Error', 'Client not found');
            setSearchParams({});
          }
        } catch (error) {
          console.error('Failed to load client:', error);
          showToast('error', 'Error', 'Failed to load client');
          setSearchParams({});
        } finally {
          setLoading(false);
        }
      }
    };
    loadClientFromUrl();
  }, [selectedClientId, activeView, accessToken]);

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
    setSearchParams({});
    setSelectedClient(null);
  }, [setSearchParams]);

  const menuItems = getMenuItems((view: string) => {
    if ((view === VIEW_MODES.CONTACTS || view === VIEW_MODES.DEPARTMENT) && !selectedClient) {
      alert("Select a client first.");
      return;
    }
    setSearchParams({ view, clientId: String(selectedClient?.clientId || '') });
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
    } catch (error: any) {
      console.error("Save client error:", error);

      // 🚨 IMPORTANT: rethrow backend error
      throw error?.response?.data || error;
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

  const handleSelectionChange = useCallback((client: ClientType | null) => {
    setSelectedClient(client);
    if (client && activeView !== VIEW_MODES.TABLE) {
      setSearchParams({ view: activeView, clientId: String(client.clientId) });
    }
  }, [activeView, setSearchParams]);


  const isTableView = activeView === VIEW_MODES.TABLE;
  const  onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilterValue(e.target.value);
  }

  return (
    <div className="dashboard-container shadow-3 p-4" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", width: "100%", minHeight: 0 }}>
      <Toast ref={toast} />

      {(isTableView || (selectedClientId && !selectedClient)) && (
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
          <div className="flex gap-2">
            <SearchButton
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search clients..."
            />
            <ExportExcelButton dtRef={dt} />
            <AddButton onClick={openAddDialog} disabled={loading} data-testid="AddBtn" />
            <EditButton onClick={handleEditSelected} disabled={!selectedClient || loading} data-testid="EditBtn" />
            <DeleteButton onClick={openDeleteDialog} disabled={!selectedClient || loading} data-testid="DeleteBtn" />
          </div>
        </div>
      )}

      {/* ✅ Only this render block replaced */}
      <div style={{display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0}}>
        {isTableView && (
          
          <ClientTable
          dtRef={dt}
          onEdit={openEditDialog}
          refreshTrigger={refreshTrigger}
          selectedClient={selectedClient}
          onSelectionChange={handleSelectionChange}
          loading={loading}
          preSelectClientId={selectedClientId ? Number(selectedClientId) : undefined}
          globalFilterValue={globalFilterValue}
        />

          
        )}

        {activeView === VIEW_MODES.CONTACTS && (
          loading && !selectedClient ? (
            <div className="text-center p-4">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
              <p className="mt-3">Loading...</p>
            </div>
          ) : selectedClient ? (
            <ClientContactsView selectedClient={selectedClient} onBackClick={handleBackToClients} />
          ) : null
        )}

        {activeView === VIEW_MODES.DEPARTMENT && (
          loading && !selectedClient ? (
            <div className="text-center p-4">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
              <p className="mt-3">Loading...</p>
            </div>
          ) : selectedClient ? (
            <DepartmentTable clientId={selectedClient.clientId} clientName={selectedClient.clientName} onBackClick={handleBackToClients} />
          ) : null
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
