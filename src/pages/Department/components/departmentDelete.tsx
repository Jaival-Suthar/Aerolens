import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
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
  const { accessToken } = useAuth();

  const handleDelete = async (): Promise<void> => {
    if (!selectedDepartment) return;

    if (!accessToken) {
      throw {
        error: "UNAUTHORIZED",
        message: "Session expired. Please log in again.",
      };
    }

    setLoading(true);

    try {
      const response = await deleteDepartment(accessToken, selectedDepartment.departmentId);

      onClearSelection();
      onSuccess(response); // parent shows backend success toast
      onHide();
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
