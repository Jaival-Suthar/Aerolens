import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import DialogButton from "../../../shared/DialogAddEditButton";
import { useAuth } from "../../../shared/auth/AuthContext";
import { SignupFormData, SignupResponse } from "../types/signuptypes";
import { registerUser, fetchMemberCreateData  } from "../services/useSignup";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}\-_=+|\\:;"'<>,./]).{8,}$/;

const PASSWORD_ERROR_MESSAGE =
  "Password must be at least 8 characters and contain uppercase, lowercase, number and special character.";

export default function SignupForm({
  visible,
  onHide,
  onSuccess,
}: {
  visible: boolean;
  onHide: () => void;
  onSuccess?: () => void
}) {
  const { accessToken, isAuthenticated } = useAuth();
  const toast = useRef<Toast>(null);

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    designationId: 0,
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
      .catch(() =>
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load designations",
        })
      );
  }, [visible, accessToken, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.contactNumber.trim())
      e.contactNumber = "Contact number is required";
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

    try {
      setLoading(true);
      const res: SignupResponse = await registerUser(formData, accessToken);

      toast.current?.show({
        severity: res.success ? "success" : "error",
        summary: res.success ? "Success" : "Error",
        detail: res.message,
      });

      if (res.success) {
        onSuccess?.();
        onHide();
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
      style={{ width: "60vw" }}
      breakpoints={{ "960px": "80vw", "640px": "95vw" }}
    >
      <Toast ref={toast} />

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

        {/* Contact */}
        <div className="field col-12 md:col-6">
          <label>Contact Number *</label>
          <InputText
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className={errors.contactNumber ? "p-invalid" : ""}
          />
          <small className="p-error">{errors.contactNumber}</small>
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
        <div className="field col-12 md:col-6">
          <label>Vendor</label>
          <Dropdown
            value={formData.vendorId ?? null}
            options={vendors}
            placeholder="Select vendor"
            showClear
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                vendorId: e.value ?? null,
              }))
            }
          />
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
                  setFormData((p) => ({ ...p, isRecruiter: e.target.checked }))
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
      </div>

      <div className="flex justify-content-end gap-2 mt-4">
        <DialogButton
          label="Cancel"
          severity="secondary"
          onClick={onHide}
        />
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
