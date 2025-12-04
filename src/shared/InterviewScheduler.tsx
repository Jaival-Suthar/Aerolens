import React from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import InterviewAddEditForm from "../pages/Interview/components/interviewAddEdit";

interface InterviewSchedulerProps {
  visible: boolean;
  onHide: () => void;
  candidateId: number | null;
  candidateName: string | null;
  toast: React.RefObject<Toast>;
}

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  visible,
  onHide,
  candidateId,
  candidateName,
  toast
}) => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    setTimeout(() => {
      navigate("/interview");
    }, 2000);
  };

  return (
    <InterviewAddEditForm
      visible={visible}
      isEdit={false}
      interviewToEdit={null}
      candidateId={candidateId || undefined}
      candidateName={candidateName || undefined}
      onHide={onHide}
      onSuccess={handleSuccess}
    />
  );
};

export default InterviewScheduler;