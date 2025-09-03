import { useState, useRef } from 'react';
import ClientTable from './components/clientTable';
import ClientAddEdit from './components/departmentAddEdit';
import ClientDelete from './components/departmentDelete';
import { Button } from 'primereact/button';
import { createClient, updateClient, deleteClient } from './services/clientService';
import { Toast } from 'primereact/toast';

const Departments = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [editClient, setEditClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const toast = useRef(null);

  const showSuccess = (message) => {
    toast.current?.show({severity:'success', summary: 'Success', detail: message});
  };

  const showError = (message) => {
    toast.current?.show({severity:'error', summary: 'Error', detail: message});
  };

  const handleAdd = () => {
    setDialogMode("add");
    setEditClient({ clientName: "", address: "" });
    setDialogVisible(true);
  };

  const onSaveClient = async (client) => {
    try {
      if (dialogMode === "add") {
        // Create new client - map clientName to name for API
        await createClient({
          name: client.clientName?.trim() || "",
          address: client.address?.trim() || ""
        });
        showSuccess("Client added successfully");
      } else {
        // Update existing client - map clientName to name for API
        await updateClient({
          id: client.clientId,
          name: client.clientName?.trim() || "",
          address: client.address?.trim() || ""
        });
        showSuccess("Client updated successfully");
      }
      
      // Refresh the table and close dialog
      setRefreshTrigger(prev => prev + 1);
      setDialogVisible(false);
      setEditClient(null);
    } catch (error) {
      console.error("Error saving client:", error);
      showError("Failed to save client. Please try again.");
    }
  };

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

  const onDeleteClient = async (client) => {
    try {
      await deleteClient(client.clientId);
      showSuccess("Client deleted successfully");
      setRefreshTrigger(prev => prev + 1);
      setSelectedClient(null);
      setDeleteDialogVisible(false);
      setClientToDelete(null);
    } catch (error) {
      console.error("Error deleting client:", error);
      showError("Failed to delete client. Please try again.");
    }
  };

  const onSelectionChange = (client) => {
    setSelectedClient(client);
  };

  return (
    <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
      <Toast ref={toast} />
      
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

        <div className="flex gap-2 mr-6">
          <Button
            icon="pi pi-pencil"
            rounded
            text
            severity="info"
            size="large"
            aria-label="Edit"
            disabled={!selectedClient}
            onClick={handleEditSelected}
            tooltip="Edit Selected Client"
            tooltipOptions={{position: 'bottom'}}
          />
          <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            size="large"
            aria-label="Delete"
            disabled={!selectedClient}
            onClick={handleDeleteSelected}
            tooltip="Delete Selected Client"
            tooltipOptions={{position: 'bottom'}}
          />
        </div>
      </div>

      <div className="card">
        <ClientTable 
          onEdit={handleEdit} 
          refreshTrigger={refreshTrigger}
          selectedClient={selectedClient}
          onSelectionChange={onSelectionChange}
        />
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

      {deleteDialogVisible && (
        <ClientDelete
          visible={deleteDialogVisible}
          onHide={() => {
            setDeleteDialogVisible(false);
            setClientToDelete(null);
          }}
          onDelete={onDeleteClient}
          client={clientToDelete}
        />
      )}
    </div>
  );
};

export default Departments;