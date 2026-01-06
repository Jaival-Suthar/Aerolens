// src/pages/Department/components/DepartmentAddEdit.tsx
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { addDepartment, updateDepartment } from "../services/useDepartment";
import { DepartmentAddEditProps } from "../types/departmentTypes";
import { FaCheck } from "react-icons/fa";
import DialogButton from "../../../shared/DialogAddEditButton";
import { useAuth } from "../../../shared/auth/AuthContext";

const DepartmentAddEdit: React.FC<DepartmentAddEditProps> = ({
  visible,
  onHide,
  selectedDepartment,
  clientId,
  onSuccess,
  onError,
}) => {
  const [departmentName, setDepartmentName] = useState<string>("");
  const [departmentDescription, setDepartmentDescription] = useState<string>("");

  const { accessToken } = useAuth();
  const isEditMode = selectedDepartment !== null;
  const [errors, setErrors] = useState<{
    departmentName?: string;
    departmentDescription?: string;
    general?: string;
  }>({});

  useEffect(() => {
    if (isEditMode && selectedDepartment) {
      setDepartmentName(selectedDepartment.departmentName || "");
      setDepartmentDescription(selectedDepartment.departmentDescription || "");
    } else {
      setDepartmentName("");
      setDepartmentDescription("");
    }
    // ✅ Clear errors when dialog opens/closes
    setErrors({});
  }, [selectedDepartment, visible, isEditMode]);

  // ✅ FIXED: Now actually used to clear field errors on input change
  const clearFieldError = (field: "departmentName" | "departmentDescription") => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    const newErrors: any = {};

    if (!departmentName.trim()) newErrors.departmentName = "Required";
    if (!departmentDescription.trim()) newErrors.departmentDescription = "Required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      let response;

      if (isEditMode && selectedDepartment) {
        response = await updateDepartment(accessToken, {
          departmentId: selectedDepartment.departmentId,
          departmentName: departmentName.trim(),
          departmentDescription: departmentDescription.trim(),
        });
      } else {
        response = await addDepartment(accessToken, {
          clientId,
          departmentName: departmentName.trim(),
          departmentDescription: departmentDescription.trim(),
        });
      }

      // ✅ Call success handler
      onSuccess(response);

      // ✅ Close dialog after a brief delay
      setTimeout(() => {
        onHide();
      }, 0);
    } catch (error: any) {
      // ✅ FIXED: Handle validation errors in dialog
      if (Array.isArray(error?.details?.validationErrors)) {
        const fieldErrors: any = {};
        error.details.validationErrors.forEach((e: any) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
        return; // Stay in dialog to show field errors
      }

      // ✅ FIXED: For general errors, show in dialog AND notify parent
      setErrors({ general: error?.message || "An error occurred" });
      
      // ✅ Call error handler so parent can show toast
      if (onError) {
        onError(error);
      }
      
      // ✅ Don't throw - let user see the error message in dialog
    }
  };

  const handleCancel = (): void => {
    setDepartmentName("");
    setDepartmentDescription("");
    setErrors({});
    onHide();
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <DialogButton
        label="Cancel"
        severity="secondary"
        onClick={handleCancel}
        className="w-auto"
      />
      <DialogButton
        label={isEditMode ? "Update Department" : "Add Department"}
        severity="success"
        icon={<FaCheck style={{ fontSize: 16, marginRight: 8, marginLeft: 4 }} />}
        onClick={handleSave}
        className="w-auto"
        disabled={!departmentName.trim() || !departmentDescription.trim()}
      />
    </div>
  );

  return (
    <>
      <Dialog
        visible={visible}
        onHide={handleCancel}
        header={isEditMode ? "Edit Department" : "Add New Department"}
        footer={dialogFooter}
        style={{ width: "450px" }}
        modal
        className="p-fluid"
      >
        {errors.general && (
          <div className="mb-3">
            <small className="p-error block">{errors.general}</small>
          </div>
        )}

        <div className="field">
          <label htmlFor="departmentName" className="font-bold">
            Department Name *
          </label>
          <InputTextarea
            id="departmentName"
            value={departmentName}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setDepartmentName(e.target.value);
              clearFieldError("departmentName"); // ✅ Clear error on change
            }}
            placeholder="Enter department name"
            required
            className={errors.departmentName ? "p-invalid" : ""}
          />
          {errors.departmentName && (
            <small className="p-error">{errors.departmentName}</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="departmentDescription" className="font-bold">
            Department Description *
          </label>
          <InputTextarea
            id="departmentDescription"
            value={departmentDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setDepartmentDescription(e.target.value);
              clearFieldError("departmentDescription"); // ✅ Clear error on change
            }}
            placeholder="Enter department description"
            required
            className={errors.departmentDescription ? "p-invalid" : ""}
          />
          {errors.departmentDescription && (
            <small className="p-error">{errors.departmentDescription}</small>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default DepartmentAddEdit;