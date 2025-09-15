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
import { 
  Department, 
  DepartmentTableProps 
} from "../types/departmentTypes";

const DepartmentTable: React.FC<DepartmentTableProps> = ({ 
  clientId, 
  clientName, 
  onBackClick 
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const loadDepartments = useCallback(async () => {
  try {
    const data = await getDepartments(clientId);
    setDepartments(data.departments);
  } catch (error) {
    console.error("Error loading departments:", error);
  }
}, [clientId]);

useEffect(() => {
  if (clientId) {
    loadDepartments();
  }
}, [clientId, loadDepartments]);
  const handleAdd = (): void => {
    setEditingDepartment(null);
    setShowAddEditDialog(true);
  };

  const handleEdit = (): void => {
    if (!selectedDepartment) return;
    // Set selected department for edit mode
    setEditingDepartment(selectedDepartment);
    setShowAddEditDialog(true);
  };

  const handleDelete = (): void => {
    if (!selectedDepartment) return;
    setShowDeleteDialog(true);
  };

  const handleAddEditSuccess = (): void => {
    loadDepartments();
  };

  const handleDeleteSuccess = (): void => {
    loadDepartments();
  };

  const handleClearSelection = (): void => {
    setSelectedDepartment(null);
  };

  const handleAddEditDialogHide = (): void => {
    setShowAddEditDialog(false);
    setEditingDepartment(null);
  };

  const handleDeleteDialogHide = (): void => {
    setShowDeleteDialog(false);
  };

  const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<Department[]>): void => {
    setSelectedDepartment(e.value);
  };

  return (
    <>
      <div className="flex justify-content-between align-items-center mb-4 w-full">
        <div className="flex justify-content-start align-items-center">
          <Button
            label="Back to Clients"
            outlined
            severity="secondary"
            icon="pi pi-arrow-left"
            onClick={onBackClick}
            size="large"
          />
        </div>
        
        <div className="flex gap-2 ml-auto mr-6">
          <AddButton
            onClick={handleAdd}
            disabled={!clientId}
          />
          <EditButton
            onClick={handleEdit}
            disabled={!selectedDepartment}
          />
          <DeleteButton
            onClick={handleDelete}
            disabled={!selectedDepartment}
          />
        </div>
      </div>

      <h4 className="mb-3">Departments for: {clientName}</h4>
      
      <DataTable
        value={departments}
        paginator
        rows={5}
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