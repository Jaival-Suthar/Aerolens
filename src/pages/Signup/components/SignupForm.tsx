import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import DialogButton from "../../../shared/DialogAddEditButton";
import { useAuth } from "../../../shared/auth/AuthContext";
import { SignupFormData } from "../types/signuptypes";
import { registerUser, fetchMemberCreateData } from "../services/useSignup";
import PhoneInputField from "../../../shared/components/PhoneInput";
import { isLikelyE164 } from "../../../shared/utils/phoneE164";
import {
  CONTACT_NUMBER_ERROR_MESSAGE,
  isValidContactNumber,
} from "../../../shared/validation/contactNumber";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}\-_=+|\\:;"'<>,./]).{8,}$/;

const PASSWORD_ERROR_MESSAGE =
  "Password must be at least 8 characters and contain uppercase, lowercase, number and special character.";

export default function SignupForm({
  visible,
  onHide,
  onSuccess,
  onError,
}: {
  visible: boolean;
  onHide: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  const { accessToken, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    designationId: 0,
    vendorId: null,
    isRecruiter: false,
    isInterviewer: false,
  });

  const [designations, setDesignations] = useState<
    { label: string; value: number }[]
  >([]);

  const [vendors, setVendors] = useState<
    { label: string; value: number }[]
  >([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fetch designations and vendors when dialog opens
  useEffect(() => {
    if (!visible || !accessToken || !isAuthenticated) return;

    fetchMemberCreateData(accessToken)
      .then((data) => {
        setDesignations(
          data.designations.map((d) => ({
            label: d.designationName,
            value: d.designationId,
          }))
        );

        setVendors(
          data.vendors.map((v) => ({
            label: v.vendorName,
            value: v.vendorId,
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to fetch member create data:", err);
        onError?.(err.message || "Failed to load form data");
      });
  }, [visible, accessToken, isAuthenticated, onError]);
  useEffect(() => {
  if (!formData.isRecruiter && formData.vendorId) {
    setFormData((p) => ({ ...p, vendorId: null }));
  }
}, [formData.isRecruiter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.contactNumber.trim()) {
      e.contactNumber = "Contact number is required";
    } else if (!isLikelyE164(formData.contactNumber.trim())) {
      e.contactNumber =
        "Enter a valid international number with country code (e.g. +91…, +44…).";
    }
    if (!formData.email.trim()) e.email = "Email is required";
    if (!formData.designationId) {
      e.designationId = "Designation is required";
    }

    if (!formData.password)
      e.password = "Please enter a password";
    else if (!PASSWORD_REGEX.test(formData.password))
      e.password = PASSWORD_ERROR_MESSAGE;

    if (!formData.confirmPassword)
      e.confirmPassword = "Please confirm password";
    else if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (visible) {
      setErrors({});
      setFormData({
        fullName: "",
        contactNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        designationId: 0,
        vendorId: null,
        isRecruiter: false,
        isInterviewer: false,
      });
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!validate() || !accessToken) return;

    setLoading(true);
    try {
      const res = await registerUser(formData, accessToken);
      
      // If we reach here, registration was successful
      onSuccess?.(res.message || "User created successfully");
      onHide(); // Close dialog on success
      
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        details?: { validationErrors?: Array<{ field: string; message: string }> };
      };
      console.log("❌ Error message:", err.message);

      let errorMsg = err.message || "Registration failed. Please try again.";
      const ve = err.details?.validationErrors;
      if (Array.isArray(ve)) {
        const row = ve.find((r) => r.field === "memberContact");
        if (row?.message) {
          errorMsg = row.message;
          setErrors((p) => ({ ...p, contactNumber: row.message }));
        }
      }

      if (onError) {
        onError(errorMsg);
      } else {
        console.error("⚠️ onError callback is undefined!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Create User"
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      style={{ width: "60vw", color: "#07253f" }}
      breakpoints={{ "960px": "80vw", "640px": "95vw" }}
    >
      <div className="p-fluid grid">
        {/* Full Name */}
        <div className="field col-12 md:col-6">
          <label>Full Name *</label>
          <InputText
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={errors.fullName ? "p-invalid" : ""}
          />
          <small className="p-error">{errors.fullName}</small>
        </div>

        <div className="field col-12 md:col-6">
          <label>Contact Number *</label>
          <PhoneInputField
            id="signup-contact-e164"
            value={formData.contactNumber}
            onChange={(v) => {
              setFormData((p) => ({ ...p, contactNumber: v }));
              setErrors((p) => ({ ...p, contactNumber: "" }));
            }}
            disabled={loading}
            error={errors.contactNumber || null}
          />
        </div>

        {/* Email */}
        <div className="field col-12 md:col-6">
          <label>Email *</label>
          <InputText
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "p-invalid" : ""}
          />
          <small className="p-error">{errors.email}</small>
        </div>

        {/* Designation */}
        <div className="field col-12 md:col-6">
          <label>Designation *</label>
          <Dropdown
            value={formData.designationId || null}
            options={designations}
            placeholder="Select designation"
            onChange={(e) => {
              setFormData((p) => ({ ...p, designationId: e.value }));
              setErrors((prev) => ({ ...prev, designationId: "" }));
            }}
            className={errors.designationId ? "p-invalid" : ""}
          />
          <small className="p-error">{errors.designationId}</small>
        </div>

        {/* Password */}
        <div className="field col-12 md:col-6">
          <label>Password *</label>
          <Password
            name="password"
            value={formData.password}
            onChange={handleChange}
            toggleMask
            feedback={false}
            className={errors.password ? "p-invalid w-full" : "w-full"}
          />
          <small className="p-error">{errors.password}</small>
        </div>

        {/* Confirm Password */}
        <div className="field col-12 md:col-6">
          <label>Confirm Password *</label>
          <Password
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            toggleMask
            feedback={false}
            className={errors.confirmPassword ? "p-invalid w-full" : "w-full"}
          />
          <small className="p-error">{errors.confirmPassword}</small>
        </div>

        {/* Roles */}
        <div className="field col-12">
          <label>User Role Access</label>

          <div className="flex gap-6 mt-3">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.isRecruiter}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    isRecruiter: e.target.checked,
                    ...(e.target.checked ? {} : { vendorId: null }),
                  }))
                }
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                }}
              />

              Recruiter
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.isInterviewer}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, isInterviewer: e.target.checked }))
                }
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                }}
              />
              Interviewer
            </label>
          </div>
        </div>
        {formData.isRecruiter && (
          <div className="field col-12 md:col-6">
            <label>Vendor</label>
            <Dropdown
              value={formData.vendorId ?? null}
              options={vendors}
              placeholder="Select vendor"
              showClear
              className={errors.vendorId ? "p-invalid" : ""}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  vendorId: e.value ?? null,
                }))
              }
            />
            <small className="p-error">{errors.vendorId}</small>
          </div>
        )}
      </div>

      <div className="flex justify-content-end gap-2 mt-4">
        <DialogButton label="Cancel" severity="secondary" onClick={onHide} />
        <DialogButton
          label="Create User"
          severity="success"
          loading={loading}
          onClick={handleSubmit}
        />
      </div>
    </Dialog>
  );
}