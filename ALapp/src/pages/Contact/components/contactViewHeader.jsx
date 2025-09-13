import React from 'react';
import { Button } from 'primereact/button';
import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';

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
          severity="secondary"        // Use warning for stronger yellow/orange color
          text={false}              // Fully filled button for stronger background
          outlined          // Remove outline for solid fill
          size="medium" 
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
          {/* <Button
          icon="pi pi-plus"
          rounded
          text={false} // false for filled button
          severity="success" // success is green in PrimeReact
          outlined={false} // remove outline for a solid fill (optional)
          size="large" // match pencil/trash size for consistency
          className="font-medium mr-1"
          onClick={onAddContact}
          style={{
            backgroundColor: '#d4edda', // pastel green
            borderColor: '#c3e6cb',
            color: '#155724',
          }}
          aria-label="Add"
          tooltip="Add"
          tooltipOptions={{ position: 'bottom' }}
        />
        <Button
          icon="pi pi-pencil"
          rounded
          text={false}
          severity="info"
          size="large"
          style={{
            backgroundColor: '#d1ecf1',  // pastel blue
            borderColor: '#bee5eb',
            color: '#0c5460',
            borderWidth: '1.5px',
            borderStyle: 'solid'
          }}
          aria-label="Edit"
          disabled={!selectedContact?.clientContactId}
          onClick={onEditContact}
          tooltip="Edit"
          tooltipOptions={{position: 'bottom'}}
        />
        <Button
          icon="pi pi-trash"
          rounded
          text={false}
          severity="danger"
          size="large"
          style={{
            backgroundColor: '#f8d7da',  // pastel red
            borderColor: '#f5c6cb',
            color: '#721c24',
            borderWidth: '1.5px',
            borderStyle: 'solid'
          }}
          aria-label="Delete"
          disabled={!selectedContact?.clientContactId}
          onClick={onDeleteContact}
          tooltip="Delete"
          tooltipOptions={{position: 'bottom'}}
        /> */}
      </div>
    </div>
  );
};

export default ContactViewHeader;