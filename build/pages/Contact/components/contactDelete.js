import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog } from "primereact/dialog";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
const ContactDelete = ({ visible, onHide, onDelete, contact }) => {
    const handleDelete = () => {
        if (onDelete && contact) {
            onDelete(contact);
        }
    };
    const dialogFooter = (_jsx("div", { className: "flex justify-content-end gap-2", children: _jsx(DialogDeleteButton, { onCancel: onHide, onDelete: handleDelete }) }));
    return (_jsx(Dialog, { header: "Confirm Delete", footer: dialogFooter, visible: visible, modal: true, onHide: onHide, style: { width: "25vw", minWidth: "300px" }, breakpoints: { '960px': '50vw', '641px': '90vw' }, children: _jsxs("div", { className: "p-4", children: [_jsxs("p", { className: "mb-4", children: ["Are you sure you want to delete contact", " ", _jsx("strong", { children: contact?.contactPersonName || "this contact" }), "?"] }), contact && (_jsxs("div", { className: "mb-4 p-3 border-round surface-100", children: [_jsxs("div", { children: [_jsx("strong", { children: "Name:" }), " ", contact.contactPersonName] }), _jsxs("div", { children: [_jsx("strong", { children: "Designation:" }), " ", contact.designation] }), _jsxs("div", { children: [_jsx("strong", { children: "Email:" }), " ", contact.email] }), _jsxs("div", { children: [_jsx("strong", { children: "Phone:" }), " ", contact.phone] })] }))] }) }));
};
export default ContactDelete;
