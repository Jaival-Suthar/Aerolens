import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { lookupService } from "../services/lookupService";
import { ValidationError } from "../types/lookupTypes";
import DialogButton from "../../../shared/DialogAddEditButton";
import { FaCheck } from "react-icons/fa";
import { useAuth } from "../../../shared/auth/AuthContext"; // ✅ get token

interface AddLookupFormProps {
  visible: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

interface FormData {
  tag: string;
  value: string;
}

interface ValidationErrors {
  tag?: string;
  value?: string;
}

export const AddLookupForm: React.FC<AddLookupFormProps> = ({
  visible,
  onHide,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth(); // ✅ bring in token from context
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ tag: "", value: "" });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // --- Validation ---
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.tag.trim()) newErrors.tag = "Tag is required";
    else if (formData.tag.length > 100)
      newErrors.tag = "Tag must be 100 characters or less";

    if (!formData.value.trim()) newErrors.value = "Value is required";
    else if (formData.value.length > 500)
      newErrors.value = "Value must be 500 characters or less";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submit Handler ---
  const handleSubmit = async () => {
    if (!validateForm()) return;

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
      } else {
        // Handle validation errors from backend
        if (
          response.error === "VALIDATION_ERROR" &&
          response.details?.validationErrors
        ) {
          const backendErrors: ValidationErrors = {};
          response.details.validationErrors.forEach((err: ValidationError) => {
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
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to create lookup entry",
        life: 3000,
      });
    } finally {
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // --- Dialog Footer ---
  const dialogFooter = (
    <div>
      <DialogButton
        label="Cancel"
        severity="secondary"
        onClick={handleHide}
        className="w-auto"
        disabled={loading}
      />
      <DialogButton
        label="Add Lookup"
        severity="success"
        icon={<FaCheck style={{ fontSize: 16, marginRight: 8, marginLeft: 4 }} />}
        onClick={handleSubmit}
        className="w-auto"
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Add New Lookup Entry"
        visible={visible}
        style={{ width: "450px" }}
        footer={dialogFooter}
        onHide={handleHide}
        draggable={false}
        modal
        data-testid="lookup-dialog"
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="tag" className="font-semibold">
              Tag <span className="text-red-500">*</span>
            </label>
            <InputText
              id="tag"
              value={formData.tag}
              onChange={(e) => handleInputChange("tag", e.target.value)}
              placeholder="Enter tag (e.g., status)"
              maxLength={100}
              className={errors.tag ? "p-invalid" : ""}
              disabled={loading}
            />
            {errors.tag && <small className="p-error">{errors.tag}</small>}
            <small className="text-500">
              {formData.tag.length}/100 characters
            </small>
          </div>

          <div className="field">
            <label htmlFor="value" className="font-semibold">
              Value <span className="text-red-500">*</span>
            </label>
            <InputText
              id="value"
              value={formData.value}
              onChange={(e) => handleInputChange("value", e.target.value)}
              placeholder="Enter value (e.g., active)"
              maxLength={500}
              className={errors.value ? "p-invalid" : ""}
              disabled={loading}
            />
            {errors.value && <small className="p-error">{errors.value}</small>}
            <small className="text-500">
              {formData.value.length}/500 characters
            </small>
          </div>
        </div>
      </Dialog>
    </>
  );
};
