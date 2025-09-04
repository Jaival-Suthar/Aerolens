import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";

const API_BASE_URL = "https://aerolens-backend.onrender.com"; // Define the base URL here

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
      const response = await fetch(`${API_BASE_URL}/client/${clientId}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch departments");
      }
      const result = await response.json();
      if (result.success && result.data?.departments) {
        console.log(result.data.clientId)
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
  }, []);

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

  const handleSaveDepartment = async () => {
    if (!department.departmentName.trim() || !department.departmentDescription.trim()) {
      console.error("Department name and description cannot be empty.");
      return;
    }
    
    setLoading(true);
    try {
        if (department.departmentId) {
            // PUT request to update an existing department
            const response = await fetch(`${API_BASE_URL}/department`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(department),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to update department");
            }

            const updatedDept = await response.json();
            setDepartments(
                departments.map((dept) =>
                    dept.departmentId === updatedDept.departmentId ? updatedDept : dept
                )
            );
        } else {
            // POST request to add a new department
            const payload = {
                clientId: clientId,
                departmentName: department.departmentName,
                departmentDescription: department.departmentDescription,
            };

            const response = await fetch(`${API_BASE_URL}/department`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to add department");
            }

            const newDept = await response.json();
            await fetchDepartments();
            // setDepartments([...departments, newDept]);
            console.log("Department added:", newDept);
            console.log(departments)
          }
    } catch (error) {
        console.error("Error saving department:", error);
        setError(error.message);
    } finally {
        setLoading(false);
        setDepartmentDialog(false);
        setDepartment({
            departmentId: null,
            departmentName: "",
            departmentDescription: "",
        });
    }
};


  const editDepartment = () => {
    if (selectedDepartment) {
      setDepartment({ ...selectedDepartment });
      setDepartmentDialog(true);
    }
  };

  const confirmDeleteDepartment = async () => {
    if (selectedDepartment) {
      setLoading(true);
      try {
          const response = await fetch(
              `${API_BASE_URL}/department/${selectedDepartment.departmentId}`,
              {
                  method: "DELETE",
              }
          );

          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.message || "Failed to delete department");
          }

          setDepartments(
              departments.filter((dept) => dept.departmentId !== selectedDepartment.departmentId)
          );
          setSelectedDepartment(null);
          console.log("Department deleted successfully");
      } catch (error) {
          console.error("Error deleting department:", error);
          setError(error.message);
      } finally {
          setLoading(false);
      }
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