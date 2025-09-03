import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    departmentName: "",
    departmentDescription: "",
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Fetch Departments (GET API)
  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${baseUrl}/client?page=${page}&limit=${limit}`);
      const data = await res.json();
      // setDepartments(data.data || data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open Add dialog (form blank)
  const openAddDialog = () => {
    setFormData({ id: null, clientId: "", clientName: "", departmentName: "", departmentDescription: "" });
    setVisible(true);
  };

  // Open Edit dialog (populate form)
  const openEditDialog = (dept) => {
    setFormData(dept);
    setVisible(true);
  };

  // Submit form (POST)
const handleSubmit = async () => {
  try {
    // Always POST for now
    const url = `${baseUrl}/department`;   // ✅ corrected

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: Number(formData.clientId), // ensure it's a number
        departmentName: formData.departmentName,
        departmentDescription: formData.departmentDescription,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      fetchDepartments(); // refresh table
      setVisible(false);
      setFormData({ clientId: "", departmentName: "", departmentDescription: "" });
    } else {
      console.error("Error:", data.message || data);
    }
  } catch (error) {
    console.error("Server Error:", error);
  }
};

  // Delete department
  const handleDelete = async (dept) => {
    try {
      const res = await fetch(`${baseUrl}/department/${dept.id}`, { method: "DELETE" });
      if (res.ok) fetchDepartments();
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  // Action buttons
  const actionBody = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-text" onClick={() => openEditDialog(rowData)} />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => handleDelete(rowData)} />
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="mb-3">Departments</h2>
      <Button label="Add Department" icon="pi pi-plus" onClick={openAddDialog} className="mb-3" />
      {/* <Column body={actionBody} header="Actions" /> */}

      <DataTable
        value={departments}
        selection={selectedDepartments}
        onSelectionChange={(e) => setSelectedDepartments(e.value)}
        selectionMode="checkbox"
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
        <Column field="clientName" header="Client Name" />
        <Column field="departmentName" header="Department Name" />
        <Column field="departmentDescription" header="Department Description" />
        <Column body={actionBody} header="Actions" />  {/* ✅ Action buttons here */}

      </DataTable>

      <Dialog header={formData.id ? "Edit Department" : "Add Department"} visible={visible} style={{ width: "30vw" }} onHide={() => setVisible(false)}>
        <div className="flex flex-col gap-3">
          <InputText name="clientId" placeholder="Client ID" value={formData.clientId} onChange={handleChange} />
          <InputText name="departmentName" placeholder="Department Name" value={formData.departmentName} onChange={handleChange} />
          <InputText name="departmentDescription" placeholder="Department Description" value={formData.departmentDescription} onChange={handleChange} />
          <Button label="Save" icon="pi pi-check" onClick={handleSubmit} className="mt-2" />
        </div>
      </Dialog>
    </div>
  );
};

export default Department;
