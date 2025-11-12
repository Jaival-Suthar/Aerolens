import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import type { Contact } from "../types/contactTypes";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
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
  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
         <DialogDeleteButton
          onCancel={onHide}
          onDelete={handleDelete}
        />
        </div>
  );
  return (
    <Dialog
      header="Confirm Delete"
      footer={dialogFooter}
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
      </div>
    </Dialog>
  );
};

export default ContactDelete;