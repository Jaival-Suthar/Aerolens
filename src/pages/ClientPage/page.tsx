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
// import ExportExcelButton from "../../shared/ExportExcelButton";
import { createClient, updateClient, deleteClient, getClients } from "./services/clientService";
import { VIEW_MODES, getMenuItems } from "../Contact/constants/contactConstants";
import { ClientType, ClientAddType } from "./types/clientTypes";
import { useAuth } from '../../shared/auth/AuthContext';
import { useSearchParams } from 'react-router-dom';
import SearchButton from '../../shared/SearchButton';
import CogButton from "../../shared/CogButton";
import ClientAuditLogsDialog from "./components/ClientAuditLogsDialog";

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
  const [globalAuditOpen, setGlobalAuditOpen] = useState(false);
  const [globalAuditTab, setGlobalAuditTab] = useState<"changes" | "deleted">("changes");
  const [showAuditMenu, setShowAuditMenu] = useState(false);
 
  // --- Refs ---
  const toast = useRef<Toast | null>(null);
  const dt = useRef<React.ElementRef<typeof DataTable>>(null);
  const auditMenuRef = useRef<HTMLDivElement | null>(null);

  // --- Toast Helper ---
  const showToast = useCallback(
    (severity: "success" | "error" | "warn", summary: string, detail: string) => {
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
    setSelectedClient(null);
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

  const openGlobalAuditLogs = useCallback((tab: "changes" | "deleted") => {
    setShowAuditMenu(false);
    setGlobalAuditTab(tab);
    setGlobalAuditOpen(true);
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

  useEffect(() => {
    if (!showAuditMenu) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (auditMenuRef.current && !auditMenuRef.current.contains(event.target as Node)) {
        setShowAuditMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showAuditMenu]);

  // --- API Handlers ---
  const handleSaveClient = useCallback(
  async (client: ClientType | ClientAddType) => {
    setLoading(true);

    try {
      let response;

      if (dialogMode === "add") {
        const newClient = client as ClientAddType;

        response = await createClient(accessToken, {
          name: newClient.clientName.trim(),
          address: newClient.address.trim(),
        });
      } else {
        const existingClient = client as ClientType;

        response = await updateClient(accessToken, {
          id: existingClient.clientId,
          name: existingClient.clientName.trim(),
          address: existingClient.address.trim(),
        });
      }

      // ✅ BACKEND SUCCESS MESSAGE
      if (response?.message) {
        showToast("success", "Success", response.message);
      }

      setRefreshTrigger((prev) => prev + 1);
      setSelectedClient(null);
      closeAddEditDialog();
    } catch (error: any) {
      console.error("Save client error:", error);

      // 🔥 VALIDATION ERRORS → let ClientAddEdit handle field highlights
      if (error?.error === "VALIDATION_ERROR") {
        throw error;
      }

      // 🔥 OTHER BACKEND ERRORS → show toast
      showToast(
        "error",
        "Error",
        error?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  },
  [dialogMode, showToast, closeAddEditDialog, accessToken]
);


  const handleDeleteClient = useCallback(
  async (client?: ClientType | null) => {
    if (!client?.clientId) return;

    setLoading(true);
    try {
      const response = await deleteClient(accessToken, client.clientId);

      // ✅ backend-driven success message (if backend sends one)
      if ((response as any)?.message) {
        showToast("success", "Success", (response as any).message);
      } else {
        showToast("success", "Success", "Client deleted successfully");
      }

      setRefreshTrigger((prev) => prev + 1);
      setSelectedClient(null);
      closeDeleteDialog();
    } catch (error: any) {
      console.error("Delete client error:", error);

      showToast(
        "error",
        "Error",
        error?.message || "Failed to delete client"
      );
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
    <div className="dashboard-container shadow-3 p-2" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", width: "100%", minHeight: 0 }}>
      <Toast ref={toast} />

      {(isTableView || (selectedClientId && !selectedClient)) && (
        <div className="flex justify-content-between align-items-center mb-2 w-full">
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
            <h2 style={{ color: "#07253f" }}> Client </h2>
          </div>
          <div className="flex gap-2">
            <SearchButton
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search clients..."
            />
            {/* <ExportExcelButton dtRef={dt} /> */}
            <AddButton onClick={openAddDialog} disabled={loading} data-testid="AddBtn" />
            <EditButton onClick={handleEditSelected} disabled={!selectedClient || loading} data-testid="EditBtn" />
            <DeleteButton onClick={openDeleteDialog} disabled={!selectedClient || loading} data-testid="DeleteBtn" />
            <div ref={auditMenuRef} style={{ position: "relative" }}>
              <CogButton
                onClick={() => setShowAuditMenu((prev) => !prev)}
                tooltip="Client Activity"
              />
              {showAuditMenu && (
                <div
                  className="card shadow-3"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 50,
                    zIndex: 1000,
                    minWidth: 220,
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "0.5rem",
                  }}
                >
                  <div
                    className="p-2 border-round"
                    role="button"
                    tabIndex={0}
                    onClick={() => openGlobalAuditLogs("changes")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openGlobalAuditLogs("changes");
                      }
                    }}
                    style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <i className="pi pi-history" style={{ fontSize: "14px", color: "#374151" }} />
                    <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                      Change Logs
                    </span>
                  </div>
                  <div
                    className="p-2 border-round"
                    role="button"
                    tabIndex={0}
                    onClick={() => openGlobalAuditLogs("deleted")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openGlobalAuditLogs("deleted");
                      }
                    }}
                    style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <i className="pi pi-trash" style={{ fontSize: "14px", color: "#374151" }} />
                    <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                      Deleted Clients
                    </span>
                  </div>
                </div>
              )}
            </div>
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

      <ClientAuditLogsDialog
        isOpen={globalAuditOpen}
        onClose={() => setGlobalAuditOpen(false)}
        defaultTab={globalAuditTab}
      />
    </div>
  );
};

export default Client;
