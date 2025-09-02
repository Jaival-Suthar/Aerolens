import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    departmentName: "",
    departmentDescription: "",
  });

  // ✅ Fetch Departments (you can hook this to your API)
  useEffect(() => {
    // Replace with GET request
    setDepartments([
      { id: 1, clientId: 123, clientName: "Client A", departmentName: "Finance", departmentDescription: "Handles financial matters" },
    ]);
  }, []);

  // ✅ Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Submit form
  const handleSubmit = async () => {
    try {
      const response = await fetch("https://aerolens-backend.onrender.com/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setDepartments([...departments, formData]); // update list
        setVisible(false);
        setFormData({ clientId: "", departmentName: "", departmentDescription: "" });
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Server Error:", error);
    }
  };

  // ✅ Action Buttons
  const actionBody = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-text" />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" />
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="mb-3">Departments</h2>
      <Button label="Add Department" icon="pi pi-plus" onClick={() => setVisible(true)} />

      {/* Table */}
      <DataTable value={departments} className="mt-4">
        <Column field="clientName" header="Client Name" />
        <Column field="departmentName" header="Department Name" />
        <Column field="departmentDescription" header="Department Description" />
        <Column body={actionBody} header="Actions" />
      </DataTable>

      {/* Add Form */}
      <Dialog header="Add Department" visible={visible} style={{ width: "30vw" }} onHide={() => setVisible(false)}>
        <div className="flex flex-col gap-3">
          <span className="p-float-label">
            <InputText id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} />
            <label htmlFor="clientId">Client ID</label>
          </span>

          <span className="p-float-label">
            <InputText id="departmentName" name="departmentName" value={formData.departmentName} onChange={handleChange} />
            <label htmlFor="departmentName">Department Name</label>
          </span>

          <span className="p-float-label">
            <InputText id="departmentDescription" name="departmentDescription" value={formData.departmentDescription} onChange={handleChange} />
            <label htmlFor="departmentDescription">Department Description</label>
          </span>

          <Button label="Save" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </Dialog>
    </div>
  );
};

export default Department;
