import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { FaCheck } from "react-icons/fa";
import { Toast } from "primereact/toast";
import DialogButton from "../../../shared/DialogAddEditButton";
import { createCandidate, updateCandidate, uploadResume, } from "../services/useResume";
import { useAuth } from "../../../shared/auth/AuthContext";
// ---------- CONSTANTS ----------
const STATUS_OPTIONS = [
    { label: "Selected", value: "Selected" },
    { label: "Rejected", value: "Rejected" },
    { label: "Interview Pending", value: "Interview Pending" },
];
const RECRUITER_OPTIONS = [
    { label: "Jayraj", value: "Jayraj" },
    { label: "Khushi", value: "Khushi" },
    { label: "Yash", value: "Yash" },
];
const LOCATION_OPTIONS = [
    { label: "Ahmedabad", value: "Ahmedabad" },
    { label: "Bangalore", value: "Bangalore" },
    { label: "San Francisco", value: "San Francisco" },
];
// ---------- HELPERS ----------
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?91|91)?[6-9]\d{9}$|^(\+?1)?[2-9]\d{9}$/;
const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/.*$/i;
const INITIAL_FORM = {
    candidateName: "",
    contactNumber: "",
    email: "",
    recruiterName: "",
    jobRole: "",
    preferredJobLocation: "",
    currentCTC: 0,
    expectedCTC: 0,
    noticePeriod: 0,
    experienceYears: 0,
    statusName: "",
    linkedinProfileUrl: "",
    resumeFile: null,
};
// ---------- VALIDATION ----------
const validateField = (field, value) => {
    switch (field) {
        case "candidateName":
            return value.trim() ? "" : "Candidate name is required.";
        case "recruiterName":
            return value ? "" : "Recruiter is required.";
        case "contactNumber":
            if (!value)
                return "Contact number is required.";
            if (!phoneRegex.test(value.replace(/[\s-]/g, "")))
                return "Enter a valid Indian or US phone number.";
            return "";
        case "email":
            if (!value)
                return "Email is required.";
            if (!emailRegex.test(value))
                return "Enter a valid email.";
            return "";
        case "jobRole":
            return value.trim() ? "" : "Job role is required.";
        case "preferredJobLocation":
            return value ? "" : "Location is required.";
        case "currentCTC":
            return value > 0 ? "" : "Current CTC must be greater than 0.";
        case "expectedCTC":
            return value > 0 ? "" : "Expected CTC must be greater than 0.";
        case "noticePeriod":
            return value >= 0 ? "" : "Notice period is required.";
        case "experienceYears":
            return value >= 0 ? "" : "Experience is required.";
        case "statusName":
            return value ? "" : "Status is required.";
        case "linkedinProfileUrl":
            if (!value)
                return "LinkedIn URL is required.";
            if (!linkedinRegex.test(value))
                return "Enter a valid LinkedIn URL.";
            return "";
        case "resumeFile":
            if (!value)
                return "";
            if (!value.name.toLowerCase().endsWith(".pdf"))
                return "Only PDF files are allowed.";
            if (value.size > 5 * 1024 * 1024)
                return "File must be smaller than 5MB.";
            return "";
        default:
            return "";
    }
};
// ---------- COMPONENT ----------
const ResumeAddEdit = ({ visible, onHide, selectedResume, onSuccess, }) => {
    const { accessToken } = useAuth();
    const isEditMode = Boolean(selectedResume);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef(null);
    // Initialize / Reset form
    useEffect(() => {
        setFormData(isEditMode ? { ...selectedResume, resumeFile: null } : INITIAL_FORM);
        setErrors({});
        setSubmitted(false);
    }, [visible, selectedResume, isEditMode]);
    const handleChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);
    const handleBlur = useCallback((field, currentValue) => {
    }, []);
    const validateForm = useCallback(() => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const errorMsg = validateField(key, formData[key]);
            if (errorMsg)
                newErrors[key] = errorMsg;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);
    const handleSave = useCallback(async () => {
        // 1. Set submitted to true to enable error display
        setSubmitted(true);
        // 2. Validate the form and check the result
        if (!validateForm()) {
            // If validation fails, stop here. Errors are now set in state and visible.
            return;
        }
        try {
            if (isEditMode && selectedResume) {
                const updateData = {
                    candidateName: formData.candidateName,
                    contactNumber: formData.contactNumber,
                    email: formData.email,
                    recruiterName: formData.recruiterName,
                    jobRole: formData.jobRole,
                    preferredJobLocation: formData.preferredJobLocation,
                    currentCTC: formData.currentCTC,
                    expectedCTC: formData.expectedCTC,
                    noticePeriod: formData.noticePeriod,
                    experienceYears: formData.experienceYears,
                    statusName: formData.statusName,
                    linkedinProfileUrl: formData.linkedinProfileUrl,
                };
                await updateCandidate(accessToken, selectedResume.candidateId, updateData);
                if (formData.resumeFile) {
                    await uploadResume(accessToken, selectedResume.candidateId, formData.resumeFile);
                }
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Candidate updated successfully!",
                    life: 3000,
                });
            }
            else {
                await createCandidate(accessToken, formData);
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Candidate added successfully!",
                    life: 3000,
                });
            }
            onSuccess();
            onHide();
        }
        catch (err) {
            console.error("Error saving candidate:", err);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: err?.response?.data?.message ||
                    err?.message ||
                    "Something went wrong. Please try again.",
                life: 5000,
            });
        }
        finally {
        }
    }, [
        formData,
        isEditMode,
        onHide,
        onSuccess,
        selectedResume,
        validateForm,
        accessToken,
    ]);
    const prefixSymbol = useMemo(() => (formData.preferredJobLocation === "San Francisco" ? "$" : "₹"), [formData.preferredJobLocation]);
    const shouldShowError = (field) => submitted ? errors[field] : undefined;
    const dialogFooter = (_jsxs("div", { className: "flex justify-content-end gap-2", children: [_jsx(DialogButton, { label: "Cancel", severity: "secondary", onClick: onHide }), _jsx(DialogButton, { label: isEditMode ? "Update Candidate" : "Add Candidate", severity: "success", icon: _jsx(FaCheck, { className: "mr-2" }), onClick: handleSave })] }));
    return (_jsxs(_Fragment, { children: [_jsx(Toast, { ref: toast }), _jsx(Dialog, { visible: visible, header: isEditMode ? "Edit Resume" : "Add New Resume", onHide: onHide, footer: dialogFooter, style: { width: "900px", maxHeight: "90vh" }, modal: true, className: "p-fluid", children: _jsxs("div", { className: "formgrid grid", children: [_jsx(InputField, { id: "candidateName", label: "Candidate Name", value: formData.candidateName, onChange: (e) => handleChange("candidateName", e.target.value), onBlur: () => handleBlur("candidateName", formData.candidateName), error: shouldShowError("candidateName") }), _jsx(DropdownField, { id: "recruiterName", label: "Recruiter", value: formData.recruiterName, options: RECRUITER_OPTIONS, onChange: (e) => handleChange("recruiterName", e.value), onBlur: () => handleBlur("recruiterName", formData.recruiterName), error: shouldShowError("recruiterName") }), _jsx(InputField, { id: "contactNumber", label: "Contact Number", value: formData.contactNumber, placeholder: "e.g. 9876543210", onChange: (e) => handleChange("contactNumber", e.target.value), onBlur: () => handleBlur("contactNumber", formData.contactNumber), error: shouldShowError("contactNumber") }), _jsx(InputField, { id: "email", label: "Email", value: formData.email, onChange: (e) => handleChange("email", e.target.value), onBlur: () => handleBlur("email", formData.email), error: shouldShowError("email") }), _jsx(InputField, { id: "jobRole", label: "Job Role", value: formData.jobRole, onChange: (e) => handleChange("jobRole", e.target.value), onBlur: () => handleBlur("jobRole", formData.jobRole), error: shouldShowError("jobRole") }), _jsx(DropdownField, { id: "preferredJobLocation", label: "Preferred Location", value: formData.preferredJobLocation, options: LOCATION_OPTIONS, onChange: (e) => handleChange("preferredJobLocation", e.value), onBlur: () => handleBlur("preferredJobLocation", formData.preferredJobLocation), error: shouldShowError("preferredJobLocation") }), _jsx(InputNumberField, { id: "currentCTC", label: "Current CTC", value: formData.currentCTC, onChange: (val) => handleChange("currentCTC", val), prefix: prefixSymbol, onBlur: () => handleBlur("currentCTC", formData.currentCTC), error: shouldShowError("currentCTC") }), _jsx(InputNumberField, { id: "expectedCTC", label: "Expected CTC", value: formData.expectedCTC, onChange: (val) => handleChange("expectedCTC", val), prefix: prefixSymbol, onBlur: () => handleBlur("expectedCTC", formData.expectedCTC), error: shouldShowError("expectedCTC") }), _jsx(InputNumberField, { id: "noticePeriod", label: "Notice Period (Days)", value: formData.noticePeriod, onChange: (val) => handleChange("noticePeriod", val), onBlur: () => handleBlur("noticePeriod", formData.noticePeriod), error: shouldShowError("noticePeriod") }), _jsx(InputNumberField, { id: "experienceYears", label: "Experience (Years)", value: formData.experienceYears, onChange: (val) => handleChange("experienceYears", val), onBlur: () => handleBlur("experienceYears", formData.experienceYears), error: shouldShowError("experienceYears") }), _jsx(DropdownField, { id: "statusName", label: "Status", value: formData.statusName, options: STATUS_OPTIONS, onChange: (e) => handleChange("statusName", e.value), onBlur: () => handleBlur("statusName", formData.statusName), error: shouldShowError("statusName") }), _jsx(InputField, { id: "linkedinProfileUrl", label: "LinkedIn URL", value: formData.linkedinProfileUrl, onChange: (e) => handleChange("linkedinProfileUrl", e.target.value), onBlur: () => handleBlur("linkedinProfileUrl", formData.linkedinProfileUrl), placeholder: "https://www.linkedin.com/in/...", error: shouldShowError("linkedinProfileUrl") }), _jsx(FileUploadField, { file: formData.resumeFile, onSelect: (file) => handleChange("resumeFile", file), error: shouldShowError("resumeFile") })] }) })] }));
};
const InputField = ({ id, label, value, onChange, onBlur, placeholder, error }) => (_jsxs("div", { className: "field col-12 md:col-6", children: [_jsxs("label", { htmlFor: id, className: "font-bold", children: [label, " *"] }), _jsx(InputText, { id: id, value: value, onChange: onChange, onBlur: onBlur, placeholder: placeholder, className: error ? "p-invalid" : "" }), error && _jsx("small", { className: "p-error", children: error })] }));
const DropdownField = ({ id, label, value, options, onChange, onBlur, placeholder, error }) => (_jsxs("div", { className: "field col-12 md:col-6", children: [_jsxs("label", { htmlFor: id, className: "font-bold", children: [label, " *"] }), _jsx(Dropdown, { id: id, value: value, options: options, onChange: onChange, onBlur: onBlur, placeholder: placeholder, className: error ? "p-invalid" : "" }), error && _jsx("small", { className: "p-error", children: error })] }));
const InputNumberField = ({ id, label, value, onChange, onBlur, prefix, error }) => (_jsxs("div", { className: "field col-12 md:col-6", children: [_jsxs("label", { htmlFor: id, className: "font-bold", children: [label, " *"] }), _jsx(InputNumber, { id: id, value: value, onValueChange: (e) => onChange(e.value), onBlur: onBlur, prefix: prefix, className: error ? "p-invalid" : "" }), error && _jsx("small", { className: "p-error", children: error })] }));
const FileUploadField = ({ file, onSelect, error }) => (_jsxs("div", { className: "field col-12 md:col-6", children: [_jsx("label", { className: "font-bold", children: "Upload Resume (PDF Only)" }), _jsx(FileUpload, { mode: "basic", name: "resume", accept: ".pdf", maxFileSize: 5 * 1024 * 1024, auto: false, customUpload: true, onSelect: (e) => e.files[0] && onSelect(e.files[0]), chooseLabel: "Select File", chooseOptions: {
                icon: "pi pi-file-pdf",
                label: "Upload PDF",
                className: "p-button-danger p-button-sm",
            }, className: error ? "p-invalid" : "" }), file && _jsxs("small", { className: "p-success", children: ["File selected: ", file.name] }), error && _jsx("small", { className: "p-error", children: error })] }));
export default ResumeAddEdit;
