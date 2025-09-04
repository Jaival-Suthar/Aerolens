import { useState } from "react";
import ClientTable from "./components/clientTable";
import ClientAddEdit from "./components/departmentAddEdit";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

const Departments = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [editClient, setEditClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState("list"); // dropdown state

  // department form state (fixed to match backend keys)
  const [departmentName, setDepartmentName] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");

  // API call for department creation
  const addDepartment = async (department) => {
    try {
      const payload = {
        clientId: selectedClient.clientId, // auto attach selected client
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

      setDepartmentName("");
      setDepartmentDescription("");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };


  const onSelectionChange = (client) => {
    setSelectedClient(client);
    // dropdown becomes enabled, but does NOT auto-switch view
  };

  const viewOptions = [
    { label: "List View", value: "list" },
    { label: "Department Details", value: "details" },
  ];

  return (
    <div
      className="dashboard-container shadow-3 p-4"
      style={{ width: "100%", maxWidth: "100%" }}
    >
      <div className="flex justify-content-between align-items-center mb-4 w-full">
        {/* Dropdown for view mode, disabled if no client selected */}
        <Dropdown
          value={viewMode}
          options={viewOptions}
          onChange={(e) => setViewMode(e.value)}
          placeholder="Select View"
          disabled={!selectedClient} // dropdown only enabled after selecting a client
        />
      </div>

      <div className="card">
        {viewMode === "list" ? (
          <ClientTable
            onEdit={() => {}}
            refreshTrigger={refreshTrigger}
            selectedClient={selectedClient}
            onSelectionChange={onSelectionChange}
          />
        ) : (
          selectedClient && (
            <div className="p-4 border-round shadow-2">
              <h3>Department Details</h3>
              <p>
                <strong>Client:</strong> {selectedClient.clientName}
              </p>

              {/* Department Form */}
              <div className="p-fluid">
                <div className="p-field">
                  <label htmlFor="departmentName">Department Name</label>
                  <input
                    id="departmentName"
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="p-inputtext p-component"
                  />
                </div>
                <div className="p-field">
                  <label htmlFor="departmentDescription">
                    Department Description
                  </label>
                  <input
                    id="departmentDescription"
                    type="text"
                    value={departmentDescription}
                    onChange={(e) => setDepartmentDescription(e.target.value)}
                    className="p-inputtext p-component"
                  />
                </div>
                <Button
                  label="Save Department"
                  icon="pi pi-check"
                  onClick={() =>
                    addDepartment({ departmentName, departmentDescription })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          )
        )}
      </div>

      {dialogVisible && (
        <ClientAddEdit
          visible={dialogVisible}
          onHide={() => {
            setDialogVisible(false);
            setEditClient(null);
          }}
          onSave={addDepartment} // not used here but kept for consistency
          mode={dialogMode}
          client={editClient}
        />
      )}
    </div>
  );
};

export default Departments;
