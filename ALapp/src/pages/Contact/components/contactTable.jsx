import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';

const sampleContactsData = [
  { contactId: 1, personName: 'John Doe', designation: 'Manager' },
  { contactId: 2, personName: 'Jane Smith', designation: 'Developer' },
  { contactId: 3, personName: 'Alice Johnson', designation: 'Designer' },
  { contactId: 4, personName: 'Bob Brown', designation: 'Tester' },
  { contactId: 5, personName: 'Carol Clark', designation: 'Designer' },
  { contactId: 6, personName: 'David Lee', designation: 'Developer' },
  { contactId: 7, personName: 'Eva Green', designation: 'Manager' }
];

const ContactTable = ({ selectedContact, onSelectionChange }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state for demonstration
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Load data with pagination simulation
  useEffect(() => {
    setLoading(true);
    // Simulate async loading
    const timeout = setTimeout(() => {
      const startIndex = (currentPage - 1) * rowsPerPage;
      const pagedData = sampleContactsData.slice(startIndex, startIndex + rowsPerPage);
      setContacts(pagedData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [currentPage, rowsPerPage]);

  const totalRecords = sampleContactsData.length;

  const onPageChange = useCallback((event) => {
    setCurrentPage(event.page + 1); // PrimeReact paginator uses 0-based index
    setRowsPerPage(event.rows);
  }, []);

  const onSelectionChangeHandler = useCallback((e) => {
    if (onSelectionChange) {
      onSelectionChange(e.value);
    }
  }, [onSelectionChange]);

  const cellClass = "py-1 px-2";
  const headerClass = "py-1 px-2 font-semibold";

  return (
    <section className="contact-table" aria-label="Contact data table">
      <DataTable
        value={contacts}
        loading={loading}
        responsiveLayout="scroll"
        stripedRows
        className="text-m shadow-2"
        paginator={false} // use separate Paginator component
        scrollHeight="350px"
        emptyMessage={loading ? "Loading contacts..." : "No contacts found."}
        selectionMode="single"
        selection={selectedContact}
        onSelectionChange={onSelectionChangeHandler}
        dataKey="contactId"
        showGridlines
      >
        <Column
          selectionMode="single"
          headerStyle={{ width: '3rem' }}
          frozen
        />
        <Column
          field="contactId"
          header="Contact ID"
          sortable
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: '8rem' }}
        />
        <Column
          field="personName"
          header="Contact Person Name"
          sortable
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: '14rem' }}
        />
        <Column
          field="designation"
          header="Designation"
          sortable
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ minWidth: '12rem' }}
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
