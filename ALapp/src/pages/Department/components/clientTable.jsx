import React, { useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { useClientData } from "../hooks/useClientData";
import { usePagination } from "../hooks/usePagination";

const ClientTable = ({ onEdit, refreshTrigger = 0, selectedClient, onSelectionChange }) => {
  // Custom hooks
  const { clients, loading, error, loadClients, setError } = useClientData(refreshTrigger);
  const {
    pagination,
    getInitialPagination,
    updateUrlParams,
    savePaginationPreferences,
    updatePaginationFromResponse,
    resetPaginationOnError,
    searchParams
  } = usePagination();

  // Load clients when URL params change xor component refreshes
  useEffect(() => {
    const loadData = async () => {
      const currentPagination = getInitialPagination();
      const { currentPage, limit } = currentPagination;
      
      try {
        // Load data with current pagination
        const response = await loadClients(currentPage, limit);
        
        // Update pagination state based on response
        updatePaginationFromResponse(response, currentPage, limit);
        
        // Save preferences
        savePaginationPreferences(currentPage, limit);
      } catch (error) {
        // Reset pagination on error
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
    resetPaginationOnError
  ]);

  // Paginator change handler
  const onPageChange = useCallback((event) => {
    const newPage = event.page + 1; // PrimeReact uses 0-based indexing
    const newLimit = event.rows;
    
    console.log(`Page change: page=${newPage}, limit=${newLimit}`);
    
    // Update URL params (this will trigger useEffect to load data)
    updateUrlParams(newPage, newLimit);
    
    // Save preferences
    savePaginationPreferences(newPage, newLimit);
  }, [updateUrlParams, savePaginationPreferences]);

  // Selection change handler
  const onSelectionChangeHandler = useCallback((e) => {
    console.log("Selection changed:", e.value);
    if (onSelectionChange) {
      onSelectionChange(e.value);
    }
  }, [onSelectionChange]);

  // Row double click handler
  const onRowDoubleClick = useCallback((e) => {
    if (e.data && onEdit) {
      onEdit(e.data);
    }
  }, [onEdit]);

  const cellClass = "py-1 px-2";
  const headerClass = "py-1 px-2 font-semibold";

  return (
    <section className="client-table" aria-label="Client data table">
      {error && (
        <div className="p-message p-message-error mb-3">
          <div className="p-message-wrapper">
            <div className="p-message-icon pi pi-times-circle"></div>
            <div className="p-message-text">Error loading clients: {error}</div>
          </div>
        </div>
      )}
      
      <DataTable
        value={clients || []}
        loading={loading}
        responsiveLayout="scroll"
        stripedRows
        className="text-m"
        paginator={false} // We handle pagination separately
        scrollHeight="400px"
        emptyMessage={loading ? "Loading..." : "No clients found."}
        selectionMode="single"
        selection={selectedClient}
        onSelectionChange={onSelectionChangeHandler}
        dataKey="clientId"
        onRowDoubleClick={onRowDoubleClick}
        showGridlines
      >
        <Column 
          selectionMode="single" 
          headerStyle={{ width: "3rem" }}
          frozen
        />
        <Column
          field="clientName"
          header="Client Name"
          sortable
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: '12rem' }}
          body={(rowData) => rowData?.clientName || 'N/A'}
        />
      </DataTable>

      {/* Only show paginator if we have data or are not loading */}
      {!loading && pagination.totalRecords > 0 && (
        <Paginator
          first={(pagination.currentPage - 1) * pagination.limit}
          rows={pagination.limit}
          totalRecords={pagination.totalRecords}
          onPageChange={onPageChange}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          rowsPerPageOptions={[5, 10, 20, 50]}
          className="mt-3"
        />
      )}
    </section>
  );
};

export default ClientTable;