import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { Interview } from "../types/interviewTypes";
import { updateInterview } from "../services/interviewService";
import { useAuth } from "../../../shared/auth/AuthContext";
import {
  FaXmark,
  FaCheck,
  FaLock,
  FaPlus,
  FaTrashCan,
  FaTriangleExclamation,
} from 'react-icons/fa6';

interface Round {
  roundName: string;
  result: string;
  interviewerNotes: string;
  isLocked: boolean;
  lockedAt?: string;
  lockConfirmation?: string;
}

interface InterviewRoundsDialogProps {
  visible: boolean;
  interview: Interview | null;
  onHide: () => void;
  onSuccess: () => void;
}

const ROUND_TYPES = [
  { label: "Technical Round", value: "Technical Round" },
  { label: "HR Round", value: "HR Round" },
  { label: "Manager Round", value: "Manager Round" },
  { label: "Cultural Fit", value: "Cultural Fit" },
  { label: "Final Round", value: "Final Round" },
];

const RESULT_OPTIONS = [
  { label: "Selected", value: "Selected" },
  { label: "Rejected", value: "Rejected" },
  { label: "On Hold", value: "On Hold" },
];

const InterviewRoundsDialog: React.FC<InterviewRoundsDialogProps> = ({
  visible,
  interview,
  onHide,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [finalNotes, setFinalNotes] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [roundIndexToLock, setRoundIndexToLock] = useState<number | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useRef<Toast>(null);

  // Initialize rounds from interview data
  useEffect(() => {
    if (interview?.rounds) {
      setRounds(interview.rounds);
      setFinalNotes(interview.finalNotes || "");
    } else {
      setRounds([]);
      setFinalNotes("");
    }
  }, [interview]);

  /* ------------------------------------------------------------------
      ROUND MANAGEMENT
  ------------------------------------------------------------------ */
  const addRound = () => {
    const newRound: Round = {
      roundName: "",
      result: "",
      interviewerNotes: "",
      isLocked: false,
    };
    setRounds([...rounds, newRound]);
  };

  const updateRound = (index: number, field: keyof Round, value: any) => {
    const updatedRounds = [...rounds];
    updatedRounds[index] = { ...updatedRounds[index], [field]: value };
    setRounds(updatedRounds);
  };

  const deleteRound = (index: number) => {
    if (rounds[index].isLocked) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Cannot delete locked round",
      });
      return;
    }
    const updatedRounds = rounds.filter((_, i) => i !== index);
    setRounds(updatedRounds);
  };

  const canLockRound = (round: Round) => {
    // Only allow locking for Selected or Rejected results
    return (round.result === 'Selected' || round.result === 'Rejected') &&
           round.roundName &&
           round.interviewerNotes.trim();
  };

  const requestLockRound = (index: number) => {
    const round = rounds[index];
    
    // Validation before locking
    if (!round.roundName) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please select round type before locking",
      });
      return;
    }
    if (!round.result) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please select result before locking",
      });
      return;
    }
    if (!round.interviewerNotes.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please add interviewer notes before locking",
      });
      return;
    }

    setRoundIndexToLock(index);
    setConfirmationText("");
    setShowConfirmDialog(true);
  };

  const confirmLockRound = () => {
    if (confirmationText === "CONFIRM" && roundIndexToLock !== null) {
      const updatedRounds = [...rounds];
      updatedRounds[roundIndexToLock] = {
        ...updatedRounds[roundIndexToLock],
        isLocked: true,
        lockedAt: new Date().toISOString(),
        lockConfirmation: "CONFIRM",
      };
      setRounds(updatedRounds);
      setShowConfirmDialog(false);
      setConfirmationText("");
      setRoundIndexToLock(null);

      toast.current?.show({
        severity: "success",
        summary: "Locked",
        detail: `Round ${roundIndexToLock + 1} has been locked`,
      });
    }
  };

  /* ------------------------------------------------------------------
      SAVE HANDLER
  ------------------------------------------------------------------ */
  const handleSave = async () => {
    // Basic validation
    if (rounds.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please add at least one round",
      });
      return;
    }

    // Validate that each round has minimum required fields
    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i];
      if (!round.roundName) {
        toast.current?.show({
          severity: "warn",
          summary: "Validation Error",
          detail: `Please select round type for Round #${i + 1}`,
        });
        return;
      }
      if (!round.result) {
        toast.current?.show({
          severity: "warn",
          summary: "Validation Error",
          detail: `Please select result for Round #${i + 1}`,
        });
        return;
      }
    }

    // Only check if all rounds are locked if final notes are provided
    if (finalNotes.trim()) {
      const unlockedRounds = rounds.filter(r => !r.isLocked);
      if (unlockedRounds.length > 0) {
        toast.current?.show({
          severity: "warn",
          summary: "Validation Error",
          detail: "Please lock all rounds before adding final notes",
        });
        return;
      }
    }

    if (!interview?.interviewId) return;

    setSaving(true);

    try {
      // Prepare payload
      const payload = {
        ...interview,
        rounds: rounds.map(({ lockConfirmation, ...round }) => round),
        finalNotes,
        status: "COMPLETED",
      };

      const response = await updateInterview(
        interview.interviewId,
        payload,
        accessToken!
      );

      if (response?.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Interview results saved successfully",
        });
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: response?.message || "Failed to save interview results",
        });
      }
    } catch (error) {
      console.error("Error saving interview results:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while saving",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------
      COMPUTED VALUES
  ------------------------------------------------------------------ */
  const allRoundsLocked = rounds.length > 0 && rounds.every(r => r.isLocked);
  const canSave = rounds.length > 0 && rounds.every(r => r.roundName && r.result);
  
  // Auto-compute final result
  const getFinalResult = () => {
    if (rounds.length === 0) return null;
    if (rounds.some(r => r.result === "Rejected")) return "Rejected";
    if (rounds.every(r => r.result === "Selected")) return "Selected";
    if (rounds.some(r => r.result === "On Hold")) return "On Hold";
    return "Pending";
  };

  /* ------------------------------------------------------------------
      DIALOG FOOTER
  ------------------------------------------------------------------ */
  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon={<FaXmark />}
        onClick={onHide}
        className="p-button-text"
        disabled={saving}
      />
      <Button
        label="Save Results"
        icon={<FaCheck />}
        onClick={handleSave}
        loading={saving}
        disabled={!canSave}
        tooltip={!canSave ? "Please fill Round Type and Result for all rounds" : ""}
      />
    </div>
  );

  /* ------------------------------------------------------------------
      LOCK CONFIRMATION DIALOG
  ------------------------------------------------------------------ */
  const confirmDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon={<FaXmark />}
        onClick={() => {
          setShowConfirmDialog(false);
          setConfirmationText("");
        }}
        className="p-button-text"
      />
      <Button
        label="Lock Round"
        icon={<FaLock />}
        onClick={confirmLockRound}
        disabled={confirmationText !== "CONFIRM"}
        severity="danger"
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />

      {/* Main Dialog */}
      <Dialog
        visible={visible}
        onHide={onHide}
        header={`Record Interview Results - ${interview?.candidateName || ""}`}
        style={{ width: "90vw", maxWidth: "900px" }}
        footer={dialogFooter}
        modal
        maximizable
      >
        <div className="interview-rounds-container">
          {/* Interview Basic Info (Read-only) */}
          <div className="p-3 mb-3 surface-100 border-round">
            <h4 className="mt-0 mb-3 text-primary">Interview Details</h4>
            <div className="grid">
              <div className="col-6">
                <strong>Candidate:</strong> {interview?.candidateName}
              </div>
              <div className="col-6">
                <strong>Interviewer:</strong> {interview?.interviewerName}
              </div>
              <div className="col-6">
                <strong>Date:</strong>{" "}
                {interview?.interviewDate
                  ? new Date(interview.interviewDate).toLocaleDateString("en-GB")
                  : ""}
              </div>
              <div className="col-6">
                <strong>Time:</strong> {interview?.fromTime?.slice(0, 5)} (
                {interview?.durationMinutes} min)
              </div>
            </div>
          </div>

          <Divider />

          {/* Rounds Section */}
          <div className="mb-4">
            <div className="flex justify-content-between align-items-center mb-3">
              <h4 className="m-0">Interview Rounds</h4>
              <Button
                label="Add Round"
                icon={<FaPlus />}
                onClick={addRound}
                size="small"
                outlined
              />
            </div>

            {rounds.length === 0 ? (
              <div className="text-center p-4 surface-50 border-round">
                <p className="text-500">
                  No rounds added yet. Click "Add Round" to start.
                </p>
              </div>
            ) : (
              <div className="flex flex-column gap-3">
                {rounds.map((round, index) => (
                  <div
                    key={index}
                    className={`p-3 border-round ${
                      round.isLocked
                        ? "surface-100 border-1 border-300"
                        : "surface-0 border-1 border-200"
                    }`}
                  >
                    <div className="flex justify-content-between align-items-center mb-2">
                      <h5 className="m-0 flex align-items-center gap-2">
                        Round #{index + 1}
                        {round.isLocked && (
                          <span className="text-orange-500">
                            <FaLock /> LOCKED
                          </span>
                        )}
                      </h5>
                      {!round.isLocked && (
                        <Button
                          icon={<FaTrashCan />}
                          onClick={() => deleteRound(index)}
                          className="p-button-rounded p-button-text p-button-danger"
                          size="small"
                        />
                      )}
                    </div>

                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <label className="block mb-2 font-semibold">
                          Round Type *
                        </label>
                        <Dropdown
                          value={round.roundName}
                          options={ROUND_TYPES}
                          onChange={(e) =>
                            updateRound(index, "roundName", e.value)
                          }
                          placeholder="Select Round Type"
                          className="w-full"
                          disabled={round.isLocked}
                        />
                      </div>

                      <div className="col-12 md:col-6">
                        <label className="block mb-2 font-semibold">
                          Result *
                        </label>
                        <Dropdown
                          value={round.result}
                          options={RESULT_OPTIONS}
                          onChange={(e) => updateRound(index, "result", e.value)}
                          placeholder="Select Result"
                          className="w-full"
                          disabled={round.isLocked}
                        />
                      </div>

                      <div className="col-12">
                        <label className="block mb-2 font-semibold">
                          Interviewer Notes *
                        </label>
                        <InputTextarea
                          value={round.interviewerNotes}
                          onChange={(e) =>
                            updateRound(index, "interviewerNotes", e.target.value)
                          }
                          rows={3}
                          className="w-full"
                          placeholder="Enter detailed feedback about the candidate's performance..."
                          disabled={round.isLocked}
                        />
                      </div>

                      {round.isLocked ? (
                        <div className="col-12">
                          <small className="text-500">
                            Locked at:{" "}
                            {round.lockedAt
                              ? new Date(round.lockedAt).toLocaleString("en-GB")
                              : ""}
                          </small>
                        </div>
                      ) : (
                        <div className="col-12 flex justify-content-end">
                          <Button
                            label="Lock This Round"
                            icon={<FaLock />}
                            onClick={() => requestLockRound(index)}
                            severity="warning"
                            size="small"
                            outlined
                            disabled={!canLockRound(round)}
                            tooltip={
                              !canLockRound(round)
                                ? "Lock is only available for Selected/Rejected results"
                                : "Lock this round permanently"
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Final Notes Section */}
          <div className="mb-3">
            <label className="block mb-2 font-semibold">
              Final Notes (Optional)
            </label>
            <InputTextarea
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              rows={4}
              className="w-full"
              placeholder="Overall assessment and recommendation... (requires all rounds to be locked)"
              disabled={!allRoundsLocked}
            />
            {!allRoundsLocked && finalNotes.trim() === "" && (
              <small className="text-500 block mt-1">
                💡 Final notes can be added after locking all Selected/Rejected rounds
              </small>
            )}
          </div>

          {/* Final Result Display */}
          {rounds.length > 0 && (
            <div className="p-3 surface-100 border-round">
              <div className="flex justify-content-between align-items-center">
                <strong>Current Result:</strong>
                <span
                  className={`px-3 py-1 border-round font-bold ${
                    getFinalResult() === "Selected"
                      ? "bg-green-100 text-green-700"
                      : getFinalResult() === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : getFinalResult() === "On Hold"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {getFinalResult()}
                </span>
              </div>
              {!allRoundsLocked && (
                <small className="text-500 block mt-2">
                  💡 You can save now or lock rounds with Selected/Rejected results for finalization
                </small>
              )}
            </div>
          )}
        </div>
      </Dialog>

      {/* Lock Confirmation Dialog */}
      <Dialog
        visible={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        header="Confirm Round Lock"
        style={{ width: "450px" }}
        footer={confirmDialogFooter}
        modal
      >
        <div className="flex flex-column gap-3">
          <div className="flex align-items-center gap-2 p-3 surface-50 border-round">
            <FaTriangleExclamation className="text-orange-500 text-2xl" />
            <div>
              <p className="m-0 font-semibold">Warning: This action is permanent</p>
              <p className="m-0 text-sm text-500">
                Once locked, this round cannot be edited or deleted.
              </p>
            </div>
          </div>

          <div>
            <label className="block mb-2">
              Type <strong>CONFIRM</strong> to proceed:
            </label>
            <InputText
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type CONFIRM"
              className="w-full"
              autoFocus
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default InterviewRoundsDialog;