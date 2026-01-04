import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown"; // ✅ Already imported
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { SignupFormData, SignupResponse } from "../types/signuptypes";
import { registerUser, fetchDesignations, fetchVendors } from "../services/useSignup"; // ✅ Added fetchVendors import
import { useAuth } from "../../../shared/auth/AuthContext";
import { FaUser, FaPhone, FaEnvelope, FaLock, FaBriefcase, FaSpinner } from "react-icons/fa";
import DialogButton from "../../../shared/DialogAddEditButton";

export default function SignupForm() {
  const navigate = useNavigate();
  const { accessToken, isAuthenticated } = useAuth();
  const toast = useRef<Toast>(null);

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    designation: "",
    vendorId: "", // ✅ Added vendorId
    isRecruiter: false,
    isInterviewer: false
  });

  const [designations, setDesignations] = useState<{ label: string; value: string }[]>([]);
  const [vendors, setVendors] = useState<{ label: string; value: string }[]>([]); // ✅ Vendor state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false); // ✅ Vendor loading state

  const resetForm = () => {
    setFormData({
      fullName: "",
      contactNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      designation: "",
      vendorId: "", // ✅ Reset vendorId
      isRecruiter: false,
      isInterviewer: false,
    });
    setErrors({});
  };

  // ---------------- LOAD DESIGNATIONS ----------------
  useEffect(() => {
    const loadDesignations = async () => {
      if (!accessToken || !isAuthenticated) return;
      try {
        setLoadingDesignations(true);
        const data = await fetchDesignations(accessToken);
        setDesignations(data.map((d) => ({ label: d, value: d })));
      } catch (err: any) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: err?.message || "Failed to load designations",
          life: 4000,
        });
      } finally {
        setLoadingDesignations(false);
      }
    };
    loadDesignations();
  }, [accessToken, isAuthenticated]);

  // ---------------- LOAD VENDORS ----------------
  useEffect(() => { // ✅ New effect for vendors
    if (!accessToken || !isAuthenticated) return;

    const loadVendors = async () => {
      try {
        setLoadingVendors(true);
        const data = await fetchVendors(accessToken);
        console.log("Vendors loaded:", data);

        // Assume API returns [{id: '1', name: 'Vendor 1'}, ...]
        setVendors(data);
      } catch (err: any) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: err?.message || "Failed to load vendors",
          life: 4000,
        });
      } finally {
        setLoadingVendors(false);
      }
    };

    loadVendors();
  }, [accessToken, isAuthenticated]);

  // ---------------- HANDLE INPUT CHANGE ----------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDropdownChange = (e: { value: string }) => {
    setFormData((prev) => ({ ...prev, designation: e.value || "" }));
    setErrors((prev) => ({ ...prev, designation: "" }));
  };

  // ---------------- VALIDATE FORM ----------------
  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) newErrors.fullName = "Please enter your full name";

    if (!formData.contactNumber?.trim()) newErrors.contactNumber = "Contact number is required";
    else if (!/^\+?[\d\s-]{10,}$/.test(formData.contactNumber)) newErrors.contactNumber = "Invalid contact number";

    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.designation) newErrors.designation = "Please select a designation";

    if (!formData.vendorId) newErrors.vendorId = "Please select a vendor"; // ✅ Vendor validation

    if (!formData.password) newErrors.password = "Please enter a password";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------- SIGNUP CLICK ----------------
  const handleSignupClick = async () => {
    if (!accessToken) {
      toast.current?.show({
        severity: "warn",
        summary: "Session not ready",
        detail: "Please wait a moment and try again.",
        life: 3000,
      });
      return;
    }

    if (!validateFields()) return;

    const submitData = {
      ...formData,
      isRecruiter: formData.isRecruiter,
      isInterviewer: formData.isInterviewer,
      vendorId: formData.vendorId, // ✅ Send vendorId to backend
    };

    try {
      setLoading(true);
      const response: SignupResponse = await registerUser(submitData, accessToken);

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
          vendorId: "", // ✅ Reset vendorId on success
          isRecruiter: false,
          isInterviewer: false
        });
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err?.message || "Something went wrong. Please try again.",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
          <p style={{ marginTop: "1rem", color: "#374151" }}>Loading...</p>
        </div>
      </div>
    );
  }

  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#374151" };
  const inputGroupStyle: React.CSSProperties = { display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "6px", padding: "6px 10px", background: "#fff" };
  const iconStyle: React.CSSProperties = { marginRight: "8px", color: "#374151", fontSize: "14px" };
  const fieldContainerStyle: React.CSSProperties = { marginBottom: "12px" };

  return (
    <div style={{ minHeight: "100vh", padding: "5px", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <Toast ref={toast} position="top-right" />

      <div style={{ maxWidth: "1200px" }}>
        {/* Header */}
        <div style={{ marginBottom: "6px" }}>
          <h1 style={{ fontSize: "24px", color: "#111827", fontWeight: "600", marginBottom: "2px" }}>Create New User</h1>
          <p style={{ color: "#4e535cff", fontSize: "16px", fontWeight: "500" }}>Add a new user to the system</p>
        </div>

        {/* Main Content */}
        <div style={{ background: "white", padding: "10px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", maxWidth: "900px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Full Name */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Full Name *</label>
              <div style={inputGroupStyle}>
                <FaUser style={iconStyle} />
                <InputText name="fullName" placeholder="Enter full name" value={formData.fullName} onChange={handleChange} style={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }} />
              </div>
              {errors.fullName && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.fullName}</p>}
            </div>

            {/* Contact Number */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Contact Number *</label>
              <div style={inputGroupStyle}>
                <FaPhone style={iconStyle} />
                <InputText name="contactNumber" placeholder="Enter contact number" value={formData.contactNumber} onChange={handleChange} style={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }} />
              </div>
              {errors.contactNumber && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.contactNumber}</p>}
            </div>

            {/* Email Address */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Email Address *</label>
              <div style={inputGroupStyle}>
                <FaEnvelope style={iconStyle} />
                <InputText name="email" placeholder="Enter email address" type="email" value={formData.email} onChange={handleChange} style={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }} />
              </div>
              {errors.email && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.email}</p>}
            </div>

            {/* Designation */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Designation *</label>
              <div style={inputGroupStyle}>
                <FaBriefcase style={iconStyle} />
                <Dropdown value={formData.designation} options={designations} onChange={handleDropdownChange} placeholder={loadingDesignations ? "Loading..." : "Select designation"} disabled={loadingDesignations} style={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }} />
              </div>
              {errors.designation && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.designation}</p>}
            </div>

            {/* Vendor */}
           

            {/* Password */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Password *</label>
              <div style={inputGroupStyle}>
                <FaLock style={iconStyle} />
                <Password name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" toggleMask inputStyle={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }} />
              </div>
              {errors.password && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Confirm Password *</label>
              <div style={inputGroupStyle}>
                <FaLock style={iconStyle} />
                <Password name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" toggleMask feedback={false} inputStyle={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }} />
              </div>
              {errors.confirmPassword && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.confirmPassword}</p>}
            </div>
            
            {/* vendor dropdown */}
            <div style={fieldContainerStyle}> {/* ✅ Vendor field added */}
              <label style={labelStyle}>Vendor *</label>
              <div style={inputGroupStyle}>
                <FaBriefcase style={iconStyle} />
                <Dropdown
                  value={formData.vendorId}
                  options={vendors}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.value }))}
                  placeholder={loadingVendors ? "Loading..." : "Select vendor"}
                  disabled={loadingVendors}
                  style={{ width: "100%", border: "none", outline: "none", fontSize: "14px" }}
                />
              </div>
              {errors.vendorId && <p style={{ color: "#dc2626", marginTop: "3px", fontSize: "12px" }}>{errors.vendorId}</p>}
            </div>

            {/* Recruiter / Interviewer */}
            <div style={{ gridColumn: "1 / span 2", marginTop: "8px" }}>
              <label style={{ ...labelStyle, marginBottom: "6px", fontSize:"16px" }}>User Role Access</label>
              <div style={{ display: "flex", gap: "40px", marginTop: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "15px" }}>
                  <input type="checkbox" style={{ transform: "scale(1.5)" }} checked={formData.isRecruiter} onChange={(e) => setFormData(prev => ({ ...prev, isRecruiter: e.target.checked }))} />
                  Recruiter
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "15px" }}>
                  <input type="checkbox" style={{ transform: "scale(1.5)" }} checked={formData.isInterviewer} onChange={(e) => setFormData(prev => ({ ...prev, isInterviewer: e.target.checked }))} />
                  Interviewer
                </label>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
            <DialogButton label="Cancel" severity="secondary" onClick={resetForm} disabled={loading} />
            <DialogButton label={loading ? "Creating User..." : "Create User"} severity="success" icon={loading ? <FaSpinner className="spin mr-2" /> : null} onClick={handleSignupClick} loading={loading} disabled={loading || !accessToken} />
          </div>
        </div>
      </div>
    </div>
  );
}
