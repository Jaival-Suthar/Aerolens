import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import type {
  ContactAddEditProps,
  ContactAddEditPayload,
} from "../types/contactTypes";
import DialogButton from "../../../shared/DialogAddEditButton";
import { FaCheck } from "react-icons/fa";
import { useAuth } from "../../../shared/auth/AuthContext";
import useContact from "../services/useContact";

interface Errors {
  contactPersonName?: string | null;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
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
  const { accessToken, isAuthenticated } = useAuth();
  const { getDesignations } = useContact();

  const [contactPersonName, setContactPersonName] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [designations, setDesignations] = useState<{ label: string; value: string }[]>([]);
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [loadingDesignations, setLoadingDesignations] = useState(false);

  // Load designations
  useEffect(() => {
    const loadDesignations = async () => {
      if (!accessToken || !isAuthenticated) return;
      try {
        setLoadingDesignations(true);
        const data = await getDesignations(accessToken);
        setDesignations(data.map((d) => ({ label: d, value: d })));
      } catch (err: any) {
        console.error("Failed to fetch designations:", err);
      } finally {
        setLoadingDesignations(false);
      }
    };
    loadDesignations();
  }, [accessToken, isAuthenticated, getDesignations]);

  // Initialize form fields when dialog opens
  useEffect(() => {
    if (visible) {
      setContactPersonName(contact?.contactPersonName || "");
      setDesignation(contact?.designation || "");
      setPhone(contact?.phone || "");
      setEmail(contact?.email || ""); // prefill email
      setErrors({});
    }
  }, [contact, visible]);

  const handleSubmit = () => {
    const newErrors: Errors = {};

    if (!contactPersonName?.trim())
      newErrors.contactPersonName = "Contact Person Name is required";

    if (!designation?.trim())
      newErrors.designation = "Designation is required";

    // Phone is optional, so no validation here

    if (!email?.trim())
      newErrors.email = "Email is required";

    if (mode === "add" && !clientId)
      newErrors.clientId = "Client ID is required for adding new contact";

    if (mode === "edit" && contact) {
      const hasChanges =
        contactPersonName.trim() !== (contact.contactPersonName || "") ||
        designation.trim() !== (contact.designation || "") ||
        phone.trim() !== (contact.phone || "") ||
        email.trim() !== (contact.email || "");

      if (!hasChanges)
        newErrors.general = "At least one field must be modified for update";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload: ContactAddEditPayload = {
      contactPersonName: contactPersonName.trim(),
      designation: designation.trim(),
      phone: phone.trim() || "", // optional
      email: email.trim(),
      ...(mode === "add" && clientId ? { clientId } : {}),
      ...(mode === "edit" && contact?.clientContactId
        ? { clientContactId: contact.clientContactId }
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
    if (onHide) onHide();
  };

  const clearFieldError = (fieldName: keyof Errors) => {
    if (errors[fieldName])
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
  };

  const dialogHeader = mode === "add" ? "Add New Contact" : "Edit Contact";

  const dialogFooter = (
    <div className="flex justify-content-end gap-2 mt-2 w-full">
      <DialogButton label="Cancel" severity="secondary" onClick={handleCancel} />
      <DialogButton
        label={mode === "add" ? "Add Contact" : "Update Contact"}
        severity="success"
        icon={<FaCheck style={{ fontSize: 16, marginRight: 8, marginLeft: 4 }} />}
        onClick={handleSubmit}
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

        <div className="field mb-4">
          <label htmlFor="phone" className="block mb-2 font-medium">
            Phone
          </label>
          <InputText
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ borderRadius: "8px" }}
          />
        </div>

        <div className="field mb-3">
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
