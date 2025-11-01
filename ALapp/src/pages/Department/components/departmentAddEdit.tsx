// src/pages/Department/components/DepartmentAddEdit.tsx
import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
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
}) => {
  const [departmentName, setDepartmentName] = useState<string>("");
  const [departmentDescription, setDepartmentDescription] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const { accessToken } = useAuth();
  const isEditMode = selectedDepartment !== null;

  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (isEditMode && selectedDepartment) {
      setDepartmentName(selectedDepartment.departmentName || "");
      setDepartmentDescription(selectedDepartment.departmentDescription || "");
    } else {
      setDepartmentName("");
      setDepartmentDescription("");
    }
  }, [selectedDepartment, visible, isEditMode]);

  const handleSave = async (): Promise<void> => {
    setSubmitted(true);

    if (!departmentName.trim() || !departmentDescription.trim()) return;

    try {
      console.log("Access Token (DepartmentAddEdit):", accessToken);

      if (!accessToken) {
        toast.current?.show({ severity: "error", summary: "Auth Error", detail: "No token found. Please log in again.", life: 3000 });
        return;
      }

      if (isEditMode && selectedDepartment) {
        await updateDepartment(accessToken, {
          ...selectedDepartment,
          departmentName: departmentName.trim(),
          departmentDescription: departmentDescription.trim(),
        });
        toast.current?.show({ severity: "success", summary: "Success", detail: "Department updated successfully.", life: 3000 });
      } else {
        await addDepartment(accessToken, {
          clientId,
          departmentName: departmentName.trim(),
          departmentDescription: departmentDescription.trim(),
        });
        toast.current?.show({ severity: "success", summary: "Success", detail: "Department added successfully.", life: 3000 });
      }

      onSuccess();
      onHide();
      setDepartmentName("");
      setDepartmentDescription("");
      setSubmitted(false);
    } catch (error) {
      console.error("Error saving department:", error);
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to save department. Please try again later.", life: 3000 });
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
      <Toast ref={toast} />
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
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDepartmentName(e.target.value)
            }
            placeholder="Enter department name"
            required
            className={submitted && !departmentName.trim() ? "p-invalid" : ""}
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
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDepartmentDescription(e.target.value)
            }
            placeholder="Enter department description"
            required
            className={submitted && !departmentDescription.trim() ? "p-invalid" : ""}
          />
          {submitted && !departmentDescription.trim() && (
            <small className="p-error">Department Description is required.</small>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default DepartmentAddEdit;
