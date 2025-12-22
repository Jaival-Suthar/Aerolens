// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import type { DataTablePageEvent, DataTableRowClickEvent, DataTableSelectionSingleChangeEvent } from 'primereact/datatable';
// import type { Contact, ContactTableProps } from '../types/contactTypes';

// const ContactTable: React.FC<ContactTableProps> = ({
//   contacts = [],
//   loading = false,
//   selectedContact,
//   onSelectionChange,
//   onRowDoubleClick
// }) => {
//   // Load saved pagination from localStorage
// const savedRows = Number(localStorage.getItem("contact_rows")) || 10;
// const savedPage = Number(localStorage.getItem("contact_page")) || 0;

// const [rowsPerPage, setRowsPerPage] = useState<number>(savedRows);
// const [first, setFirst] = useState<number>(savedPage * savedRows);


//   // Event handler for page changes
//   const onPageChange = useCallback((event: DataTablePageEvent) => {
//   setRowsPerPage(event.rows);
//   setFirst(event.first);

//   // Save to localStorage
//   localStorage.setItem("contact_rows", String(event.rows));
//   localStorage.setItem("contact_page", String(event.first / event.rows));
// }, []);


//   const onSelectionChangeHandler = useCallback(
//     (e: DataTableSelectionSingleChangeEvent<Contact[]>) => {
//       onSelectionChange?.(e.value as Contact | null);
//     },
//     [onSelectionChange]
//   );

//   const onRowDoubleClickHandler = useCallback(
//     (e: DataTableRowClickEvent) => {
//       if (e.data) {
//         onRowDoubleClick?.(e.data as Contact);
//       }
//     },
//     [onRowDoubleClick]
//   );

//   // Memoize template functions to prevent unnecessary re-renders
//   const contactPersonTemplate = useCallback((rowData: Contact) => (
//     <div>
//       <div className="font-medium">{rowData.contactPersonName}</div>
//       <div className="text-sm text-gray-600">{rowData.email}</div>
//     </div>
//   ), []);

//   const designationTemplate = useCallback((rowData: Contact) => (
//     <div>
//       <div className="font-medium">{rowData.designation}</div>
//       <div className="text-sm text-gray-600">{rowData.phone}</div>
//     </div>
//   ), []);

//   // Memoize constants
//   const cellClass = useMemo(() => "py-1 px-2", []);
//   const headerClass = useMemo(() => "py-1 px-2 font-semibold", []);

//   return (
//     <section className="contact-table" aria-label="Contact data table" style={{
//     display: "flex",
//     flexDirection: "column",
//     minHeight: 0,
//     overflow: "hidden",
//   }}>
//       <DataTable
//         value={contacts}
//         loading={loading}
//         stripedRows
//         className="text-sm"
//         paginator={true}
//         first={first}
//         rows={rowsPerPage}
//         scrollable
//         scrollHeight="flex"
//         style={{ flex: 1 }}
//         onPage={onPageChange}
//         paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
//         currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Contacts"
//         emptyMessage={loading ? "Loading contacts..." : "No contacts found."}
//         selectionMode="single"
//         selection={selectedContact}
//         onRowDoubleClick={onRowDoubleClickHandler}
//         onSelectionChange={onSelectionChangeHandler}
//         dataKey="clientContactId"
//         showGridlines
//         metaKeySelection={false}
//         rowsPerPageOptions={[10, 20, 50]}
//       >
//         <Column
//           selectionMode="single"
//           headerStyle={{ width: '3rem' }}
//         />
//         <Column
//           field="clientContactId"
//           header="Contact ID"
//           sortable
//           bodyClassName={cellClass}
//           headerClassName={headerClass}
//           style={{ minWidth: '8rem' }}
//         />
//         <Column
//           field="contactPersonName"
//           header="Contact Person"
//           sortable
//           body={contactPersonTemplate}
//           bodyClassName={cellClass}
//           headerClassName={headerClass}
//           style={{ minWidth: '16rem' }}
//         />
//         <Column
//           field="designation"
//           header="Designation"
//           sortable
//           body={designationTemplate}
//           bodyClassName={cellClass}
//           headerClassName={headerClass}
//           style={{ minWidth: '14rem' }}
//         />
//       </DataTable>
//     </section>
//   );
// };

// export default ContactTable;