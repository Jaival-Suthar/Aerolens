import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const ContactAddEdit = ({
  visible = false,
  onHide,
  onSave,
  mode = "add",
  contact = null,
  clientId = null // Required for adding new contacts
}) => {
  const [contactPersonName, setContactPersonName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  // Initialize form data when dialog opens or contact changes
  useEffect(() => {
    if (visible) {
      if (contact) {
        setContactPersonName(contact.contactPersonName || "");
        setDesignation(contact.designation || "");
        setPhone(contact.phone || "");
        setEmail(contact.email || "");
      } else {
        setContactPersonName("");
        setDesignation("");
        setPhone("");
        setEmail("");
      }
      setErrors({});
    }
  }, [contact, visible]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!contactPersonName || contactPersonName.trim() === "") {
      newErrors.contactPersonName = "Contact Person Name is required";
    }
    
    if (!designation || designation.trim() === "") {
      newErrors.designation = "Designation is required";
    }
    
    if (!phone || phone.trim() === "") {
      newErrors.phone = "Phone is required";
    }
    
    if (!email || email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // For add mode, clientId is required
    if (mode === "add" && !clientId) {
      newErrors.clientId = "Client ID is required for adding new contact";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpdateForm = () => {
    const newErrors = {};
    
    // For update mode, at least one field must be provided and different from original
    if (mode === "edit" && contact) {
      const hasChanges = 
        contactPersonName.trim() !== (contact.contactPersonName || "") ||
        designation.trim() !== (contact.designation || "") ||
        phone.trim() !== (contact.phone || "") ||
        email.trim() !== (contact.email || "");
      
      if (!hasChanges) {
        newErrors.general = "At least one field must be modified for update";
      }
    }

    // Validate email format if provided
    if (email && email.trim() !== "" && !/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (mode === "add") {
      if (!validateForm()) {
        return;
      }

      const contactData = {
        clientId: clientId,
        contactPersonName: contactPersonName.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      if (onSave) {
        onSave(contactData);
      }
    } else if (mode === "edit") {
      if (!validateUpdateForm()) {
        return;
      }

      // Use the correct field name mapping for the API
      const updateData = {
        contactId: contact?.clientContactId || contact?.contactId // Map frontend field to API field
      };

      // Only include fields that have been modified
      if (contactPersonName.trim() !== (contact?.contactPersonName || "")) {
        updateData.contactPersonName = contactPersonName.trim();
      }
      if (designation.trim() !== (contact?.designation || "")) {
        updateData.designation = designation.trim();
      }
      if (phone.trim() !== (contact?.phone || "")) {
        updateData.phone = phone.trim();
      }
      if (email.trim() !== (contact?.email || "")) {
        updateData.email = email.trim();
      }

      if (onSave) {
        onSave(updateData);
      }
    }
  };

  const handleCancel = () => {
    setContactPersonName("");
    setDesignation("");
    setPhone("");
    setEmail("");
    setErrors({});
    if (onHide) {
      onHide();
    }
  };

  const clearFieldError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const dialogHeader = mode === "add" ? "Add New Contact" : "Edit Contact";

  return (
    <Dialog
      header={dialogHeader}
      visible={visible}
      modal
      onHide={handleCancel}
      style={{ width: "30vw", minWidth: "300px" }}
      breakpoints={{ '960px': '50vw', '641px': '90vw' }}
    >
      <div className="p-fluid">
        {errors.general && (
          <div className="mb-3">
            <small className="p-error block">{errors.general}</small>
          </div>
        )}

        <div className="field mb-3">
          <label htmlFor="contactPersonName" className="block mb-2 font-medium">
            Contact Person Name <span className="text-red-500">*</span>
          </label>
          <InputText
            id="contactPersonName"
            value={contactPersonName}
            onChange={(e) => {
              setContactPersonName(e.target.value);
              clearFieldError("contactPersonName");
            }}
            autoFocus
            style={{ borderRadius: "8px" }}
            className={errors.contactPersonName ? "p-invalid" : ""}
          />
          {errors.contactPersonName && (
            <small className="p-error block mt-1">{errors.contactPersonName}</small>
          )}
        </div>

        <div className="field mb-3">
          <label htmlFor="designation" className="block mb-2 font-medium">
            Designation <span className="text-red-500">*</span>
          </label>
          <InputText
            id="designation"
            value={designation}
            onChange={(e) => {
              setDesignation(e.target.value);
              clearFieldError("designation");
            }}
            style={{ borderRadius: "8px" }}
            className={errors.designation ? "p-invalid" : ""}
          />
          {errors.designation && (
            <small className="p-error block mt-1">{errors.designation}</small>
          )}
        </div>

        <div className="field mb-3">
          <label htmlFor="phone" className="block mb-2 font-medium">
            Phone <span className="text-red-500">*</span>
          </label>
          <InputText
            id="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearFieldError("phone");
            }}
            style={{ borderRadius: "8px" }}
            className={errors.phone ? "p-invalid" : ""}
          />
          {errors.phone && (
            <small className="p-error block mt-1">{errors.phone}</small>
          )}
        </div>

        <div className="field mb-4">
          <label htmlFor="email" className="block mb-2 font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <InputText
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            style={{ borderRadius: "8px" }}
            className={errors.email ? "p-invalid" : ""}
          />
          {errors.email && (
            <small className="p-error block mt-1">{errors.email}</small>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            text
            severity="secondary"
            size="small"
            onClick={handleCancel}
            className="w-auto"
            style={{
              borderWidth: "1.5px",
              borderColor: "#6c757d",
              color: "#6c757d",
              backgroundColor: "transparent",
              padding: "0.4rem 1rem",
              borderRadius: "6px",
              fontWeight: "500",
            }}
          />
          <Button
            label={mode === "add" ? "Add Contact" : "Save Changes"}
            severity="success"
            icon="pi pi-check"
            size="small"
            onClick={handleSubmit}
            className="w-auto"
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "6px",
              fontWeight: "600",
            }}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ContactAddEdit;