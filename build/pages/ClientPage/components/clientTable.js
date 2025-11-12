import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { useClientData } from "../hooks/useClientData";
import { usePagination } from "../hooks/usePagination";
import { FaTimesCircle } from "react-icons/fa";
const ClientTable = ({ dtRef, onEdit, refreshTrigger = 0, selectedClient, onSelectionChange, preSelectClientId }) => {
    const { clients, loading, error, loadClients } = useClientData();
    const { pagination, getInitialPagination, updateUrlParams, savePaginationPreferences, updatePaginationFromResponse, resetPaginationOnError, searchParams, } = usePagination();
    useEffect(() => {
        const loadData = async () => {
            const { currentPage, limit } = getInitialPagination();
            try {
                const response = await loadClients(currentPage, limit);
                updatePaginationFromResponse({ ...response, pagination: response.meta ?? {} }, currentPage, limit);
                savePaginationPreferences(currentPage, limit);
            }
            catch {
                resetPaginationOnError(currentPage, limit);
            }
        };
        loadData();
    }, [
        searchParams,
        refreshTrigger,
        getInitialPagination,
        loadClients,
        savePaginationPreferences,
        updatePaginationFromResponse,
        resetPaginationOnError,
    ]);
    // Auto-select client from URL on mount/refresh
    useEffect(() => {
        if (preSelectClientId && clients.length > 0 && !selectedClient) {
            const clientToSelect = clients.find(c => c.clientId === preSelectClientId);
            if (clientToSelect) {
                onSelectionChange(clientToSelect);
            }
        }
    }, [preSelectClientId, clients, selectedClient, onSelectionChange]);
    const onPageChange = useCallback((event) => {
        const newPage = event.page + 1; // zero-based → one-based
        const newLimit = event.rows;
        updateUrlParams(newPage, newLimit);
        savePaginationPreferences(newPage, newLimit);
    }, [updateUrlParams, savePaginationPreferences]);
    const onSelectionChangeHandler = useCallback((e) => {
        onSelectionChange(e.value ?? null);
    }, [onSelectionChange]);
    const onRowDoubleClick = useCallback((e) => {
        onEdit(e.data);
    }, [onEdit]);
    const cellClass = "py-1 px-2";
    const headerClass = "py-1 px-2 font-semibold";
    return (_jsxs("section", { className: "client-table", "aria-label": "Client data table", children: [error && (_jsx("div", { className: "p-message p-message-error mb-3", role: "alert", "aria-live": "assertive", children: _jsxs("div", { className: "p-message-wrapper", children: [_jsx(FaTimesCircle, { "aria-hidden": "true", style: { fontSize: 20, color: "#f44336" } }), _jsxs("div", { className: "p-message-text", children: ["Error loading clients: ", error] })] }) })), _jsxs(DataTable, { ref: dtRef, value: clients, loading: loading, responsiveLayout: "scroll", stripedRows: true, className: "text-m", paginator: false, scrollHeight: "400px", emptyMessage: loading ? "Loading..." : "No clients found.", selectionMode: "single", selection: selectedClient, onSelectionChange: onSelectionChangeHandler, dataKey: "clientId", onRowDoubleClick: onRowDoubleClick, showGridlines: true, "aria-live": "polite", children: [_jsx(Column, { selectionMode: "single", headerStyle: { width: "3rem" }, frozen: true }), _jsx(Column, { field: "clientId", header: "Client ID", sortable: true, bodyClassName: cellClass, headerClassName: headerClass, style: { minWidth: "8rem" }, body: (row) => row.clientId ?? "N/A" }), _jsx(Column, { field: "clientName", header: "Client Name", sortable: true, bodyClassName: cellClass, headerClassName: headerClass, style: { minWidth: "12rem" }, body: (row) => row.clientName ?? "N/A" }), _jsx(Column, { field: "address", header: "Address", bodyClassName: cellClass, headerClassName: headerClass, style: { minWidth: "15rem" }, body: (row) => row.address ?? "N/A" })] }), !loading && pagination.totalRecords > 0 && (_jsx(Paginator, { first: (pagination.currentPage - 1) * pagination.limit, rows: pagination.limit, totalRecords: pagination.totalRecords, onPageChange: onPageChange, template: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown", rowsPerPageOptions: [10, 20, 50], className: "mt-3", "aria-label": "Table pagination controls" }))] }));
};
export default ClientTable;
