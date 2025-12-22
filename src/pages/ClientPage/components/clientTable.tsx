import React, { useEffect, useCallback, useState } from "react";
import { DataTable, type DataTableSelectionSingleChangeEvent, type DataTableRowClickEvent, DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
// import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { useClientData } from "../hooks/useClientData";
// import { usePagination } from "../hooks/usePagination";
import type { ClientTableProps, ClientType } from "../types/clientTypes";
import { FaTimesCircle, FaSearch } from "react-icons/fa";
import { useAuth } from '../../../shared/auth/AuthContext'; 
// import { InputText } from 'primereact/inputtext';
// import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
import type { DataTableFilterMeta } from 'primereact/datatable';

const ClientTable: React.FC<ClientTableProps> = ({
  dtRef,
  onEdit,
  refreshTrigger = 0,
  selectedClient,
  onSelectionChange,
  preSelectClientId,
  // filters,
  // globalFilterFields
}) => {
  const { clients, loading, error, loadClients } = useClientData(refreshTrigger);
  // const {
  //   pagination,
  //   getInitialPagination,
  //   updateUrlParams,
  //   savePaginationPreferences,
  //   updatePaginationFromResponse,
  //   resetPaginationOnError,
  //   searchParams,
  // } = usePagination();
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    clientId: { value: null, matchMode: FilterMatchMode.CONTAINS },
    clientName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    address: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
const [rowsPerPage, setRowsPerPage] = useState<number>(10);
const [first, setFirst] = useState<number>(0);
  useEffect(() => {
  const loadData = async () => {
    try {
      await loadClients(); // Just load all data, no pagination params
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };
  loadData();
}, [refreshTrigger, loadClients]);
  // useEffect(() => {          Backend Pagination - disabled for now
  //   const loadData = async () => {
  //     const { currentPage, limit } = getInitialPagination();
  //     try {
  //       const response = await loadClients(currentPage, limit);
  //       updatePaginationFromResponse(
  //         { ...response, pagination: response.meta ?? {} },
  //         currentPage,
  //         limit
  //       );
  //       savePaginationPreferences(currentPage, limit);
  //     } catch {
  //       resetPaginationOnError(currentPage, limit);
  //     }
  //   };
  //   loadData();
  // }, [
  //   searchParams,
  //   refreshTrigger,
  //   getInitialPagination,
  //   loadClients,
  //   savePaginationPreferences,
  //   updatePaginationFromResponse,
  //   resetPaginationOnError,
  // ]);

  // Auto-select client from URL on mount/refresh
useEffect(() => {
  if (preSelectClientId && clients.length > 0 && !selectedClient) {
    const clientToSelect = clients.find(c => c.clientId === preSelectClientId);
    if (clientToSelect) {
      onSelectionChange(clientToSelect);
    }
  }
}, [preSelectClientId, clients, selectedClient, onSelectionChange]);
  // const onPageChange = useCallback(
  //   (event: PaginatorPageChangeEvent) => {
  //     const newPage = event.page + 1; // zero-based → one-based
  //     const newLimit = event.rows;
  //     updateUrlParams(newPage, newLimit);
  //     savePaginationPreferences(newPage, newLimit);
  //   },
  //   [updateUrlParams, savePaginationPreferences]
  // );

  const onSelectionChangeHandler = useCallback(
  (e: DataTableSelectionSingleChangeEvent<ClientType[]>) => {
    onSelectionChange(e.value ?? null);
  },
  [onSelectionChange]
);


  const onRowDoubleClick = useCallback(
    (e: DataTableRowClickEvent) => {
      onEdit(e.data as ClientType);
    },
    [onEdit]
  );
  const onPageChange = useCallback((event: DataTablePageEvent) => {
  setRowsPerPage(event.rows);
  setFirst(event.first);
}, []);
  const cellClass = "py-1 px-2";
  const headerClass = "py-1 px-2 font-semibold";
  return (
    <section className="client-table" aria-label="Client data table" style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}>
      {error && (
        <div
          className="p-message p-message-error mb-3"
          role="alert"
          aria-live="assertive"
        >
          <div className="p-message-wrapper">
            <FaTimesCircle aria-hidden="true" style={{ fontSize: 20, color: "#f44336" }} />
            <div className="p-message-text">Error loading clients: {error}</div>
          </div>
        </div>
      )}

      <DataTable
         ref={dtRef}
          value={clients}
          loading={loading}
          responsiveLayout="scroll"
          stripedRows
          paginator
          first={first}
          rows={rowsPerPage}
          scrollable
          scrollHeight="flex"
          onPage={onPageChange}
          rowsPerPageOptions={[10, 20, 50]}
          emptyMessage={loading ? "Loading..." : "No clients found."}
          selectionMode="single"
          selection={selectedClient}
          onSelectionChange={onSelectionChangeHandler}
          dataKey="clientId"
          onRowDoubleClick={onRowDoubleClick}
          showGridlines
          filterDisplay="menu"
          filters={filters}
          onFilter={(e) => setFilters(e.filters)}
        // filters={filters}
        // globalFilterFields={globalFilterFields}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Clients"
      >
        <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
        <Column
          field="clientId"
          header="Client ID"
          sortable
          filter
          showClearButton={true}
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: "8rem" }}
          body={(row: ClientType) => row.clientId ?? "N/A"}
        />
        <Column
          field="clientName"
          header="Client Name"
          sortable
          filter
          showClearButton={true}
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: "12rem" }}
          body={(row: ClientType) => row.clientName ?? "N/A"}
        />
        <Column
          field="address"
          header="Address"
          filter
          showFilterMatchModes={false}
          showApplyButton={false}
          showClearButton={true}
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: "15rem" }}
          body={(row: ClientType) => row.address ?? "N/A"}
        />
      </DataTable>

      {/* {!loading && pagination.totalRecords > 0 && (
        <Paginator
          first={(pagination.currentPage - 1) * pagination.limit}
          rows={pagination.limit}
          totalRecords={pagination.totalRecords}
          onPageChange={onPageChange}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          rowsPerPageOptions={[10, 20, 50]}
          className="mt-3"
          aria-label="Table pagination controls"
        />
      )} */}
    </section>
  );
};

export default ClientTable;