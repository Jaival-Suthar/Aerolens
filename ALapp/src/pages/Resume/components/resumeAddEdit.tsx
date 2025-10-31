import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { FaCheck } from "react-icons/fa";
import DialogButton from "../../../shared/DialogAddEditButton";

import {
  createCandidate,
  updateCandidate,
  uploadResume,
} from "../services/useResume";
import { ResumeAddEditProps, AddEditCandidate } from "../types/resumeTypes";
import { useAuth } from "../../../shared/auth/AuthContext";


// ---------- CONSTANTS ----------
const STATUS_OPTIONS = [
  { label: "Selected", value: "Selected" },
  { label: "Rejected", value: "Rejected" },
  { label: "Interview Pending", value: "Interview Pending" },
];

const RECRUITER_OPTIONS = [
  { label: "Jayraj", value: "Jayraj" },
  { label: "Khushi", value: "Khushi" },
  { label: "Yash", value: "Yash" },
];

const LOCATION_OPTIONS = [
  { label: "Ahmedabad", value: "Ahmedabad" },
  { label: "Bangalore", value: "Bangalore" },
  { label: "San Francisco", value: "San Francisco" },
];

// ---------- HELPERS ----------
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?91|91)?[6-9]\d{9}$|^(\+?1)?[2-9]\d{9}$/;
const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/.*$/i;

const INITIAL_FORM: AddEditCandidate = {
  candidateName: "",
  contactNumber: "",
  email: "",
  recruiterName: "",
  jobRole: "",
  preferredJobLocation: "",
  currentCTC: 0,
  expectedCTC: 0,
  noticePeriod: 0,
  experienceYears: 0,
  statusName: "",
  linkedinProfileUrl: "",
  resumeFile: null,
};

// ---------- VALIDATION ----------
const validateField = (field: keyof AddEditCandidate, value: any) => {
  switch (field) {
    case "candidateName":
      return value.trim() ? "" : "Candidate name is required.";
    case "recruiterName":
      return value ? "" : "Recruiter is required.";
    case "contactNumber":
      if (!value) return "Contact number is required.";
      if (!phoneRegex.test(value.replace(/[\s-]/g, "")))
        return "Enter a valid Indian or US phone number.";
      return "";
    case "email":
      if (!value) return "Email is required.";
      if (!emailRegex.test(value)) return "Enter a valid email.";
      return "";
    case "jobRole":
      return value.trim() ? "" : "Job role is required.";
    case "preferredJobLocation":
      return value ? "" : "Location is required.";
    case "currentCTC":
      return value > 0 ? "" : "Current CTC must be greater than 0.";
    case "expectedCTC":
      return value > 0 ? "" : "Expected CTC must be greater than 0.";
    case "noticePeriod":
      return value >= 0 ? "" : "Notice period is required.";
    case "experienceYears":
      return value >= 0 ? "" : "Experience is required.";
    case "statusName":
      return value ? "" : "Status is required.";
    case "linkedinProfileUrl":
      if (!value) return "LinkedIn URL is required.";
      if (!linkedinRegex.test(value)) return "Enter a valid LinkedIn URL.";
      return "";
    case "resumeFile":
      if (!value) return "";
      if (!value.name.toLowerCase().endsWith(".pdf"))
        return "Only PDF files are allowed.";
      if (value.size > 5 * 1024 * 1024)
        return "File must be smaller than 5MB.";
      return "";
    default:
      return "";
  }
};

