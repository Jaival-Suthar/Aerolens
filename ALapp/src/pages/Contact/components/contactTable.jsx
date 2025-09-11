import React, { useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const ContactTable = ({
  contacts = [],
  loading = false,
  selectedContact,
  onSelectionChange,
  onRowDoubleClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Event handler for page changes
  const onPageChange = useCallback((event) => {
    setCurrentPage(event.page + 1); // PrimeReact uses 0-based indexing
    setRowsPerPage(event.rows);
  }, []);

  const onSelectionChangeHandler = useCallback((e) => {
    const selectedContactData = e.value;
    if (selectedContactData && !selectedContactData.clientContactId) {
      console.error('Selected contact is missing clientContactId:', selectedContactData);
      return;
    }
    if (onSelectionChange) {
      onSelectionChange(selectedContactData);
    }
  }, [onSelectionChange]);

  const onRowDoubleClickHandler = useCallback((e) => {
    if (onRowDoubleClick && e.data) {
      onRowDoubleClick(e.data);
    }
  }, [onRowDoubleClick]);

  const cellClass = "py-1 px-2";
  const headerClass = "py-1 px-2 font-semibold";

  const contactPersonTemplate = (rowData) => (
    <div>
      <div className="font-medium">{rowData.contactPersonName}</div>
      <div className="text-sm text-gray-600">{rowData.email}</div>
    </div>
  );

  const designationTemplate = (rowData) => (
    <div>
      <div className="font-medium">{rowData.designation}</div>
      <div className="text-sm text-gray-600">{rowData.phone}</div>
    </div>
  );

  return (
    <section className="contact-table" aria-label="Contact data table">
      <DataTable
        value={contacts}
        loading={loading}
        responsiveLayout="scroll"
        stripedRows
        className="text-sm shadow-2"
        paginator={true}
        rows={rowsPerPage}
        onPage={onPageChange}
        totalRecords={contacts.length}
        currentPageReportTemplate={`Showing {first} to {last} of {totalRecords} contacts`}
        emptyMessage={loading ? "Loading contacts..." : "No contacts found."}
        selectionMode="single"
        selection={selectedContact}
        onRowDoubleClick={onRowDoubleClickHandler}
        onSelectionChange={onSelectionChangeHandler}
        dataKey="clientContactId"
        showGridlines
        metaKeySelection={false}
        rowsPerPageOptions={[5, 10, 20]}
        scrollHeight="350px"
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
    </section>
  );
};

export default ContactTable;
