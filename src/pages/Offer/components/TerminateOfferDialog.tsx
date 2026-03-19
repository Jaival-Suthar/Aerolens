import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import DialogButton from "../../../shared/DialogAddEditButton";
import { terminateOffer } from "../services/offerService";
import { useAuth } from "../../../shared/auth/AuthContext";
import type { OfferTableRow } from "../types/offerTypes";

type TerminateOfferDialogProps = {
  visible: boolean;
  onHide: () => void;
  selectedOffer: OfferTableRow | null;
  onSuccess: () => void;
};

const TerminateOfferDialog: React.FC<TerminateOfferDialogProps> = ({
  visible,
  onHide,
  selectedOffer,
  onSuccess,
}) => {
  const [terminationDate, setTerminationDate] = useState<Date | null>(null);
  const [terminationReason, setTerminationReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();

  const resetForm = () => {
    setTerminationDate(null);
    setTerminationReason("");
    setErrors({});
  };

  const handleHide = () => {
    resetForm();
    onHide();
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!terminationDate) next.terminationDate = "Date of termination is required.";
    if (!terminationReason.trim()) next.terminationReason = "Reason is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleTerminate = async () => {
    if (!selectedOffer || !accessToken || !validate()) return;
    const dateStr = terminationDate instanceof Date
      ? terminationDate.toISOString().slice(0, 10)
      : terminationDate
        ? new Date(terminationDate).toISOString().slice(0, 10)
        : "";
    if (!dateStr) return;

    setLoading(true);
    try {
      const response = await terminateOffer(
        selectedOffer.offerId,
        { terminationDate: dateStr, terminationReason: terminationReason.trim() },
        accessToken
      );
      if (response.success) {
        toast.current?.show({
          severity: "success",
          summary: "Terminated",
          detail: response.message ?? "Offer terminated successfully",
          life: 3000,
        });
        onSuccess();
        handleHide();
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: response.message ?? "Failed to terminate offer",
          life: 3000,
        });
      }
    } catch (error: unknown) {
      const message = error && typeof error === "object" && "message" in error ? String((error as { message: unknown }).message) : "Failed to terminate offer.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <Dialog
        visible={visible}
        onHide={handleHide}
        header="Terminate Offer"
        footer={
          <div className="flex justify-content-end gap-2">
            <DialogButton label="Cancel" severity="secondary" onClick={handleHide} disabled={loading} />
            <DialogButton label="Terminate" severity="danger" onClick={handleTerminate} disabled={loading} loading={loading} />
          </div>
        }
        style={{ width: "440px" }}
        modal
        className="p-fluid"
      >
        {selectedOffer && (
          <p className="mb-3 text-600">Terminate offer for <strong>{selectedOffer.candidateName}</strong>?</p>
        )}
        <div className="field mb-3">
          <label className="block font-bold mb-1">Date of Termination <span className="text-red-500">*</span></label>
          <Calendar
            value={terminationDate}
            onChange={(e) => setTerminationDate(e.value ?? null)}
            dateFormat="dd/mm/yy"
            placeholder="Select date"
            className={errors.terminationDate ? "p-invalid w-full" : "w-full"}
            showIcon
          />
          {errors.terminationDate && <small className="p-error block mt-1">{errors.terminationDate}</small>}
        </div>
        <div className="field">
          <label className="block font-bold mb-1">Reason <span className="text-red-500">*</span></label>
          <InputTextarea
            value={terminationReason}
            onChange={(e) => setTerminationReason(e.target.value)}
            rows={3}
            className={errors.terminationReason ? "p-invalid w-full" : "w-full"}
            placeholder="Reason for termination"
          />
          {errors.terminationReason && <small className="p-error block mt-1">{errors.terminationReason}</small>}
        </div>
      </Dialog>
    </>
  );
};

export default TerminateOfferDialog;
