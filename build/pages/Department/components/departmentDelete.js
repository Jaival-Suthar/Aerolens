import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
import { deleteDepartment } from "../services/useDepartment";
import { useAuth } from "../../../shared/auth/AuthContext";
const DepartmentDelete = ({ visible, onHide, selectedDepartment, onSuccess, onClearSelection, }) => {
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const { accessToken } = useAuth();
    const handleDelete = async () => {
        if (!selectedDepartment)
            return;
        if (!accessToken) {
            toast.current?.show({
                severity: "error",
                summary: "Auth Error",
                detail: "No token found. Please log in again.",
                life: 3000,
            });
            return;
        }
        setLoading(true);
        try {
            await deleteDepartment(accessToken, selectedDepartment.departmentId);
            toast.current?.show({
                severity: "success",
                summary: "Deleted",
                detail: `Department "${selectedDepartment.departmentName}" deleted successfully`,
                life: 3000,
            });
            onClearSelection();
            onSuccess();
            onHide();
        }
        catch (error) {
            console.error(error);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete department. Please try again.",
                life: 3000,
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        onHide();
    };
    const dialogFooter = (_jsx("div", { className: "flex justify-content-end gap-2", children: _jsx(DialogDeleteButton, { onCancel: handleCancel, onDelete: handleDelete, loading: loading }) }));
    return (_jsxs(_Fragment, { children: [_jsx(Toast, { ref: toast, position: "top-right" }), _jsx(Dialog, { visible: visible, onHide: handleCancel, header: "Confirm Deletion", footer: dialogFooter, style: { width: "400px" }, modal: true, className: "p-fluid", children: _jsxs("div", { className: "confirmation-content", children: [_jsxs("p", { children: ["Are you sure you want to delete department ", _jsxs("strong", { children: ["\"", selectedDepartment?.departmentName, "\""] }), "?"] }), _jsx("p", { className: "text-sm text-600", children: "This action cannot be undone." })] }) })] }));
};
export default DepartmentDelete;
