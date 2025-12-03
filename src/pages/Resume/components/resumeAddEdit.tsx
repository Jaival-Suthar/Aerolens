import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { FaCheck } from "react-icons/fa";
import { Toast } from "primereact/toast";
import DialogButton from "../../../shared/DialogAddEditButton";
import {
  createCandidate,
  updateCandidate,
  uploadResume,
  fetchLookupData,
} from "../services/useResume";
import { ResumeAddEditProps, AddEditCandidate } from "../types/resumeTypes";
import { useAuth } from "../../../shared/auth/AuthContext";

interface DropdownFieldProps {
  id: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (e: { value: string }) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

// ---------- CONSTANTS ----------
const LOCATION_DATA = {
  "India": ["Ahmedabad", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai"],
  "USA": ["San Francisco", "New York", "Boston", "Seattle", "Austin", "Chicago"],
  "UK": ["London", "Manchester", "Birmingham", "Edinburgh"],
};

const AVAILABLE_COUNTRIES = Object.keys(LOCATION_DATA);

// ---------- HELPERS ----------
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?91|91)?[6-9]\d{9}$|^(\+?1)?[2-9]\d{9}$/;
const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;

const INITIAL_FORM: AddEditCandidate = {
  candidateName: "",
  contactNumber: "",
  email: "",
  recruiterId: null,
  recruiterName: "",
  jobRole: "",
  preferredJobLocation: { city: '', country: '' },
  currentCTC: 0,
  expectedCTC: 0,
  noticePeriod: 0,
  experienceYears: 0,
  statusName: "",
  linkedinProfileUrl: undefined,
  resumeFile: null,
  notes: undefined,
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
      if (!value || !value.country) return "Country is required.";
      if (!value.city) return "City is required.";
      return "";
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
      if (!value || value.trim() === "") return "";
      if (!linkedinRegex.test(value)) return "Enter a valid LinkedIn URL.";
      return "";
    case "resumeFile":
      if (!value) return "";
      const fileName = value.name.toLowerCase();
      if (!fileName.endsWith(".pdf") && !fileName.endsWith(".docx"))
        return "Only PDF and DOCX files are allowed.";
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
  const toast = useRef<Toast>(null);
  const [recruiterOptions, setRecruiterOptions] = useState<{ label: string; value: string }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Get available cities based on selected country
  const availableCities = useMemo(() => {
    if (!formData.preferredJobLocation?.country) return [];
    return LOCATION_DATA[formData.preferredJobLocation.country as keyof typeof LOCATION_DATA] || [];
  }, [formData.preferredJobLocation?.country]);

  useEffect(() => {
    const loadLookupData = async () => {
      if (!accessToken) return;
      
      setLoadingOptions(true);
      try {
        const { recruiters, statuses } = await fetchLookupData(accessToken);

        setRecruiterOptions(recruiters.map(r => ({ label: r, value: r })));
        setStatusOptions(statuses.map(s => ({ label: s, value: s })));
      } catch (error) {
        console.error("Error loading lookup data:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load dropdown options",
          life: 3000,
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    if (visible) {
      loadLookupData();
    }
  }, [visible, accessToken]);

  // Initialize / Reset form
  useEffect(() => {
    if (isEditMode && selectedResume) {
      setFormData({
        candidateName: selectedResume.candidateName,
        contactNumber: selectedResume.contactNumber,
        email: selectedResume.email,
        recruiterId: selectedResume.recruiterId,
        recruiterName: selectedResume.recruiterName || "",
        jobRole: selectedResume.jobRole,
        preferredJobLocation: selectedResume.preferredJobLocation || { city: '', country: '' },
        currentCTC: selectedResume.currentCTC,
        expectedCTC: selectedResume.expectedCTC,
        noticePeriod: selectedResume.noticePeriod,
        experienceYears: selectedResume.experienceYears,
        statusName: selectedResume.statusName,
        linkedinProfileUrl: selectedResume.linkedinProfileUrl || undefined,
        resumeFile: null,
        notes: selectedResume.notes || undefined,
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
    setSubmitted(false);
  }, [visible, selectedResume, isEditMode]);

  const handleChange = useCallback(
    (field: keyof AddEditCandidate, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleBlur = useCallback(
    (field: keyof AddEditCandidate, currentValue?: any) => {
    },
    []
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
    
    if (!validateForm()) {
      return; 
    }

    try {
      if (isEditMode && selectedResume) {
        const updateData = {
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
          linkedinProfileUrl: formData.linkedinProfileUrl || undefined,
          notes: formData.notes?.trim() || "",
        };

        await updateCandidate(accessToken, selectedResume.candidateId, updateData);

        if (formData.resumeFile) {
          await uploadResume(accessToken, selectedResume.candidateId, formData.resumeFile);
        }

        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Candidate updated successfully!",
          life: 3000,
        });
      } else {
        await createCandidate(accessToken, formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Candidate added successfully!",
          life: 3000,
        });
      }

      onSuccess();
      onHide();
    } catch (err: any) {
      console.error("Error saving candidate:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again.",
        life: 5000,
      });
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

  const shouldShowError = (field: string): string | undefined =>
    submitted ? errors[field] : undefined;

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
    <>
      <Toast ref={toast} />
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
            onBlur={() => handleBlur("candidateName", formData.candidateName)}
            error={shouldShowError("candidateName")}
          />

          <DropdownField
            id="recruiterName"
            label="Recruiter"
            value={formData.recruiterName || ""}
            options={recruiterOptions}
            onChange={(e: { value: string }) => handleChange("recruiterName", e.value)}
            onBlur={() => handleBlur("recruiterName", formData.recruiterName)}
            error={shouldShowError("recruiterName")}
            disabled={loadingOptions}
            placeholder={loadingOptions ? "Loading..." : "Select Recruiter"}
          />

          <InputField
            id="notes"
            label="Notes"
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            onBlur={() => handleBlur("notes", formData.notes)}
            error={shouldShowError("notes")}
            required={false}
          />

          <InputField
            id="contactNumber"
            label="Contact Number"
            value={formData.contactNumber}
            placeholder="e.g. 9876543210"
            onChange={(e) => handleChange("contactNumber", e.target.value)}
            onBlur={() => handleBlur("contactNumber", formData.contactNumber)}
            error={shouldShowError("contactNumber")}
          />

          <InputField
            id="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email", formData.email)}
            error={shouldShowError("email")}
          />

          <InputField
            id="jobRole"
            label="Job Role"
            value={formData.jobRole}
            onChange={(e) => handleChange("jobRole", e.target.value)}
            onBlur={() => handleBlur("jobRole", formData.jobRole)}
            error={shouldShowError("jobRole")}
          />

          {/* Country Dropdown */}
          <div className="field col-12 md:col-6">
            <label htmlFor="country" className="font-bold">Country *</label>
            <Dropdown
              id="country"
              value={formData.preferredJobLocation?.country || null}
              options={AVAILABLE_COUNTRIES.map(country => ({ label: country, value: country }))}
              onChange={(e: { value: string }) => 
                handleChange("preferredJobLocation", { 
                  country: e.value, 
                  city: '' 
                })
              }
              onBlur={() => handleBlur("preferredJobLocation", formData.preferredJobLocation)}
              placeholder="Select Country"
              className={shouldShowError("preferredJobLocation") ? "p-invalid" : ""}
            />
            {shouldShowError("preferredJobLocation") && (
              <small className="p-error">{shouldShowError("preferredJobLocation")}</small>
            )}
          </div>

          {/* City Dropdown */}
          <div className="field col-12 md:col-6">
            <label htmlFor="city" className="font-bold">City *</label>
            <Dropdown
              id="city"
              value={formData.preferredJobLocation?.city || null}
              options={availableCities.map(city => ({ label: city, value: city }))}
              onChange={(e: { value: string }) => 
                handleChange("preferredJobLocation", { 
                  country: formData.preferredJobLocation?.country || '', 
                  city: e.value 
                })
              }
              onBlur={() => handleBlur("preferredJobLocation", formData.preferredJobLocation)}
              placeholder="Select City"
              disabled={!formData.preferredJobLocation?.country || availableCities.length === 0}
              className={shouldShowError("preferredJobLocation") ? "p-invalid" : ""}
            />
            {formData.preferredJobLocation?.country && availableCities.length === 0 && (
              <small className="text-muted">No cities available for selected country</small>
            )}
          </div>

          <InputNumberField
            id="currentCTC"
            label="Current CTC"
            value={formData.currentCTC}
            onChange={(val: number | null) => handleChange("currentCTC", val)}
            onBlur={() => handleBlur("currentCTC", formData.currentCTC)}
            error={shouldShowError("currentCTC")}
          />

          <InputNumberField
            id="expectedCTC"
            label="Expected CTC"
            value={formData.expectedCTC}
            onChange={(val: number | null) => handleChange("expectedCTC", val)}
            onBlur={() => handleBlur("expectedCTC", formData.expectedCTC)}
            error={shouldShowError("expectedCTC")}
          />

          <InputNumberField
            id="noticePeriod"
            label="Notice Period (Days)"
            value={formData.noticePeriod}
            onChange={(val: number | null) => handleChange("noticePeriod", val)}
            onBlur={() => handleBlur("noticePeriod", formData.noticePeriod)}
            error={shouldShowError("noticePeriod")}
          />

          <InputNumberField
            id="experienceYears"
            label="Experience (Years)"
            value={formData.experienceYears}
            onChange={(val: number | null) => handleChange("experienceYears", val)}
            onBlur={() => handleBlur("experienceYears", formData.experienceYears)}
            error={shouldShowError("experienceYears")}
          />

          <DropdownField
            id="statusName"
            label="Status"
            value={formData.statusName}
            options={statusOptions}
            onChange={(e: { value: string }) => handleChange("statusName", e.value)}
            onBlur={() => handleBlur("statusName", formData.statusName)}
            error={shouldShowError("statusName")}
            disabled={loadingOptions}
            placeholder={loadingOptions ? "Loading..." : "Select Status"}
          />

          <InputField
            id="linkedinProfileUrl"
            label="LinkedIn URL"
            value={formData.linkedinProfileUrl || ""}
            onChange={(e) =>
              handleChange("linkedinProfileUrl", e.target.value || undefined)
            }
            onBlur={() => handleBlur("linkedinProfileUrl", formData.linkedinProfileUrl)}
            placeholder="https://www.linkedin.com/in/..."
            error={shouldShowError("linkedinProfileUrl")}
            required={false}
          />

          <FileUploadField
            file={formData.resumeFile}
            onSelect={(file) => handleChange("resumeFile", file)}
            error={shouldShowError("resumeFile")}
          />
        </div>
      </Dialog>
    </>
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
  required?: boolean;
}

const InputField = ({ id, label, value, onChange, onBlur, placeholder, error, required = true }: InputFieldProps) => (
  <div className="field col-12 md:col-6">
    <label htmlFor={id} className="font-bold">
      {label} {required && "*"}
    </label>
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

const DropdownField = ({ 
  id, 
  label, 
  value, 
  options, 
  onChange, 
  onBlur, 
  placeholder, 
  error,
  disabled = false 
}: DropdownFieldProps) => (
  <div className="field col-12 md:col-6">
    <label htmlFor={id} className="font-bold">{label} *</label>
    <Dropdown 
      id={id}
      value={value} 
      options={options} 
      onChange={onChange} 
      onBlur={onBlur} 
      placeholder={placeholder}
      disabled={disabled}
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
    <label className="font-bold">Upload Resume (PDF or DOCX)</label>
    <FileUpload
      mode="basic"
      name="resume"
      accept=".pdf,.docx"
      maxFileSize={5 * 1024 * 1024}
      auto={false}
      customUpload
      onSelect={(e) => e.files[0] && onSelect(e.files[0])}
      chooseLabel="Select File"
      chooseOptions={{
        label: "Upload File",
        className: "p-button-danger p-button-sm",
      }}
      className={error ? "p-invalid" : ""}
    />
    {file && <small className="p-success">File selected: {file.name}</small>}
    {error && <small className="p-error">{error}</small>}
  </div>
);

export default ResumeAddEdit;