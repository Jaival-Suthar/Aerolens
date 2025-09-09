// src/pages/Department/components/DepartmentTable.jsx
import React, { useEffect, useState } from "react";
import { confirmDialog } from "primereact/confirmdialog";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/useDepartment";

const DepartmentTable = ({ clientId }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    if (clientId) {
      loadDepartments();
    }
  }, [clientId]);
// for fetch implementation
  const loadDepartments = async () => {
    const data = await getDepartments(clientId);
    setDepartments(data.departments);
  };
  const handleAdd = async () => {
    console.log("Adding new department for clientId:", clientId);
    await addDepartment({ clientId, departmentName, departmentDescription });
    loadDepartments();
  };
  
  const handleUpdate = () => {
    if (!selectedDepartment) return;

    confirmDialog({
      message: `Are you sure you want to save changes to department "${selectedDepartment.departmentName}"?`,
      header: "Confirm Update",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-success",
      accept: async () => {
        await updateDepartment(selectedDepartment);
        loadDepartments();
        console.log(`Department "${selectedDepartment.departmentName}" updated successfully`);
      },
      reject: () => {
        console.log("Update cancelled");
      },
    });
  };

  const handleDelete = () => {
    if (!selectedDepartment) return;

    confirmDialog({
      message: `Are you sure you want to delete department "${selectedDepartment.departmentName}"?`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await deleteDepartment(selectedDepartment.departmentId);
        setSelectedDepartment(null); // Clear selection after deletion
        loadDepartments();
      },
      reject: () => {
        console.log("Deletion cancelled");
      },
    });
  };

  return (
    <div>
      <div className="flex justify-content-between align-items-center mb-3">
        <h2>Departments</h2>
        <div className="flex gap-2">
          <Button
            icon="pi pi-plus"
            label="Add"
            severity="info"
            onClick={handleAdd}
          />
          <Button
            icon="pi pi-pencil"
            label="Edit"
            onClick={handleUpdate}
            disabled={!selectedDepartment}
          />
          <Button
            icon="pi pi-trash"
            label="Delete"
            severity="danger"
            onClick={handleDelete}
            disabled={!selectedDepartment}
          />
        </div>
      </div>
      <DataTable
        value={departments}
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
    </div>
  );
};

export default DepartmentTable;