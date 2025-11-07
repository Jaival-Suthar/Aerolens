import React from 'react';
import { Button } from 'primereact/button';
import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';
import type { Contact, Client } from '../types/contactTypes';
import { FaArrowLeft } from "react-icons/fa";
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
       <button
          onClick={onBackClick}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-100 transition"
        >
          <FaArrowLeft />
          Back to Clients
        </button>
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