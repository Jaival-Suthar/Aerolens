import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { getClients } from "../services/clientService";

const ClientTable = ({ onEdit, refreshTrigger = 0, selectedClient, onSelectionChange }) => {
  // State for clients and pagination
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);

  // Load clients from API when currentPage, limit, or refreshTrigger changes
  const loadClients = async (page, limit) => {
    setLoading(true);
    try {
      const response = await getClients(page, limit);
      console.log("API Response:", response); // Debug log
      
      if (response && response.data) {
        setClients(response.data);
        setPagination(response.pagination || {
          currentPage: page,
          totalPages: 1,
          totalRecords: response.data.length,
          limit: limit,
        });
      } else {
        console.warn("No data received from API");
        setClients([]);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      setClients([]);
      setPagination(prev => ({ 
        ...prev, 
        totalRecords: 0 
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients(pagination.currentPage, pagination.limit);
  }, [refreshTrigger]); // Only depend on refreshTrigger initially

  useEffect(() => {
    if (refreshTrigger === 0) return; // Skip on initial load
    loadClients(pagination.currentPage, pagination.limit);
  }, [pagination.currentPage, pagination.limit]);

  // Paginator change handler
  const onPageChange = (event) => {
    setPagination(prev => ({
      ...prev,
      currentPage: event.page + 1,
      limit: event.rows,
    }));
  };

  // Selection change handler
  const onSelectionChangeHandler = (e) => {
    console.log("Selection changed:", e.value); // Debug log
    if (onSelectionChange) {
      onSelectionChange(e.value);
    }
  };

  const cellClass = "py-1 px-2";
  const headerClass = "py-1 px-2 font-semibold";

  return (
    <section className="client-table" aria-label="Client data table">
      <DataTable
        value={clients || []} // Ensure never null
        loading={loading}
        responsiveLayout="scroll"
        stripedRows
        className="text-m"
        paginator={false}
        scrollHeight="400px"
        emptyMessage="No clients found."
        selectionMode="single"
        selection={selectedClient}
        onSelectionChange={onSelectionChangeHandler}
        dataKey="clientId"
        onRowDoubleClick={(e) => {
          if (e.data && onEdit) {
            onEdit(e.data);
          }
        }}
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

      {!loading && clients && clients.length > 0 && (
        <Paginator
          first={(pagination.currentPage - 1) * pagination.limit}
          rows={pagination.limit}
          totalRecords={pagination.totalRecords || 0}
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