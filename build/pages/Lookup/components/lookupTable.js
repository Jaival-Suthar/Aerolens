import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { DataTable, } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AddButton from '../../../shared/AddButton';
//import DeleteButton from '../../../shared/DeleteButton';
import { AddLookupForm } from './AddLookupForm';
const LookupTable = ({ data, meta, loading = false, onPageChange, onSelectionChange, onDataChange, }) => {
    const [selectedLookup, setSelectedLookup] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    // const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    // Memoized selection handler with strict typing
    const onSelectionChangeHandler = useCallback((e) => {
        // Defensive check and normalization
        const selected = e?.value && typeof e.value === 'object' && 'lookupKey' in e.value ? e.value : null;
        setSelectedLookup(selected);
        onSelectionChange?.(selected);
    }, [onSelectionChange]);
    // Page change handler, calculates new page and limit correctly
    const handlePageChange = useCallback((event) => {
        const newPage = Math.floor(event.first / event.rows) + 1;
        const newLimit = event.rows;
        onPageChange(newPage, newLimit);
    }, [onPageChange]);
    const handleAddClick = () => setShowAddDialog(true);
    // Add success callback resets relevant data
    const handleAddSuccess = useCallback(() => {
        onDataChange?.();
    }, [onDataChange]);
    // Delete success callback clears selection and refreshes data
    // const handleDeleteSuccess = useCallback(() => {
    //   setSelectedLookup(null);
    //   onSelectionChange?.(null);
    //   onDataChange?.();
    // }, [onSelectionChange, onDataChange]);
    // Calculate index of first record for paginator
    const first = meta ? (meta.currentPage - 1) * meta.limit : 0;
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex justify-content-between align-items-center mb-2", children: [_jsx("h2", { children: "Lookup Data" }), _jsx("div", { className: "flex gap-2", children: _jsx(AddButton, { onClick: handleAddClick }) })] }), _jsxs(DataTable, { value: data, loading: loading, paginator: true, first: first, rows: meta?.limit || 10, totalRecords: meta?.totalRecords || 0, lazy: true, onPage: handlePageChange, responsiveLayout: "scroll", className: "p-datatable-sm", selectionMode: "single", selection: selectedLookup, onSelectionChange: onSelectionChangeHandler, dataKey: "lookupKey", emptyMessage: "No lookup entries found", paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown", currentPageReportTemplate: "Showing {first} to {last} of {totalRecords} entries", rowsPerPageOptions: [5, 10, 25, 50], children: [_jsx(Column, { selectionMode: "single", headerStyle: { width: '3rem' }, frozen: true }), _jsx(Column, { field: "lookupKey", header: "Key", sortable: true }), _jsx(Column, { field: "tag", header: "Tag", sortable: true }), _jsx(Column, { field: "value", header: "Value" })] }), _jsx(AddLookupForm, { visible: showAddDialog, onHide: () => setShowAddDialog(false), onSuccess: handleAddSuccess })] }));
};
export default LookupTable;
