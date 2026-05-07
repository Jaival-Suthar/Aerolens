import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import DialogButton from "../../../shared/DialogAddEditButton";
import { showGlobalToast } from "../../../shared/services/globalToastService";
import { useAuth } from "../../../shared/auth/AuthContext";
import {
  createOffer,
  getOfferFormData,
  getActiveOfferForCandidate,
  generateOnboardingDocument,
  regenerateOnboardingDocument,
  downloadOnboardingDocument,
} from "../../Offer/services/offerService";
import type { CreateOfferPayload, OfferFormDataResponse } from "../../Offer/types/offerTypes";
import type { OnboardingDocument } from "../types/resumeTypes";
import { FaCheck, FaFileAlt, FaDownload, FaEye, FaRedo, FaMagic } from "react-icons/fa";
import type {
  Candidate,
  OnboardingFormData,
  OnboardingDocumentChoice,
  ResumeOnBoardingProps,
} from "../types/resumeTypes";

type JprDropdownOption = {
  label: string;
  value: number;
  jobRole: string;
  clientName: string;
  departmentName: string;
};

const getInitialFormData = (candidate: Candidate | null): OnboardingFormData => ({
  candidateName: candidate?.candidateName ?? "",
  jprProjectDepartmentId: candidate?.jobProfileRequirementId ?? null,
  employmentTypeLookupId: null,
  employmentType: null,
  modeOfWorkingId: candidate?.workModeId ?? null,
  joiningDate: null,
  offeredCtcValue: candidate?.expectedCTCAmount || null,
  currencyId: candidate?.expectedCTCCurrencyId ?? null,
  compensationTypeId: candidate?.expectedCTCTypeId ?? null,
  variablePay: null,
  joiningBonus: null,
  reportingToId: null,
  vendorId: candidate?.vendorId ?? null,
  offerLetterSent: null,
  serviceAgreementSent: null,
  ndaSent: null,
  codeOfConductSent: null,
});

const DocumentToggle: React.FC<{
  value: OnboardingDocumentChoice;
  onChange: (v: "Yes" | "No") => void;
}> = ({ value, onChange }) => (
  <div className="flex gap-1">
    <Button
      label="Yes"
      size="small"
      severity="success"
      outlined={value !== "Yes"}
      onClick={() => onChange("Yes")}
      style={value === "Yes" ? { fontWeight: 600 } : undefined}
    />
    <Button
      label="No"
      size="small"
      severity="danger"
      outlined={value !== "No"}
      onClick={() => onChange("No")}
      style={value === "No" ? { fontWeight: 600 } : undefined}
    />
  </div>
);

// ─── Document Preview Panel ───────────────────────────────────────────────────

