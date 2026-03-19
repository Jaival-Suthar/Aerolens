import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import DialogButton from "../../../shared/DialogAddEditButton";
import { updateOfferStatus } from "../services/offerService";
import { useAuth } from "../../../shared/auth/AuthContext";
import type { OfferTableRow } from "../types/offerTypes";

const STATUS_OPTIONS = [
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
];

type DocStatus = "Yes" | "No";

const DocToggle: React.FC<{ value: DocStatus; onChange: (v: DocStatus) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1">
    <Button label="Yes" size="small" severity="success" outlined={value !== "Yes"} onClick={() => onChange("Yes")} />
    <Button label="No" size="small" severity="danger" outlined={value !== "No"} onClick={() => onChange("No")} />
  </div>
);

type OfferStatusDialogProps = {
  visible: boolean;
  onHide: () => void;
  selectedOffer: OfferTableRow | null;
  onSuccess: () => void;
};

const OfferStatusDialog: React.FC<OfferStatusDialogProps> = ({
  visible,
  onHide,
  selectedOffer,
  onSuccess,
}) => {
  const [status, setStatus] = useState<"ACCEPTED" | "REJECTED" | null>(null);
  const [decisionDate, setDecisionDate] = useState<Date | null>(null);
  const [signedOfferLetterReceived, setSignedOfferLetterReceived] = useState<DocStatus>("Yes");
  const [signedServiceAgreementReceived, setSignedServiceAgreementReceived] = useState<DocStatus>("Yes");
  const [signedNDAReceived, setSignedNDAReceived] = useState<DocStatus>("Yes");
  const [signedCodeOfConductReceived, setSignedCodeOfConductReceived] = useState<DocStatus>("Yes");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();

  const isEmployee = selectedOffer?.employmentTypeName?.trim().toLowerCase() === "employee";

  useEffect(() => {
    if (!visible) {
      setStatus(null);
      setDecisionDate(null);
      setSignedOfferLetterReceived("Yes");
      setSignedServiceAgreementReceived("Yes");
      setSignedNDAReceived("Yes");
      setSignedCodeOfConductReceived("Yes");
      setRejectionReason("");
      setErrors({});
    }
  }, [visible]);

  const handleHide = () => onHide();

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!status) next.status = "Offer status is required.";
    if (!decisionDate) next.decisionDate = "Acceptance/Rejection date is required.";
    if (status === "ACCEPTED") {
      if (isEmployee && signedOfferLetterReceived !== "Yes") next.signedOffer = "Signed Offer Letter Received must be Yes.";
      if (!isEmployee && signedServiceAgreementReceived !== "Yes") next.signedService = "Signed Service Agreement Received must be Yes.";
      if (signedNDAReceived !== "Yes") next.signedNDA = "Signed NDA Received must be Yes.";
      if (signedCodeOfConductReceived !== "Yes") next.signedCode = "Signed Code of Conduct Received must be Yes.";
    }
    if (status === "REJECTED" && !rejectionReason.trim()) next.rejectionReason = "Reason for rejection is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleResolve = async () => {
    if (!selectedOffer || !accessToken || !status || !decisionDate || !validate()) return;
    const dateStr = decisionDate instanceof Date
      ? decisionDate.toISOString().slice(0, 10)
      : new Date(decisionDate).toISOString().slice(0, 10);

    const payload: Parameters<typeof updateOfferStatus>[1] = {
      status,
      decisionDate: dateStr,
    };
    if (status === "ACCEPTED") {
      payload.signedNDAReceived = signedNDAReceived === "Yes";
      payload.signedCodeOfConductReceived = signedCodeOfConductReceived === "Yes";
      if (isEmployee) payload.signedOfferLetterReceived = signedOfferLetterReceived === "Yes";
      else payload.signedServiceAgreementReceived = signedServiceAgreementReceived === "Yes";
    } else {
      payload.rejectionReason = rejectionReason.trim();
    }

    setLoading(true);
    try {
      const response = await updateOfferStatus(selectedOffer.offerId, payload, accessToken);
      if (response.success) {
        toast.current?.show({
          severity: "success",
          summary: "Updated",
          detail: response.message ?? "Offer status updated successfully",
          life: 3000,
        });
        onSuccess();
        onHide();
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: response.message ?? "Failed to update offer status",
          life: 3000,
        });
      }
    } catch (error: unknown) {
      const err = error as { message?: string; details?: { validationErrors?: { message?: string }[] } };
      const message = Array.isArray(err?.details?.validationErrors) && err.details.validationErrors.length > 0
        ? err.details.validationErrors.map((v) => v.message).filter(Boolean).join(", ") || err?.message
        : (err?.message ?? "Failed to update offer status.");
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
        header="Offer Status"
        footer={
          <div className="flex justify-content-end gap-2">
            <DialogButton label="Cancel" severity="secondary" onClick={handleHide} disabled={loading} />
            <DialogButton label="Resolve Offer" severity="success" onClick={handleResolve} disabled={loading} loading={loading} />
          </div>
        }
        style={{ width: "500px" }}
        modal
        className="p-fluid"
      >
        {selectedOffer && (
          <p className="mb-3 text-600">Update status for offer of <strong>{selectedOffer.candidateName}</strong>.</p>
        )}

        <div className="field mb-3">
          <label className="block font-bold mb-1">Offer Status <span className="text-red-500">*</span></label>
          <Dropdown
            value={status}
            options={STATUS_OPTIONS}
            onChange={(e) => setStatus(e.value)}
            placeholder="Select"
            className={errors.status ? "p-invalid w-full" : "w-full"}
          />
          {errors.status && <small className="p-error block mt-1">{errors.status}</small>}
        </div>

        <div className="field mb-3">
          <label className="block font-bold mb-1">Acceptance/Rejection Date <span className="text-red-500">*</span></label>
          <Calendar
            value={decisionDate}
            onChange={(e) => setDecisionDate(e.value ?? null)}
            dateFormat="dd/mm/yy"
            placeholder="Select date"
            className={errors.decisionDate ? "p-invalid w-full" : "w-full"}
            showIcon
          />
          {errors.decisionDate && <small className="p-error block mt-1">{errors.decisionDate}</small>}
        </div>

        {status === "ACCEPTED" && (
          <div className="border-1 surface-border border-round p-3 mb-3" style={{ backgroundColor: "var(--blue-50)" }}>
            <p className="font-bold mb-2">Signed documents received</p>
            {isEmployee ? (
              <div className="flex align-items-center gap-2 flex-wrap mb-2">
                <span className="font-medium" style={{ minWidth: "280px" }}>Signed Offer Letter Received <span className="text-red-500">*</span></span>
                <DocToggle value={signedOfferLetterReceived} onChange={setSignedOfferLetterReceived} />
              </div>
            ) : (
              <div className="flex align-items-center gap-2 flex-wrap mb-2">
                <span className="font-medium" style={{ minWidth: "280px" }}>Signed Service Agreement Received <span className="text-red-500">*</span></span>
                <DocToggle value={signedServiceAgreementReceived} onChange={setSignedServiceAgreementReceived} />
              </div>
            )}
            <div className="flex align-items-center gap-2 flex-wrap mb-2">
              <span className="font-medium" style={{ minWidth: "280px" }}>Signed NDA Received <span className="text-red-500">*</span></span>
              <DocToggle value={signedNDAReceived} onChange={setSignedNDAReceived} />
            </div>
            <div className="flex align-items-center gap-2 flex-wrap">
              <span className="font-medium" style={{ minWidth: "280px" }}>Signed Code of Conduct Received <span className="text-red-500">*</span></span>
              <DocToggle value={signedCodeOfConductReceived} onChange={setSignedCodeOfConductReceived} />
            </div>
            {(errors.signedOffer || errors.signedService || errors.signedNDA || errors.signedCode) && (
              <small className="p-error block mt-2">{errors.signedOffer || errors.signedService || errors.signedNDA || errors.signedCode}</small>
            )}
          </div>
        )}

        {status === "REJECTED" && (
          <div className="border-1 surface-border border-round p-3 mb-3" style={{ backgroundColor: "var(--pink-50)" }}>
            <label className="block font-bold mb-1">Reason for Rejection <span className="text-red-500">*</span></label>
            <InputTextarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className={errors.rejectionReason ? "p-invalid w-full" : "w-full"}
              placeholder="e.g. Candidate accepted another offer"
            />
            {errors.rejectionReason && <small className="p-error block mt-1">{errors.rejectionReason}</small>}
          </div>
        )}
      </Dialog>
    </>
  );
};

export default OfferStatusDialog;
