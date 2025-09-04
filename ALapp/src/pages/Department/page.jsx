// Departments.js
import { useState } from "react";
import ClientTable from "./components/clientTable";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import DepartmentTable from "./components/departmentTable";

const Departments = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // dropdown state



  // API call for department creation
  const addDepartment = async (department) => {
    if (!selectedClient) return;

    try {
      const payload = {
        clientId: selectedClient.clientId,
        departmentName: department.departmentName,
        departmentDescription: department.departmentDescription,
      };

      const response = await fetch(
        "https://aerolens-backend.onrender.com/department",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to add department");

      const data = await response.json();
      console.log("Department added:", data);

      // Clear local form state
      setDepartmentName("");
      setDepartmentDescription("");
      
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  const onSelectionChange = (client) => {
    setSelectedClient(client);
  };

  const viewOptions = [
    { label: "List View", value: "list" },
    { label: "Department Details", value: "details" },
  ];

  return (
    <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
      <div className="flex justify-content-between align-items-center mb-4 w-full">
        <Dropdown
          value={viewMode}
          options={viewOptions}
          onChange={(e) => setViewMode(e.value)}
          placeholder="Select View"
          disabled={!selectedClient}
        />
      </div>

      <div className="card">
        {viewMode === "list" ? (
          <ClientTable
            onEdit={() => {}}
            selectedClient={selectedClient}
            onSelectionChange={onSelectionChange}
          />
        ) : (
          selectedClient && (
            <DepartmentTable
              clientId={selectedClient.clientId}
              clientName={selectedClient.clientName}
              addDepartment={addDepartment}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Departments;
