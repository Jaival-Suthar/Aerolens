import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { lookupService } from "../services/lookupService";
import DialogButton from "../../../shared/DialogAddEditButton";
import { FaCheck } from "react-icons/fa";
import { useAuth } from "../../../shared/auth/AuthContext"; // ✅ get token
export const AddLookupForm = ({ visible, onHide, onSuccess, }) => {
    const toast = useRef(null);
    const { accessToken } = useAuth(); // ✅ bring in token from context
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ tag: "", value: "" });
    const [errors, setErrors] = useState({});
    // --- Validation ---
    const validateForm = () => {
        const newErrors = {};
        if (!formData.tag.trim())
            newErrors.tag = "Tag is required";
        else if (formData.tag.length > 100)
            newErrors.tag = "Tag must be 100 characters or less";
        if (!formData.value.trim())
            newErrors.value = "Value is required";
        else if (formData.value.length > 500)
            newErrors.value = "Value must be 500 characters or less";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // --- Submit Handler ---
    const handleSubmit = async () => {
        if (!validateForm())
            return;
        if (!accessToken) {
            toast.current?.show({
                severity: "warn",
                summary: "Authentication Required",
                detail: "Please log in again to continue.",
                life: 3000,
            });
            return;
        }
        setLoading(true);
        try {
            const response = await lookupService.create(accessToken, {
                tag: formData.tag.trim(),
                value: formData.value.trim(),
            });
            if (response.success) {
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: response.message || "Lookup entry created successfully",
                    life: 3000,
                });
                resetForm();
                onSuccess();
                onHide();
            }
            else {
                // Handle validation errors from backend
                if (response.error === "VALIDATION_ERROR" &&
                    response.details?.validationErrors) {
                    const backendErrors = {};
                    response.details.validationErrors.forEach((err) => {
                        if (err.field === "tag" || err.field === "value") {
                            backendErrors[err.field] = err.message;
                        }
                    });
                    setErrors(backendErrors);
                }
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: response.message || "Failed to create lookup entry",
                    life: 3000,
                });
            }
        }
        catch (error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: error.message || "Failed to create lookup entry",
                life: 3000,
            });
        }
        finally {
            setLoading(false);
        }
    };
    // --- Helpers ---
    const resetForm = () => {
        setFormData({ tag: "", value: "" });
        setErrors({});
    };
    const handleHide = () => {
        resetForm();
        onHide();
    };
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field])
            setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
    // --- Dialog Footer ---
    const dialogFooter = (_jsxs("div", { children: [_jsx(DialogButton, { label: "Cancel", severity: "secondary", onClick: handleHide, className: "w-auto", disabled: loading }), _jsx(DialogButton, { label: "Add Lookup", severity: "success", icon: _jsx(FaCheck, { style: { fontSize: 16, marginRight: 8, marginLeft: 4 } }), onClick: handleSubmit, className: "w-auto", loading: loading })] }));
    return (_jsxs(_Fragment, { children: [_jsx(Toast, { ref: toast }), _jsx(Dialog, { header: "Add New Lookup Entry", visible: visible, style: { width: "450px" }, footer: dialogFooter, onHide: handleHide, draggable: false, modal: true, "data-testid": "lookup-dialog", children: _jsxs("div", { className: "p-fluid", children: [_jsxs("div", { className: "field mb-4", children: [_jsxs("label", { htmlFor: "tag", className: "font-semibold", children: ["Tag ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(InputText, { id: "tag", value: formData.tag, onChange: (e) => handleInputChange("tag", e.target.value), placeholder: "Enter tag (e.g., status)", maxLength: 100, className: errors.tag ? "p-invalid" : "", disabled: loading }), errors.tag && _jsx("small", { className: "p-error", children: errors.tag }), _jsxs("small", { className: "text-500", children: [formData.tag.length, "/100 characters"] })] }), _jsxs("div", { className: "field", children: [_jsxs("label", { htmlFor: "value", className: "font-semibold", children: ["Value ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(InputText, { id: "value", value: formData.value, onChange: (e) => handleInputChange("value", e.target.value), placeholder: "Enter value (e.g., active)", maxLength: 500, className: errors.value ? "p-invalid" : "", disabled: loading }), errors.value && _jsx("small", { className: "p-error", children: errors.value }), _jsxs("small", { className: "text-500", children: [formData.value.length, "/500 characters"] })] })] }) })] }));
};
