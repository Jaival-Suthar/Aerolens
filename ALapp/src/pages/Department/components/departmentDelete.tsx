// src/pages/Department/components/DepartmentDelete.tsx
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { deleteDepartment } from "../services/useDepartment";
import { DepartmentDeleteProps } from "../types/departmentTypes";

const DepartmentDelete: React.FC<DepartmentDeleteProps> = ({
  visible,
  onHide,
  selectedDepartment,
  onSuccess,
  onClearSelection
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    if (!selectedDepartment) return;

    setLoading(true);
    try {
      await deleteDepartment(selectedDepartment.departmentId);
      console.log(`Department "${selectedDepartment.departmentName}" deleted successfully`);
      
      onClearSelection(); // Clear selection after deletion
      onSuccess(); // Reload departments
      onHide(); // Close dialog
    } catch (error) {
      console.error("Error deleting department:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (): void => {
    console.log("Deletion cancelled");
    onHide();
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={handleCancel}
        disabled={loading}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        severity="danger"
        onClick={handleDelete}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={handleCancel}
      header="Confirm Deletion"
      footer={dialogFooter}
      style={{ width: "400px" }}
      modal
      className="p-fluid"
    >
      <div className="confirmation-content">
        <i 
          className="pi pi-exclamation-triangle mr-3" 
          style={{ fontSize: "2rem", color: "var(--yellow-500)" }} 
        />
        <div>
          <div className="font-bold text-xl mb-2">Confirm Deletion</div>
          <p className="mb-3">
            Are you sure you want to delete department{" "}
            <strong>"{selectedDepartment?.departmentName}"</strong>?
          </p>
          <p className="text-sm text-600">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default DepartmentDelete;