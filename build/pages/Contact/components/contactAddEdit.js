import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import DialogButton from "../../../shared/DialogAddEditButton";
import { FaCheck } from 'react-icons/fa';
const ContactAddEdit = ({ visible = false, onHide, onSave, mode = "add", contact = null, clientId = null, }) => {
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
            }
            else {
                setContactPersonName("");
                setDesignation("");
                setPhone("");
                setEmail("");
            }
            setErrors({});
        }
    }, [contact, visible]);
    // Type only for function interface, not for object mutation.
    const handleSubmit = () => {
        // Validate based on mode
        const newErrors = {};
        // Common validation for both modes
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
        }
        else if (!/\S+@\S+\.\S+/.test(email.trim())) {
            newErrors.email = "Please enter a valid email address";
        }
        // Mode-specific validation
        if (mode === "add") {
            if (clientId != null) {
                // Build payload part or whatever needs the clientId
                // e.g., payload = { clientId: Number(clientId), ... }
            }
            else {
                newErrors.clientId = "Client ID is required for adding new contact";
            }
        }
        if (mode === "edit" && contact) {
            const hasChanges = contactPersonName.trim() !== (contact.contactPersonName || "") ||
                designation.trim() !== (contact.designation || "") ||
                phone.trim() !== (contact.phone || "") ||
                email.trim() !== (contact.email || "");
            if (!hasChanges) {
                newErrors.general = "At least one field must be modified for update";
            }
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0)
            return;
        // Build payload
        const payload = {
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
        if (onSave)
            onSave(payload);
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
            setErrors((prev) => ({ ...prev, [fieldName]: null }));
        }
    };
    const dialogHeader = mode === "add" ? "Add New Contact" : "Edit Contact";
    const dialogFooter = (_jsxs("div", { className: "flex justify-content-end gap-2 mt-2 w-full", children: [_jsx(DialogButton, { label: "Cancel", severity: "secondary", onClick: handleCancel, className: "w-auto" }), _jsx(DialogButton, { label: mode === "add" ? "Add Contact" : "Update Contact", severity: "success", icon: _jsx(FaCheck, { style: { fontSize: 16, marginRight: 8, marginLeft: 4 } }), onClick: handleSubmit, className: "w-auto" })] }));
    return (_jsx(Dialog, { header: dialogHeader, footer: dialogFooter, visible: visible, modal: true, onHide: handleCancel, style: { width: "30vw", minWidth: "300px" }, breakpoints: { "960px": "50vw", "641px": "90vw" }, children: _jsxs("div", { className: "p-fluid", children: [errors.general && (_jsx("div", { className: "mb-3", children: _jsx("small", { className: "p-error block", children: errors.general }) })), _jsxs("div", { className: "field mb-3", children: [_jsxs("label", { htmlFor: "contactPersonName", className: "block mb-2 font-medium", children: ["Contact Person Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(InputText, { id: "contactPersonName", value: contactPersonName, onChange: (e) => {
                                setContactPersonName(e.target.value);
                                clearFieldError("contactPersonName");
                            }, autoFocus: true, style: { borderRadius: "8px" }, className: errors.contactPersonName ? "p-invalid" : "" }), errors.contactPersonName && (_jsx("small", { className: "p-error block mt-1", children: errors.contactPersonName }))] }), _jsxs("div", { className: "field mb-3", children: [_jsxs("label", { htmlFor: "designation", className: "block mb-2 font-medium", children: ["Designation ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(InputText, { id: "designation", value: designation, onChange: (e) => {
                                setDesignation(e.target.value);
                                clearFieldError("designation");
                            }, style: { borderRadius: "8px" }, className: errors.designation ? "p-invalid" : "" }), errors.designation && (_jsx("small", { className: "p-error block mt-1", children: errors.designation }))] }), _jsxs("div", { className: "field mb-3", children: [_jsxs("label", { htmlFor: "phone", className: "block mb-2 font-medium", children: ["Phone ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(InputText, { id: "phone", value: phone, onChange: (e) => {
                                setPhone(e.target.value);
                                clearFieldError("phone");
                            }, style: { borderRadius: "8px" }, className: errors.phone ? "p-invalid" : "" }), errors.phone && _jsx("small", { className: "p-error block mt-1", children: errors.phone })] }), _jsxs("div", { className: "field mb-4", children: [_jsxs("label", { htmlFor: "email", className: "block mb-2 font-medium", children: ["Email ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(InputText, { id: "email", type: "email", value: email, onChange: (e) => {
                                setEmail(e.target.value);
                                clearFieldError("email");
                            }, style: { borderRadius: "8px" }, className: errors.email ? "p-invalid" : "" }), errors.email && _jsx("small", { className: "p-error block mt-1", children: errors.email })] })] }) }));
};
export default ContactAddEdit;
