import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "primereact/button";
import { FaTrash } from "react-icons/fa";
const DialogDeleteButton = ({ onCancel, onDelete, loading = false, cancelLabel = "Cancel", deleteLabel = "Delete", cancelDisabled = false, deleteDisabled = false, className = "", }) => {
    return (_jsxs(_Fragment, { children: [_jsx(Button, { label: cancelLabel, severity: "secondary", size: "small", onClick: onCancel, disabled: cancelDisabled || loading, className: `w-auto ${className}`, style: {
                    padding: "0.4rem 1rem",
                    borderRadius: "6px",
                    fontWeight: 500,
                } }), _jsx(Button, { label: deleteLabel, severity: "danger", size: "small", icon: _jsx(FaTrash, { style: { fontSize: 16, marginRight: 8, marginLeft: 4 } }), onClick: onDelete, loading: loading, disabled: deleteDisabled || loading, autoFocus: true, className: className, style: {
                    padding: "0.4rem 1rem",
                    borderRadius: "6px",
                    fontWeight: 600,
                } })] }));
};
export default DialogDeleteButton;
