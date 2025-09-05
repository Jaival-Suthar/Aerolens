import React, { useState, useEffect } from 'react';
import ContactTable from './contactTable';
import ContactViewHeader from './contactViewHeader';
import useContact from '../services/useContact';

const ClientContactsView = ({ 
  selectedClient, 
  onBackClick, 
  onAddContact,
  selectedContact,
  onSelectionChange,
  onEditContact,
  onDeleteContact,
  refreshTrigger,
  loading 
}) => {
  const [clientContacts, setClientContacts] = useState([]);
  const { getClientDetails } = useContact();

  // Load contacts when client is selected or refresh is triggered
  useEffect(() => {
    if (selectedClient?.clientId) {
      loadClientContacts(selectedClient.clientId);
    }
  }, [selectedClient, refreshTrigger]);

  const loadClientContacts = async (clientId) => {
    try {
      const response = await getClientDetails(clientId);
      if (response.success) {
        const contacts = response.data.clientContacts || [];
        const contactsWithValidIds = contacts.map((contact, index) => ({
          ...contact,
          clientContactId: contact.clientContactId || contact.id || `temp-${index}`,
          clientId: contact.clientId || clientId
        }));
        setClientContacts(contactsWithValidIds);
      }
    } catch (err) {
      console.error('Error loading client contacts:', err);
      setClientContacts([]);
    }
  };

  if (!selectedClient) {
    return (
      <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
        <ContactViewHeader 
          onBackClick={onBackClick}
          selectedClient={selectedClient}
          onAddContact={onAddContact}
          selectedContact={selectedContact}
          onEditContact={onEditContact}
          onDeleteContact={onDeleteContact}
        />
        <div className="text-center p-4">
          <p>Please select a client from the main table to view contacts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container shadow-3 p-4" style={{ width: "100%", maxWidth: "100%" }}>
      <ContactViewHeader 
        onBackClick={onBackClick}
        selectedClient={selectedClient}
        onAddContact={onAddContact}
        selectedContact={selectedContact}
        onEditContact={onEditContact}
        onDeleteContact={onDeleteContact}
      />

      <div>
        <h4 className="mb-3">
          Contacts for: {selectedClient.clientName}
        </h4>
        <ContactTable 
          contacts={clientContacts}
          loading={loading}
          selectedContact={selectedContact}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  );
};

export default ClientContactsView;