// src/pages/Department/components/DepartmentAddEdit.tsx
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { addDepartment, updateDepartment } from "../services/useDepartment";
import { DepartmentAddEditProps } from "../types/departmentTypes";

const DepartmentAddEdit: React.FC<DepartmentAddEditProps> = ({
  visible,
  onHide,
  selectedDepartment,
  clientId,
  onSuccess
}) => {
  // Input field states that will be used for edit and add department
  const [departmentName, setDepartmentName] = useState<string>("");
  const [departmentDescription, setDepartmentDescription] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false); // Track if user tried to save

  const isEditMode: boolean = selectedDepartment !== null;

  useEffect(() => {
    if (isEditMode && selectedDepartment) {
      setDepartmentName(selectedDepartment.departmentName || "");
      // This will prefill the form with existing data when in edit mode from the selected department
      setDepartmentDescription(selectedDepartment.departmentDescription || "");
    } else {
      // Reset form for add mode
      setDepartmentName("");
      setDepartmentDescription("");
    }
  }, [selectedDepartment, visible, isEditMode]);
  // The effect re-runs whenever:
  // - A new department is selected (selectedDepartment changes)
  // - Or the dialog/modal opens/closes (visible changes)

  const handleSave = async (): Promise<void> => {
    setSubmitted(true); // Turn on validation
    // This state is used to conditionally apply the "p-invalid" class to the input fields and show error messages if they are empty when the user tries to save.
    
    // Validate required fields before proceeding
    if (!departmentName.trim() || !departmentDescription.trim()) {
      return;
    }

    try {
      if (isEditMode && selectedDepartment) {
        await updateDepartment({
          ...selectedDepartment,
          departmentName: departmentName.trim(),
          departmentDescription: departmentDescription.trim()
        });
      } else {
        await addDepartment({
          clientId,
          departmentName: departmentName.trim(),
          departmentDescription: departmentDescription.trim()
        });
      }

      onSuccess(); // Reload departments
      onHide(); // Close dialog

      // Reset form
      setDepartmentName("");
      setDepartmentDescription("");
      setSubmitted(false);
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };

  const handleCancel = (): void => {
    setDepartmentName("");
    setDepartmentDescription("");
    setSubmitted(false);
    onHide();
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={handleCancel} // Reset form on cancel
      />
      <Button
        label={isEditMode ? "Update" : "Save"}
        icon={isEditMode ? "pi pi-check" : "pi pi-plus"}
        onClick={handleSave}
        disabled={!departmentName.trim() || !departmentDescription.trim()}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={handleCancel}
      header={isEditMode ? "Edit Department" : "Add New Department"}
      footer={dialogFooter}
      style={{ width: "450px" }}
      modal
      className="p-fluid"
    >
      <div className="field">
        <label htmlFor="departmentName" className="font-bold">
          Department Name *
        </label>
        <InputTextarea
          id="departmentName"
          value={departmentName}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDepartmentName(e.target.value)}
          placeholder="Enter department name"
          required
          className={submitted && !departmentName.trim() ? "p-invalid" : ""}
          // This will add a red border to the input field if the user has tried to submit the form without filling it out and the departmentName is empty
        />
        {submitted && !departmentName.trim() && (
          <small className="p-error">Department Name is required.</small>
        )}
      </div>

      <div className="field">
        <label htmlFor="departmentDescription" className="font-bold">
          Department Description *
        </label>
        <InputTextarea
          id="departmentDescription"
          value={departmentDescription}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDepartmentDescription(e.target.value)}
          placeholder="Enter department description"
          required
          className={submitted && !departmentDescription.trim() ? "p-invalid" : ""}
          // This will add a red border to the input field if the user has tried to submit the form without filling it out and the departmentDescription is empty
        />
        {submitted && !departmentDescription.trim() && (
          <small className="p-error">Department Description is required.</small>
        )}
      </div>
      {/* This will check the same condition as className and will make sure the actual message prints. Or else only a red border will show. */}
    </Dialog>
  );
};

export default DepartmentAddEdit;