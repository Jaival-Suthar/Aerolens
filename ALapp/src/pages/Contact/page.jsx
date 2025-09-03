import { useState, useRef } from 'react';
import ClientTable from './components/clientTable';
import ClientAddEdit from './components/contactAddEdit';
import ClientDelete from './components/contactDelete';
import ContactTable from './components/contactTable';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const Contact = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [editClient, setEditClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState("table"); // "table", "department", "contacts"
  const toast = useRef(null);

  const showSuccess = (message) => {
    toast.current?.show({ severity: 'success', summary: 'Success', detail: message });
  };

  const showError = (message) => {
    toast.current?.show({ severity: 'error', summary: 'Error', detail: message });
  };

  const handleAdd = () => {
    setDialogMode("add");
    setEditClient({ clientName: "", address: "" });
    setDialogVisible(true);
  };

  // Removed onSaveClient, onDeleteClient, and service call logic for now

  const handleEdit = (client) => {
    if (!client) return;
    setDialogMode("edit");
    setEditClient(client);
    setDialogVisible(true);
  };

  const handleDeleteSelected = () => {
    if (selectedClient) {
      setClientToDelete(selectedClient);
      setDeleteDialogVisible(true);
    }
  };

  const handleEditSelected = () => {
    if (selectedClient) {
      handleEdit(selectedClient);
    }
  };

  const onSelectionChange = (client) => {
    setSelectedClient(client);
  };

  const menuItems = [
    {
      label: 'View Department',
      icon: 'pi pi-building',
      command: () => setActiveView("department")
    },
    {
      label: 'View Contacts',
      icon: 'pi pi-users',
      command: () => setActiveView("contacts")
    }
  ];

  const renderView = () => {
    switch (activeView) {
      case "department":
        return (
          <div>
            <Button 
              icon="pi pi-arrow-left" 
              label="Back to Clients" 
              onClick={() => setActiveView("table")} 
              className="p-mb-3" 
            />
            <h3>Department view is under construction</h3>
          </div>
        );
      case "contacts":
        return (
          <div>
            <Button 
              icon="pi pi-arrow-left" 
              label="Back to Clients" 
              onClick={() => setActiveView("table")} 
              className="p-mb-3" 
            />
            <ContactTable />
          </div>
        );
      case "table":
      default:
        return (
          <ClientTable
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
            selectedClient={selectedClient}
            onSelectionChange={onSelectionChange}
          />
        );
    }
  };

  return (
    <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4 w-full">
        <div className="flex gap-2 mr-6">
          <SplitButton
            icon="pi pi-cog"
            model={menuItems}
            tooltip="Settings"
            tooltipOptions={{ position: 'bottom' }}
            disabled={!selectedClient}
            aria-label="Settings"
          />
        </div>
      </div>

      <div className="card">
        {renderView()}
      </div>

      {dialogVisible && (
        <ClientAddEdit
          visible={dialogVisible}
          onHide={() => {
            setDialogVisible(false);
            setEditClient(null);
          }}
          mode={dialogMode}
          client={editClient}
        />
      )}

      {deleteDialogVisible && (
        <ClientDelete
          visible={deleteDialogVisible}
          onHide={() => {
            setDeleteDialogVisible(false);
            setClientToDelete(null);
          }}
          client={clientToDelete}
        />
      )}
    </div>
  );
};

export default Contact;
