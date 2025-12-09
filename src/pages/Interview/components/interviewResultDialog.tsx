import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../shared/auth/AuthContext";
import { finalizeInterview } from "../services/interviewService";
import { Interview, InterviewResult } from "../types/interviewTypes";

interface InterviewResultDialogProps {
  visible: boolean;
  onHide: () => void;
  selectedInterview: Interview | null;
  onSuccess: () => void;
  externalToast?: React.RefObject<Toast>;
}

const InterviewResultDialog: React.FC<InterviewResultDialogProps> = ({
  visible,
  onHide,
  selectedInterview,
  onSuccess,
  externalToast,
}) => {
  const { accessToken } = useAuth();
  const internalToast = useRef<Toast>(null);
  const toast = externalToast || internalToast;

  const [result, setResult] = useState<InterviewResult>("Pending");
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [interviewerFeedback, setInterviewerFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const resultOptions: { label: string; value: InterviewResult }[] = [
    { label: "Pending", value: "Pending" },
    { label: "Selected", value: "Selected" },
    { label: "Rejected", value: "Rejected" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  // Reset form when dialog opens with selected interview data
  useEffect(() => {
    if (visible && selectedInterview) {
      setResult((selectedInterview.result as InterviewResult) || "Pending");
      setRecruiterNotes(selectedInterview.recruiterNotes || "");
      setInterviewerFeedback(selectedInterview.interviewerFeedback || "");
    } else if (!visible) {
      // Reset form when dialog closes
      setResult("Pending");
      setRecruiterNotes("");
      setInterviewerFeedback("");
      setLoading(false);
    }
  }, [visible, selectedInterview]);

  const handleSubmit = async () => {
    if (!selectedInterview) {
      toast.current?.show({
        severity: "warn",
        summary: "No Selection",
        detail: "Please select an interview to finalize",
        life: 3000,
      });
      return;
    }

    if (!accessToken) {
      toast.current?.show({
        severity: "error",
        summary: "Authentication Error",
        detail: "Access token is missing",
        life: 3000,
      });
      return;
    }

    // Validation
    if (!result) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please select a result",
        life: 3000,
      });
      return;
    }

    if (recruiterNotes && recruiterNotes.length > 1000) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Recruiter notes must not exceed 1000 characters",
        life: 3000,
      });
      return;
    }

    if (interviewerFeedback && interviewerFeedback.length > 2000) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Interviewer feedback must not exceed 2000 characters",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        result,
        recruiterNotes: recruiterNotes.trim() || undefined,
        interviewerFeedback: interviewerFeedback.trim() || undefined,
      };

      const response = await finalizeInterview(
        selectedInterview.interviewId,
        payload,
        accessToken
      );

      if (response?.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: response.message || "Interview finalized successfully",
          life: 3000,
        });
        onSuccess();
        onHide();
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: response?.message || "Failed to finalize interview",
          life: 3000,
        });
      }
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "An error occurred while finalizing the interview",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={loading}
      />
      <Button
        label="Submit"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
        loading={loading}
      />
    </div>
  );

  if (!visible) return null;

  return (
    <>
      {!externalToast && <Toast ref={internalToast} />}
      <Dialog
        visible={visible}
        style={{ width: "550px" }}
        header="Finalize Interview Result"
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={onHide}
        blockScroll
      >
        {selectedInterview && (
          <div className="mb-4 p-3 border-round" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="mb-2">
              <strong>Candidate:</strong> {selectedInterview.candidateName}
            </div>
            <div className="mb-2">
              <strong>Interviewer:</strong> {selectedInterview.interviewerName}
            </div>
            <div>
              <strong>Round:</strong> {selectedInterview.roundNumber} of{" "}
              {selectedInterview.totalInterviews}
            </div>
          </div>
        )}

        <div className="field mb-3">
          <label htmlFor="result" className="font-semibold mb-2">
            Result <span style={{ color: "red" }}>*</span>
          </label>
          <Dropdown
            id="result"
            value={result}
            options={resultOptions}
            onChange={(e) => setResult(e.value)}
            placeholder="Select Result"
            disabled={loading}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="recruiterNotes" className="font-semibold mb-2">
            Recruiter Notes
            <span className="text-sm ml-2" style={{ color: "#6c757d" }}>
              ({recruiterNotes.length}/1000)
            </span>
          </label>
          <InputTextarea
            id="recruiterNotes"
            value={recruiterNotes}
            onChange={(e) => setRecruiterNotes(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Enter recruiter notes (optional)"
            disabled={loading}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="interviewerFeedback" className="font-semibold mb-2">
            Interviewer Feedback
            <span className="text-sm ml-2" style={{ color: "#6c757d" }}>
              ({interviewerFeedback.length}/2000)
            </span>
          </label>
          <InputTextarea
            id="interviewerFeedback"
            value={interviewerFeedback}
            onChange={(e) => setInterviewerFeedback(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Enter interviewer feedback (optional)"
            disabled={loading}
            className="w-full"
          />
        </div>
      </Dialog>
    </>
  );
};

export default InterviewResultDialog;