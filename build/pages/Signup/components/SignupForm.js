import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { registerUser, fetchDesignations } from "../services/useSignup";
import { useAuth } from "../../../shared/auth/AuthContext";
import { FaUser, FaPhone, FaEnvelope, FaLock, FaBriefcase } from "react-icons/fa";
export default function SignupForm() {
    const navigate = useNavigate();
    const { accessToken, isAuthenticated } = useAuth();
    const toast = useRef(null); // ✅ Toast ref
    const [formData, setFormData] = useState({
        fullName: "",
        contactNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        designation: "",
        isRecruiter: false,
    });
    const [designations, setDesignations] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingDesignations, setLoadingDesignations] = useState(false);
    useEffect(() => {
        const loadDesignations = async () => {
            if (!accessToken || !isAuthenticated)
                return;
            try {
                setLoadingDesignations(true);
                const data = await fetchDesignations(accessToken);
                setDesignations(data.map((d) => ({ label: d, value: d })));
            }
            catch (err) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: err?.message || "Failed to load designations",
                    life: 4000,
                });
            }
            finally {
                setLoadingDesignations(false);
            }
        };
        loadDesignations();
    }, [accessToken, isAuthenticated]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };
    const handleDropdownChange = (e) => {
        setFormData((prev) => ({ ...prev, designation: e.value || "" }));
        setErrors((prev) => ({ ...prev, designation: "" }));
    };
    const validateFields = () => {
        const newErrors = {};
        if (!formData.fullName)
            newErrors.fullName = "Please enter your full name";
        if (!formData.contactNumber)
            newErrors.contactNumber = "Please enter your contact number";
        if (!formData.email)
            newErrors.email = "Please enter your email address";
        if (!formData.designation)
            newErrors.designation = "Please select a designation";
        if (!formData.password)
            newErrors.password = "Please enter a password";
        if (!formData.confirmPassword)
            newErrors.confirmPassword = "Please confirm your password";
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSignupClick = async () => {
        if (!validateFields())
            return;
        const submitData = {
            ...formData,
            isRecruiter: false,
            isAdmin: formData.designation === "admin",
        };
        try {
            setLoading(true);
            const response = await registerUser(submitData);
            // ✅ Always show toast based on backend message
            toast.current?.show({
                severity: response.success ? "success" : "error",
                summary: response.success ? "Success" : "Error",
                detail: response.message || (response.success ? "User created successfully!" : "Signup failed."),
                life: 4000,
            });
            if (response.success) {
                setFormData({
                    fullName: "",
                    contactNumber: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    designation: "",
                    isRecruiter: false,
                });
            }
        }
        catch (err) {
            console.error("Registration failed:", err);
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: err?.message || "Something went wrong. Please try again.",
                life: 4000,
            });
        }
        finally {
            setLoading(false);
        }
    };
    if (!isAuthenticated) {
        return (_jsx("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }, children: _jsxs("div", { style: { textAlign: "center" }, children: [_jsx("i", { className: "pi pi-spin pi-spinner", style: { fontSize: "2rem" } }), _jsx("p", { style: { marginTop: "1rem", color: "#6b7280" }, children: "Loading..." })] }) }));
    }
    const labelStyle = {
        display: "block",
        marginBottom: "4px",
        fontSize: "13px",
        fontWeight: "500",
        color: "#374151",
    };
    const inputGroupStyle = {
        display: "flex",
        alignItems: "center",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        padding: "6px 10px",
        background: "#fff",
    };
    const iconStyle = { marginRight: "8px", color: "#6b7280", fontSize: "14px" };
    const fieldContainerStyle = { marginBottom: "12px" };
    return (_jsxs("div", { style: {
            minHeight: "100vh",
            padding: "20px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "40px",
        }, children: [_jsx(Toast, { ref: toast, position: "top-right" }), _jsxs("div", { style: { maxWidth: "1200px" }, children: [_jsxs("div", { style: { marginBottom: "12px" }, children: [_jsx("h1", { style: {
                                    fontSize: "24px",
                                    color: "#111827",
                                    fontWeight: "600",
                                    marginBottom: "2px",
                                }, children: "Create New User" }), _jsx("p", { style: { color: "#4e535cff", fontSize: "16px", fontWeight: "500" }, children: "Add a new user to the system" })] }), _jsxs("div", { style: {
                            background: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            maxWidth: "900px",
                        }, children: [_jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }, children: [_jsxs("div", { style: fieldContainerStyle, children: [_jsx("label", { style: labelStyle, children: "Full Name" }), _jsxs("div", { style: inputGroupStyle, children: [_jsx(FaUser, { style: iconStyle }), _jsx(InputText, { name: "fullName", placeholder: "Enter full name", value: formData.fullName, onChange: handleChange, style: { width: "100%", border: "none", outline: "none", fontSize: "14px" } })] }), errors.fullName && _jsx("p", { style: { color: "#dc2626", marginTop: "3px", fontSize: "12px" }, children: errors.fullName })] }), _jsxs("div", { style: fieldContainerStyle, children: [_jsx("label", { style: labelStyle, children: "Contact Number" }), _jsxs("div", { style: inputGroupStyle, children: [_jsx(FaPhone, { style: iconStyle }), _jsx(InputText, { name: "contactNumber", placeholder: "Enter contact number", value: formData.contactNumber, onChange: handleChange, style: { width: "100%", border: "none", outline: "none", fontSize: "14px" } })] }), errors.contactNumber && _jsx("p", { style: { color: "#dc2626", marginTop: "3px", fontSize: "12px" }, children: errors.contactNumber })] }), _jsxs("div", { style: fieldContainerStyle, children: [_jsx("label", { style: labelStyle, children: "Email Address" }), _jsxs("div", { style: inputGroupStyle, children: [_jsx(FaEnvelope, { style: iconStyle }), _jsx(InputText, { name: "email", placeholder: "Enter email address", type: "email", value: formData.email, onChange: handleChange, style: { width: "100%", border: "none", outline: "none", fontSize: "14px" } })] }), errors.email && _jsx("p", { style: { color: "#dc2626", marginTop: "3px", fontSize: "12px" }, children: errors.email })] }), _jsxs("div", { style: fieldContainerStyle, children: [_jsx("label", { style: labelStyle, children: "Designation" }), _jsxs("div", { style: inputGroupStyle, children: [_jsx(FaBriefcase, { style: iconStyle }), _jsx(Dropdown, { value: formData.designation, options: designations, onChange: handleDropdownChange, placeholder: loadingDesignations ? "Loading..." : "Select designation", disabled: loadingDesignations, style: { width: "100%", border: "none", outline: "none", fontSize: "14px" } })] }), errors.designation && _jsx("p", { style: { color: "#dc2626", marginTop: "3px", fontSize: "12px" }, children: errors.designation })] }), _jsxs("div", { style: fieldContainerStyle, children: [_jsx("label", { style: labelStyle, children: "Password" }), _jsxs("div", { style: inputGroupStyle, children: [_jsx(FaLock, { style: iconStyle }), _jsx(Password, { name: "password", value: formData.password, onChange: handleChange, placeholder: "Enter password", toggleMask: true, inputStyle: { width: "100%", border: "none", outline: "none", fontSize: "14px" } })] }), errors.password && _jsx("p", { style: { color: "#dc2626", marginTop: "3px", fontSize: "12px" }, children: errors.password })] }), _jsxs("div", { style: fieldContainerStyle, children: [_jsx("label", { style: labelStyle, children: "Confirm Password" }), _jsxs("div", { style: inputGroupStyle, children: [_jsx(FaLock, { style: iconStyle }), _jsx(Password, { name: "confirmPassword", value: formData.confirmPassword, onChange: handleChange, placeholder: "Re-enter password", toggleMask: true, feedback: false, inputStyle: { width: "100%", border: "none", outline: "none", fontSize: "14px" } })] }), errors.confirmPassword && _jsx("p", { style: { color: "#dc2626", marginTop: "3px", fontSize: "12px" }, children: errors.confirmPassword })] })] }), _jsxs("div", { style: { display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }, children: [_jsx(Button, { label: "Cancel", onClick: () => navigate(-1), outlined: true, style: {
                                            padding: "8px 20px",
                                            borderRadius: "6px",
                                            border: "1px solid #d1d5db",
                                            background: "white",
                                            color: "#374151",
                                            fontSize: "14px",
                                        } }), _jsx(Button, { label: loading ? "Creating User..." : "Create User", icon: loading ? "pi pi-spin pi-spinner" : "", onClick: handleSignupClick, disabled: loading, style: {
                                            padding: "8px 20px",
                                            background: "#2563eb",
                                            border: "none",
                                            color: "white",
                                            borderRadius: "6px",
                                            cursor: loading ? "not-allowed" : "pointer",
                                            fontSize: "14px",
                                        } })] })] })] })] }));
}
