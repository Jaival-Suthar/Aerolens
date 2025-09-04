import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';

const ContactTable = ({ 
  contacts = [], 
  loading = false, 
  selectedContact, 
  onSelectionChange 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pagedContacts, setPagedContacts] = useState([]);

  // Handle pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPagedContacts(contacts.slice(startIndex, endIndex));
  }, [contacts, currentPage, rowsPerPage]);

  // Reset to first page when contacts change
  useEffect(() => {
    setCurrentPage(1);
  }, [contacts]);

  const totalRecords = contacts.length;

  const onPageChange = useCallback((event) => {
    setCurrentPage(event.page + 1); // PrimeReact paginator uses 0-based index
    setRowsPerPage(event.rows);
  }, []);

  const onSelectionChangeHandler = useCallback((e) => {
    const selectedContactData = e.value;
    
    // Validate that the selected contact has a proper ID
    if (selectedContactData && !selectedContactData.clientContactId) {
      console.error('Selected contact is missing clientContactId:', selectedContactData);
      return;
    }
    
    if (onSelectionChange) {
      onSelectionChange(selectedContactData);
    }
  }, [onSelectionChange]);

  const cellClass = "py-1 px-2";
  const headerClass = "py-1 px-2 font-semibold";

  // Template for contact person name with email
  const contactPersonTemplate = (rowData) => (
    <div>
      <div className="font-medium">{rowData.contactPersonName}</div>
      <div className="text-sm text-gray-600">{rowData.email}</div>
    </div>
  );

  // Template for designation with phone
  const designationTemplate = (rowData) => (
    <div>
      <div className="font-medium">{rowData.designation}</div>
      <div className="text-sm text-gray-600">{rowData.phone}</div>
    </div>
  );

  return (
    <section className="contact-table" aria-label="Contact data table">
      <DataTable
        value={pagedContacts}
        loading={loading}
        responsiveLayout="scroll"
        stripedRows
        className="text-sm shadow-2"
        paginator={false} // use separate Paginator component
        scrollHeight="350px"
        emptyMessage={loading ? "Loading contacts..." : "No contacts found."}
        selectionMode="single"
        selection={selectedContact}
        onSelectionChange={onSelectionChangeHandler}
        dataKey="clientContactId" // Use clientContactId as the unique identifier
        showGridlines
        metaKeySelection={false}
      >
        <Column
          selectionMode="single"
          headerStyle={{ width: '3rem' }}
          frozen
        />
        <Column
          field="clientContactId"
          header="Contact ID"
          sortable
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: '8rem' }}
        />
        <Column
          field="contactPersonName"
          header="Contact Person"
          sortable
          body={contactPersonTemplate}
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: '16rem' }}
        />
        <Column
          field="designation"
          header="Designation"
          sortable
          body={designationTemplate}
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: '14rem' }}
        />
      </DataTable>

      {!loading && totalRecords > 0 && (
        <Paginator
          first={(currentPage - 1) * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          rowsPerPageOptions={[5, 10, 20]}
          className="mt-3"
        />
      )}
    </section>
  );
};

export default ContactTable;