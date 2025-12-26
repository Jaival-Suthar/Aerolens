import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { locationService } from "../services/locationService";
import { LocationEntry, LocationValidationError } from "../types/locationTypes";
import DialogButton from "../../../shared/DialogAddEditButton";
import { FaCheck, FaPencilAlt, FaInfoCircle } from "react-icons/fa";
import { useAuth } from "../../../shared/auth/AuthContext";

interface AddEditLocationFormProps {
  visible: boolean;
  isEdit?: boolean;
  locationToEdit?: LocationEntry | null;
  existingCountries?: string[]; // Pass unique countries from table data
  onHide: () => void;
  onSuccess: () => void;
}

interface FormData {
  city: string;
  country: string;
  state: string;
}

interface ValidationErrors {
  city?: string;
  country?: string;
  state?: string;
}

const AddEditLocationForm: React.FC<AddEditLocationFormProps> = ({
  visible,
  isEdit = false,
  locationToEdit = null,
  existingCountries = [],
  onHide,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    city: "",
    country: "",
    state: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // --- Effect to set form data on Edit ---
  useEffect(() => {
    if (visible && isEdit && locationToEdit) {
      // Set existing values for editing
      setFormData({
        city: locationToEdit.city,
        country: locationToEdit.country,
        state: locationToEdit.state || "",
      });
    } else if (visible && !isEdit) {
      // Reset form for 'Add' when dialog opens
      resetForm();
    }
  }, [visible, isEdit, locationToEdit]);

  // --- Smart Capitalize: Handles multi-word countries (e.g., "United States", "New Zealand") ---
  const smartCapitalize = (str: string): string => {
    if (!str) return str;
    return str
      .trim()
      .split(/\s+/) // Split by any whitespace
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '); // Join with single space
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // City validation (required for both create and update when provided)
    if (!formData.city.trim()) {
      newErrors.city = "City cannot be empty";
    } else if (formData.city.length > 100) {
      newErrors.city = "City cannot exceed 100 characters";
    }

    // Country validation (required for both create and update when provided)
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (formData.country.length > 100) {
      newErrors.country = "Country cannot exceed 100 characters";
    }

    // State validation (optional, but must be valid if provided)
    if (formData.state.trim()) {
      if (formData.state.length < 1) {
        newErrors.state = "State must be at least 1 character long";
      } else if (formData.state.length > 100) {
        newErrors.state = "State cannot exceed 100 characters";
      }
    }

    // For PATCH/Edit: At least one field must be different from original
    if (isEdit && locationToEdit) {
      const hasChanges =
        formData.city !== locationToEdit.city ||
        formData.country !== locationToEdit.country ||
        formData.state !== (locationToEdit.state || "");

      if (!hasChanges) {
        toast.current?.show({
          severity: "warn",
          summary: "No Changes",
          detail: "Please modify at least one field to update",
          life: 3000,
        });
        return false;
      }
    }

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

      if (isEdit && locationToEdit) {
        // --- PATCH/EDIT Logic (Partial Update) ---
        const payload: Partial<{ city: string; country: string; state: string }> = {};

        // Only include fields that have changed
        if (formData.city !== locationToEdit.city) {
          payload.city = smartCapitalize(formData.city.trim());
        }
        if (formData.country !== locationToEdit.country) {
          payload.country = smartCapitalize(formData.country.trim());
        }
        if (formData.state !== (locationToEdit.state || "")) {
          payload.state = smartCapitalize(formData.state.trim());
        }

        response = await locationService.patch(
          accessToken,
          locationToEdit.locationId,
          payload
        );
      } else {
        // --- POST/CREATE Logic ---
        const payload: { city: string; country: string; state?: string } = {
          city: smartCapitalize(formData.city.trim()),
          country: smartCapitalize(formData.country.trim()),
        };

        // Only add state if provided
        if (formData.state.trim()) {
          payload.state = smartCapitalize(formData.state.trim());
        }

        response = await locationService.create(accessToken, payload);
      }

      if (response.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: response.message || `Location ${action}d successfully`,
          life: 3000,
        });
        resetForm();
        onSuccess();
        onHide();
      } else {
        // Handle validation errors from backend
        if (
          response.errorCode === "VALIDATION_ERROR" &&
          response.validationErrors
        ) {
          const backendErrors: ValidationErrors = {};
          response.validationErrors.forEach((err: LocationValidationError) => {
            if (err.field === "city" || err.field === "country" || err.field === "state") {
              backendErrors[err.field] = err.message;
            }
          });
          setErrors(backendErrors);
        }

        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: response.message || `Failed to ${action} location`,
          life: 3000,
        });
      }
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "error",
        detail: error.message || `Failed to ${isEdit ? "update" : "create"} location`,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const resetForm = () => {
    setFormData({ city: "", country: "", state: "" });
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

  // --- Get unique countries for reference tags ---
  const uniqueCountries = Array.from(new Set(existingCountries)).sort();

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
        label={isEdit ? "Save Changes" : "Add Location"}
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
        header={
          isEdit
            ? `Edit Location ID ${locationToEdit?.locationId}`
            : "Add New Location"
        }
        visible={visible}
        style={{ width: "550px" }}
        footer={dialogFooter}
        onHide={handleHide}
        draggable={false}
        modal
        data-testid="location-dialog"
      >
        <div className="p-fluid">
          {/* City Field */}
          <div className="field mb-4">
            <label htmlFor="city" className="font-semibold">
              City <span className="text-red-500">*</span>
            </label>
            <InputText
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Enter city name (e.g., Mumbai, New York)"
              maxLength={100}
              className={errors.city ? "p-invalid" : ""}
              disabled={loading}
            />
            {errors.city && <small className="p-error">{errors.city}</small>}
            <small className="text-500">
              {formData.city.length}/100 characters 
            </small>
          </div>

          {/* Country Field */}
          <div className="field mb-4">
            <label htmlFor="country" className="font-semibold">
              Country <span className="text-red-500">*</span>
            </label>
            <InputText
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              placeholder="Enter country (e.g., India, United States)"
              maxLength={100}
              className={errors.country ? "p-invalid" : ""}
              disabled={loading}
            />
            {errors.country && <small className="p-error">{errors.country}</small>}
            <small className="text-500">
              {formData.country.length}/100 characters 
            </small>
            
            {/* Existing Countries Reference */}
            {uniqueCountries.length > 0 && (
              <div className="mt-2 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <div className="flex align-items-center gap-2 mb-2">
                  <FaInfoCircle style={{ fontSize: 12, color: '#6c757d' }} />
                  <small className="font-semibold text-600">Existing Countries (Select to auto-fill):</small>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueCountries.map((country, idx) => (
                    <Tag 
                      key={idx} 
                      value={country} 
                      severity="info"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleInputChange("country", country)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* State Field */}
          <div className="field">
            <label htmlFor="state" className="font-semibold">
              State
            </label>
            <InputText
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="Enter state (optional, e.g., Karnataka, California)"
              maxLength={100}
              className={errors.state ? "p-invalid" : ""}
              disabled={loading}
            />
            {errors.state && <small className="p-error">{errors.state}</small>}
            <small className="text-500">
              {formData.state.length}/100 characters • Optional 
            </small>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AddEditLocationForm;