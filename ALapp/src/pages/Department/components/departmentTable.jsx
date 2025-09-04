import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";

const DepartmentTable = ({ clientId }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientName, setClientName] = useState("");
  const [departmentDialog, setDepartmentDialog] = useState(false);
  const [department, setDepartment] = useState({
    departmentId: null,
    departmentName: "",
    departmentDescription: "",
  });
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const fetchDepartments = async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://aerolens-backend.onrender.com/client/${clientId}`
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch departments");
      }

      const result = await response.json();

      if (result.success && result.data?.departments) {
        setDepartments(result.data.departments);
        setClientName(result.data.clientName || "");
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [clientId]);

  const openNew = () => {
    setDepartment({
      departmentId: null,
      departmentName: "",
      departmentDescription: "",
    });
    setDepartmentDialog(true);
  };

  const hideDialog = () => {
    setDepartmentDialog(false);
  };

  const handleSaveDepartment = () => {
    if (!department.departmentName.trim() || !department.departmentDescription.trim()) {
      console.error("Department name and description cannot be empty.");
      return;
    }

    if (department.departmentId) {
      // Logic for editing an existing department
      setDepartments(
        departments.map((dept) =>
          dept.departmentId === department.departmentId ? department : dept
        )
      );
    } else {
      // Logic for adding a new department
      const newDept = {
        ...department,
        departmentId: departments.length > 0 ? Math.max(...departments.map(d => d.departmentId)) + 1 : 1,
      };
      setDepartments([...departments, newDept]);
    }

    setDepartmentDialog(false);
    setDepartment({
      departmentId: null,
      departmentName: "",
      departmentDescription: "",
    });
  };

  const editDepartment = () => {
    if (selectedDepartment) {
      setDepartment({ ...selectedDepartment });
      setDepartmentDialog(true);
    }
  };

  const confirmDeleteDepartment = () => {
    if (selectedDepartment) {
      console.log(`Deleting department with ID: ${selectedDepartment.departmentId}`);
      setDepartments(
        departments.filter((dept) => dept.departmentId !== selectedDepartment.departmentId)
      );
      setSelectedDepartment(null);
    }
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _department = { ...department };
    _department[`${name}`] = val;
    setDepartment(_department);
  };

  const dialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDialog}
      />
      <Button
        label="Save"
        icon="pi pi-check"
        className="p-button-text"
        onClick={handleSaveDepartment}
      />
    </React.Fragment>
  );

  const header = (
    <div className="table-header">
      <Button
        label="Add"
        icon="pi pi-plus"
        className="p-button-success mr-2"
        onClick={openNew}
      />
      <Button
        label="Edit"
        icon="pi pi-pencil"
        className="p-button-warning mr-2"
        onClick={editDepartment}
        disabled={!selectedDepartment}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={confirmDeleteDepartment}
        disabled={!selectedDepartment}
      />
    </div>
  );

  if (loading) return <p>Loading departments...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h3>Departments for Client {clientName}</h3>
      <DataTable
        value={departments}
        header={header}
        dataKey="departmentId"
        selectionMode="single"
        selection={selectedDepartment}
        onSelectionChange={(e) => setSelectedDepartment(e.value)}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column selectionMode="single" style={{ width: "3em" }} />
        <Column field="departmentId" header="Department ID" />
        <Column field="departmentName" header="Department Name" />
        <Column field="departmentDescription" header="Department Description" />
      </DataTable>

      <Dialog
        visible={departmentDialog}
        style={{ width: "450px" }}
        header="Department Details"
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
      >
        <div className="p-field">
          <label htmlFor="name">Department Name</label>
          <InputText
            id="name"
            value={department.departmentName}
            onChange={(e) => onInputChange(e, "departmentName")}
            required
            autoFocus
            className={classNames({
              "p-invalid": !department.departmentName.trim(),
            })}
          />
        </div>
        <div className="p-field mt-4">
          <label htmlFor="description">Description</label>
          <InputText
            id="description"
            value={department.departmentDescription}
            onChange={(e) => onInputChange(e, "departmentDescription")}
            required
            className={classNames({
              "p-invalid": !department.departmentDescription.trim(),
            })}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default DepartmentTable;