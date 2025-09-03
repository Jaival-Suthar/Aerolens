import { useState } from 'react';
import ClientTable from './components/clientTable';
import ClientAddEdit from './components/departmentAddEdit';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { createClient, updateClient } from './services/clientService';

const Departments = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [editClient, setEditClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState("list"); // dropdown state

  const handleAdd = () => {
    setDialogMode("add");
    setEditClient({ clientName: "", address: "" });
    setDialogVisible(true);
  };

  const onSaveClient = async (client) => {
    try {
      if (dialogMode === "add") {
        await createClient({
          name: client.clientName?.trim() || "",
          address: client.address?.trim() || ""
        });
      } else {
        await updateClient({
          id: client.clientId,
          name: client.clientName?.trim() || "",
          address: client.address?.trim() || ""
        });
      }

      setRefreshTrigger(prev => prev + 1);
      setDialogVisible(false);
      setEditClient(null);
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const onSelectionChange = (client) => {
    setSelectedClient(client);
    // Do NOT change viewMode automatically — user must select from dropdown
  };

  const viewOptions = [
    { label: 'List View', value: 'list' },
    { label: 'Details View', value: 'details' }
  ];

//   // if (client) {
//   setViewMode("details");
// } else {
//   setViewMode("list");
// } remove this


  return (
    <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
      <div className="flex justify-content-between align-items-center mb-4 w-full">
        <Button
          label="Add Client"
          icon="pi pi-plus"
          severity="secondary"
          outlined
          size="medium"
          className="font-medium"
          onClick={handleAdd}
        />

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
              <p><strong>Department Name:</strong> {selectedClient.deptName}</p>
              <p><strong>Department Description:</strong> {selectedClient.deptDescription}</p>
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
          onSave={onSaveClient}
          mode={dialogMode}
          client={editClient}
        />
      )}
    </div>
  );
};

export default Departments;
