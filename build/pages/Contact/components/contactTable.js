import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
const ContactTable = ({ contacts = [], loading = false, selectedContact, onSelectionChange, onRowDoubleClick }) => {
    // Load saved pagination from localStorage
    const savedRows = Number(localStorage.getItem("contact_rows")) || 5;
    const savedPage = Number(localStorage.getItem("contact_page")) || 0;
    const [rowsPerPage, setRowsPerPage] = useState(savedRows);
    const [first, setFirst] = useState(savedPage * savedRows);
    // Event handler for page changes
    const onPageChange = useCallback((event) => {
        setRowsPerPage(event.rows);
        setFirst(event.first);
        // Save to localStorage
        localStorage.setItem("contact_rows", String(event.rows));
        localStorage.setItem("contact_page", String(event.first / event.rows));
    }, []);
    const onSelectionChangeHandler = useCallback((e) => {
        onSelectionChange?.(e.value);
    }, [onSelectionChange]);
    const onRowDoubleClickHandler = useCallback((e) => {
        if (e.data) {
            onRowDoubleClick?.(e.data);
        }
    }, [onRowDoubleClick]);
    // Memoize template functions to prevent unnecessary re-renders
    const contactPersonTemplate = useCallback((rowData) => (_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: rowData.contactPersonName }), _jsx("div", { className: "text-sm text-gray-600", children: rowData.email })] })), []);
    const designationTemplate = useCallback((rowData) => (_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: rowData.designation }), _jsx("div", { className: "text-sm text-gray-600", children: rowData.phone })] })), []);
    // Memoize constants
    const cellClass = useMemo(() => "py-1 px-2", []);
    const headerClass = useMemo(() => "py-1 px-2 font-semibold", []);
    return (_jsx("section", { className: "contact-table", "aria-label": "Contact data table", children: _jsxs(DataTable, { value: contacts, loading: loading, responsiveLayout: "scroll", stripedRows: true, className: "text-sm", paginator: true, first: first, rows: rowsPerPage, onPage: onPageChange, totalRecords: contacts.length, currentPageReportTemplate: `Showing {first} to {last} of {totalRecords} contacts`, emptyMessage: loading ? "Loading contacts..." : "No contacts found.", selectionMode: "single", selection: selectedContact, onRowDoubleClick: onRowDoubleClickHandler, onSelectionChange: onSelectionChangeHandler, dataKey: "clientContactId", showGridlines: true, metaKeySelection: false, rowsPerPageOptions: [5, 10, 20, 50], scrollHeight: "350px", children: [_jsx(Column, { selectionMode: "single", headerStyle: { width: '3rem' }, frozen: true }), _jsx(Column, { field: "clientContactId", header: "Contact ID", sortable: true, bodyClassName: cellClass, headerClassName: headerClass, style: { minWidth: '8rem' } }), _jsx(Column, { field: "contactPersonName", header: "Contact Person", sortable: true, body: contactPersonTemplate, bodyClassName: cellClass, headerClassName: headerClass, style: { minWidth: '16rem' } }), _jsx(Column, { field: "designation", header: "Designation", sortable: true, body: designationTemplate, bodyClassName: cellClass, headerClassName: headerClass, style: { minWidth: '14rem' } })] }) }));
};
export default ContactTable;
