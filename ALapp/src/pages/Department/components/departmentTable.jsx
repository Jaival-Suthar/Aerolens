// src/pages/Department/components/DepartmentTable.jsx
import React, { useEffect, useState } from "react";
import { confirmDialog } from "primereact/confirmdialog";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { getDepartments, addDepartment, updateDepartment, deleteDepartment } 
  from "../services/useDepartment";

const DepartmentTable = ({ clientId }) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (clientId) {
      loadDepartments();
    }
  }, [clientId]);

  const loadDepartments = async () => {
    const data = await getDepartments(clientId);
    setDepartments(data.departments);
  };

  const handleAdd = async () => {
    const newDept = { clientId, departmentName: "New Dept", departmentDescription: "Test" };
    await addDepartment(newDept);
    loadDepartments();
  };

  const handleUpdate = (dept) => {
    confirmDialog({
      message: `Are you sure you want to save changes to department "${dept.departmentName}"?`,
      header: "Confirm Update",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-success",
      accept: async () => {
        await updateDepartment(dept);
        loadDepartments();
        console.log(`Department "${dept.departmentName}" updated successfully`);
      },
      reject: () => {
        console.log("Update cancelled");
      }
    });
  };
  
  const handleDelete = (deptId, deptName) => {
    confirmDialog({
      message: `Are you sure you want to delete department "${deptName}"?`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await deleteDepartment(deptId);
        loadDepartments();
      },
      reject: () => {
        console.log("Deletion cancelled");
      }
    });
  };

  return (
    <div>
      <h2>Departments</h2>
      <Button label="Add Department" onClick={handleAdd} className="mb-3" />
      <DataTable value={departments} dataKey="departmentId" tableStyle={{ minWidth: "50rem" }}>
        <Column field="departmentId" header="ID" />
        <Column field="departmentName" header="Department Name" />
        <Column field="departmentDescription" header="Description" />
        <Column
          body={(rowData) => (
            <>
              <Button label="Edit" onClick={() => handleUpdate(rowData)} className="p-button-sm" />
              <Button label="Delete" onClick={() => handleDelete(rowData.departmentId)} severity="danger" className="p-button-sm ml-2" />
            </>
          )}
        />
      </DataTable>
    </div>
  );
};

export default DepartmentTable;
