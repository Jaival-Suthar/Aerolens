import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
import { DepartmentDeleteProps } from "../types/departmentTypes";
import { deleteDepartment } from "../services/useDepartment";
import { useAuth } from "../../../shared/auth/AuthContext";

const DepartmentDelete: React.FC<DepartmentDeleteProps> = ({
  visible,
  onHide,
  selectedDepartment,
  onSuccess,
  onClearSelection,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();

  const handleDelete = async (): Promise<void> => {
    if (!selectedDepartment) return;

    if (!accessToken) {
      toast.current?.show({
        severity: "error",
        summary: "Auth Error",
        detail: "No token found. Please log in again.",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      await deleteDepartment(accessToken, selectedDepartment.departmentId);

      toast.current?.show({
        severity: "success",
        summary: "Deleted",
        detail: `Department "${selectedDepartment.departmentName}" deleted successfully`,
        life: 3000,
      });

      onClearSelection();
      onSuccess();
      onHide();
    } catch (error) {
      console.error(error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete department. Please try again.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (): void => {
    onHide();
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <DialogDeleteButton onCancel={handleCancel} onDelete={handleDelete} loading={loading} />
    </div>
  );

  return (
    <>
      {/* Toast outside Dialog */}
      <Toast ref={toast} position="top-right" />

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
          <p>
            Are you sure you want to delete department <strong>"{selectedDepartment?.departmentName}"</strong>?
          </p>
          <p className="text-sm text-600">This action cannot be undone.</p>
        </div>
      </Dialog>
    </>
  );
};

export default DepartmentDelete;
