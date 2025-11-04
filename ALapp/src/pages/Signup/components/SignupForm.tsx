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
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDropdownChange = (e: { value: string }) => {
    setFormData((prev) => ({ ...prev, designation: e.value || "" }));
    setErrors((prev) => ({ ...prev, designation: "" }));
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Please enter your full name";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Please enter your contact number";
    if (!formData.email) newErrors.email = "Please enter your email address";
    if (!formData.designation)
      newErrors.designation = "Please select a designation";
    if (!formData.password) newErrors.password = "Please enter a password";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    )
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
      if (response && response.success) {
        alert("User created successfully! Redirecting to login page.");
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #eef2ff, #ffffff)",
        padding: "20px",
      }}
    >
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
          Create Your Account
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          Join our management system and start your journey today 🚀
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

        {/* Full Name */}
        <div style={inputGroupStyle}>
          <FaUser style={iconStyle} />
          <InputText
            placeholder="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            style={{ width: "100%", border: "none", outline: "none" }}
          />
        </div>
        {errors.fullName && <p style={{ color: "red", marginTop: "-8px" }}>{errors.fullName}</p>}

        {/* Contact Number */}
        <div style={inputGroupStyle}>
          <FaPhone style={iconStyle} />
          <InputText
            placeholder="Contact Number"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            style={{ width: "100%", border: "none", outline: "none" }}
          />
        </div>
        {errors.contactNumber && <p style={{ color: "red", marginTop: "-8px" }}>{errors.contactNumber}</p>}

        {/* Email */}
        <div style={inputGroupStyle}>
          <FaEnvelope style={iconStyle} />
          <InputText
            placeholder="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: "100%", border: "none", outline: "none" }}
          />
        </div>
        {errors.email && <p style={{ color: "red", marginTop: "-8px" }}>{errors.email}</p>}

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

        {/* Password */}
        <div style={inputGroupStyle}>
          <FaLock style={iconStyle} />
          <Password
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            toggleMask
            inputStyle={{ width: "100%", border: "none", outline: "none" }}
          />
        </div>
        {errors.password && <p style={{ color: "red", marginTop: "-8px" }}>{errors.password}</p>}

        {/* Confirm Password */}
        <div style={inputGroupStyle}>
          <FaLock style={iconStyle} />
          <Password
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            feedback={false}
            toggleMask
            inputStyle={{ width: "100%", border: "none", outline: "none" }}
          />
        </div>
        {errors.confirmPassword && <p style={{ color: "red", marginTop: "-8px" }}>{errors.confirmPassword}</p>}

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