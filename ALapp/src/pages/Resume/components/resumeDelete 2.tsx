// src/pages/Resume/components/ResumeDelete.tsx
import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { deleteCandidate } from "../services/useResume";
import { ResumeDeleteProps } from "../types/resumeTypes";

const ResumeDelete: React.FC<ResumeDeleteProps> = ({
  visible, //dialgoue visibility
  onHide, // function to close the dialog
  selectedResume, // the candidate selected for deletion
  onSuccess, // function to call after successful deletion to refresh the list
  onClearSelection // function to clear the selected candidate object
}) => {
//we declare the props from resumedeleteProps interface because we are using typescript
// and we want to ensure that the component receives the correct types of props.
  const handleDelete = async (): Promise<void> => {
    if (!selectedResume) return;

    try {
      await deleteCandidate(selectedResume.candidateId);
      console.log(`Candidate "${selectedResume.candidateName}" deleted successfully`);

      onClearSelection(); // Clear selection after deletion
      onSuccess();        // Reload resumes
      onHide();           // Close dialog
    } catch (error) {
      console.error("Error deleting candidate:", error);
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
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        severity="danger"
        onClick={handleDelete}
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
            Are you sure you want to delete candidate{" "}
            <strong>"{selectedResume?.candidateName}"</strong>?
          </p>
          <p className="text-sm text-600">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default ResumeDelete;