const DocumentPanel: React.FC<{
  doc: OnboardingDocument;
  offerId: number;
  onRegenerate: () => void;
  regenerating: boolean;
  accessToken: string | null;
}> = ({ doc, offerId, onRegenerate, regenerating, accessToken }) => {
  const label =
    doc.docType === "offer_letter" ? "Offer Letter" : "Service Agreement";

  const handleDownload = async () => {
    try {
      const blob = await downloadOnboardingDocument(offerId, accessToken);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.docFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      showGlobalToast({ severity: "error", summary: "Error", detail: "Failed to download document.", life: 4000 });
    }
  };

  const handlePreview = async () => {
    try {
      const blob = await downloadOnboardingDocument(offerId, accessToken);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      showGlobalToast({ severity: "error", summary: "Error", detail: "Failed to preview document.", life: 4000 });
    }
  };

  const kb = doc.docFileSize ? `${Math.round(doc.docFileSize / 1024)} KB` : "";
  const generatedDate = doc.docGeneratedAt
    ? new Date(doc.docGeneratedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

  return (
    <div
      style={{
        border: "1.5px solid #22c55e",
        borderRadius: "10px",
        padding: "14px 16px",
        background: "#f0fdf4",
        marginBottom: "12px",
      }}
    >
      {/* File info row */}
      <div className="flex align-items-center gap-2 mb-2">
        <FaFileAlt style={{ color: "#16a34a", fontSize: "1.4rem", flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div
            className="font-semibold text-900"
            style={{
              fontSize: "0.85rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={doc.docFileName}
          >
            {doc.docFileName}
          </div>
          <div className="text-500" style={{ fontSize: "0.72rem" }}>
            {label}{kb ? ` · ${kb}` : ""}{generatedDate ? ` · ${generatedDate}` : ""}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          icon={<FaEye className="mr-1" />}
          label="View"
          size="small"
          severity="success"
          outlined
          onClick={handlePreview}
          style={{ fontSize: "0.78rem", padding: "4px 10px" }}
        />
        <Button
          icon={<FaDownload className="mr-1" />}
          label="Download"
          size="small"
          severity="success"
          outlined
          onClick={handleDownload}
          style={{ fontSize: "0.78rem", padding: "4px 10px" }}
        />
        <Button
          icon={<FaRedo className="mr-1" />}
          label="Regenerate"
          size="small"
          severity="secondary"
          outlined
          onClick={onRegenerate}
          loading={regenerating}
          disabled={regenerating}
          style={{ fontSize: "0.78rem", padding: "4px 10px" }}
        />
      </div>
    </div>
  );
};

// ─── Main dialog ──────────────────────────────────────────────────────────────

const ResumeOnBoarding: React.FC<ResumeOnBoardingProps> = ({
  visible,
  onHide,
  selectedCandidate,
  createData,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState<OnboardingFormData>(getInitialFormData(null));
  console.log("Initial formData", formData);
  const [offerFormData, setOfferFormData] = useState<OfferFormDataResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Document generation state
  const [savedOfferId, setSavedOfferId] = useState<number | null>(null);
  const [generatedDoc, setGeneratedDoc] = useState<OnboardingDocument | null>(null);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const generateAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (visible && selectedCandidate) {
      setFormData(getInitialFormData(selectedCandidate));
      setErrors({});
      setSubmitted(false);
      setSavedOfferId(null);
      setGeneratedDoc(null);
      setGenerating(false);
      setRegenerating(false);
    }
  }, [visible, selectedCandidate]);

  useEffect(() => {
    if (visible && accessToken) {
      getOfferFormData(accessToken)
        .then(setOfferFormData)
        .catch(() => setOfferFormData(null));
    } else {
      setOfferFormData(null);
    }
  }, [visible, accessToken]);

  // Pre-populate form from an existing active offer when dialog opens
  useEffect(() => {
    if (!visible || !selectedCandidate || !accessToken) return;
    setLoadingOffer(true);
    getActiveOfferForCandidate(selectedCandidate.candidateId, accessToken)
      .then((offer) => {
        if (!offer) return;
        const typeLower = offer.employmentTypeName?.toLowerCase().trim() ?? "";
        const employmentType =
          typeLower === "employee"
            ? "Employee"
            : typeLower === "consultant" || typeLower === "contractor"
            ? "Consultant"
            : null;
        setSavedOfferId(offer.offerId);
        setFormData((prev) => ({
          ...prev,
          jprProjectDepartmentId: offer.jobProfileRequirementId ?? prev.jprProjectDepartmentId,
          employmentTypeLookupId: offer.employmentTypeLookupId,
          employmentType,
          modeOfWorkingId: offer.workModelLookupId ?? prev.modeOfWorkingId,
          joiningDate: offer.joiningDate ? new Date(offer.joiningDate) : null,
          offeredCtcValue: offer.offeredCTCAmount || prev.offeredCtcValue,
          currencyId: offer.currencyLookupId ?? prev.currencyId,
          compensationTypeId: offer.compensationTypeLookupId ?? prev.compensationTypeId,
          variablePay: offer.variablePay ?? null,
          joiningBonus: offer.joiningBonus ?? null,
          reportingToId: offer.reportingManagerId,
          vendorId: offer.vendorId ?? prev.vendorId,
          offerLetterSent: offer.offerLetterSent === true ? "Yes" : offer.offerLetterSent === false ? "No" : null,
          serviceAgreementSent: offer.serviceAgreementSent === true ? "Yes" : offer.serviceAgreementSent === false ? "No" : null,
          ndaSent: offer.ndaSent === true ? "Yes" : offer.ndaSent === false ? "No" : null,
          codeOfConductSent: offer.codeOfConductSent === true ? "Yes" : offer.codeOfConductSent === false ? "No" : null,
        }));
        if (offer.docType && offer.docFileName && offer.docS3Key && offer.docMimeType && offer.docGeneratedAt) {
          setGeneratedDoc({
            offerId: offer.offerId,
            docType: offer.docType,
            docFileName: offer.docFileName,
            docS3Key: offer.docS3Key,
            docMimeType: offer.docMimeType,
            docFileSize: offer.docFileSize,
            docGeneratedAt: offer.docGeneratedAt,
            docGeneratedBy: offer.docGeneratedBy,
          });
        }
      })
      .catch(() => {
        // New candidate — no existing offer, continue with blank form
      })
      .finally(() => setLoadingOffer(false));
  }, [visible, selectedCandidate, accessToken]);

  // ─── Dropdown options ───────────────────────────────────────────────────────

  const currencyOptions = (createData?.currencies ?? []).map((c) => ({
    label: c.currencyName,
    value: c.currencyId,
  }));
  const compensationTypeOptions = (createData?.compensationTypes ?? []).map((t) => ({
    label: t.compensationTypeName,
    value: t.compensationTypeId,
  }));
  const workModeOptions = (createData?.workModes ?? []).map((w) => ({
    label: w.workMode,
    value: w.workModeId,
  }));
  const vendorOptions = (createData?.vendors ?? []).map((v) => ({
    label: v.vendorName,
    value: v.vendorId,
  }));
  const jprOptions: JprDropdownOption[] = (createData?.jobProfiles ?? []).map((j) => ({
    label: [j.jobRole, j.clientName, j.departmentName].filter(Boolean).join(" | "),
    value: j.jobProfileRequirementId,
    jobRole: j.jobRole,
    clientName: j.clientName ?? "",
    departmentName: j.departmentName ?? "",
  }));
  const reportingToOptions = (offerFormData?.members ?? []).map((m) => ({
    label: m.memberName,
    value: m.memberId,
  }));
  const employmentTypeOptions = (offerFormData?.employmentTypes ?? []).map((e) => ({
    label: e.employmentTypeName,
    value: e.employmentTypeLookupId,
  }));

  // ─── Employment type helpers ────────────────────────────────────────────────

  const selectedEmploymentType = offerFormData?.employmentTypes?.find(
    (e) => e.employmentTypeLookupId === formData.employmentTypeLookupId
  );
  const employmentTypeName = selectedEmploymentType?.employmentTypeName ?? "";
  const type = employmentTypeName?.toLowerCase().trim();
  const isEmployee = type === "employee";
  const isConsultant = type === "consultant" || type === "contractor";

  const handleEmploymentTypeChange = (lookupId: number | null) => {
    const name = offerFormData?.employmentTypes?.find(
      (e) => e.employmentTypeLookupId === lookupId
    )?.employmentTypeName;
    const nameLower = name?.toLowerCase().trim();
    setFormData((p) => ({
      ...p,
      employmentTypeLookupId: lookupId,
      employmentType:
        nameLower === "employee"
          ? "Employee"
          : nameLower === "consultant" || nameLower === "contractor"
          ? "Consultant"
          : null,
      ...(nameLower === "employee" ? { vendorId: null } : {}),
    }));
    if (errors.employmentType) setErrors((p) => ({ ...p, employmentType: undefined }));
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const shouldShowError = (field: string): string | undefined =>
    submitted ? errors[field] : undefined;

  // ─── JPR dropdown templates ─────────────────────────────────────────────────

  const jprOptionTemplate = (option: JprDropdownOption | null) => {
    if (!option) return null;
    return (
      <div className="flex flex-column gap-1 py-1">
        <span className="font-semibold text-900">{option.jobRole}</span>
        <div className="flex flex-wrap gap-3 text-xs text-500">
          {option.clientName ? <span>Client: {option.clientName}</span> : null}
          {option.departmentName ? <span>Dept: {option.departmentName}</span> : null}
        </div>
      </div>
    );
  };

  const jprValueTemplate = (option: JprDropdownOption | null) => {
    if (!option) return <span>Select</span>;
    const meta = [
      option.clientName ? `Client: ${option.clientName}` : "",
      option.departmentName ? `Dept: ${option.departmentName}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <span className="block truncate">
        <span className="font-semibold">{option.jobRole}</span>
        {meta ? <span className="text-600 text-sm"> · {meta}</span> : null}
      </span>
    );
  };

  // ─── Validation ─────────────────────────────────────────────────────────────

  /** Validates all fields required for offer creation (excludes doc toggles). */
  const validateCore = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (formData.employmentTypeLookupId == null) next.employmentType = "Employment type is required.";
    if (!formData.jprProjectDepartmentId) next.jprProjectDepartmentId = "Final JPR is required.";
    if (!formData.modeOfWorkingId) next.modeOfWorkingId = "Mode of Working is required.";
    if (!formData.joiningDate) next.joiningDate = "Joining date is required.";
    if (!formData.offeredCtcValue || Number(formData.offeredCtcValue) <= 0)
      next.offeredCtcValue = "Offered CTC must be greater than 0.";
    if (!formData.currencyId) next.currencyId = "Currency is required.";
    if (!formData.compensationTypeId) next.compensationTypeId = "Compensation type is required.";
    if (!formData.reportingToId) next.reportingToId = "Reporting to is required.";
    if (isConsultant && !formData.vendorId) next.vendorId = "Vendor is required for Consultant.";
    return next;
  };

  const validate = (): boolean => {
    const coreErrors = validateCore();
    const docErrors: string[] = [];
    if (formData.ndaSent !== "Yes") docErrors.push("NDA Sent");
    if (formData.codeOfConductSent !== "Yes") docErrors.push("Code of Conduct Sent");
    if (isEmployee && formData.offerLetterSent !== "Yes") docErrors.push("Offer Letter Sent");
    if (isConsultant && formData.serviceAgreementSent !== "Yes") docErrors.push("Service Agreement Sent");
    if (docErrors.length > 0)
      coreErrors.documents = `All document statuses must be set to Yes. Please review: ${docErrors.join(", ")}.`;
    setErrors(coreErrors);
    setSubmitted(true);
    return Object.keys(coreErrors).length === 0;
  };

  const docTogglesValid =
    formData.ndaSent === "Yes" &&
    formData.codeOfConductSent === "Yes" &&
    (!isEmployee || formData.offerLetterSent === "Yes") &&
    (!isConsultant || formData.serviceAgreementSent === "Yes");

  /** Whether enough form fields are filled to enable the Generate button. */
  const canGenerate =
    !!formData.employmentTypeLookupId &&
    (isEmployee || isConsultant) &&
    !!formData.jprProjectDepartmentId &&
    !!formData.modeOfWorkingId &&
    !!formData.joiningDate &&
    !!formData.offeredCtcValue &&
    Number(formData.offeredCtcValue) > 0 &&
    !!formData.currencyId &&
    !!formData.compensationTypeId &&
    !!formData.reportingToId &&
    (!isConsultant || !!formData.vendorId);

  // ─── Helpers to build the offer creation payload ────────────────────────────

  const buildPayload = (): CreateOfferPayload | null => {
    if (formData.employmentTypeLookupId == null) return null;
    const joiningDate =
      formData.joiningDate instanceof Date
        ? formData.joiningDate.toISOString().slice(0, 10)
        : formData.joiningDate
        ? new Date(formData.joiningDate).toISOString().slice(0, 10)
        : "";
    if (!joiningDate) return null;
    return {
      jobProfileRequirementId: formData.jprProjectDepartmentId!,
      reportingManagerId: formData.reportingToId!,
      employmentTypeLookupId: formData.employmentTypeLookupId,
      workModelLookupId: formData.modeOfWorkingId!,
      joiningDate,
      ndaSent: formData.ndaSent === "Yes",
      codeOfConductSent: formData.codeOfConductSent === "Yes",
      offeredCTCAmount: formData.offeredCtcValue ?? undefined,
      currencyLookupId: formData.currencyId ?? undefined,
      compensationTypeLookupId: formData.compensationTypeId ?? undefined,
      variablePay: formData.variablePay ?? undefined,
      joiningBonus: formData.joiningBonus ?? undefined,
      vendorId: isConsultant ? formData.vendorId : undefined,
      offerLetterSent: isEmployee ? formData.offerLetterSent === "Yes" : undefined,
      serviceAgreementSent: isConsultant ? formData.serviceAgreementSent === "Yes" : undefined,
    };
  };

  // ─── Generate handler ───────────────────────────────────────────────────────

  const handleCancelGenerate = () => {
    generateAbortRef.current?.abort();
    generateAbortRef.current = null;
    setGenerating(false);
  };

  const handleGenerate = async () => {
    if (!selectedCandidate || !accessToken) return;
    const abortController = new AbortController();
    generateAbortRef.current = abortController;
    setGenerating(true);
    try {
      let offerId = savedOfferId;

      // Save the offer first if not already done
      if (!offerId) {
        const payload = buildPayload();
        if (!payload) return;
        const created = await createOffer(accessToken, selectedCandidate.candidateId, payload) as { offerId: number };
        offerId = created.offerId;
        setSavedOfferId(offerId);
      }

      const doc = await generateOnboardingDocument(offerId, accessToken, abortController.signal);
      setGeneratedDoc(doc);
      showGlobalToast({
        severity: "success",
        summary: "Document generated",
        detail: `${doc.docType === "offer_letter" ? "Offer Letter" : "Service Agreement"} is ready.`,
        life: 4000,
      });
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") return;
      const e = err as { message?: string };
      showGlobalToast({
        severity: "error",
        summary: "Generation failed",
        detail: e?.message ?? "Failed to generate document.",
        life: 5000,
      });
    } finally {
      generateAbortRef.current = null;
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!savedOfferId || !accessToken) return;
    setRegenerating(true);
    try {
      const doc = await regenerateOnboardingDocument(savedOfferId, accessToken);
      setGeneratedDoc(doc);
      showGlobalToast({ severity: "success", summary: "Regenerated", detail: "New document is ready.", life: 4000 });
    } catch (err: unknown) {
      const e = err as { message?: string };
      showGlobalToast({ severity: "error", summary: "Error", detail: e?.message ?? "Regeneration failed.", life: 5000 });
    } finally {
      setRegenerating(false);
    }
  };

  // ─── Save handler ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    // If offer already saved via generate → validate toggles then close
    if (savedOfferId) {
      if (!docTogglesValid) {
        setSubmitted(true);
        const docErrors: string[] = [];
        if (formData.ndaSent !== "Yes") docErrors.push("NDA Sent");
        if (formData.codeOfConductSent !== "Yes") docErrors.push("Code of Conduct Sent");
        if (isEmployee && formData.offerLetterSent !== "Yes") docErrors.push("Offer Letter Sent");
        if (isConsultant && formData.serviceAgreementSent !== "Yes") docErrors.push("Service Agreement Sent");
        setErrors((p) => ({
          ...p,
          documents: `All document statuses must be set to Yes. Please review: ${docErrors.join(", ")}.`,
        }));
        return;
      }
      onSuccess();
      onHide();
      return;
    }

    // Document generation is required for Employee / Consultant before saving
    if ((isEmployee || isConsultant) && !generatedDoc) {
      showGlobalToast({
        severity: "warn",
        summary: "Document Required",
        detail: `Please generate the ${isEmployee ? "Offer Letter" : "Service Agreement"} before saving.`,
        life: 5000,
      });
      return;
    }

    if (!validate() || !selectedCandidate || !accessToken) return;

    const payload = buildPayload();
    if (!payload) {
      setErrors((p) => ({ ...p, joiningDate: "Invalid joining date." }));
      setSubmitted(true);
      return;
    }

    setSaving(true);
    try {
      await createOffer(accessToken, selectedCandidate.candidateId, payload);
      showGlobalToast({ severity: "success", summary: "Offer created", detail: "Offer has been created successfully.", life: 4000 });
      onSuccess();
      onHide();
    } catch (err: unknown) {
      const e = err as { message?: string; details?: { validationErrors?: { message?: string }[] } };
      const message =
        Array.isArray(e?.details?.validationErrors) && e.details!.validationErrors!.length > 0
          ? e.details!.validationErrors!.map((v) => v.message).filter(Boolean).join(", ") || e?.message
          : (e?.message ?? "Failed to create offer.");
      showGlobalToast({ severity: "error", summary: "Error", detail: message, life: 5000 });
    } finally {
      setSaving(false);
    }
  };

  // ─── Generate button label ──────────────────────────────────────────────────

  const generateLabel = isConsultant ? "Generate Service Agreement" : "Generate Offer Letter";

  // ─── Footer ─────────────────────────────────────────────────────────────────

  const footer = (
    <div className="flex justify-content-end gap-2">
      <DialogButton label="Cancel" severity="secondary" onClick={onHide} disabled={saving || generating} />
      <DialogButton
        label="Save Offer"
        severity="success"
        icon={<FaCheck className="mr-2" />}
        onClick={handleSave}
        disabled={saving || generating || !canGenerate || ((isEmployee || isConsultant) && !generatedDoc) || !docTogglesValid}
        loading={saving}
      />
    </div>
  );
{console.log("RenderformData", { formData, errors })}


  return (
    <Dialog
      visible={visible}
      header="Initiate Onboarding"
      onHide={onHide}
      footer={footer}
      style={{ width: "900px", maxWidth: "95vw" }}
      modal
      className="p-fluid"
    >
      {loadingOffer && (
        <div className="flex align-items-center justify-content-center gap-2 mb-3">
          <ProgressSpinner style={{ width: "20px", height: "20px" }} strokeWidth="4" />
          <span className="text-600" style={{ fontSize: "0.85rem" }}>Loading offer data…</span>
        </div>
      )}
      {shouldShowError("formData") && (
        <div className="mb-3">
          <small className="p-error block">{shouldShowError("formData")}</small>
        </div>
      )}

      {/* Row 1: Candidate Name | JPR */}
      <div className="grid p-fluid mb-2">
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">Candidate Name</label>
          <InputText value={formData.candidateName} disabled className="w-full" />
        </div>
        <div className="col-12 md:col-8">
          <label className="block font-bold mb-1">
            Final JPR (Project/Department) <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={formData.jprProjectDepartmentId}
            options={jprOptions}
            optionLabel="label"
            itemTemplate={jprOptionTemplate}
            valueTemplate={jprValueTemplate}
            onChange={(e) => {
              setFormData((p) => ({ ...p, jprProjectDepartmentId: e.value }));
              clearError("jprProjectDepartmentId");
            }}
            placeholder="Select"
            className={shouldShowError("jprProjectDepartmentId") ? "p-invalid w-full" : "w-full"}
            showClear
          />
          {shouldShowError("jprProjectDepartmentId") && (
            <small className="p-error block mt-1">{shouldShowError("jprProjectDepartmentId")}</small>
          )}
        </div>
      </div>

      {/* Row 2: Employment Type | Mode of Working | Joining Date */}
      <div className="grid p-fluid mb-2">
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={formData.employmentTypeLookupId}
            options={employmentTypeOptions}
            onChange={(e) => handleEmploymentTypeChange(e.value ?? null)}
            placeholder={employmentTypeOptions.length ? "Select" : "Loading..."}
            className={shouldShowError("employmentType") ? "p-invalid w-full" : "w-full"}
            showClear
            disabled={employmentTypeOptions.length === 0}
          />
          {shouldShowError("employmentType") && (
            <small className="p-error block mt-1">{shouldShowError("employmentType")}</small>
          )}
          {isConsultant && (
            <div className="mt-2">
              <label className="block font-bold mb-1">Vendor</label>
              <Dropdown
                value={formData.vendorId}
                options={vendorOptions}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, vendorId: e.value }));
                  clearError("vendorId");
                }}
                placeholder="Select Vendor"
                className={shouldShowError("vendorId") ? "p-invalid w-full" : "w-full"}
                showClear
              />
              {shouldShowError("vendorId") && (
                <small className="p-error block mt-1">{shouldShowError("vendorId")}</small>
              )}
            </div>
          )}
        </div>
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">
            Mode of Working <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={formData.modeOfWorkingId}
            options={workModeOptions}
            onChange={(e) => {
              setFormData((p) => ({ ...p, modeOfWorkingId: e.value }));
              clearError("modeOfWorkingId");
            }}
            placeholder="Select"
            className={shouldShowError("modeOfWorkingId") ? "p-invalid w-full" : "w-full"}
            showClear
          />
          {shouldShowError("modeOfWorkingId") && (
            <small className="p-error block mt-1">{shouldShowError("modeOfWorkingId")}</small>
          )}
        </div>
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">
            Joining Date <span className="text-red-500">*</span>
          </label>
          <Calendar
            value={formData.joiningDate}
            onChange={(e) => {
              setFormData((p) => ({ ...p, joiningDate: e.value ?? null }));
              clearError("joiningDate");
            }}
            dateFormat="dd/mm/yy"
            placeholder="Select Date"
            className={shouldShowError("joiningDate") ? "p-invalid w-full" : "w-full"}
            minDate={new Date()}
            showIcon
          />
          {shouldShowError("joiningDate") && (
            <small className="p-error block mt-1">{shouldShowError("joiningDate")}</small>
          )}
        </div>
      </div>
      {/* Row 3: CTC | Currency | Compensation Type */}
      <div className="grid p-fluid mb-2">
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">
            Offered CTC Value <span className="text-red-500">*</span>
          </label>
          <InputText
            type="number"
            min="0"
            step="any"
            value={formData.offeredCtcValue != null ? String(formData.offeredCtcValue) : ""}
            onChange={(e) => {
              const parsed = e.target.value === "" ? null : parseFloat(e.target.value);
              const val = parsed != null && !isNaN(parsed) && parsed > 0 ? parsed : null;
              setFormData((p) => ({ ...p, offeredCtcValue: val }));
              clearError("offeredCtcValue");
            }}
            placeholder="0"
            className={shouldShowError("offeredCtcValue") ? "p-invalid w-full" : "w-full"}
          />
          {shouldShowError("offeredCtcValue") && (
            <small className="p-error block mt-1">{shouldShowError("offeredCtcValue")}</small>
          )}
        </div>
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">
            Currency <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={formData.currencyId}
            options={currencyOptions}
            onChange={(e) => {
              setFormData((p) => ({ ...p, currencyId: e.value }));
              clearError("currencyId");
            }}
            placeholder="Select"
            className={shouldShowError("currencyId") ? "p-invalid w-full" : "w-full"}
            showClear
          />
          {shouldShowError("currencyId") && (
            <small className="p-error block mt-1">{shouldShowError("currencyId")}</small>
          )}
        </div>
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">
            Compensation Type <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={formData.compensationTypeId}
            options={compensationTypeOptions}
            onChange={(e) => {
              setFormData((p) => ({ ...p, compensationTypeId: e.value }));
              clearError("compensationTypeId");
            }}
            placeholder="Select"
            className={shouldShowError("compensationTypeId") ? "p-invalid w-full" : "w-full"}
            showClear
          />
          {shouldShowError("compensationTypeId") && (
            <small className="p-error block mt-1">{shouldShowError("compensationTypeId")}</small>
          )}
        </div>
      </div>

      {/* Row 4: Variable Pay | Joining Bonus | Reporting To */}
      <div className="grid p-fluid mb-3">
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">Variable Pay</label>
          <InputNumber
            value={formData.variablePay ?? undefined}
            onValueChange={(e) => setFormData((p) => ({ ...p, variablePay: e.value ?? null }))}
            mode="decimal"
            className="w-full"
          />
        </div>
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">Joining Bonus</label>
          <InputNumber
            value={formData.joiningBonus ?? undefined}
            onValueChange={(e) => setFormData((p) => ({ ...p, joiningBonus: e.value ?? null }))}
            mode="decimal"
            className="w-full"
          />
        </div>
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">
            Reporting To <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={formData.reportingToId}
            options={reportingToOptions}
            onChange={(e) => {
              setFormData((p) => ({ ...p, reportingToId: e.value }));
              clearError("reportingToId");
            }}
            placeholder="Select"
            className={shouldShowError("reportingToId") ? "p-invalid w-full" : "w-full"}
            showClear
          />
          {shouldShowError("reportingToId") && (
            <small className="p-error block mt-1">{shouldShowError("reportingToId")}</small>
          )}
        </div>
      </div>

      {/* ── Generate Document section ── */}
      <div className="mb-3">
        {/* Generated document preview */}
        {generatedDoc && savedOfferId && (
          <DocumentPanel
            doc={generatedDoc}
            offerId={savedOfferId}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
            accessToken={accessToken}
          />
        )}

        {/* Generating spinner */}
        {generating && !generatedDoc && (
          <div
            className="flex align-items-center justify-content-between gap-2 mb-2"
            style={{
              border: "1.5px dashed #94a3b8",
              borderRadius: "10px",
              padding: "12px 16px",
              background: "#f8fafc",
            }}
          >
            <div className="flex align-items-center gap-2">
              <ProgressSpinner style={{ width: "22px", height: "22px" }} strokeWidth="4" />
              <span className="text-600" style={{ fontSize: "0.85rem" }}>
                Generating document with AI…
              </span>
            </div>
            <Button
              label="Cancel"
              size="small"
              severity="secondary"
              outlined
              onClick={handleCancelGenerate}
              style={{ fontSize: "0.78rem", padding: "4px 10px" }}
            />
          </div>
        )}

        {/* Generate button — shown when employment type is known and fields are filled */}
        {(isEmployee || isConsultant) && !generatedDoc && (
          <Button
            icon={<FaMagic className="mr-2" />}
            label={generating ? "Generating…" : generateLabel}
            severity="info"
            outlined
            size="small"
            disabled={!canGenerate || generating}
            loading={generating}
            onClick={handleGenerate}
            style={{ fontSize: "0.85rem" }}
          />
        )}
      </div>

      {/* ── Document status toggles ── */}
      <div className="flex flex-column gap-2 pt-3 border-top-1 surface-border">
        {isEmployee && (
          <div className="flex align-items-center gap-2 flex-wrap">
            <span className="font-bold mr-2" style={{ minWidth: "260px" }}>
              Offer Letter Sent <span className="text-red-500">*</span>
            </span>
            <DocumentToggle
              value={formData.offerLetterSent}
              onChange={(v) => {
                setFormData((p) => ({ ...p, offerLetterSent: v }));
                clearError("documents");
              }}
            />
          </div>
        )}
        {isConsultant && (
          <div className="flex align-items-center gap-2 flex-wrap">
            <span className="font-bold mr-2" style={{ minWidth: "260px" }}>
              Service Agreement Sent <span className="text-red-500">*</span>
            </span>
            <DocumentToggle
              value={formData.serviceAgreementSent}
              onChange={(v) => {
                setFormData((p) => ({ ...p, serviceAgreementSent: v }));
                clearError("documents");
              }}
            />
          </div>
        )}
        <div className="flex align-items-center gap-2 flex-wrap">
          <span className="font-bold mr-2" style={{ minWidth: "260px" }}>
            NDA Sent <span className="text-red-500">*</span>
          </span>
          <DocumentToggle
            value={formData.ndaSent}
            onChange={(v) => {
              setFormData((p) => ({ ...p, ndaSent: v }));
              clearError("documents");
            }}
          />
        </div>
        <div className="flex align-items-center gap-2 flex-wrap">
          <span className="font-bold mr-2" style={{ minWidth: "260px" }}>
            Code of Conduct Sent <span className="text-red-500">*</span>
          </span>
          <DocumentToggle
            value={formData.codeOfConductSent}
            onChange={(v) => {
              setFormData((p) => ({ ...p, codeOfConductSent: v }));
              clearError("documents");
            }}
          />
        </div>
      </div>

      {shouldShowError("documents") && (
        <div className="mt-3">
          <small className="p-error block">{shouldShowError("documents")}</small>
        </div>
      )}
    </Dialog>
  );
};

export default ResumeOnBoarding;
