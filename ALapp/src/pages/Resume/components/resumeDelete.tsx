// src/pages/Resume/components/ResumeDelete.tsx
import React, { useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { deleteCandidate } from "../services/useResume";
import { ResumeDeleteProps } from "../types/resumeTypes";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";

const ResumeDelete: React.FC<ResumeDeleteProps> = ({
  visible,
  onHide,
  selectedResume,
  onSuccess,
  onClearSelection,
}) => {
  const accessToken = localStorage.getItem("accessToken");

  // ✅ Toast ref
  const toast = useRef<Toast>(null);

  const handleDelete = async (): Promise<void> => {
    if (!selectedResume?.candidateId) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "No candidate selected for deletion.",
        life: 3000,
      });
      return;
    }

    const id = Number(selectedResume.candidateId);

    try {
      await deleteCandidate(accessToken, id);
      onClearSelection();
      onSuccess();
      onHide();

      // ✅ Success toast
      toast.current?.show({
        severity: "success",
        summary: "Deleted",
        detail: `Candidate "${selectedResume.candidateName}" deleted successfully.`,
        life: 3000,
      });
    } catch (error: any) {
      console.error("Error deleting candidate:", error);

      // ❌ Error toast
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error?.response?.data?.message ||
          "Failed to delete candidate. Please try again.",
        life: 5000,
      });
    }
  };

  const handleCancel = (): void => onHide();

  const footer = (
    <div className="flex justify-content-end gap-2">
      <DialogDeleteButton onCancel={handleCancel} onDelete={handleDelete} />
    </div>
  );

  return (
    <>
      {/* ✅ Toast Component */}
      <Toast ref={toast} />

      <Dialog
        visible={visible}
        onHide={handleCancel}
        header="Confirm Deletion"
        footer={footer}
        style={{ width: "400px" }}
        modal
        className="p-fluid"
      >
        <div className="confirmation-content">
          <p>
            Are you sure you want to delete candidate{" "}
            <strong>"{selectedResume?.candidateName}"</strong>?
          </p>
          <p>This action cannot be undone.</p>
        </div>
      </Dialog>
    </>
  );
};

export default ResumeDelete;
