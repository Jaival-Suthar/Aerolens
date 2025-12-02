import React, { useRef } from "react";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { deleteInterview } from "../services/useInterview";
import { Interview } from "../types/useInterview";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

type InterviewDeleteProps = {
  visible: boolean;
  onHide: () => void;
  selectedInterview: Interview | null;
  onSuccess: () => void;
  onClearSelection: () => void;
};

const InterviewDelete: React.FC<InterviewDeleteProps> = ({
  visible,
  onHide,
  selectedInterview,
  onSuccess,
  onClearSelection,
}) => {
  const toast = useRef<Toast>(null);

  const handleDelete = () => {
    if (!selectedInterview) return;

    confirmDialog({
      message: `Are you sure you want to delete the interview of ${selectedInterview.candidateName}?`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No auth token found");

          const response = await deleteInterview(selectedInterview.interviewId, token);
          if (response.success) {
            toast.current?.show({
              severity: "success",
              summary: "Deleted",
              detail: "Interview deleted successfully",
              life: 3000,
            });
            onSuccess();
            onClearSelection();
            onHide();
          } else {
            toast.current?.show({
              severity: "error",
              summary: "Error",
              detail: response.message,
              life: 3000,
            });
          }
        } catch (error: any) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message,
            life: 3000,
          });
        }
      },
    });
  };

  return (
    <Dialog
      header="Delete Interview"
      visible={visible}
      style={{ width: "400px" }}
      onHide={onHide}
      modal
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancel" className="p-button-secondary" onClick={onHide} />
          <Button label="Delete" className="p-button-danger" onClick={handleDelete} />
        </div>
      }
    >
      <Toast ref={toast} />
      {selectedInterview ? (
        <p>
          Are you sure you want to delete the interview of{" "}
          <strong>{selectedInterview.candidateName}</strong>?
        </p>
      ) : (
        <p>No interview selected.</p>
      )}
    </Dialog>
  );
};

export default InterviewDelete;
