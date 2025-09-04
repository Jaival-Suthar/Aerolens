import { useState, useRef, useEffect } from 'react';
import ClientTable from './components/clientTable';
import ContactAddEdit from './components/contactAddEdit';
import ContactDelete from './components/contactDelete';
import ContactTable from './components/contactTable';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import useContact from './services/useContact';

const Contact = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [editContact, setEditContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState("table"); // "table", "department", "contacts"
  const [clientContacts, setClientContacts] = useState([]);
  const toast = useRef(null);

  const { 
    loading, 
    error, 
    createContact, 
    updateContact, 
    getClientDetails, 
    deleteContact,
    clearError 
  } = useContact();

  const showSuccess = (message) => {
    toast.current?.show({ severity: 'success', summary: 'Success', detail: message });
  };

  const showError = (message) => {
    toast.current?.show({ severity: 'error', summary: 'Error', detail: message });
  };

  // Load contacts when a client is selected and view is contacts
  useEffect(() => {
    if (selectedClient && activeView === "contacts") {
      loadClientContacts(selectedClient.clientId);
    }
  }, [selectedClient, activeView, refreshTrigger]);

  // Show error toast when service error occurs
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, clearError]);

  const loadClientContacts = async (clientId) => {
    try {
      const response = await getClientDetails(clientId);
      if (response.success) {
        // Ensure contacts have proper ID structure
        const contacts = response.data.clientContacts || [];
        const contactsWithValidIds = contacts.map((contact, index) => ({
          ...contact,
          // Ensure we always have a clientContactId for operations
          clientContactId: contact.clientContactId || contact.id || `temp-${index}`,
          // Keep original clientId reference
          clientId: contact.clientId || clientId
        }));
        setClientContacts(contactsWithValidIds);
      }
    } catch (err) {
      console.error('Error loading client contacts:', err);
      setClientContacts([]);
    }
  };

  const handleAddContact = () => {
    if (!selectedClient) {
      showError('Please select a client first to add a contact');
      return;
    }
    setDialogMode("add");
    setEditContact({
      clientId: selectedClient.clientId,
      contactPersonName: "",
      email: "",
      phone: "",
      designation: ""
    });
    setDialogVisible(true);
  };

  const handleEditContact = (contact) => {
    if (!contact) {
      showError('No contact selected for editing');
      return;
    }
    
    // Ensure we have the contact ID for editing
    if (!contact.clientContactId) {
      showError('Contact ID is missing. Cannot edit this contact.');
      return;
    }
    
    setDialogMode("edit");
    setEditContact({
      ...contact,
      // Ensure the contact ID is properly passed
      clientContactId: contact.clientContactId,
      clientId: contact.clientId || selectedClient?.clientId
    });
    setDialogVisible(true);
  };

  const handleDeleteSelectedContact = () => {
    if (!selectedContact) {
      showError('Please select a contact to delete');
      return;
    }
    
    // Ensure we have the contact ID for deletion
    if (!selectedContact.clientContactId) {
      showError('Contact ID is missing. Cannot delete this contact.');
      return;
    }
    
    setContactToDelete({
      ...selectedContact,
      clientContactId: selectedContact.clientContactId
    });
    setDeleteDialogVisible(true);
  };

  const handleEditSelectedContact = () => {
    if (!selectedContact) {
      showError('Please select a contact to edit');
      return;
    }
    
    // Ensure we have the contact ID for editing
    if (!selectedContact.clientContactId) {
      showError('Contact ID is missing. Cannot edit this contact.');
      return;
    }
    
    handleEditContact(selectedContact);
  };

  const onSaveContact = async (contactData) => {
    try {
      let response;
      if (dialogMode === "add") {
        // For new contacts, ensure clientId is included
        const newContactData = {
          ...contactData,
          clientId: selectedClient?.clientId
        };
        response = await createContact(newContactData);
        showSuccess("Contact added successfully");
      } else {
        // For updates, pass the contact data with the ID
        const contactId = contactData.clientContactId || editContact?.clientContactId;
        
        if (!contactId) {
          throw new Error('Contact ID is missing for update operation');
        }
        
        // Pass the data as-is, the service will handle the ID extraction
        const updateContactData = {
          ...contactData,
          clientContactId: contactId, // Keep original field name
          clientId: contactData.clientId || selectedClient?.clientId
        };
        
        response = await updateContact(updateContactData);
        showSuccess("Contact updated successfully");
      }
      
      setDialogVisible(false);
      setEditContact(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error saving contact:', err);
      showError(err.message || 'Failed to save contact');
    }
  };

  const onDeleteContact = async (contactToDelete) => {
    try {
      // Ensure we have the contact ID for deletion
      if (!contactToDelete.clientContactId) {
        throw new Error('Contact ID is missing for deletion');
      }
      
      await deleteContact(contactToDelete.clientContactId);
      showSuccess("Contact deleted successfully");
      setDeleteDialogVisible(false);
      setContactToDelete(null);
      setSelectedContact(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error deleting contact:', err);
      showError(err.message || 'Failed to delete contact');
    }
  };

  const onClientSelectionChange = (client) => {
    setSelectedClient(client);
    setSelectedContact(null); // Clear contact selection when client changes
    // Clear contacts when client changes
    if (activeView === "contacts") {
      setClientContacts([]);
    }
  };

  const onContactSelectionChange = (contact) => {
    // Validate that the contact has a proper ID before setting it as selected
    if (contact && !contact.clientContactId) {
      console.warn('Selected contact is missing clientContactId:', contact);
      showError('Invalid contact selection. Contact ID is missing.');
      return;
    }
    setSelectedContact(contact);
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

  const contactMenuItems = [
    {
      label: 'Add Contact',
      icon: 'pi pi-plus',
      command: handleAddContact
    },
    {
      label: 'Edit Contact',
      icon: 'pi pi-pencil',
      command: handleEditSelectedContact,
      disabled: !selectedContact || !selectedContact.clientContactId
    },
    {
      label: 'Delete Contact',
      icon: 'pi pi-trash',
      command: handleDeleteSelectedContact,
      disabled: !selectedContact || !selectedContact.clientContactId
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
              className="mb-3" 
            />
            <h3>Department view is under construction</h3>
          </div>
        );
      case "contacts":
        return (
          <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
            <Toast ref={toast} />
            
            <div className="flex justify-content-between align-items-center mb-4 w-full">
              <div className="flex align-items-center gap-3">
                <Button 
                  icon="pi pi-arrow-left" 
                  label="Back to Clients" 
                  onClick={() => setActiveView("table")}
                  severity="secondary"
                  outlined
                  size="small"
                />
                <span className="text-lg font-semibold">Contacts</span>
              </div>
              
              <Button
                label="Add Contact"
                icon="pi pi-plus"
                severity="secondary"
                outlined
                size="medium"
                className="font-medium"
                onClick={handleAddContact}
                disabled={!selectedClient}
              />
              
              <div className="flex gap-2 mr-6">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  severity="info"
                  size="large"
                  aria-label="Edit"
                  disabled={!selectedContact || !selectedContact.clientContactId}
                  onClick={handleEditSelectedContact}
                  tooltip="Edit Selected Contact"
                  tooltipOptions={{position: 'bottom'}}
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  size="large"
                  aria-label="Delete"
                  disabled={!selectedContact || !selectedContact.clientContactId}
                  onClick={handleDeleteSelectedContact}
                  tooltip="Delete Selected Contact"
                  tooltipOptions={{position: 'bottom'}}
                />
              </div>
            </div>

            {selectedClient ? (
              <div>
                <h4 className="mb-3">
                  Contacts for: {selectedClient.clientName}
                </h4>
                <ContactTable 
                  contacts={clientContacts}
                  loading={loading}
                  selectedContact={selectedContact}
                  onSelectionChange={onContactSelectionChange}
                />
              </div>
            ) : (
              <div className="text-center p-4">
                <p>Please select a client from the main table to view contacts.</p>
              </div>
            )}
          </div>
        );
      
      case "table":
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
        <ContactAddEdit
          visible={dialogVisible}
          onHide={() => {
            setDialogVisible(false);
            setEditContact(null);
          }}
          onSave={onSaveContact}
          mode={dialogMode}
          contact={editContact}
          clientId={selectedClient?.clientId}
        />
      )}

      {deleteDialogVisible && (
        <ContactDelete
          visible={deleteDialogVisible}
          onHide={() => {
            setDeleteDialogVisible(false);
            setContactToDelete(null);
          }}
          contact={contactToDelete}
          onDelete={onDeleteContact}
        />
      )}
    </div>
  );
};

export default Contact;