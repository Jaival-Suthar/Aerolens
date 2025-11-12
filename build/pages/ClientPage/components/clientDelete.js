import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog } from "primereact/dialog";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
const ClientDelete = ({ visible, onHide, onDelete, client }) => {
    const dialogFooter = (_jsx("div", { className: "flex justify-content-end gap-2", children: _jsx(DialogDeleteButton, { onCancel: onHide, onDelete: () => {
                onDelete(client);
                onHide();
            } }) }));
    return (_jsx(Dialog, { header: "Confirm Delete", footer: dialogFooter, visible: visible, modal: true, onHide: onHide, style: { width: "25vw", minWidth: "300px" }, children: _jsxs("p", { children: ["Are you sure you want to delete client", " ", _jsx("strong", { children: client?.clientName || "this client" }), "?"] }) }));
};
export default ClientDelete;
