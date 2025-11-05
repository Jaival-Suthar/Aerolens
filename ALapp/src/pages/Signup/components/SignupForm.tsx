import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { SignupFormData, SignupResponse } from "../types/signuptypes";
import { registerUser } from "../services/useSignup";

// React Icons
import { FaUser, FaPhone, FaEnvelope, FaLock, FaBriefcase } from "react-icons/fa";

export default function SignupForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    designation: "",
    isRecruiter: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const designations = [
    { label: "QA Automation Developer", value: "qa automation developer" },
    { label: "Software Engineer", value: "software engineer" },
    { label: "Sr. PHP Developer", value: "sr. php developer" },
    { label: "Head Of Engineering", value: "head of engineering" },
    { label: "Admin", value: "admin" },
    { label: "Test Engineer", value: "test-engineer" },
    { label: "Staff Software Engineer", value: "staff software engineer" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleDropdownChange = (e: { value: string }) => {
    setFormData(prev => ({ ...prev, designation: e.value || "" }));
    setErrors(prev => ({ ...prev, designation: "" }));
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Please enter your full name";
    if (!formData.contactNumber) newErrors.contactNumber = "Please enter your contact number";
    if (!formData.email) newErrors.email = "Please enter your email address";
    if (!formData.designation) newErrors.designation = "Please select a designation";
    if (!formData.password) newErrors.password = "Please enter a password";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupClick = async () => {
    setGeneralError("");
    if (!validateFields()) return;

    const submitData = {
      ...formData,
      isRecruiter: false,
      isAdmin: formData.designation === "admin",
    };

    try {
      setLoading(true);
      const response: SignupResponse = await registerUser(submitData);
      if (response?.success) {
        alert("User created successfully! Redirecting to Home page.");
        navigate("/login");
      } else {
        setGeneralError(response?.message || "Signup failed.");
      }
    } catch (err: any) {
      setGeneralError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "4px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
  };

  const inputGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "6px 10px",
    background: "#fff",
  };

  const iconStyle: React.CSSProperties = { 
    marginRight: "8px", 
    color: "#6b7280",
    fontSize: "14px"
  };

  const fieldContainerStyle: React.CSSProperties = {
    marginBottom: "12px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        alignItems: "flex-start",     
        justifyContent: "center",
        paddingTop: "40px",           
      }}
    >
      <div style={{ maxWidth: "1200px"}}>
        {/* Header */}
        <div style={{ marginBottom: "12px" }}>
          <h1
            style={{
              fontSize: "24px",
              color: "#111827",
              fontWeight: "600",
              marginBottom: "2px",
            }}
          >
            Create New User
          </h1>
          <p style={{ color: "#4e535cff", fontSize: "16px", fontWeight: "500" }}>
            Add a new user to the system
          </p>
        </div>

        {/* Main Content */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            maxWidth: "900px",
          }}
        >
          {generalError && (
            <div
              style={{
                color: "#b91c1c",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                padding: "8px 12px",
                marginBottom: "16px",
                fontSize: "13px",
              }}
            >
              {generalError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Full Name */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Full Name</label>
              <div style={inputGroupStyle}>
                <FaUser style={iconStyle} />
                <InputText
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }}
                />
              </div>
              {errors.fullName && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.fullName}</p>}
            </div>

            {/* Contact Number */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Contact Number</label>
              <div style={inputGroupStyle}>
                <FaPhone style={iconStyle} />
                <InputText
                  name="contactNumber"
                  placeholder="Enter contact number"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  style={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }}
                />
              </div>
              {errors.contactNumber && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.contactNumber}</p>}
            </div>

            {/* Email Address */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Email Address</label>
              <div style={inputGroupStyle}>
                <FaEnvelope style={iconStyle} />
                <InputText
                  name="email"
                  placeholder="Enter email address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }}
                />
              </div>
              {errors.email && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.email}</p>}
            </div>

            {/* Designation */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Designation</label>
              <div style={inputGroupStyle}>
                <FaBriefcase style={iconStyle} />
                <Dropdown
                  value={formData.designation}
                  options={designations}
                  onChange={handleDropdownChange}
                  placeholder="Select designation"
                  style={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }}
                />
              </div>
              {errors.designation && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.designation}</p>}
            </div>

            {/* Password */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Password</label>
              <div style={inputGroupStyle}>
                <FaLock style={iconStyle} />
                <Password
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  toggleMask
                  inputStyle={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }}
                />
              </div>
              {errors.password && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Confirm Password</label>
              <div style={inputGroupStyle}>
                <FaLock style={iconStyle} />
                <Password
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  toggleMask
                  feedback={false}
                  inputStyle={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }}
                />
              </div>
              {errors.confirmPassword && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
            <Button
              label="Cancel"
              onClick={() => navigate(-1)}
              outlined
              style={{
                padding: "8px 20px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "white",
                color: "#374151",
                fontSize: "14px",
              }}
            />
            <Button
              label={loading ? "Creating User..." : "Create User"}
              icon={loading ? "pi pi-spin pi-spinner" : ""}
              onClick={handleSignupClick}
              disabled={loading}
              style={{
                padding: "8px 20px",
                background: "#2563eb",
                border: "none",
                color: "white",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}