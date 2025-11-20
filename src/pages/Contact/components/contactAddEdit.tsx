import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import type {
  ContactAddEditProps,
  ContactAddEditPayload,
} from "../types/contactTypes";
import DialogButton from "../../../shared/DialogAddEditButton";
import { FaCheck } from 'react-icons/fa';

import { useAuth } from "../../../shared/auth/AuthContext";
import useContact from "../services/useContact";
import { Dropdown } from "primereact/dropdown";


interface Errors {
  contactPersonName?: string | null;
  designation?: string | null;
  phone?: string | null;
  email?: string | null;
  clientId?: string | null;
  general?: string | null;
}

const ContactAddEdit: React.FC<ContactAddEditProps> = ({
  visible = false,
  onHide,
  onSave,
  mode = "add",
  contact = null,
  clientId = null,
}) => {
  const [contactPersonName, setContactPersonName] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [designations, setDesignations] = useState<{ label: string; value: string }[]>([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const { accessToken } = useAuth();
  const { getDesignations } = useContact();
  

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


  // for desginations dropdown
  useEffect(() => {
    const loadDesignations = async () => {
      if (!visible) return;
      try {
        setLoadingDesignations(true);
  
        // call getDesignations from useContact hook
        const data = await getDesignations(accessToken);
        console.log("Fetched designations:", data);
  
        // Filter only designation entries
        const designationData = data.map((d: string) => ({ label: d, value: d }));

        console.log("Processed designation data:", designationData);
        setDesignations(designationData);
      } catch (err) {
        console.error("Failed to fetch designations:", err);
      } finally {
        setLoadingDesignations(false);
      }
    };
    loadDesignations();
  }, [visible, getDesignations, accessToken]);
  


  // Type only for function interface, not for object mutation.
  const handleSubmit = () => {
    // Validate based on mode
    const newErrors: Errors = {};

    // Common validation for both modes
    if (!contactPersonName || contactPersonName.trim() === "") {
      newErrors.contactPersonName = "Contact Person Name is required";
    }
    if (!designation || designation.trim() === "") {
      newErrors.designation = "Designation is required";
    }
    // if (!phone || phone.trim() === "") {
    //   newErrors.phone = "Phone is required";
    // }
    if (!email || email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Mode-specific validation
    if (mode === "add") {
      if (clientId != null) {
        // Build payload part or whatever needs the clientId
        // e.g., payload = { clientId: Number(clientId), ... }
      } else {
        newErrors.clientId = "Client ID is required for adding new contact";
      }
    }

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

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Build payload
    const payload: ContactAddEditPayload = {
      contactPersonName: contactPersonName.trim(),
      designation: designation.trim(),
      phone: phone.trim(),
      email: email.trim(),
      ...(mode === "add" && clientId ? { clientId } : {}),
      ...(mode === "edit" && contact?.clientContactId
        ? { clientContactId: contact.clientContactId }
        : mode === "edit" && contact?.contactId
          ? { contactId: contact.contactId }
          : {}),
    };


    if (onSave) onSave(payload);
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

  const clearFieldError = (fieldName: keyof Errors) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const dialogHeader = mode === "add" ? "Add New Contact" : "Edit Contact";
  const dialogFooter = (
    <div className="flex justify-content-end gap-2 mt-2 w-full">
      <DialogButton
        label="Cancel"
        severity="secondary"
        onClick={handleCancel}
        className="w-auto"
      />
      <DialogButton
        label={mode === "add" ? "Add Contact" : "Update Contact"}
        severity="success"
        icon={<FaCheck style={{ fontSize: 16, marginRight: 8, marginLeft: 4 }} />}
        onClick={handleSubmit}
        className="w-auto"
      />
    </div>
  );
  return (
    <Dialog
      header={dialogHeader}
      footer={dialogFooter}
      visible={visible}
      modal
      onHide={handleCancel}
      style={{ width: "30vw", minWidth: "300px" }}
      breakpoints={{ "960px": "50vw", "641px": "90vw" }}
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
          <Dropdown
            id="designation"
            value={designation}
            options={designations}
            onChange={(e) => {
              setDesignation(e.value || "");
              clearFieldError("designation");
            }}
            placeholder={loadingDesignations ? "Loading..." : "Select designation"}
            disabled={loadingDesignations}
            style={{ borderRadius: "8px" }}
            className={errors.designation ? "p-invalid" : ""}
          />
          {errors.designation && (
            <small className="p-error block mt-1">{errors.designation}</small>
          )}
        </div>
        {/* modified phone to optional field. */}
        <div className="field mb-3">
          <label htmlFor="phone" className="block mb-2 font-medium">
            Phone
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
          {errors.phone && <small className="p-error block mt-1">{errors.phone}</small>}
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
          {errors.email && <small className="p-error block mt-1">{errors.email}</small>}
        </div>
      </div>
    </Dialog>
  );
};

export default ContactAddEdit;
