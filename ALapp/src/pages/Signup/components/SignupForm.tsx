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
        alert("User created successfully! Redirecting to Login page.");
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

  const inputGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "8px 10px",
    marginBottom: "10px",
    background: "#fff",
  };

  const iconStyle: React.CSSProperties = { marginRight: "10px", color: "#555" };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #eef2ff, #ffffff)",
        padding: "20px",
      }}
    >
      {/* Top-left heading */}
      <h1
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          fontSize: "24px",
          color: "#000000",
          fontWeight: "bold",
        }}
      >
        Create New User
      </h1>

      {/* Signup form */}
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "28px", marginBottom: "8px" }}>
          Create New Account
        </h2>
        <p style={{ textAlign: "center", color: "#000000", marginBottom: "20px" }}>
          Join our management system and start a new journey today 🚀
        </p>

        {generalError && (
          <div
            style={{
              textAlign: "center",
              color: "#b91c1c",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "8px",
              marginBottom: "16px",
            }}
          >
            {generalError}
          </div>
        )}

        {/** Form Fields **/}
        {[
          { icon: FaUser, name: "fullName", placeholder: "Full Name", type: "text" },
          { icon: FaPhone, name: "contactNumber", placeholder: "Contact Number", type: "text" },
          { icon: FaEnvelope, name: "email", placeholder: "Email Address", type: "email" },
        ].map(field => (
          <div key={field.name}>
            <div style={inputGroupStyle}>
              <field.icon style={iconStyle} />
              <InputText
                name={field.name}
                placeholder={field.placeholder}
                value={(formData as any)[field.name]}
                onChange={handleChange}
                style={{ width: "100%", border: "none", outline: "none" }}
              />
            </div>
            {errors[field.name] && <p style={{ color: "red", marginTop: "-8px" }}>{errors[field.name]}</p>}
          </div>
        ))}

        {/* Designation */}
        <div style={inputGroupStyle}>
          <FaBriefcase style={iconStyle} />
          <Dropdown
            value={formData.designation}
            options={designations}
            onChange={handleDropdownChange}
            placeholder="Select Designation"
            style={{ width: "100%", border: "none", outline: "none" }}
          />
        </div>
        {errors.designation && <p style={{ color: "red", marginTop: "-8px" }}>{errors.designation}</p>}

        {/* Password & Confirm Password */}
        {[
          { icon: FaLock, name: "password", placeholder: "Password" },
          { icon: FaLock, name: "confirmPassword", placeholder: "Confirm Password" },
        ].map(field => (
          <div key={field.name}>
            <div style={inputGroupStyle}>
              <field.icon style={iconStyle} />
              <Password
                name={field.name}
                value={(formData as any)[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                toggleMask
                feedback={field.name === "confirmPassword" ? false : undefined}
                inputStyle={{ width: "100%", border: "none", outline: "none" }}
              />
            </div>
            {errors[field.name] && <p style={{ color: "red", marginTop: "-8px" }}>{errors[field.name]}</p>}
          </div>
        ))}

        {/* Submit Button */}
        <Button
          type="submit"
          label={loading ? "Creating Account..." : "Sign Up"}
          icon={loading ? "pi pi-spin pi-spinner" : ""}
          onClick={handleSignupClick}
          disabled={loading}
          style={{
            width: "100%",
            background: "#2563eb",
            border: "none",
            color: "white",
            padding: "10px",
            borderRadius: "10px",
            marginTop: "10px",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}
