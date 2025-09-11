// src/pages/Department/components/DepartmentDelete.jsx
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { deleteDepartment } from "../services/useDepartment";

const DepartmentDelete = ({ 
  visible, 
  onHide, 
  selectedDepartment,
  departments, 
  onSuccess,
  onClearSelection 
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
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

  const handleCancel = () => {
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
    >
      <div className="flex align-items-center">
        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem", color: "#f59e0b" }} />
        <div>
          <p className="m-0">
            Are you sure you want to delete department{" "}
            <strong>"{selectedDepartment?.departmentName}"</strong>?
          </p>
          <p className="text-sm text-600 mt-2 mb-0">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default DepartmentDelete;