// ---------- COMPONENT ----------
const ResumeAddEdit: React.FC<ResumeAddEditProps> = ({
  visible,
  onHide,
  selectedResume,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const isEditMode = Boolean(selectedResume);

  const [formData, setFormData] = useState<AddEditCandidate>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  
  
  // Initialize / Reset form
  useEffect(() => {
    setFormData(
      isEditMode ? { ...selectedResume!, resumeFile: null } : INITIAL_FORM
    );
    setErrors({});
    setSubmitted(false);
  }, [visible, selectedResume, isEditMode]);

  const handleChange = useCallback(
    (field: keyof AddEditCandidate, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (field: keyof AddEditCandidate) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) setErrors((prev) => ({ ...prev, [field]: errorMsg }));
      else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [formData]
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    (Object.keys(formData) as (keyof AddEditCandidate)[]).forEach((key) => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) newErrors[key] = errorMsg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
  setSubmitted(true);
  if (!validateForm()) return;

  try {
    if (isEditMode && selectedResume) {
      // ✅ Explicit and typed update data
      const updateData: {
        candidateName: string;
        contactNumber: string;
        email: string;
        recruiterName: string;
        jobRole: string;
        preferredJobLocation: string;
        currentCTC: number;
        expectedCTC: number;
        noticePeriod: number;
        experienceYears: number;
        statusName: string;
        linkedinProfileUrl: string;
      } = {
        candidateName: formData.candidateName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        recruiterName: formData.recruiterName,
        jobRole: formData.jobRole,
        preferredJobLocation: formData.preferredJobLocation,
        currentCTC: formData.currentCTC,
        expectedCTC: formData.expectedCTC,
        noticePeriod: formData.noticePeriod,
        experienceYears: formData.experienceYears,
        statusName: formData.statusName,
        linkedinProfileUrl: formData.linkedinProfileUrl,
      };

      await updateCandidate(accessToken, selectedResume.candidateId, updateData);

      // ✅ Optional resume upload
      if (formData.resumeFile) {
        await uploadResume(accessToken, selectedResume.candidateId, formData.resumeFile);
      }
    } else {
      // ✅ Create new candidate
      await createCandidate(accessToken, formData);
    }

    onSuccess();
    onHide();
  } catch (err) {
    console.error("Error saving candidate:", err);
  } finally {
    setSubmitted(false);
  }
}, [
  formData,
  isEditMode,
  onHide,
  onSuccess,
  selectedResume,
  validateForm,
  accessToken,
]);


  const prefixSymbol = useMemo(
    () => (formData.preferredJobLocation === "San Francisco" ? "$" : "₹"),
    [formData.preferredJobLocation]
  );

  const shouldShowError = (field: string) =>
    (submitted || errors[field]) && errors[field];

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <DialogButton label="Cancel" severity="secondary" onClick={onHide} />
      <DialogButton
        label={isEditMode ? "Update Candidate" : "Add Candidate"}
        severity="success"
        icon={<FaCheck className="mr-2" />}
        onClick={handleSave}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      header={isEditMode ? "Edit Resume" : "Add New Resume"}
      onHide={onHide}
      footer={dialogFooter}
      style={{ width: "900px", maxHeight: "90vh" }}
      modal
      className="p-fluid"
    >
      <div className="formgrid grid">
        {/* Candidate Info */}
        <InputField
          id="candidateName"
          label="Candidate Name"
          value={formData.candidateName}
          onChange={(e) => handleChange("candidateName", e.target.value)}
          onBlur={() => handleBlur("candidateName")}
          error={shouldShowError("candidateName")}
        />

        <DropdownField
          id="recruiterName"
          label="Recruiter"
          value={formData.recruiterName}
          options={RECRUITER_OPTIONS}
          onChange={(e: { value: string }) => handleChange("recruiterName", e.value)}
          onBlur={() => handleBlur("recruiterName")}
          error={shouldShowError("recruiterName")}
        />

        <InputField
          id="contactNumber"
          label="Contact Number"
          value={formData.contactNumber}
          placeholder="e.g. 9876543210"
          onChange={(e) => handleChange("contactNumber", e.target.value)}
          onBlur={() => handleBlur("contactNumber")}
          error={shouldShowError("contactNumber")}
        />

        <InputField
          id="email"
          label="Email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          error={shouldShowError("email")}
        />

        <InputField
          id="jobRole"
          label="Job Role"
          value={formData.jobRole}
          onChange={(e) => handleChange("jobRole", e.target.value)}
          onBlur={() => handleBlur("jobRole")}
          error={shouldShowError("jobRole")}
        />

        <DropdownField
          id="preferredJobLocation"
          label="Preferred Location"
          value={formData.preferredJobLocation}
          options={LOCATION_OPTIONS}
          onChange={(e: { value: string }) => handleChange("preferredJobLocation", e.value)}
          onBlur={() => handleBlur("preferredJobLocation")}
          error={shouldShowError("preferredJobLocation")}
        />

        <InputNumberField
          id="currentCTC"
          label="Current CTC"
          value={formData.currentCTC}
          onChange={(val: number | null) => handleChange("currentCTC", val)}
          prefix={prefixSymbol}
          onBlur={() => handleBlur("currentCTC")}
          error={shouldShowError("currentCTC")}
        />

        <InputNumberField
          id="expectedCTC"
          label="Expected CTC"
          value={formData.expectedCTC}
          onChange={(val: number | null) => handleChange("expectedCTC", val)}
          prefix={prefixSymbol}
          onBlur={() => handleBlur("expectedCTC")}
          error={shouldShowError("expectedCTC")}
        />

        <InputNumberField
          id="noticePeriod"
          label="Notice Period (Days)"
          value={formData.noticePeriod}
          onChange={(val: number | null) => handleChange("noticePeriod", val)}
          onBlur={() => handleBlur("noticePeriod")}
          error={shouldShowError("noticePeriod")}
        />

        <InputNumberField
          id="experienceYears"
          label="Experience (Years)"
          value={formData.experienceYears}
          onChange={(val: number | null) => handleChange("experienceYears", val)}
          onBlur={() => handleBlur("experienceYears")}
          error={shouldShowError("experienceYears")}
        />

        <DropdownField
          id="statusName"
          label="Status"
          value={formData.statusName}
          options={STATUS_OPTIONS}
          onChange={(e: { value: string }) => handleChange("statusName", e.value)}
          onBlur={() => handleBlur("statusName")}
          error={shouldShowError("statusName")}
        />

        <InputField
          id="linkedinProfileUrl"
          label="LinkedIn URL"
          value={formData.linkedinProfileUrl}
          onChange={(e) =>
            handleChange("linkedinProfileUrl", e.target.value)
          }
          onBlur={() => handleBlur("linkedinProfileUrl")}
          placeholder="https://www.linkedin.com/in/..."
          error={shouldShowError("linkedinProfileUrl")}
        />

        <FileUploadField
          file={formData.resumeFile}
          onSelect={(file) => handleChange("resumeFile", file)}
          error={shouldShowError("resumeFile")}
        />
      </div>
    </Dialog>
  );
};

