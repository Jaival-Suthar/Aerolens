import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/Department/components/DepartmentTable.tsx
import { useEffect, useState, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getDepartments } from "../services/useDepartment";
import DepartmentAddEdit from "../components/departmentAddEdit";
import DepartmentDelete from "../components/departmentDelete";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import { useAuth } from "../../../shared/auth/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
const DepartmentTable = ({ clientId, clientName, onBackClick, }) => {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [showAddEditDialog, setShowAddEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    // ✅ LocalStorage Pagination (isolated for Department table)
    const savedPage = Number(localStorage.getItem("departmentTablePage") || 0);
    const savedRows = Number(localStorage.getItem("departmentTableRows") || 5);
    const [first, setFirst] = useState(savedPage * savedRows);
    const [rows, setRows] = useState(savedRows);
    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
        const pageIndex = event.page; // starts from 0
        localStorage.setItem("departmentTablePage", pageIndex.toString());
        localStorage.setItem("departmentTableRows", event.rows.toString());
    };
    // ✅ Add Auth Hook
    const { accessToken } = useAuth();
    // ✅ Load departments
    const loadDepartments = useCallback(async () => {
        if (!clientId || !accessToken)
            return;
        try {
            const data = await getDepartments(accessToken, clientId); // ✅ fixed param order
            setDepartments(data.departments || []);
            console.log("Departments loaded:", data);
        }
        catch (error) {
            console.error("Error loading departments:", error);
        }
    }, [clientId, accessToken]);
    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);
    const handleAdd = () => {
        setEditingDepartment(null);
        setShowAddEditDialog(true);
    };
    const handleEdit = () => {
        if (!selectedDepartment)
            return;
        setEditingDepartment(selectedDepartment);
        setShowAddEditDialog(true);
    };
    const handleDelete = () => {
        if (!selectedDepartment)
            return;
        setShowDeleteDialog(true);
    };
    const handleAddEditSuccess = () => {
        void loadDepartments();
    };
    const handleDeleteSuccess = () => {
        void loadDepartments();
    };
    const handleClearSelection = () => setSelectedDepartment(null);
    const handleAddEditDialogHide = () => {
        setShowAddEditDialog(false);
        setEditingDepartment(null);
    };
    const handleDeleteDialogHide = () => setShowDeleteDialog(false);
    const handleSelectionChange = (e) => {
        const dept = Array.isArray(e.value) ? e.value[0] || null : e.value;
        setSelectedDepartment(dept);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-content-between align-items-center mb-4 w-full", children: [_jsx("div", { className: "flex justify-content-start align-items-center", children: _jsxs("button", { onClick: onBackClick, className: "flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-100 transition", children: [_jsx(FaArrowLeft, {}), "Back to Clients"] }) }), _jsxs("div", { className: "flex gap-2 ml-auto mr-6", children: [_jsx(AddButton, { onClick: handleAdd, disabled: !clientId }), _jsx(EditButton, { onClick: handleEdit, disabled: !selectedDepartment }), _jsx(DeleteButton, { onClick: handleDelete, disabled: !selectedDepartment })] })] }), _jsxs("h4", { className: "mb-3", children: ["Departments for: ", clientName] }), _jsxs(DataTable, { value: departments, paginator: true, rows: rows, first: first, onPage: onPageChange, rowsPerPageOptions: [5, 10, 20], dataKey: "departmentId", selectionMode: "single", selection: selectedDepartment, onSelectionChange: handleSelectionChange, tableStyle: { minWidth: "50rem" }, children: [_jsx(Column, { selectionMode: "single", headerStyle: { width: "3rem" } }), _jsx(Column, { field: "departmentId", header: "ID" }), _jsx(Column, { field: "departmentName", header: "Department Name" }), _jsx(Column, { field: "departmentDescription", header: "Description" })] }), _jsx(DepartmentAddEdit, { visible: showAddEditDialog, onHide: handleAddEditDialogHide, selectedDepartment: editingDepartment, clientId: clientId, onSuccess: handleAddEditSuccess }), _jsx(DepartmentDelete, { visible: showDeleteDialog, onHide: handleDeleteDialogHide, selectedDepartment: selectedDepartment, onSuccess: handleDeleteSuccess, onClearSelection: handleClearSelection })] }));
};
export default DepartmentTable;
