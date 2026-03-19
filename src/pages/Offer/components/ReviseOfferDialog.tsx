import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import DialogButton from "../../../shared/DialogAddEditButton";
import { reviseOffer } from "../services/offerService";
import { useAuth } from "../../../shared/auth/AuthContext";
import type { OfferTableRow } from "../types/offerTypes";

type ReviseOfferDialogProps = {
  visible: boolean;
  onHide: () => void;
  selectedOffer: OfferTableRow | null;
  onSuccess: () => void;
};

const ReviseOfferDialog: React.FC<ReviseOfferDialogProps> = ({
  visible,
  onHide,
  selectedOffer,
  onSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [newCTC, setNewCTC] = useState<number | null>(null);
  const [newJoiningDate, setNewJoiningDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (visible && selectedOffer) {
      setNewCTC(selectedOffer.offeredCTCAmount ?? null);
      setNewJoiningDate(selectedOffer.joiningDate ? new Date(selectedOffer.joiningDate) : null);
    } else if (!visible) {
      setReason("");
      setNewCTC(null);
      setNewJoiningDate(null);
      setErrors({});
    }
  }, [visible, selectedOffer]);

  const handleHide = () => onHide();

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!reason.trim()) next.reason = "Reason for revision is required.";
    const hasCTC = newCTC != null && newCTC >= 1;
    const hasDate = newJoiningDate != null;
    if (newCTC != null && newCTC < 1) next.change = "CTC must be at least 1.";
    else if (!hasCTC && !hasDate) next.change = "Enter at least one: Change in CTC or Change in Joining Date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRevise = async () => {
    if (!selectedOffer || !accessToken || !validate()) return;
    const payload: { reason: string; newCTC?: number; newJoiningDate?: string } = { reason: reason.trim() };
    if (newCTC != null && newCTC >= 1) payload.newCTC = newCTC;
    if (newJoiningDate) {
      const d = newJoiningDate instanceof Date ? newJoiningDate : new Date(newJoiningDate);
      payload.newJoiningDate = d.toISOString().slice(0, 10);
    }
    if (!payload.newCTC && !payload.newJoiningDate) return;

    setLoading(true);
    try {
      const response = await reviseOffer(selectedOffer.offerId, payload, accessToken);
      if (response.success) {
        toast.current?.show({
          severity: "success",
          summary: "Revised",
          detail: response.message ?? "Offer revised successfully",
          life: 3000,
        });
        onSuccess();
        onHide();
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: response.message ?? "Failed to revise offer",
          life: 3000,
        });
      }
    } catch (error: unknown) {
      const err = error as { message?: string; details?: { validationErrors?: { message?: string }[] } };
      const message = Array.isArray(err?.details?.validationErrors) && err.details.validationErrors.length > 0
        ? err.details.validationErrors.map((v) => v.message).filter(Boolean).join(", ") || err?.message
        : (err?.message ?? "Failed to revise offer.");
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
        header="Revise Offer"
        footer={
          <div className="flex justify-content-end gap-2">
            <DialogButton label="Cancel" severity="secondary" onClick={handleHide} disabled={loading} />
            <DialogButton label="Revise Offer" severity="success" onClick={handleRevise} disabled={loading} loading={loading} />
          </div>
        }
        style={{ width: "460px" }}
        modal
        className="p-fluid"
      >
        {selectedOffer && (
          <p className="mb-3 text-600">Revise offer for <strong>{selectedOffer.candidateName}</strong>. Current CTC: {selectedOffer.offeredCTCAmount ?? "—"}, Joining: {selectedOffer.joiningDate ?? "—"}.</p>
        )}
        <div className="field mb-3">
          <label className="block font-bold mb-1">Reason for Revision <span className="text-red-500">*</span></label>
          <InputText
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={errors.reason ? "p-invalid w-full" : "w-full"}
            placeholder="e.g. CTC revised after negotiation"
          />
          {errors.reason && <small className="p-error block mt-1">{errors.reason}</small>}
        </div>
        <div className="field mb-3">
          <label className="block font-bold mb-1">Change in CTC</label>
          <InputNumber
            value={newCTC ?? undefined}
            onValueChange={(e) => setNewCTC(e.value ?? null)}
            mode="decimal"
            min={1}
            className="w-full"
            placeholder="New CTC"
          />
        </div>
        <div className="field mb-3">
          <label className="block font-bold mb-1">Change in Joining Date</label>
          <Calendar
            value={newJoiningDate}
            onChange={(e) => setNewJoiningDate(e.value ?? null)}
            dateFormat="dd/mm/yy"
            placeholder="Select date"
            className="w-full"
            showIcon
          />
        </div>
        {errors.change && <small className="p-error block mb-2">{errors.change}</small>}
      </Dialog>
    </>
  );
};

export default ReviseOfferDialog;
