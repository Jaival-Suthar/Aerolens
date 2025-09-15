import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import type { Contact } from "../types/contactTypes";

interface ContactDeleteProps {
  visible: boolean;
  onHide: () => void;
  onDelete?: (contact: Contact) => void;
  contact: Contact | null;
}

const ContactDelete: React.FC<ContactDeleteProps> = ({ visible, onHide, onDelete, contact }) => {
  const handleDelete = () => {
    if (onDelete && contact) {
      onDelete(contact);
    }
  };

  return (
    <Dialog
      header="Confirm Delete"
      visible={visible}
      modal
      onHide={onHide}
      style={{ width: "25vw", minWidth: "300px" }}
      breakpoints={{ '960px': '50vw', '641px': '90vw' }}
    >
      <div className="p-4">
        <p className="mb-4">
          Are you sure you want to delete contact{" "}
          <strong>{contact?.contactPersonName || "this contact"}</strong>?
        </p>
        
        {contact && (
          <div className="mb-4 p-3 border-round surface-100">
            <div><strong>Name:</strong> {contact.contactPersonName}</div>
            <div><strong>Designation:</strong> {contact.designation}</div>
            <div><strong>Email:</strong> {contact.email}</div>
            <div><strong>Phone:</strong> {contact.phone}</div>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <Button
            label="Cancel"
            className="p-button-text"
            severity="secondary"
            onClick={onHide}
          />
          <Button
            label="Delete"
            severity="danger"
            icon="pi pi-trash"
            onClick={handleDelete}
            autoFocus
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ContactDelete;