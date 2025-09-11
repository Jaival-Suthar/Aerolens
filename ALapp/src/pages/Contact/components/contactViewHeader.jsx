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
          severity="warning"        // Use warning for stronger yellow/orange color
          text={false}              // Fully filled button for stronger background
          outlined={false}          // Remove outline for solid fill
          size="medium" 
          className="font-semibold" // Bold text for better readability
        />
      </div>

      <div className="flex gap-2 mr-6">
          <Button
          icon="pi pi-plus"
          rounded
          text={false} // remove `text` for strong color fill
          severity="success" // success is green in PrimeReact
          outlined={false} // remove outline for a solid fill (optional)
          size="large" // match pencil/trash size for consistency
          className="font-medium mr-1"
          onClick={onAddContact}
          aria-label="Add"
          tooltip="Add Contact"
          tooltipOptions={{ position: 'bottom' }}
        />
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