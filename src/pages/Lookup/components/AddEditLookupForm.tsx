import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { lookupService } from "../services/lookupService";
import { LookupEntry, ValidationError } from "../types/lookupTypes"; // Ensure LookupEntry is imported
import DialogButton from "../../../shared/DialogAddEditButton";
import { FaCheck, FaPencilAlt } from "react-icons/fa"; // Added FaPencilAlt for Edit button
import { useAuth } from "../../../shared/auth/AuthContext";

interface AddLookupFormProps {
  visible: boolean;
  isEdit?: boolean;
  lookupToEdit?: LookupEntry | null;
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
  isEdit = false, // Default to false
  lookupToEdit = null, // Default to null
  onHide,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ tag: "", value: "" });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // --- Effect to set form data on Edit ---
  useEffect(() => {
    if (visible && isEdit && lookupToEdit) {
      // Set existing values for editing
      setFormData({
        tag: lookupToEdit.tag,
        value: lookupToEdit.value,
      });
    } else if (visible && !isEdit) {
      // Reset form for 'Add' when dialog opens
      resetForm();
    }
  }, [visible, isEdit, lookupToEdit]);

  // --- Validation ---
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!isEdit) {
      // **Create (Add) Validation:** Tag is required
      if (!formData.tag.trim()) newErrors.tag = "Tag is required";
      else if (formData.tag.length > 100)
        newErrors.tag = "Tag must be 100 characters or less";
    }

    // **Shared Validation:** Value is required for both Create and Patch/Edit
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
      let response;
      const action = isEdit ? "update" : "create";

      if (isEdit && lookupToEdit) {
        // --- PATCH/EDIT Logic (Partial Update) ---
        const payload: { value: string } = {
          value: formData.value.trim(),
        };

        response = await lookupService.patch(
          accessToken,
          lookupToEdit.lookupKey,
          payload
        );
      } else {
        // --- POST/CREATE Logic ---
        const payload: { tag: string; value: string } = {
          tag: formData.tag.trim(),
          value: formData.value.trim(),
        };
        response = await lookupService.create(accessToken, payload);
      }

      if (response.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: response.message || `Lookup entry ${action}d successfully`,
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
          detail: response.message || `Failed to ${action} lookup entry`,
          life: 3000,
        });
      }
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || `Failed to perform lookup ${isEdit ? 'update' : 'creation'}`,
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
    <div className="flex justify-content-end gap-2">
      <DialogButton
        label="Cancel"
        severity="secondary"
        onClick={handleHide}
        disabled={loading}
      />

      <DialogButton
        label={isEdit ? "Save Changes" : "Add Lookup"}
        severity="success"
        icon={<FaCheck style={{ fontSize: 16, marginRight: 8 }} />}
        onClick={handleSubmit}
        loading={loading}
        disabled={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={isEdit ? `Edit Lookup Key ${lookupToEdit?.lookupKey}` : "Add New Lookup Entry"} // Dynamic Header
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
              disabled={loading || isEdit} // Disable Tag when editing/patching
            />
            {errors.tag && <small className="p-error">{errors.tag}</small>}
            {isEdit ? (
                <small className="text-500">Tag is read-only during update.</small>
            ) : (
                <small className="text-500">
                {formData.tag.length}/100 characters
                </small>
            )}
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