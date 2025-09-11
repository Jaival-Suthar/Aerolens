// src/pages/Department/components/DepartmentTable.jsx
import React, { useEffect, useState } from "react";
import { Paginator } from "primereact/paginator";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { getDepartments } from "../services/useDepartment";
import DepartmentAddEdit from "./departmentAddEdit";
import DepartmentDelete from "./departmentDelete";

const DepartmentTable = ({ clientId,clientName, onBackClick }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  useEffect(() => {
    if (clientId) {
      loadDepartments();
    }
  }, [clientId]);
  // Fetch departments implementation
  const loadDepartments = async () => {
    try {
      const data = await getDepartments(clientId);
      setDepartments(data.departments);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };
console.log(departments)

  const handleAdd = () => {
    setShowAddEditDialog(true);
  };

  const handleEdit = () => {
    if (!selectedDepartment) return;
     // Set selected department for edit mode
     console.log("Editing department:", selectedDepartment);
      setEditingDepartment(selectedDepartment); // Set the department to be edited
    setShowAddEditDialog(true);
  };

  const handleDelete = () => {
    if (!selectedDepartment) return;
    setShowDeleteDialog(true);
  };

  const handleAddEditSuccess = () => {
    loadDepartments();
  };

  const handleDeleteSuccess = () => {
    loadDepartments();
  };

  const handleClearSelection = () => {
    setSelectedDepartment(null);
  };

  const handleAddEditDialogHide = () => {
    setShowAddEditDialog(false);
    setEditingDepartment(null);
  };

  const handleDeleteDialogHide = () => {
    setShowDeleteDialog(false);
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
          size="medium"
        />
          </div>
          
          <div className="flex gap-2 ml-auto mr-6">
          
            <Button
              text={false}
              rounded
              icon="pi pi-plus"
              size="large"
              severity="success"
              onClick={handleAdd}
              outlined={false}
              className="font-medium"
              disabled={!clientId}
              aria-label="Add"
              tooltip="Add Department"
              tooltipOptions={{ position: "bottom" }}
            />
            <Button
              text
              rounded
              icon="pi pi-pencil"
              size="large"
              onClick={handleEdit}
              disabled={!selectedDepartment}
              aria-label="Edit"
              tooltip="Edit Department"
              tooltipOptions={{ position: "bottom" }}
            />
            <Button
              text
              rounded
              icon="pi pi-trash"
              size="large"
              severity="danger"
              onClick={handleDelete}
              disabled={!selectedDepartment}
              aria-label="Delete"
              tooltip="Delete Department"
              tooltipOptions={{ position: "bottom" }}
            />
          </div>
        </div>

        <h2> Departments for: {clientName}</h2>
        <DataTable
          value={departments}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 20]}
          dataKey="departmentId"
          selectionMode="single"
          selection={selectedDepartment}
          onSelectionChange={(e) => setSelectedDepartment(e.value)}
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
        departments={departments}
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

{/* { totalRecords > 0 && (
        <Paginator
          first={(currentPage - 1) * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          rowsPerPageOptions={[5, 10, 20]}
          className="mt-3"
        />
      )} */}
    </>
  );
};

export default DepartmentTable;


