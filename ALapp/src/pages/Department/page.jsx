// src/pages/Department/page.tsx
import { useState } from "react";
import { SplitButton } from "primereact/splitbutton";
import ClientTable from "../Dashboard/components/clientTable";
import DepartmentTable from "./components/departmentTable";
import { Button } from "primereact/button";

const DepartmentPage = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  const menuItems = [
    {
      label: " View  Departments",
      icon: "pi pi-sitemap",
      command: () => setViewMode("departments"),
    },
  ];

  const handleGoBack = () => {
    setViewMode("list");
  };

  return (
    <>
      <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
        <div className="flex justify-end">
          {viewMode === "list" ? (
            <SplitButton
              label="ClientList"
              icon="pi pi-cog"
              model={menuItems}
              tooltipOptions={{ position: "bottom" }}
              disabled={!selectedClient}
            />
          ) : null}
        </div>

        <div>
          {viewMode === "list" ? (
            <ClientTable
              selectedClient={selectedClient}
              onSelectionChange={(client) => setSelectedClient(client)}
            />
          ) : (
            selectedClient && (
              <DepartmentTable
                clientId={selectedClient.clientId}
                clientName={selectedClient.clientName}
                handleGoBack={handleGoBack} // pass the function
              />
            )
          )}
        </div>
      </div>
    </>
  );
};

export default DepartmentPage;
// src/pages/Department/page.tsx