// ---------- REUSABLE FIELD COMPONENTS ----------
interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
}

const InputField = ({ id, label, value, onChange, onBlur, placeholder, error }: InputFieldProps) => (
  <div className="field col-12 md:col-6">
    <label htmlFor={id} className="font-bold">{label} *</label>
    <InputText 
      id={id}
      value={value} 
      onChange={onChange} 
      onBlur={onBlur} 
      placeholder={placeholder} 
      className={error ? "p-invalid" : ""} 
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);

const DropdownField = ({ id, label, value, options, onChange, onBlur, placeholder, error }: any) => (
  <div className="field col-12 md:col-6">
    <label htmlFor={id} className="font-bold">{label} *</label>
    <Dropdown 
      id={id}
      value={value} 
      options={options} 
      onChange={onChange} 
      onBlur={onBlur} 
      placeholder={placeholder} 
      className={error ? "p-invalid" : ""} 
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);

const InputNumberField = ({ id, label, value, onChange, onBlur, prefix, error }: any) => (
  <div className="field col-12 md:col-6">
    <label htmlFor={id} className="font-bold">{label} *</label>
    <InputNumber 
      id={id}
      value={value} 
      onValueChange={(e) => onChange(e.value)} 
      onBlur={onBlur} 
      prefix={prefix} 
      className={error ? "p-invalid" : ""} 
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);

interface FileUploadFieldProps {
  file: File | null;
  onSelect: (file: File) => void;
  error?: string;
}

const FileUploadField = ({ file, onSelect, error }: FileUploadFieldProps) => (
  <div className="field col-12 md:col-6">
    <label className="font-bold">Upload Resume (PDF Only)</label>
    <FileUpload
      mode="basic"
      name="resume"
      accept=".pdf"
      maxFileSize={5 * 1024 * 1024}
      auto={false}
      customUpload
      onSelect={(e) => e.files[0] && onSelect(e.files[0])}
      chooseLabel="Select File"
      chooseOptions={{
        icon: "pi pi-file-pdf",
        label: "Upload PDF",
        className: "p-button-danger p-button-sm",
      }}
      className={error ? "p-invalid" : ""}
    />
    {file && <small className="p-success">File selected: {file.name}</small>}
    {error && <small className="p-error">{error}</small>}
  </div>
);

export default ResumeAddEdit;