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
  onClearSelection
}) => {

  const handleDelete = async (): Promise<void> => {
    if (!selectedResume) return;
    const id = selectedResume.candidateId;

    try {
      await Promise.resolve(deleteCandidate(id)); // make sure it’s awaited synchronously
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
