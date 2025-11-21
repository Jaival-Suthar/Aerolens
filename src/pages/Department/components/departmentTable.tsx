// src/pages/Department/components/DepartmentTable.tsx
import React, { useEffect, useState, useCallback } from "react";
import { DataTable, DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { getDepartments } from "../services/useDepartment";
import DepartmentAddEdit from "../components/departmentAddEdit";
import DepartmentDelete from "../components/departmentDelete";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import { Department, DepartmentTableProps } from "../types/departmentTypes";
import { useAuth } from "../../../shared/auth/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
const DepartmentTable: React.FC<DepartmentTableProps> = ({
  clientId,
  clientName,
  onBackClick,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  // ✅ LocalStorage Pagination (isolated for Department table)
const savedPage = Number(localStorage.getItem("departmentTablePage") || 0);
const savedRows = Number(localStorage.getItem("departmentTableRows") || 5);

const [first, setFirst] = useState(savedPage * savedRows);
const [rows, setRows] = useState(savedRows);
const onPageChange = (event: any) => {
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
    if (!clientId || !accessToken) return;

    try {
      const data = await getDepartments(accessToken, clientId); // ✅ fixed param order
      setDepartments(data.departments || []);
    } catch (error) {
    }
  }, [clientId, accessToken]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleAdd = (): void => {
    setEditingDepartment(null);
    setShowAddEditDialog(true);
  };

  const handleEdit = (): void => {
    if (!selectedDepartment) return;
    setEditingDepartment(selectedDepartment);
    setShowAddEditDialog(true);
  };

  const handleDelete = (): void => {
    if (!selectedDepartment) return;
    setShowDeleteDialog(true);
  };

  const handleAddEditSuccess = (): void => {
    void loadDepartments();
  };
  
  const handleDeleteSuccess = (): void => {
    void loadDepartments();
  };
  
  const handleClearSelection = (): void => setSelectedDepartment(null);
  const handleAddEditDialogHide = (): void => {
    setShowAddEditDialog(false);
    setEditingDepartment(null);
  };
  const handleDeleteDialogHide = (): void => setShowDeleteDialog(false);

  const handleSelectionChange = (e: any): void => {
  const dept = Array.isArray(e.value) ? e.value[0] || null : e.value;
  setSelectedDepartment(dept);
};

  return (
    <>
      <div className="flex justify-content-between align-items-center mb-4 w-full">
        <div className="flex justify-content-start align-items-center">
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-100 transition"
          >
            <FaArrowLeft />
            Back to Clients
          </button>
        </div>

        <div className="flex gap-2 ml-auto mr-6">
          <AddButton onClick={handleAdd} disabled={!clientId} />
          <EditButton onClick={handleEdit} disabled={!selectedDepartment} />
          <DeleteButton onClick={handleDelete} disabled={!selectedDepartment} />
        </div>
      </div>

      <h4 className="mb-3">Departments for: {clientName}</h4>

      <DataTable
        value={departments}
        paginator
        rows={rows}
        first={first}
        onPage={onPageChange}
        rowsPerPageOptions={[5, 10, 20]}
        dataKey="departmentId"
        selectionMode="single"
        selection={selectedDepartment}
        onSelectionChange={handleSelectionChange}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
        <Column field="departmentId" header="ID" />
        <Column field="departmentName" header="Department Name" />
        <Column field="departmentDescription" header="Description" />
      </DataTable>
      {/* Add/Edit Dialog */}
      <DepartmentAddEdit
        visible={showAddEditDialog}
        onHide={handleAddEditDialogHide}
        selectedDepartment={editingDepartment}
        clientId={clientId}
        onSuccess={handleAddEditSuccess}
      />
      {/* Delete Dialog */}
      <DepartmentDelete
        visible={showDeleteDialog}
        onHide={handleDeleteDialogHide}
        selectedDepartment={selectedDepartment}
        onSuccess={handleDeleteSuccess}
        onClearSelection={handleClearSelection}
      />
    </>
  );
};

export default DepartmentTable;
