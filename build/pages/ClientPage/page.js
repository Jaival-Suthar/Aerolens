import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect } from "react";
import { Toast } from "primereact/toast";
import { SplitButton } from "primereact/splitbutton";
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
import { useAuth } from '../../shared/auth/AuthContext';
import { useSearchParams } from 'react-router-dom';
const Client = () => {
    // --- Dialog States ---
    const [dialogVisible, setDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [dialogMode, setDialogMode] = useState("add");
    const { accessToken } = useAuth();
    // --- Data States ---
    const [editClient, setEditClient] = useState(null);
    const [clientToDelete, setClientToDelete] = useState(null);
    // --- UI States ---
    const [searchParams, setSearchParams] = useSearchParams();
    const activeView = searchParams.get('view') || VIEW_MODES.TABLE;
    const selectedClientId = searchParams.get('clientId');
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // --- Refs ---
    const toast = useRef(null);
    const dt = useRef(null);
    // --- Toast Helper ---
    const showToast = useCallback((severity, summary, detail) => {
        toast.current?.show({ severity, summary, detail });
    }, []);
    // ✅ *** ADD THIS - Load client from URL on refresh ***
    useEffect(() => {
        const loadClientFromUrl = async () => {
            if (selectedClientId && !selectedClient && activeView !== VIEW_MODES.TABLE) {
                setLoading(true);
                try {
                    const response = await getClients(accessToken, 1, 1000);
                    const client = response.data.find((c) => c.clientId === Number(selectedClientId));
                    if (client) {
                        setSelectedClient(client);
                    }
                    else {
                        showToast('error', 'Error', 'Client not found');
                        setSearchParams({});
                    }
                }
                catch (error) {
                    console.error('Failed to load client:', error);
                    showToast('error', 'Error', 'Failed to load client');
                    setSearchParams({});
                }
                finally {
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
    const openEditDialog = useCallback((client) => {
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
    const menuItems = getMenuItems((view) => {
        if ((view === VIEW_MODES.CONTACTS || view === VIEW_MODES.DEPARTMENT) && !selectedClient) {
            alert("Select a client first.");
            return;
        }
        setSearchParams({ view, clientId: String(selectedClient?.clientId || '') });
    });
    // --- API Handlers ---
    const handleSaveClient = useCallback(async (client) => {
        setLoading(true);
        try {
            if (dialogMode === "add") {
                const newClient = client;
                await createClient(accessToken, {
                    name: newClient.clientName.trim(),
                    address: newClient.address.trim(),
                });
                showToast("success", "Success", "Client added successfully");
            }
            else {
                const existingClient = client;
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
        }
        catch (error) {
            console.error("Save client error:", error);
            showToast("error", "Error", "Failed to save client. Retry.");
        }
        finally {
            setLoading(false);
        }
    }, [dialogMode, showToast, closeAddEditDialog, accessToken]);
    const handleDeleteClient = useCallback(async (client) => {
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
        }
        catch (error) {
            console.error("Delete client error:", error);
            showToast("error", "Error", "Failed to delete client. Retry.");
        }
        finally {
            setLoading(false);
        }
    }, [showToast, closeDeleteDialog, accessToken]);
    const handleEditSelected = useCallback(() => {
        if (selectedClient) {
            openEditDialog(selectedClient);
        }
    }, [selectedClient, openEditDialog]);
    const handleSelectionChange = useCallback((client) => {
        setSelectedClient(client);
        if (client && activeView !== VIEW_MODES.TABLE) {
            setSearchParams({ view: activeView, clientId: String(client.clientId) });
        }
    }, [activeView, setSearchParams]);
    const isTableView = activeView === VIEW_MODES.TABLE;
    return (_jsxs("div", { className: "dashboard-container shadow-3 p-4", style: { width: "100%", maxWidth: "100%" }, children: [_jsx(Toast, { ref: toast }), (isTableView || (selectedClientId && !selectedClient)) && (_jsxs("div", { className: "flex justify-content-between align-items-center mb-4 w-full", children: [_jsx("div", { className: "flex align-items-center gap-3", children: _jsx(SplitButton, { icon: _jsx(FaCog, { style: { fontSize: 16 } }), model: menuItems, tooltip: "Settings", tooltipOptions: { position: "bottom" }, disabled: !selectedClient || loading, "aria-label": "Settings", "data-testid": "SettingsBtn" }) }), _jsxs("div", { className: "flex gap-2 mr-6", children: [_jsx(ExportExcelButton, { dtRef: dt }), _jsx(AddButton, { onClick: openAddDialog, disabled: loading, "data-testid": "AddBtn" }), _jsx(EditButton, { onClick: handleEditSelected, disabled: !selectedClient || loading, "data-testid": "EditBtn" }), _jsx(DeleteButton, { onClick: openDeleteDialog, disabled: !selectedClient || loading, "data-testid": "DeleteBtn" })] })] })), _jsxs("div", { className: "card", children: [isTableView && (_jsx(ClientTable, { dtRef: dt, onEdit: openEditDialog, refreshTrigger: refreshTrigger, selectedClient: selectedClient, onSelectionChange: handleSelectionChange, loading: loading, preSelectClientId: selectedClientId ? Number(selectedClientId) : undefined })), activeView === VIEW_MODES.CONTACTS && (loading && !selectedClient ? (_jsxs("div", { className: "text-center p-4", children: [_jsx("i", { className: "pi pi-spin pi-spinner", style: { fontSize: '2rem' } }), _jsx("p", { className: "mt-3", children: "Loading..." })] })) : selectedClient ? (_jsx(ClientContactsView, { selectedClient: selectedClient, onBackClick: handleBackToClients })) : null), activeView === VIEW_MODES.DEPARTMENT && (loading && !selectedClient ? (_jsxs("div", { className: "text-center p-4", children: [_jsx("i", { className: "pi pi-spin pi-spinner", style: { fontSize: '2rem' } }), _jsx("p", { className: "mt-3", children: "Loading..." })] })) : selectedClient ? (_jsx(DepartmentTable, { clientId: selectedClient.clientId, clientName: selectedClient.clientName, onBackClick: handleBackToClients })) : null)] }), dialogVisible && (_jsx(ClientAddEdit, { visible: dialogVisible, onHide: closeAddEditDialog, onSave: handleSaveClient, mode: dialogMode, client: editClient, loading: loading })), deleteDialogVisible && (_jsx(ClientDelete, { visible: deleteDialogVisible, onHide: closeDeleteDialog, onDelete: handleDeleteClient, client: clientToDelete, loading: loading }))] }));
};
export default Client;
