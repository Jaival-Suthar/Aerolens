// src/pages/Resume/components/ResumeDelete.tsx
import React from "react";
import { Dialog } from "primereact/dialog";
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
  // ✅ Retrieve access token from localStorage (or context if you have one)
  const accessToken = localStorage.getItem("accessToken");

  const handleDelete = async (): Promise<void> => {
    if (!selectedResume?.candidateId) {
      console.error("No candidate ID found for deletion");
      return;
    }

    const id = Number(selectedResume.candidateId); // ✅ ensure numeric ID

    try {
      await deleteCandidate(accessToken, id); // ✅ correctly pass token and ID
      onClearSelection();
      onSuccess();
      onHide();
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  const handleCancel = (): void => onHide();

  const footer = (
    <div className="flex justify-content-end gap-2">
      <DialogDeleteButton onCancel={handleCancel} onDelete={handleDelete} />
    </div>
  );

  return (
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
  );
};

export default ResumeDelete;
