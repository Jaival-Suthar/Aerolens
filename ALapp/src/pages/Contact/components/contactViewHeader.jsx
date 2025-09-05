import React from 'react';
import { Button } from 'primereact/button';

const ContactViewHeader = ({ 
  onBackClick, 
  selectedClient, 
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
        onClick={onAddContact}
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
          disabled={!selectedContact?.clientContactId}
          onClick={onEditContact}
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
          disabled={!selectedContact?.clientContactId}
          onClick={onDeleteContact}
          tooltip="Delete Selected Contact"
          tooltipOptions={{position: 'bottom'}}
        />
      </div>
    </div>
  );
};

export default ContactViewHeader;