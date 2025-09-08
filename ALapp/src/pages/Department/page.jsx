// src/pages/Department/page.tsx
import { useState } from "react";
import { SplitButton } from "primereact/splitbutton";
import ClientTable from "./components/ClientTable";
import DepartmentTable from "./components/departmentTable";
import { Button } from "primereact/button";
const DepartmentPage = () => {
  const [selectedClient, setSelectedClient] = useState(null);
// for client selection

  const [viewMode, setViewMode] = useState("list");
// controlling state for view mode: "list" or "departments". then when go to 
// departments view, show the DepartmentTable component and then a button to go back to list view
//button logic is below in handleGoBack function
const menuItems = [
  // {
  //   label: "List",
  //   icon: "pi pi-list",
  //   command: () => setViewMode("list"),
  // },
  {
    label: " View  Departments",
    icon: "pi pi-sitemap",
    command: () => setViewMode("departments"),
  },
];
  // const handleGotodepartment = () => {
  //   setViewMode("departments");
  // };
  const handleGoBack = () => {
    setViewMode("list");
  };
//   <SplitButton
//   label="Settings"
//   icon="pi pi-cog"
//   model={menuItems}
//   tooltip="Settings"
//   tooltipOptions={{ position: "bottom" }}
//   disabled={!selectedClient}
//   aria-label="Settings"
// />
  return (
    <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
        <div className="flex justify-end">
        {viewMode === "list" ? (
         <SplitButton
         label="ClientList"
         icon="pi pi-cog"
         model={menuItems}
        //  tooltip="Settings"
         tooltipOptions={{ position: "bottom" }}
         disabled={!selectedClient}
        //  aria-label="Settings"
       />
        ) : (
          <Button
            label="Back to Clients"
            icon="pi pi-arrow-left"
            onClick={handleGoBack}
            className="p-button-text"
          />
        )}
      </div>

      <div>
        {viewMode === "list" ? (
          <ClientTable
          selectedClient={selectedClient} // lets ClientTable know which row to highlight
          onSelectionChange={(client) => setSelectedClient(client)}
// onSelectionChange passes the selected client back to this page

        />
        
        ) : (
          selectedClient && (
            <DepartmentTable
              clientId={selectedClient.clientId}
              clientName={selectedClient.clientName}
            />
          )
        )}
      </div>
    </div>
  );
};

export default DepartmentPage;
