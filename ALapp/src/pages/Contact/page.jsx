import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

// Component imports
import ClientTable from './components/clientTable';
import ContactAddEdit from './components/contactAddEdit';
import ContactDelete from './components/contactDelete';
import ClientContactsView from './components/clientContactsView';

// Hook imports
import useContact from './services/useContact';
import { useContactOperations } from './hooks/useContactOperations';

// Constants
import { VIEW_MODES, DIALOG_MODES, getMenuItems, getEmptyContact } from './constants/contactConstants';

const Contact = () => {
  // Dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState(DIALOG_MODES.ADD);
  
  // Contact state
  const [editContact, setEditContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  
  // Client state
  const [selectedClient, setSelectedClient] = useState(null);
  
  // View state
  const [activeView, setActiveView] = useState(VIEW_MODES.TABLE);
  
  // Refs
  const toast = useRef(null);

  // Hooks
  const { loading, error, clearError } = useContact();
  
  // Toast functions
  const showSuccess = useCallback((message) => {
    toast.current?.show({ severity: 'success', summary: 'Success', detail: message });
  }, []);

  const showError = useCallback((message) => {
    toast.current?.show({ severity: 'error', summary: 'Error', detail: message });
  }, []);

  // Custom operations hook
  const { 
    refreshTrigger, 
    handleSaveContact, 
    handleDeleteContact,
    validateContactSelection 
  } = useContactOperations(showSuccess, showError);

  // Error handling effect
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, clearError, showError]);

  // Event handlers
  const handleAddContact = useCallback(() => {
    if (!selectedClient) {
      showError('Please select a client first to add a contact');
      return;
    }
    setDialogMode(DIALOG_MODES.ADD);
    setEditContact(getEmptyContact(selectedClient.clientId));
    setDialogVisible(true);
  }, [selectedClient, showError]);

  const handleEditContact = useCallback((contact) => {
    if (!validateContactSelection(contact, showError)) return;
    
    setDialogMode(DIALOG_MODES.EDIT);
    setEditContact({
      ...contact,
      clientContactId: contact.clientContactId,
      clientId: contact.clientId || selectedClient?.clientId
    });
    setDialogVisible(true);
  }, [validateContactSelection, showError, selectedClient]);

  const handleDeleteSelectedContact = useCallback(() => {
    if (!validateContactSelection(selectedContact, showError)) return;
    
    setContactToDelete({
      ...selectedContact,
      clientContactId: selectedContact.clientContactId
    });
    setDeleteDialogVisible(true);
  }, [selectedContact, validateContactSelection, showError]);

  const handleEditSelectedContact = useCallback(() => {
    if (!validateContactSelection(selectedContact, showError)) return;
    handleEditContact(selectedContact);
  }, [selectedContact, validateContactSelection, showError, handleEditContact]);

  // Dialog handlers
  const onSaveContact = useCallback(async (contactData) => {
    const result = await handleSaveContact(contactData, dialogMode, selectedClient);
    if (result.success) {
      setDialogVisible(false);
      setEditContact(null);
    }
  }, [handleSaveContact, dialogMode, selectedClient]);

  const onDeleteContact = useCallback(async (contactToDelete) => {
    const result = await handleDeleteContact(contactToDelete);
    if (result.success) {
      setDeleteDialogVisible(false);
      setContactToDelete(null);
      setSelectedContact(null);
    }
  }, [handleDeleteContact]);

  // Selection handlers
  const onClientSelectionChange = useCallback((client) => {
    setSelectedClient(client);
    setSelectedContact(null);
  }, []);

  const onContactSelectionChange = useCallback((contact) => {
    if (contact && !contact.clientContactId) {
      console.warn('Selected contact is missing clientContactId:', contact);
      showError('Invalid contact selection. Contact ID is missing.');
      return;
    }
    setSelectedContact(contact);
  }, [showError]);

  // Dialog close handlers
  const closeAddEditDialog = useCallback(() => {
    setDialogVisible(false);
    setEditContact(null);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogVisible(false);
    setContactToDelete(null);
  }, []);

  // View handlers
  const handleBackToClients = useCallback(() => {
    setActiveView(VIEW_MODES.TABLE);
  }, []);

  // Menu items
  const menuItems = getMenuItems(setActiveView);

  // Render methods
  const renderDepartmentView = () => (
    <div>
      <Button 
        icon="pi pi-arrow-left" 
        label="Back to Clients" 
        onClick={handleBackToClients} 
        className="mb-3" 
      />
      <h3>Department view is under construction</h3>
    </div>
  );

  const renderMainView = () => {
    switch (activeView) {
      case VIEW_MODES.DEPARTMENT:
        return renderDepartmentView();
        
      case VIEW_MODES.CONTACTS:
        return (
          <ClientContactsView 
            selectedClient={selectedClient}
            onBackClick={handleBackToClients}
            onAddContact={handleAddContact}
            selectedContact={selectedContact}
            onSelectionChange={onContactSelectionChange}
            onEditContact={handleEditSelectedContact}
            onDeleteContact={handleDeleteSelectedContact}
            refreshTrigger={refreshTrigger}
            loading={loading}
          />
        );
      
      case VIEW_MODES.TABLE:
      default:
        return (
          <ClientTable
            refreshTrigger={refreshTrigger}
            selectedClient={selectedClient}
            onSelectionChange={onClientSelectionChange}
          />
        );
    }
  };

  // Don't render the main container for contacts view (handled by ClientContactsView)
  if (activeView === VIEW_MODES.CONTACTS) {
    return (
      <>
        <Toast ref={toast} />
        {renderMainView()}
        
        {dialogVisible && (
          <ContactAddEdit
            visible={dialogVisible}
            onHide={closeAddEditDialog}
            onSave={onSaveContact}
            mode={dialogMode}
            contact={editContact}
            clientId={selectedClient?.clientId}
          />
        )}

        {deleteDialogVisible && (
          <ContactDelete
            visible={deleteDialogVisible}
            onHide={closeDeleteDialog}
            contact={contactToDelete}
            onDelete={onDeleteContact}
          />
        )}
      </>
    );
  }

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
        {renderMainView()}
      </div>

      {dialogVisible && (
        <ContactAddEdit
          visible={dialogVisible}
          onHide={closeAddEditDialog}
          onSave={onSaveContact}
          mode={dialogMode}
          contact={editContact}
          clientId={selectedClient?.clientId}
        />
      )}

      {deleteDialogVisible && (
        <ContactDelete
          visible={deleteDialogVisible}
          onHide={closeDeleteDialog}
          contact={contactToDelete}
          onDelete={onDeleteContact}
        />
      )}
    </div>
  );
};

export default Contact;