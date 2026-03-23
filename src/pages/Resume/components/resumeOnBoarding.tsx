import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import DialogButton from "../../../shared/DialogAddEditButton";
import { showGlobalToast } from "../../../shared/services/globalToastService";
import { useAuth } from "../../../shared/auth/AuthContext";
import { createOffer, getOfferFormData } from "../../Offer/services/offerService";
import type { CreateOfferPayload, OfferFormDataResponse } from "../../Offer/types/offerTypes";
import { FaCheck } from "react-icons/fa";
import type {
  Candidate,
  CandidateCreateData,
  OnboardingFormData,
  OnboardingDocumentStatus,
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
  offeredCtcValue: candidate?.expectedCTCAmount ?? null,
  currencyId: candidate?.expectedCTCCurrencyId ?? null,
  compensationTypeId: candidate?.expectedCTCTypeId ?? null,
  variablePay: null,
  joiningBonus: null,
  reportingToId: null,
  vendorId: candidate?.vendorId ?? null,
  offerLetterSent: "Yes",
  serviceAgreementSent: "Yes",
  ndaSent: "Yes",
  codeOfConductSent: "Yes",
});

/** Yes (green) / No (red) toggle buttons for document status — matches Jaival UI */
const DocumentToggle: React.FC<{
  value: OnboardingDocumentStatus;
  onChange: (v: OnboardingDocumentStatus) => void;
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

const ResumeOnBoarding: React.FC<ResumeOnBoardingProps> = ({
  visible,
  onHide,
  selectedCandidate,
  createData,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState<OnboardingFormData>(getInitialFormData(null));
  const [offerFormData, setOfferFormData] = useState<OfferFormDataResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (visible && selectedCandidate) {
      setFormData(getInitialFormData(selectedCandidate));
      setErrors({});
      setSubmitted(false);
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

  const jprOptionTemplate = (option: JprDropdownOption | null) => {
    if (!option) return null;
    return (
      <div className="flex flex-column gap-1 py-1">
        <div className="flex align-items-center gap-2 flex-wrap">
          <span className="font-semibold text-900">{option.jobRole}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-500">
          {option.clientName ? <span>Client: {option.clientName}</span> : null}
          {option.departmentName ? <span>Dept: {option.departmentName}</span> : null}
        </div>
      </div>
    );
  };

  const jprValueTemplate = (option: JprDropdownOption | null) => {
    if (!option) return <span>Select</span>;
    const clientPart = option.clientName ? `Client: ${option.clientName}` : "";
    const deptPart = option.departmentName ? `Dept: ${option.departmentName}` : "";
    const meta = [clientPart, deptPart].filter(Boolean).join(" · ");
    return (
      <span className="block truncate">
        <span className="font-semibold">{option.jobRole}</span>
        {meta ? (
          <>
            {" "}
            <span className="text-600 text-sm">· {meta}</span>
          </>
        ) : null}
      </span>
    );
  };
  const reportingToOptions = (offerFormData?.members ?? []).map((m) => ({
    label: m.memberName,
    value: m.memberId,
  }));

  const employmentTypeOptions = (offerFormData?.employmentTypes ?? []).map((e) => ({
    label: e.employmentTypeName,
    value: e.employmentTypeLookupId,
  }));

  const selectedEmploymentType = offerFormData?.employmentTypes?.find(
    (e) => e.employmentTypeLookupId === formData.employmentTypeLookupId
  );
  const employmentTypeName = selectedEmploymentType?.employmentTypeName ?? "";
  const isEmployee = employmentTypeName === "Employee";
  const isConsultant = employmentTypeName === "Consultant" || employmentTypeName === "Contractor";

  const handleEmploymentTypeChange = (lookupId: number | null) => {
    const name = offerFormData?.employmentTypes?.find((e) => e.employmentTypeLookupId === lookupId)?.employmentTypeName;
    setFormData((p) => ({
      ...p,
      employmentTypeLookupId: lookupId,
      employmentType: name === "Employee" ? "Employee" : name === "Consultant" || name === "Contractor" ? "Consultant" : null,
      ...(name === "Employee" ? { vendorId: null } : {}),
    }));
    if (errors.employmentType) setErrors((p) => ({ ...p, employmentType: undefined }));
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const shouldShowError = (field: string): string | undefined =>
    submitted ? errors[field] : undefined;

  const validate = (): boolean => {
    const next: Record<string, string | undefined> = {};
    if (formData.employmentTypeLookupId == null) next.employmentType = "Employment type is required.";
    if (!formData.jprProjectDepartmentId) next.jprProjectDepartmentId = "Find JPR (Project/Department) is required.";
    if (!formData.modeOfWorkingId) next.modeOfWorkingId = "Mode of Working is required.";
    if (!formData.joiningDate) next.joiningDate = "Joining date is required.";
    if (
      formData.offeredCtcValue === null ||
      formData.offeredCtcValue === undefined ||
      Number(formData.offeredCtcValue) <= 0
    ) {
      next.offeredCtcValue = "Offered CTC must be greater than 0.";
    }
    if (!formData.currencyId) next.currencyId = "Currency is required.";
    if (!formData.compensationTypeId) next.compensationTypeId = "Compensation type is required.";
    if (!formData.reportingToId) next.reportingToId = "Reporting to is required.";
    if (isConsultant && !formData.vendorId) next.vendorId = "Vendor is required for Consultant.";
    const docErrors: string[] = [];
    if (formData.ndaSent !== "Yes") docErrors.push("NDA Sent");
    if (formData.codeOfConductSent !== "Yes") docErrors.push("Code of Conduct Sent");
    if (isEmployee && formData.offerLetterSent !== "Yes") docErrors.push("Offer Letter Sent");
    if (isConsultant && formData.serviceAgreementSent !== "Yes") docErrors.push("Service Agreement Sent");
    if (docErrors.length > 0) next.documents = `All document statuses must be set to Yes. Please review: ${docErrors.join(", ")}.`;
    setErrors(next);
    setSubmitted(true);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !selectedCandidate || !accessToken) return;

    let formDataToUse = offerFormData;
    if (formDataToUse == null && accessToken) {
      try {
        formDataToUse = await getOfferFormData(accessToken);
        setOfferFormData(formDataToUse);
      } catch {
        formDataToUse = null;
      }
    }

    const employmentTypeLookupId = formData.employmentTypeLookupId;
    if (employmentTypeLookupId == null) return;

    const joiningDate =
      formData.joiningDate instanceof Date
        ? formData.joiningDate.toISOString().slice(0, 10)
        : formData.joiningDate
          ? new Date(formData.joiningDate).toISOString().slice(0, 10)
          : "";
    if (!joiningDate) {
      setErrors((p) => ({ ...p, joiningDate: "Invalid joining date." }));
      setSubmitted(true);
      return;
    }

    const payload: CreateOfferPayload = {
      jobProfileRequirementId: formData.jprProjectDepartmentId!,
      reportingManagerId: formData.reportingToId!,
      employmentTypeLookupId,
      workModelLookupId: formData.modeOfWorkingId!,
      joiningDate,
      ndaSent: formData.ndaSent === "Yes",
      codeOfConductSent: formData.codeOfConductSent === "Yes",
      offeredCTCAmount: (formData.offeredCtcValue != null && formData.offeredCtcValue >= 1) ? formData.offeredCtcValue : undefined,
      currencyLookupId: formData.currencyId ?? undefined,
      compensationTypeLookupId: formData.compensationTypeId ?? undefined,
      variablePay: formData.variablePay ?? undefined,
      joiningBonus: formData.joiningBonus ?? undefined,
      vendorId: isConsultant ? formData.vendorId : undefined,
      offerLetterSent: isEmployee ? formData.offerLetterSent === "Yes" : undefined,
      serviceAgreementSent: isConsultant ? formData.serviceAgreementSent === "Yes" : undefined,
    };

    setSaving(true);
    try {
      await createOffer(accessToken, selectedCandidate.candidateId, payload);
      showGlobalToast({ severity: "success", summary: "Offer created", detail: "Offer has been created successfully.", life: 4000 });
      onSuccess();
      onHide();
    } catch (err: unknown) {
      const e = err as { message?: string; details?: { validationErrors?: { message?: string }[] } };
      const message = Array.isArray(e?.details?.validationErrors) && e.details.validationErrors.length > 0
        ? e.details.validationErrors.map((v) => v.message).filter(Boolean).join(", ") || e?.message
        : (e?.message ?? "Failed to create offer.");
      showGlobalToast({ severity: "error", summary: "Error", detail: message, life: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <DialogButton label="Cancel" severity="secondary" onClick={onHide} disabled={saving} />
      <DialogButton label="Save Offer" severity="success" icon={<FaCheck className="mr-2" />} onClick={handleSave} disabled={saving} loading={saving} />
    </div>
  );

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
      {shouldShowError("formData") && (
        <div className="mb-3">
          <small className="p-error block">{shouldShowError("formData")}</small>
        </div>
      )}

      {/* Row 1: Candidate Name (Read-only) | Find JPR (Project/Department) * */}
      <div className="grid p-fluid mb-2">
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">Candidate Name</label>
          <InputText value={formData.candidateName} disabled className="w-full" />
        </div>
        <div className="col-12 md:col-8">
          <label className="block font-bold mb-1">Final JPR (Project/Department) <span className="text-red-500">*</span></label>
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
          {shouldShowError("jprProjectDepartmentId") && <small className="p-error block mt-1">{shouldShowError("jprProjectDepartmentId")}</small>}
        </div>
      </div>

      {/* Row 2: Employment Type * | Mode of Working * | Joining Date * */}
      <div className="grid p-fluid mb-2">
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">Employment Type <span className="text-red-500">*</span></label>
          <Dropdown
            value={formData.employmentTypeLookupId}
            options={employmentTypeOptions}
            onChange={(e) => handleEmploymentTypeChange(e.value ?? null)}
            placeholder={employmentTypeOptions.length ? "Select" : "Loading..."}
            className={shouldShowError("employmentType") ? "p-invalid w-full" : "w-full"}
            showClear
            disabled={employmentTypeOptions.length === 0}
          />
          {shouldShowError("employmentType") && <small className="p-error block mt-1">{shouldShowError("employmentType")}</small>}
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
              {shouldShowError("vendorId") && <small className="p-error block mt-1">{shouldShowError("vendorId")}</small>}
            </div>
          )}
        </div>
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">Mode of Working <span className="text-red-500">*</span></label>
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
          {shouldShowError("modeOfWorkingId") && <small className="p-error block mt-1">{shouldShowError("modeOfWorkingId")}</small>}
        </div>
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">Joining Date <span className="text-red-500">*</span></label>
          <Calendar
            value={formData.joiningDate}
            onChange={(e) => {
              setFormData((p) => ({ ...p, joiningDate: e.value ?? null }));
              clearError("joiningDate");
            }}
            dateFormat="dd/mm/yy"
            placeholder="Select Date"
            className={shouldShowError("joiningDate") ? "p-invalid w-full" : "w-full"}
            showIcon
          />
          {shouldShowError("joiningDate") && <small className="p-error block mt-1">{shouldShowError("joiningDate")}</small>}
        </div>
      </div>

      {/* Row 3: Offered CTC Value * | Currency * | Compensation Type * — display as number + symbol/type */}
      <div className="grid p-fluid mb-2">
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">Offered CTC Value <span className="text-red-500">*</span></label>
          <InputNumber
            value={formData.offeredCtcValue ?? undefined}
            onValueChange={(e) => {
              const value = typeof e.value === "number" ? e.value : null;
            
              setFormData((p) => ({
                ...p,
                offeredCtcValue: value,
              }));
            
              clearError("offeredCtcValue");
            }}
            mode="decimal"
            min={1}
            className={shouldShowError("offeredCtcValue") ? "p-invalid w-full" : "w-full"}
          />
          {shouldShowError("offeredCtcValue") && <small className="p-error block mt-1">{shouldShowError("offeredCtcValue")}</small>}
        </div>
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">Currency <span className="text-red-500">*</span></label>
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
          {shouldShowError("currencyId") && <small className="p-error block mt-1">{shouldShowError("currencyId")}</small>}
        </div>
        <div className="col-12 md:col-4">
          <label className="block font-bold mb-1">Compensation Type <span className="text-red-500">*</span></label>
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
          {shouldShowError("compensationTypeId") && <small className="p-error block mt-1">{shouldShowError("compensationTypeId")}</small>}
        </div>
      </div>

      {/* Row 4: Variable Pay | Joining Bonus | Reporting To * */}
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
          <label className="block font-bold mb-1">Reporting To <span className="text-red-500">*</span></label>
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
          {shouldShowError("reportingToId") && <small className="p-error block mt-1">{shouldShowError("reportingToId")}</small>}
        </div>
      </div>

      {/* Document status — Yes (green) / No (red). Employee: Offer Letter only; Consultant: Service Agreement only; NDA & Code of Conduct for both. */}
      <div className="flex flex-column gap-2 mt-3 pt-3 border-top-1 surface-border">
        {isEmployee && (
          <div className="flex align-items-center gap-2 flex-wrap">
            <span className="font-bold mr-2" style={{ minWidth: "260px" }}>
              Offer Letter Sent <span className="text-red-500">*</span>
            </span>
            <DocumentToggle
              value={formData.offerLetterSent}
              onChange={(v) => { setFormData((p) => ({ ...p, offerLetterSent: v })); clearError("documents"); }}
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
              onChange={(v) => { setFormData((p) => ({ ...p, serviceAgreementSent: v })); clearError("documents"); }}
            />
          </div>
        )}
        <div className="flex align-items-center gap-2 flex-wrap">
          <span className="font-bold mr-2" style={{ minWidth: "260px" }}>
            NDA Sent <span className="text-red-500">*</span>
          </span>
          <DocumentToggle
            value={formData.ndaSent}
            onChange={(v) => { setFormData((p) => ({ ...p, ndaSent: v })); clearError("documents"); }}
          />
        </div>
        <div className="flex align-items-center gap-2 flex-wrap">
          <span className="font-bold mr-2" style={{ minWidth: "260px" }}>
            Code of Conduct Sent <span className="text-red-500">*</span>
          </span>
          <DocumentToggle
            value={formData.codeOfConductSent}
            onChange={(v) => { setFormData((p) => ({ ...p, codeOfConductSent: v })); clearError("documents"); }}
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
