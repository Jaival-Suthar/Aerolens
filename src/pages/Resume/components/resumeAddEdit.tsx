import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Toast } from "primereact/toast";
import DialogButton from "../../../shared/DialogAddEditButton";
import {
  createCandidate,
  updateCandidate,
  uploadResume,
  fetchCandidateCreateData,
} from "../services/useResume";
import { ResumeAddEditProps, AddEditCandidate, CandidateCreateData } from "../types/resumeTypes";
import { useAuth } from "../../../shared/auth/AuthContext";

interface DropdownFieldProps {
  id: string;
  label: string;
  value: any;
  options: { label: string; value: any }[];
  onChange: (e: { value: any }) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  colSize?: string;
  required?: boolean;
}

// ---------- HELPERS ----------
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?91|91)?[6-9]\d{9}$|^(\+?1)?[2-9]\d{9}$/;
const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;

const INITIAL_FORM: AddEditCandidate = {
  candidateName: "",
  contactNumber: undefined,
  email: undefined,
  recruiterId: null,
  recruiterName: null,
  jobRole: "",
  preferredJobLocation: { city: '', country: '' },
  currentCTC: undefined,
  expectedCTC: undefined,
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
      if (!value) return ""; // OPTIONAL
      if (!phoneRegex.test(value.replace(/[\s-]/g, "")))
        return "Enter a valid Indian or US phone number.";
      return "";
    case "email":
      if (!value) return ""; // OPTIONAL
      if (!emailRegex.test(value)) return "Enter a valid email.";
      return "";
    case "jobRole":
      return value.trim() ? "" : "Job role is required.";
    case "preferredJobLocation":
      if (!value || !value.country) return "Country is required.";
      if (!value.city) return "City is required.";
      return "";
    case "currentCTC":
      if (value === undefined || value === null) return "";
      return value > 0 ? "" : "Current CTC must be greater than 0.";
    case "expectedCTC":
      if (value === undefined || value === null) return "";
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
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef<Toast>(null);
  
  const [createData, setCreateData] = useState<CandidateCreateData | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Prepare dropdown options from create-data
  const recruiterOptions = useMemo(() => {
    if (!createData?.recruiters) return [];
    return createData.recruiters.map(r => ({ 
      label: r.recruiterName, 
      value: r.recruiterId 
    }));
  }, [createData?.recruiters]);

  const statusOptions = useMemo(() => {
    if (!createData?.status) return [];
    return createData.status.map(s => ({ 
      label: s.statusName, 
      value: s.statusId 
    }));
  }, [createData?.status]);

  // Group locations by country
  const locationsByCountry = useMemo(() => {
    if (!createData?.locations) return {};
    
    const grouped: Record<string, typeof createData.locations> = {};
    createData.locations.forEach(loc => {
      if (!grouped[loc.country]) {
        grouped[loc.country] = [];
      }
      grouped[loc.country].push(loc);
    });
    return grouped;
  }, [createData?.locations]);

  const countryOptions = useMemo(() => {
    return Object.keys(locationsByCountry).map(country => ({
      label: country,
      value: country
    }));
  }, [locationsByCountry]);

  const cityOptions = useMemo(() => {
    const country = formData.preferredJobLocation?.country;
    if (!country || !locationsByCountry[country]) return [];
    
    return locationsByCountry[country].map(loc => ({
      label: loc.city,
      value: loc.locationId
    }));
  }, [formData.preferredJobLocation?.country, locationsByCountry]);

  // Load create-data on dialog open
  useEffect(() => {
    const loadCreateData = async () => {
      if (!accessToken) return;
      
      setLoadingOptions(true);
      try {
        const data = await fetchCandidateCreateData(accessToken);
        setCreateData(data);
      } catch (error) {
        console.error("Error loading create data:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load form options",
          life: 3000,
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    if (visible) {
      loadCreateData();
    }
  }, [visible, accessToken]);

  // Initialize / Reset form
  useEffect(() => {
    if (isEditMode && selectedResume) {
      // Find the locationId from the selected resume's location
      let locationId: number | undefined;
      if (selectedResume.preferredJobLocation && createData?.locations) {
        const matchingLocation = createData.locations.find(
          loc => loc.city === selectedResume.preferredJobLocation?.city && 
                 loc.country === selectedResume.preferredJobLocation?.country
        );
        locationId = matchingLocation?.locationId;
      }

      setFormData({
        candidateName: selectedResume.candidateName,
        contactNumber: selectedResume.contactNumber ?? undefined,
        email: selectedResume.email ?? undefined,
        recruiterId: selectedResume.recruiterId,
        recruiterName: selectedResume.recruiterName,
        jobRole: selectedResume.jobRole,
        preferredJobLocation: selectedResume.preferredJobLocation || { city: '', country: '' },
        currentCTC: selectedResume.currentCTC ?? undefined,
        expectedCTC: selectedResume.expectedCTC ?? undefined,
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
  }, [visible, selectedResume, isEditMode, createData]);

  const handleChange = useCallback(
  (field: keyof AddEditCandidate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  },
  [errors]
);


  const handleBlur = useCallback(
    (field: keyof AddEditCandidate) => {
      // Optional: validate on blur if needed
    },
    []
  );

  const handleBackendErrors = (error: any) => {
  // Case 1: backend validationErrors array (current backend)
  if (Array.isArray(error?.details?.validationErrors)) {
    const fieldErrors: Record<string, string> = {};

    error.details.validationErrors.forEach((err: any) => {
      if (err.field && err.message) {
        fieldErrors[err.field] = err.message;
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
  }

  // Case 2: single-field backend error (future-proof)
  if (error?.details?.field && error?.message) {
    setErrors({
      [error.details.field]: error.message,
    });
    return;
  }

  // Case 3: already-normalized error object
  if (error?.details?.errors) {
    setErrors(error.details.errors);
    return;
  }

  // Case 4: fallback (non-validation error)
  toast.current?.show({
    severity: "error",
    summary: "Error",
    detail: error?.message || "Something went wrong",
    life: 2000,
  });
};


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
          recruiterId: formData.recruiterId,
          recruiterName: formData.recruiterName,
          jobRole: formData.jobRole,
          preferredJobLocation: formData.preferredJobLocation,
          noticePeriod: formData.noticePeriod,
          experienceYears: formData.experienceYears,
          statusName: formData.statusName,
          ...(formData.contactNumber && { contactNumber: formData.contactNumber }),
          ...(formData.email && { email: formData.email }),
          ...(typeof formData.currentCTC === "number" && { currentCTC: formData.currentCTC }),
          ...(typeof formData.expectedCTC === "number" && { expectedCTC: formData.expectedCTC }),
          ...(formData.linkedinProfileUrl && { linkedinProfileUrl: formData.linkedinProfileUrl }),
          ...(formData.notes && { notes: formData.notes }),
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
      handleBackendErrors(err);
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
        style={{ width: "1200px", maxHeight: "90vh" }}
        modal
        className="p-fluid"
      >
        <div className="formgrid grid">
          {/* Column 1 */}
          <InputField
            id="candidateName"
            label="Candidate Name"
            value={formData.candidateName}
            onChange={(e) => handleChange("candidateName", e.target.value)}
            onBlur={() => handleBlur("candidateName")}
            error={shouldShowError("candidateName")}
            colSize="col-12 md:col-4"
          />

          <InputField
            id="contactNumber"
            label="Contact Number"
            value={formData.contactNumber}
            placeholder="e.g. 9876543210"
            onChange={(e) => handleChange("contactNumber", e.target.value)}
            onBlur={() => handleBlur("contactNumber")}
            error={shouldShowError("contactNumber")}
            colSize="col-12 md:col-4"
            required={false}
          />

          <InputField
            id="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            error={shouldShowError("email")}
            colSize="col-12 md:col-4"
            required={false}
          />

          <InputField
            id="jobRole"
            label="Job Role"
            value={formData.jobRole}
            onChange={(e) => handleChange("jobRole", e.target.value)}
            onBlur={() => handleBlur("jobRole")}
            error={shouldShowError("jobRole")}
            colSize="col-12 md:col-4"
          />

          <InputNumberField
            id="experienceYears"
            label="Experience (Years)"
            value={formData.experienceYears}
            onChange={(val: number | null) => handleChange("experienceYears", val)}
            onBlur={() => handleBlur("experienceYears")}
            error={shouldShowError("experienceYears")}
            colSize="col-12 md:col-4"
          />

          {/* Column 2 */}
          <DropdownField
            id="recruiterId"
            label="Recruiter"
            value={formData.recruiterId}
            options={recruiterOptions}
            onChange={(e: { value: number }) => {
              const recruiter = createData?.recruiters.find(r => r.recruiterId === e.value);
              handleChange("recruiterId", e.value);
              handleChange("recruiterName", recruiter?.recruiterName || null);
            }}
            onBlur={() => handleBlur("recruiterName")}
            error={shouldShowError("recruiterName")}
            disabled={loadingOptions}
            placeholder={loadingOptions ? "Loading..." : "Select Recruiter"}
            colSize="col-12 md:col-4"
          />

          {/* Country Dropdown */}
          <div className="field col-12 md:col-4">
            <label htmlFor="country" className="font-bold">Country *</label>
            <Dropdown
              id="country"
              value={formData.preferredJobLocation?.country || null}
              options={countryOptions}
              onChange={(e: { value: string }) => 
                handleChange("preferredJobLocation", { 
                  country: e.value, 
                  city: '' 
                })
              }
              onBlur={() => handleBlur("preferredJobLocation")}
              placeholder="Select Country"
              disabled={loadingOptions}
              className={shouldShowError("preferredJobLocation") ? "p-invalid" : ""}
            />
            {shouldShowError("preferredJobLocation") && (
              <small className="p-error">{shouldShowError("preferredJobLocation")}</small>
            )}
          </div>

          {/* City Dropdown */}
          <div className="field col-12 md:col-4">
            <label htmlFor="city" className="font-bold">City *</label>
            <Dropdown
              id="city"
              value={
                formData.preferredJobLocation?.city && createData?.locations 
                  ? createData.locations.find(
                      loc => loc.city === formData.preferredJobLocation?.city && 
                             loc.country === formData.preferredJobLocation?.country
                    )?.locationId 
                  : null
              }
              options={cityOptions}
              onChange={(e: { value: number }) => {
                const location = createData?.locations.find(loc => loc.locationId === e.value);
                if (location) {
                  handleChange("preferredJobLocation", { 
                    country: location.country, 
                    city: location.city 
                  });
                }
              }}
              onBlur={() => handleBlur("preferredJobLocation")}
              placeholder="Select City"
              disabled={!formData.preferredJobLocation?.country || cityOptions.length === 0 || loadingOptions}
              className={shouldShowError("preferredJobLocation") ? "p-invalid" : ""}
            />
            {formData.preferredJobLocation?.country && cityOptions.length === 0 && (
              <small className="text-muted">No cities available for selected country</small>
            )}
          </div>

          <InputNumberField
            id="noticePeriod"
            label="Notice Period (Days)"
            value={formData.noticePeriod}
            onChange={(val: number | null) => handleChange("noticePeriod", val)}
            onBlur={() => handleBlur("noticePeriod")}
            error={shouldShowError("noticePeriod")}
            colSize="col-12 md:col-4"
          />

          {/* Column 3 */}
          <InputNumberField
            id="currentCTC"
            label="Current CTC"
            value={formData.currentCTC}
            onChange={(val: number | null) => handleChange("currentCTC", val)}
            onBlur={() => handleBlur("currentCTC")}
            error={shouldShowError("currentCTC")}
            colSize="col-12 md:col-4"
            required={false}
          />

          <InputNumberField
            id="expectedCTC"
            label="Expected CTC"
            value={formData.expectedCTC}
            onChange={(val: number | null) => handleChange("expectedCTC", val)}
            onBlur={() => handleBlur("expectedCTC")}
            error={shouldShowError("expectedCTC")}
            colSize="col-12 md:col-4"
            required={false}
          />

          <DropdownField
            id="statusName"
            label="Status"
            value={
              createData?.status.find(
                s => s.statusName === formData.statusName
              )?.statusId || null
            }
            options={statusOptions}
            onChange={(e: { value: number }) => {
              const status = createData?.status.find(
                s => s.statusId === e.value
              );
              handleChange("statusName", status?.statusName || "");
            }}
            onBlur={() => handleBlur("statusName")}
            error={shouldShowError("statusName")}
            disabled={loadingOptions}
            placeholder={loadingOptions ? "Loading..." : "Select Status"}
            colSize="col-12 md:col-4"
          />

          <InputField
            id="linkedinProfileUrl"
            label="LinkedIn URL"
            value={formData.linkedinProfileUrl || ""}
            onChange={(e) =>
              handleChange("linkedinProfileUrl", e.target.value || undefined)
            }
            onBlur={() => handleBlur("linkedinProfileUrl")}
            placeholder="https://www.linkedin.com/in/..."
            error={shouldShowError("linkedinProfileUrl")}
            required={false}
            colSize="col-12 md:col-6"
          />
          <InputField
            id="notes"
            label="Notes"
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            onBlur={() => handleBlur("notes")}
            error={shouldShowError("notes")}
            required={false}
            colSize="col-12"
          />
          {/* Full Width Bottom Section */}
          <div className="field col-12">
            <label className="font-bold">
              Upload Resume (PDF / DOCX)
            </label>

            <div
              onDragOver={(e) => {
                if (formData.resumeFile) return;
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                if (formData.resumeFile) return;
                e.preventDefault();
                e.stopPropagation();

                const file = e.dataTransfer.files?.[0];
                if (file) {
                  handleChange("resumeFile", file);
                }
              }}
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "8px",
                padding: "1rem",
                textAlign: "center",
                background: "#f8fafc",
                opacity: formData.resumeFile ? 0.95 : 1
              }}
            >

              {/* CASE A: No file */}
              {!formData.resumeFile && (
                <>
                  <p style={{ marginBottom: "0.75rem", color: "#475569", fontSize: "0.875rem" }}>
                    Drag & drop resume here or browse files
                  </p>

                  <FileUpload
                    mode="basic"
                    name="resume"
                    accept=".pdf,.docx"
                    maxFileSize={5 * 1024 * 1024}
                    auto={false}
                    customUpload
                    uploadHandler={() => {}}
                    chooseLabel="Browse Files"
                    chooseOptions={{
                      label: "Browse Files",
                      className: "p-button-secondary p-button-sm",
                    }}
                    onSelect={(e) => {
                      const selectedFile = e.files?.[0];
                      if (selectedFile) {
                        handleChange("resumeFile", selectedFile);
                      }
                    }}
                  />
                </>
              )}

              {/* CASE B: File selected */}
              {formData.resumeFile && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "6px",
                    padding: "0.75rem 1rem"
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ color: "#0f172a" }}>
                      {formData.resumeFile.name}
                    </strong>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChange("resumeFile", null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fee2e2",
                      border: "1px solid #fecaca",
                      borderRadius: "999px",
                      width: "36px",
                      height: "36px",
                      cursor: "pointer"
                    }}
                    title="Remove file"
                  >
                    <FaTimes style={{ color: "#b91c1c", fontSize: "16px" }} />
                  </button>
                </div>
              )}
            </div>

            <small className="text-muted block mt-1">
              Supported formats: PDF, DOCX (max 5MB)
            </small>

            {shouldShowError("resumeFile") && (
              <small className="p-error">{shouldShowError("resumeFile")}</small>
            )}
          </div>
          
        </div>
      </Dialog>
    </>
  );
};

// ---------- REUSABLE FIELD COMPONENTS ----------
interface InputFieldProps {
  id: string;
  label: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  colSize?: string;
}

const InputField = ({ id, label, value, onChange, onBlur, placeholder, error, required = true, colSize = "col-12 md:col-6" }: InputFieldProps) => (
  <div className={`field ${colSize}`}>
    <label htmlFor={id} className="font-bold">
      {label} {required && "*"}
    </label>
    <InputText 
      id={id}
      value={value ?? ""}
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
  disabled = false,
  required = true,
  colSize = "col-12 md:col-6"
}: DropdownFieldProps) => (
  <div className={`field ${colSize}`}>
    <label htmlFor={id} className="font-bold">{label} {required && "*"}</label>
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

interface InputNumberFieldProps {
  id: string;
  label: string;
  value?: number | null;
  onChange: (val: number | null) => void;
  onBlur: () => void;
  prefix?: string;
  error?: string;
  colSize?: string;
  required?: boolean;
}

const InputNumberField = ({ id, label, value, onChange, onBlur, prefix, error, required=true, colSize = "col-12 md:col-6" }: InputNumberFieldProps) => (
  <div className={`field ${colSize}`}>
    <label htmlFor={id} className="font-bold">{label} {required && "*"}</label>
    <InputNumber 
      id={id}
      value={value ?? null}
      onValueChange={(e) => onChange(e.value ?? null)} 
      onBlur={onBlur} 
      prefix={prefix} 
      className={error ? "p-invalid" : ""} 
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);

export default ResumeAddEdit;