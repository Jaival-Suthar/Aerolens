// // It renders a ClientTable component, which shows available clients.

// When you click/select one, onSelectionChange sets selectedClient in state.

// Switches between two views using a dropdown:

// "list" → shows the client list (ClientTable).

// "details" → once a client is selected, it shows that client’s department info (DepartmentTable).

// Handles department creation:

// It defines addDepartment, which sends a POST request to your backend (${API_BASE_URL}/department) with clientId, departmentName, and departmentDescription.

// This function is passed into DepartmentTable so that the department form inside that component can call it when creating a new department.
import { useState } from "react";
import ClientTable from "./components/clientTable";
import { Dropdown } from "primereact/dropdown";
import DepartmentTable from "./components/departmentTable";
// import useContact from './services/useDepartment';

const Departments = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // dropdown state

  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  // API call for department creation
  const addDepartment = async (department) => {
    if (!selectedClient) return;

    try {
      const payload = {
        clientId: selectedClient.clientId,
        departmentName: department.departmentName,
        departmentDescription: department.departmentDescription,
      };

      const response = await fetch(`${API_BASE_URL}/department`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to add department");

      const data = await response.json();
      console.log("Department added:", data);

      // Clear local form state (remove if handled inside DepartmentTable)
      // setDepartmentName("");
      // setDepartmentDescription("");

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
