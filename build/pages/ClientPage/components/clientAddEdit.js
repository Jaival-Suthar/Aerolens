import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { FaCheck } from 'react-icons/fa';
import DialogButton from "../../../shared/DialogAddEditButton";
const ClientAddEdit = ({ visible, onHide, onSave, mode = "add", client = null }) => {
    const [clientName, setClientName] = useState("");
    const [address, setAddress] = useState("");
    const [errors, setErrors] = useState({});
    // Initialize form data when dialog opens or client changes
    useEffect(() => {
        if (visible) {
            if (client) {
                setClientName(client.clientName || "");
                setAddress(client.address || "");
            }
            else {
                setClientName("");
                setAddress("");
            }
            setErrors({});
        }
    }, [client, visible]);
    const validateForm = () => {
        const newErrors = {};
        if (!clientName.trim()) {
            newErrors.clientName = "Client Name is required";
        }
        if (!address.trim()) {
            newErrors.address = "Address is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = () => {
        if (!validateForm())
            return;
        const trimmedName = clientName.trim();
        const trimmedAddress = address.trim();
        if (mode === "add") {
            const clientData = {
                clientName: trimmedName,
                address: trimmedAddress,
            };
            onSave(clientData);
        }
        else {
            // edit mode, clientId must exist in client
            if (!client || !("clientId" in client)) {
                // This is catastrophic: editing client without clientId
                //console.error("Missing clientId in edit mode");
                return;
            }
            const clientData = {
                clientId: client.clientId,
                clientName: trimmedName,
                address: trimmedAddress,
            };
            onSave(clientData);
        }
    };
    const handleCancel = () => {
        setClientName("");
        setAddress("");
        setErrors({});
        onHide();
    };
    const dialogHeader = mode === "add" ? "Add New Client" : "Edit Client";
    const dialogFooter = (_jsxs("div", { className: "flex justify-content-end gap-2", children: [_jsx(DialogButton, { label: "Cancel", severity: "secondary", onClick: handleCancel, className: "w-auto" }), _jsx(DialogButton, { label: mode === "add" ? "Add Client" : "Update Client", severity: "success", icon: _jsx(FaCheck, { style: { fontSize: 16, marginRight: 8, marginLeft: 4 } }), onClick: handleSubmit, className: "w-auto" })] }));
    return (_jsx(Dialog, { header: dialogHeader, footer: dialogFooter, visible: visible, modal: true, onHide: handleCancel, style: { width: "30vw", minWidth: "300px" }, breakpoints: { "960px": "50vw", "641px": "90vw" }, children: _jsxs("div", { className: "p-fluid", children: [_jsxs("div", { className: "field mb-3", children: [_jsxs("label", { htmlFor: "clientName", className: "block mb-2 font-medium", children: ["Client Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(InputText, { id: "clientName", value: clientName, onChange: (e) => {
                                setClientName(e.target.value);
                                if (errors.clientName) {
                                    setErrors((prev) => ({ ...prev, clientName: undefined }));
                                }
                            }, autoFocus: true, style: { borderRadius: "8px" }, className: errors.clientName ? "p-invalid" : "" }), errors.clientName && (_jsx("small", { className: "p-error block mt-1", children: errors.clientName }))] }), _jsxs("div", { className: "field mb-4", children: [_jsxs("label", { htmlFor: "address", className: "block mb-2 font-medium", children: ["Address ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(InputText, { id: "address", value: address, onChange: (e) => {
                                setAddress(e.target.value);
                                if (errors.address) {
                                    setErrors((prev) => ({ ...prev, address: undefined }));
                                }
                            }, style: { borderRadius: "8px" }, className: errors.address ? "p-invalid" : "" }), errors.address && (_jsx("small", { className: "p-error block mt-1", children: errors.address }))] })] }) }));
};
export default ClientAddEdit;
