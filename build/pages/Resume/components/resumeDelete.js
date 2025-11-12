import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/Resume/components/ResumeDelete.tsx
import { useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { deleteCandidate } from "../services/useResume";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
import { useAuth } from "../../../shared/auth/AuthContext";
const ResumeDelete = ({ visible, onHide, selectedResume, onSuccess, onClearSelection, }) => {
    const { accessToken } = useAuth();
    // ✅ Toast ref
    const toast = useRef(null);
    const handleDelete = async () => {
        if (!selectedResume?.candidateId) {
            toast.current?.show({
                severity: "warn",
                summary: "Warning",
                detail: "No candidate selected for deletion.",
                life: 3000,
            });
            return;
        }
        const id = Number(selectedResume.candidateId);
        try {
            await deleteCandidate(accessToken, id);
            onClearSelection();
            onSuccess();
            onHide();
            // ✅ Success toast
            toast.current?.show({
                severity: "success",
                summary: "Deleted",
                detail: `Candidate "${selectedResume.candidateName}" deleted successfully.`,
                life: 3000,
            });
        }
        catch (error) {
            console.error("Error deleting candidate:", error);
            // ❌ Error toast
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: error?.response?.data?.message ||
                    "Failed to delete candidate. Please try again.",
                life: 5000,
            });
        }
    };
    const handleCancel = () => onHide();
    const footer = (_jsx("div", { className: "flex justify-content-end gap-2", children: _jsx(DialogDeleteButton, { onCancel: handleCancel, onDelete: handleDelete }) }));
    return (_jsxs(_Fragment, { children: [_jsx(Toast, { ref: toast }), _jsx(Dialog, { visible: visible, onHide: handleCancel, header: "Confirm Deletion", footer: footer, style: { width: "400px" }, modal: true, className: "p-fluid", children: _jsxs("div", { className: "confirmation-content", children: [_jsxs("p", { children: ["Are you sure you want to delete candidate", " ", _jsxs("strong", { children: ["\"", selectedResume?.candidateName, "\""] }), "?"] }), _jsx("p", { children: "This action cannot be undone." })] }) })] }));
};
export default ResumeDelete;
