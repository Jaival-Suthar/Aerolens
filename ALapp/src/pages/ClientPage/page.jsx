import { useState, useRef } from 'react';
import ClientTable from './components/clientTable';
import ClientAddEdit from './components/clientAddEdit';
import ClientDelete from './components/clientDelete';
import ClientContactsView from '../Contact/components/clientContactsView';
import { Button } from 'primereact/button';
import { createClient, updateClient, deleteClient } from './services/clientService';
import { Toast } from 'primereact/toast';
import { VIEW_MODES, getMenuItems } from '../Contact/constants/contactConstants';
import { SplitButton } from 'primereact/splitbutton';

const Client = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [editClient, setEditClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState(VIEW_MODES.TABLE);
  const toast = useRef(null);

  const showSuccess = (message) => {
    toast.current?.show({severity:'success', summary: 'Success', detail: message});
  };

  const showError = (message) => {
    toast.current?.show({severity:'error', summary: 'Error', detail: message});
  };

  const handleBackToClients = () => {
    setActiveView(VIEW_MODES.TABLE);
    setSelectedClient(null);
  };

  // Now menuItems will properly trigger view changes
  const menuItems = getMenuItems((view) => {
    if ((view === VIEW_MODES.CONTACTS || view === VIEW_MODES.DEPARTMENT) && !selectedClient) {
      alert('Please select a client first.');
      return;
    }
    setActiveView(view);
  });

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
        showSuccess("Client added successfully");
      } else {
        await updateClient({
          id: client.clientId,
          name: client.clientName?.trim() || "",
          address: client.address?.trim() || ""
        });
        showSuccess("Client updated successfully");
      }
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

  // Single card controls and main view swapping
  return (
    <>
      <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
        <Toast ref={toast} />

        <div className="flex justify-content-between align-items-center mb-4 w-full">
          {activeView === VIEW_MODES.TABLE && (
            <>
              <div className="flex align-items-center gap-3">
                <SplitButton
                  icon="pi pi-cog"
                  model={menuItems}
                  tooltip="Settings"
                  tooltipOptions={{ position: 'bottom' }}
                  disabled={!selectedClient}
                  aria-label="Settings"
                />
              </div>
              <div className="flex gap-2 mr-6">
                <Button
                  rounded
                  severity="success"
                  icon="pi pi-plus"
                  size="large"
                  className="font-medium mr-1"
                  onClick={handleAdd}
                  aria-label="Add"
                  tooltip="Add Client"
                  tooltipOptions={{ position: 'bottom' }}
                />
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
            </>
          )}
        </div>


        <div className="card">
          {activeView === VIEW_MODES.TABLE && (
            <ClientTable
              onEdit={handleEdit}
              refreshTrigger={refreshTrigger}
              selectedClient={selectedClient}
              onSelectionChange={onSelectionChange}
            />
          )}

          {activeView === VIEW_MODES.CONTACTS && selectedClient && (
            <ClientContactsView
              selectedClient={selectedClient}
              onBackClick={handleBackToClients}
            />
          )}

          {activeView === VIEW_MODES.DEPARTMENT && selectedClient && (
            <div>
              <button
                onClick={handleBackToClients}
                className="mb-3 p-button p-button-secondary"
              >
                &larr; Back to Clients
              </button>
              <h3>Department view under construction</h3>
            </div>
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
    </>
  );
};

export default Client;
