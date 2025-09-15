import React from 'react';
import { Button } from 'primereact/button';
import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';
import type { Contact, Client } from '../types/contactTypes';

interface ContactViewHeaderProps {
  onBackClick: () => void;
  selectedClient?: Client | null;
  onAddContact: () => void;
  selectedContact: Contact | null;
  onEditContact: () => void;
  onDeleteContact: () => void;
}

const ContactViewHeader: React.FC<ContactViewHeaderProps> = ({ 
  onBackClick,  
  onAddContact, 
  selectedContact,
  onEditContact,
  onDeleteContact 
}) => {
  return (
    <div className="flex justify-content-between align-items-center mb-4 w-full">
      <div className="flex align-items-center gap-3">
       <Button 
          icon="pi pi-arrow-left" 
          label="Back to Clients" 
          onClick={onBackClick}
          severity="secondary"        // Use warning for stronger yellow/orange color
          text={false}              // Fully filled button for stronger background
          outlined          // Remove outline for solid fill
          size="large" 
          className="font-semibold" // Bold text for better readability
        />
      </div>

      <div className="flex gap-2 mr-6">
          <AddButton
            onClick={onAddContact}
          />
          <EditButton
            onClick={onEditContact}
            disabled={!selectedContact?.clientContactId}
          />
          <DeleteButton
            onClick={onDeleteContact}
            disabled={!selectedContact?.clientContactId}
          />
      </div>
    </div>
  );
};

export default ContactViewHeader;