import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/Department/components/DepartmentAddEdit.tsx
import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { addDepartment, updateDepartment } from "../services/useDepartment";
import { FaCheck } from "react-icons/fa";
import DialogButton from "../../../shared/DialogAddEditButton";
import { useAuth } from "../../../shared/auth/AuthContext";
const DepartmentAddEdit = ({ visible, onHide, selectedDepartment, clientId, onSuccess, }) => {
    const [departmentName, setDepartmentName] = useState("");
    const [departmentDescription, setDepartmentDescription] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const { accessToken } = useAuth();
    const isEditMode = selectedDepartment !== null;
    const toast = useRef(null);
    useEffect(() => {
        if (isEditMode && selectedDepartment) {
            setDepartmentName(selectedDepartment.departmentName || "");
            setDepartmentDescription(selectedDepartment.departmentDescription || "");
        }
        else {
            setDepartmentName("");
            setDepartmentDescription("");
        }
    }, [selectedDepartment, visible, isEditMode]);
    const handleSave = async () => {
        setSubmitted(true);
        if (!departmentName.trim() || !departmentDescription.trim())
            return;
        try {
            if (!accessToken) {
                toast.current?.show({ severity: "error", summary: "Auth Error", detail: "No token found. Please log in again.", life: 3000 });
                return;
            }
            if (isEditMode && selectedDepartment) {
                await updateDepartment(accessToken, {
                    ...selectedDepartment,
                    departmentName: departmentName.trim(),
                    departmentDescription: departmentDescription.trim(),
                });
                toast.current?.show({ severity: "success", summary: "Success", detail: "Department updated successfully.", life: 3000 });
            }
            else {
                await addDepartment(accessToken, {
                    clientId,
                    departmentName: departmentName.trim(),
                    departmentDescription: departmentDescription.trim(),
                });
                toast.current?.show({ severity: "success", summary: "Success", detail: "Department added successfully.", life: 3000 });
            }
            onSuccess();
            onHide();
            setDepartmentName("");
            setDepartmentDescription("");
            setSubmitted(false);
        }
        catch (error) {
            console.error("Error saving department:", error);
            toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to save department. Please try again later.", life: 3000 });
        }
    };
    const handleCancel = () => {
        setDepartmentName("");
        setDepartmentDescription("");
        setSubmitted(false);
        onHide();
    };
    const dialogFooter = (_jsxs("div", { className: "flex justify-content-end gap-2", children: [_jsx(DialogButton, { label: "Cancel", severity: "secondary", onClick: handleCancel, className: "w-auto" }), _jsx(DialogButton, { label: isEditMode ? "Update Department" : "Add Department", severity: "success", icon: _jsx(FaCheck, { style: { fontSize: 16, marginRight: 8, marginLeft: 4 } }), onClick: handleSave, className: "w-auto", disabled: !departmentName.trim() || !departmentDescription.trim() })] }));
    return (_jsxs(_Fragment, { children: [_jsx(Toast, { ref: toast }), _jsxs(Dialog, { visible: visible, onHide: handleCancel, header: isEditMode ? "Edit Department" : "Add New Department", footer: dialogFooter, style: { width: "450px" }, modal: true, className: "p-fluid", children: [_jsxs("div", { className: "field", children: [_jsx("label", { htmlFor: "departmentName", className: "font-bold", children: "Department Name *" }), _jsx(InputTextarea, { id: "departmentName", value: departmentName, onChange: (e) => setDepartmentName(e.target.value), placeholder: "Enter department name", required: true, className: submitted && !departmentName.trim() ? "p-invalid" : "" }), submitted && !departmentName.trim() && (_jsx("small", { className: "p-error", children: "Department Name is required." }))] }), _jsxs("div", { className: "field", children: [_jsx("label", { htmlFor: "departmentDescription", className: "font-bold", children: "Department Description *" }), _jsx(InputTextarea, { id: "departmentDescription", value: departmentDescription, onChange: (e) => setDepartmentDescription(e.target.value), placeholder: "Enter department description", required: true, className: submitted && !departmentDescription.trim() ? "p-invalid" : "" }), submitted && !departmentDescription.trim() && (_jsx("small", { className: "p-error", children: "Department Description is required." }))] })] })] }));
};
export default DepartmentAddEdit;
