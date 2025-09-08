// src/pages/Department/page.tsx
import { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import ClientTable from "./components/ClientTable";
import "primereact/resources/themes/saga-blue/theme.css";   // theme (choose any)
import "primereact/resources/primereact.min.css";           // core
import "primeicons/primeicons.css";                        // icons

import DepartmentTable from "./components/departmentTable";
const viewOptions = [
  { label: "List", value: "list" },
  { label: "Departments", value: "departments" },
];

const DepartmentPage = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  return (
    <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
      {/* Always show ClientTable first */}
      <ClientTable
        onClientSelect={(client) => {
          console.log("✅ Client selected in ClientTable:", selectedClient);
          setSelectedClient(client);
        }}
      />      
      {/* Only show dropdown & departments after a client is selected */}
      {selectedClient && (
        <>
          <div className="flex justify-content-between align-items-center mb-4 w-full">
          <Dropdown
  value={viewMode}
  options={viewOptions}
  onChange={(e) => {
    setViewMode(e.value);
    console.log("📌 viewMode:", e.value);
  }}
  placeholder="Select View"
  disabled={!selectedClient}
/>

          </div>
          console.log(viewMode)
          <div className="card">
            {viewMode === "departments" && (
              <DepartmentTable
                clientId={selectedClient.clientId}
                clientName={selectedClient.clientName}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DepartmentPage;
