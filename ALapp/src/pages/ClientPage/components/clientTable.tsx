import React, { useEffect, useCallback } from "react";
import { DataTable, type DataTableSelectionSingleChangeEvent, type DataTableRowClickEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { useClientData } from "../hooks/useClientData";
import { usePagination } from "../hooks/usePagination";
import type { ClientTableProps, ClientType } from "../types/clientTypes";

const ClientTable: React.FC<ClientTableProps> = ({
  dtRef,
  onEdit,
  refreshTrigger = 0,
  selectedClient,
  onSelectionChange,
}) => {
  const { clients, loading, error, loadClients } = useClientData();
  const {
    pagination,
    getInitialPagination,
    updateUrlParams,
    savePaginationPreferences,
    updatePaginationFromResponse,
    resetPaginationOnError,
    searchParams,
  } = usePagination();

  useEffect(() => {
    const loadData = async () => {
      const { currentPage, limit } = getInitialPagination();
      try {
        const response = await loadClients(currentPage, limit);
        updatePaginationFromResponse(
          { ...response, pagination: response.meta ?? {} },
          currentPage,
          limit
        );
        savePaginationPreferences(currentPage, limit);
      } catch {
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

  const onPageChange = useCallback(
    (event: PaginatorPageChangeEvent) => {
      const newPage = event.page + 1; // zero-based → one-based
      const newLimit = event.rows;
      updateUrlParams(newPage, newLimit);
      savePaginationPreferences(newPage, newLimit);
    },
    [updateUrlParams, savePaginationPreferences]
  );

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

  const cellClass = "py-1 px-2";
  const headerClass = "py-1 px-2 font-semibold";
  return (
    <section className="client-table" aria-label="Client data table">
      {error && (
        <div
          className="p-message p-message-error mb-3"
          role="alert"
          aria-live="assertive"
        >
          <div className="p-message-wrapper">
            <div className="p-message-icon pi pi-times-circle" />
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
        className="text-m"
        paginator={false} // external paginator
        scrollHeight="400px"
        emptyMessage={loading ? "Loading..." : "No clients found."}
        selectionMode="single"
        selection={selectedClient}
        onSelectionChange={onSelectionChangeHandler}
        dataKey="clientId"
        onRowDoubleClick={onRowDoubleClick}
        showGridlines
        aria-live="polite"
      >
        <Column selectionMode="single" headerStyle={{ width: "3rem" }} frozen />
        <Column
          field="clientId"
          header="Client ID"
          sortable
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: "8rem" }}
          body={(row: ClientType) => row.clientId ?? "N/A"}
        />
        <Column
          field="clientName"
          header="Client Name"
          sortable
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: "12rem" }}
          body={(row: ClientType) => row.clientName ?? "N/A"}
        />
        <Column
          field="address"
          header="Address"
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: "15rem" }}
          body={(row: ClientType) => row.address ?? "N/A"}
        />
      </DataTable>

      {!loading && pagination.totalRecords > 0 && (
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
      )}
    </section>
  );
};

export default ClientTable;