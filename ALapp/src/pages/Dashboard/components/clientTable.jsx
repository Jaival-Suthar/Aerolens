import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { getClients } from "../services/clientService";

const ClientTable = ({ onEdit, refreshTrigger = 0, selectedClient, onSelectionChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State for clients and loading
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get pagination from URL parameters or localStorage defaults
  const getInitialPagination = useCallback(() => {
    // First try URL params
    const urlPage = parseInt(searchParams.get('page')) || null;
    const urlLimit = parseInt(searchParams.get('limit')) || null;
    
    // Then try localStorage
    const savedPagination = localStorage.getItem('clientTablePagination');
    const saved = savedPagination ? JSON.parse(savedPagination) : {};
    
    return {
      currentPage: urlPage || saved.currentPage || 1,
      limit: urlLimit || saved.limit || 10,
      totalPages: 1,
      totalRecords: 0,
    };
  }, [searchParams]);

  const [pagination, setPagination] = useState(getInitialPagination);

  // Update URL params when pagination changes
  const updateUrlParams = useCallback((newPage, newLimit) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('limit', newLimit.toString());
    
    // Preserve other search params if any
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') {
        params.set(key, value);
      }
    });
    
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // Save pagination preferences to localStorage
  const savePaginationPreferences = useCallback((page, limit) => {
    const preferences = { currentPage: page, limit };
    localStorage.setItem('clientTablePagination', JSON.stringify(preferences));
  }, []);

  // Memoized load function
  const loadClients = useCallback(async (page, limit) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading clients: page=${page}, limit=${limit}`);
      const response = await getClients(page, limit);
      
      if (response && response.data) {
        setClients(response.data);
        
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            currentPage: response.pagination.currentPage,
            totalPages: response.pagination.totalPages,
            totalRecords: response.pagination.totalRecords,
            limit: response.pagination.limit,
          }));
        } else {
          // Fallback if no pagination in response
          setPagination(prev => ({
            ...prev,
            currentPage: page,
            limit: limit,
            totalPages: Math.ceil(response.data.length / limit),
            totalRecords: response.data.length,
          }));
        }
      } else {
        console.warn("No data received from API");
        setClients([]);
        setPagination(prev => ({ 
          ...prev, 
          currentPage: page,
          limit: limit,
          totalRecords: 0,
          totalPages: 1
        }));
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      setError(error.message);
      setClients([]);
      setPagination(prev => ({ 
        ...prev, 
        currentPage: page,
        limit: limit,
        totalRecords: 0,
        totalPages: 1
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load clients when URL params change or component refreshes
  useEffect(() => {
    const currentPagination = getInitialPagination();
    const { currentPage, limit } = currentPagination;
    
    // Update internal state to match URL/localStorage
    setPagination(currentPagination);
    
    // Load data with current pagination
    loadClients(currentPage, limit);
    
    // Save preferences
    savePaginationPreferences(currentPage, limit);
  }, [searchParams, refreshTrigger, getInitialPagination, loadClients, savePaginationPreferences]);

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
          field="clientId"
          header="Client ID"
          sortable
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: '8rem' }}
          body={(rowData) => rowData?.clientId || 'N/A'}
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
        <Column
          field="address"
          header="Address"
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: '15rem' }}
          body={(rowData) => rowData?.address || 'N/A'}
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
      
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500">
          Debug: Page {pagination.currentPage} of {pagination.totalPages} 
          | Limit: {pagination.limit} 
          | Total: {pagination.totalRecords} records
          | URL: {searchParams.toString()}
        </div>
      )}
    </section>
  );
};

export default ClientTable;