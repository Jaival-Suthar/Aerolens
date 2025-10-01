import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { InputNumber } from "primereact/inputnumber";
import { ResumeAddEditProps, AddEditCandidate } from "../types/resumeTypes";
import { createCandidate, updateCandidate, uploadResume } from "../services/useResume";

const statusOptions = [
  { label: "Selected", value: "Selected" },
  { label: "Rejected", value: "Rejected" },
  { label: "Interview Pending", value: "Interview Pending" },
];
const recruitorsOptions = [
  { label: "Jayraj", value: "Jayraj" },
  { label: "Khushi", value: "Khushi" },
  { label: "Yash", value: "Yash" },
];
const locationOptions = [
  { label: "Ahmedabad", value: "Ahmedabad" },
  { label: "Bangalore", value: "Bangalore" },
  { label: "San Francisco", value: "San Francisco" },
];

const ResumeAddEdit: React.FC<ResumeAddEditProps> = ({
  visible,
  onHide,
  selectedResume,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<AddEditCandidate>({
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
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const isEditMode = selectedResume !== null;

  useEffect(() => {
    if (isEditMode) {
      setFormData({ ...selectedResume, resumeFile: null });
    } else {
      setFormData({
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
      });
    }
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }, [selectedResume, visible, isEditMode]);

  const handleChange = (field: keyof AddEditCandidate, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof AddEditCandidate) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof AddEditCandidate) => {
    const newErrors: { [key: string]: string } = { ...errors };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Updated regex for Indian (10 digits) and American (10 digits) phone numbers
    // Supports formats: 1234567890, +911234567890, +11234567890
    const phoneRegex = /^(\+?91|91)?[6-9]\d{9}$|^(\+?1)?[2-9]\d{9}$/;
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/.*$/i;

    switch (field) {
      case "candidateName":
        if (!formData.candidateName.trim()) {
          newErrors.candidateName = "Candidate name is required.";
        } else {
          delete newErrors.candidateName;
        }
        break;
      
      case "recruiterName":
        if (!formData.recruiterName) {
          newErrors.recruiterName = "Recruiter is required.";
        } else {
          delete newErrors.recruiterName;
        }
        break;

      case "contactNumber":
        if (!formData.contactNumber) {
          newErrors.contactNumber = "Contact number is required.";
        } else if (!phoneRegex.test(formData.contactNumber.replace(/[\s-]/g, ""))) {
          newErrors.contactNumber = "Enter a valid Indian (10 digits starting with 6-9) or American (10 digits) phone number.";
        } else {
          delete newErrors.contactNumber;
        }
        break;

      case "email":
        if (!formData.email) {
          newErrors.email = "Email is required.";
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = "Enter a valid email address.";
        } else {
          delete newErrors.email;
        }
        break;

      case "jobRole":
        if (!formData.jobRole.trim()) {
          newErrors.jobRole = "Job role is required.";
        } else {
          delete newErrors.jobRole;
        }
        break;

      case "preferredJobLocation":
        if (!formData.preferredJobLocation) {
          newErrors.preferredJobLocation = "Location is required.";
        } else {
          delete newErrors.preferredJobLocation;
        }
        break;

      case "currentCTC":
        if (!formData.currentCTC || formData.currentCTC <= 0) {
          newErrors.currentCTC = "Current CTC is required and must be greater than 0.";
        } else {
          delete newErrors.currentCTC;
        }
        break;

      case "expectedCTC":
        if (!formData.expectedCTC || formData.expectedCTC <= 0) {
          newErrors.expectedCTC = "Expected CTC is required and must be greater than 0.";
        } else {
          delete newErrors.expectedCTC;
        }
        break;

      case "noticePeriod":
        if (formData.noticePeriod === null || formData.noticePeriod === undefined || formData.noticePeriod < 0) {
          newErrors.noticePeriod = "Notice period is required.";
        } else {
          delete newErrors.noticePeriod;
        }
        break;

      case "experienceYears":
        if (formData.experienceYears === null || formData.experienceYears === undefined || formData.experienceYears < 0) {
          newErrors.experienceYears = "Experience is required.";
        } else {
          delete newErrors.experienceYears;
        }
        break;

      case "statusName":
        if (!formData.statusName) {
          newErrors.statusName = "Status is required.";
        } else {
          delete newErrors.statusName;
        }
        break;

      case "linkedinProfileUrl":
        if (!formData.linkedinProfileUrl) {
          newErrors.linkedinProfileUrl = "LinkedIn URL is required.";
        } else if (!linkedinRegex.test(formData.linkedinProfileUrl)) {
          newErrors.linkedinProfileUrl = "Enter a valid LinkedIn profile URL.";
        } else {
          delete newErrors.linkedinProfileUrl;
        }
        break;

      case "resumeFile":
        if (formData.resumeFile) {
          if (!formData.resumeFile.name.toLowerCase().endsWith(".pdf")) {
            newErrors.resumeFile = "Only PDF files are allowed.";
          } else if (formData.resumeFile.size > 5 * 1024 * 1024) {
            newErrors.resumeFile = "File must be less than 5MB.";
          } else {
            delete newErrors.resumeFile;
          }
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = async () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+?91|91)?[6-9]\d{9}$|^(\+?1)?[2-9]\d{9}$/;
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/.*$/i;

    if (!formData.candidateName.trim()) newErrors.candidateName = "Candidate name is required.";
    if (!formData.recruiterName) newErrors.recruiterName = "Recruiter is required.";

    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact number is required.";
    } else if (!phoneRegex.test(formData.contactNumber.replace(/[\s-]/g, ""))) {
      newErrors.contactNumber = "Enter a valid Indian (10 digits starting with 6-9) or American (10 digits) phone number.";
    }

    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.jobRole.trim()) newErrors.jobRole = "Job role is required.";
    if (!formData.preferredJobLocation) newErrors.preferredJobLocation = "Location is required.";
    
    if (!formData.currentCTC || formData.currentCTC <= 0) {
      newErrors.currentCTC = "Current CTC is required and must be greater than 0.";
    }
    if (!formData.expectedCTC || formData.expectedCTC <= 0) {
      newErrors.expectedCTC = "Expected CTC is required and must be greater than 0.";
    }
    if (formData.noticePeriod === null || formData.noticePeriod === undefined || formData.noticePeriod < 0) {
      newErrors.noticePeriod = "Notice period is required.";
    }
    if (formData.experienceYears === null || formData.experienceYears === undefined || formData.experienceYears < 0) {
      newErrors.experienceYears = "Experience is required.";
    }
    if (!formData.statusName) newErrors.statusName = "Status is required.";

    if (!formData.linkedinProfileUrl) {
      newErrors.linkedinProfileUrl = "LinkedIn URL is required.";
    } else if (!linkedinRegex.test(formData.linkedinProfileUrl)) {
      newErrors.linkedinProfileUrl = "Enter a valid LinkedIn profile URL.";
    }

    if (formData.resumeFile) {
      if (!formData.resumeFile.name.toLowerCase().endsWith(".pdf")) {
        newErrors.resumeFile = "Only PDF files are allowed.";
      } else if (formData.resumeFile.size > 5 * 1024 * 1024) {
        newErrors.resumeFile = "File must be less than 5MB.";
      }
    }

    // Simulated duplicate check (backend should also validate)
    if (formData.email === "duplicate@example.com") {
      newErrors.email = "This email already exists.";
    }
    if (formData.contactNumber === "9999999999") {
      newErrors.contactNumber = "This contact number already exists.";
    }

    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched: { [key: string]: boolean } = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setSubmitted(true);
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      if (isEditMode && selectedResume) {
        const { resumeFile, ...updateData } = formData;
      
        // ✅ Do NOT include resume in payload (backend update should only handle text fields)
        await updateCandidate(selectedResume.candidateId, updateData);
      
        // ✅ Upload file only if user selected one
        if (resumeFile) {
          await uploadResume(selectedResume.candidateId, resumeFile);
        }
      } else {
        // For new candidate, pass full formData including resumeFile
        await createCandidate(formData);
      }
      

      onSuccess();
      onHide();
    } catch (error) {
      console.error("Error saving candidate:", error);
    } finally {
      setSubmitted(false);
    }
  };

  const handleCancel = () => {
    setSubmitted(false);
    setErrors({});
    setTouched({});
    onHide();
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancel" icon="pi pi-times" outlined onClick={handleCancel} />
      <Button
        label={isEditMode ? "Update" : "Save"}
        icon={isEditMode ? "pi pi-check" : "pi pi-plus"}
        onClick={handleSave}
      />
    </div>
  );

  const shouldShowError = (field: string) => {
    return (touched[field] || submitted) && errors[field];
  };

  return (
    <Dialog
      visible={visible}
      onHide={handleCancel}
      header={isEditMode ? "Edit Resume" : "Add New Resume"}
      footer={dialogFooter}
      style={{ width: "900px", maxHeight: "90vh" }}
      modal
      className="p-fluid"
    >
      <div className="formgrid grid">
        {/* Candidate Name */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Candidate Name *</label>
          <InputText
            value={formData.candidateName}
            onChange={(e) => handleChange("candidateName", e.target.value)}
            onBlur={() => handleBlur("candidateName")}
            className={shouldShowError("candidateName") ? "p-invalid" : ""}
          />
          {shouldShowError("candidateName") && <small className="p-error">{errors.candidateName}</small>}
        </div>

        {/* Recruiter */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Recruiter *</label>
          <Dropdown
            value={formData.recruiterName}
            options={recruitorsOptions}
            onChange={(e) => handleChange("recruiterName", e.value)}
            onBlur={() => handleBlur("recruiterName")}
            placeholder="Select Recruiter"
            className={shouldShowError("recruiterName") ? "p-invalid" : ""}
          />
          {shouldShowError("recruiterName") && <small className="p-error">{errors.recruiterName}</small>}
        </div>

        {/* Contact Number */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Contact Number *</label>
          <InputText
            value={formData.contactNumber}
            onChange={(e) => handleChange("contactNumber", e.target.value)}
            onBlur={() => handleBlur("contactNumber")}
            placeholder="e.g., 9876543210 or 2125551234"
            className={shouldShowError("contactNumber") ? "p-invalid" : ""}
          />
          {shouldShowError("contactNumber") && <small className="p-error">{errors.contactNumber}</small>}
        </div>

        {/* Email */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Email *</label>
          <InputText
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={shouldShowError("email") ? "p-invalid" : ""}
          />
          {shouldShowError("email") && <small className="p-error">{errors.email}</small>}
        </div>

        {/* Job Role */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Job Role *</label>
          <InputText
            value={formData.jobRole}
            onChange={(e) => handleChange("jobRole", e.target.value)}
            onBlur={() => handleBlur("jobRole")}
            className={shouldShowError("jobRole") ? "p-invalid" : ""}
          />
          {shouldShowError("jobRole") && <small className="p-error">{errors.jobRole}</small>}
        </div>

        {/* Preferred Job Location */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Preferred Job Location *</label>
          <Dropdown
            value={formData.preferredJobLocation}
            options={locationOptions}
            onChange={(e) => handleChange("preferredJobLocation", e.value)}
            onBlur={() => handleBlur("preferredJobLocation")}
            placeholder="Select Location"
            className={shouldShowError("preferredJobLocation") ? "p-invalid" : ""}
          />
          {shouldShowError("preferredJobLocation") && <small className="p-error">{errors.preferredJobLocation}</small>}
        </div>

        {/* Current CTC */}
<div className="field col-12 md:col-6">
  <label className="font-bold">Current CTC *</label>
  <InputNumber
    value={formData.currentCTC}
    onChange={(e) => handleChange("currentCTC", Number(e.value))}
    onBlur={() => handleBlur("currentCTC")}
    className={shouldShowError("currentCTC") ? "p-invalid" : ""}
    prefix={formData.preferredJobLocation === "San Francisco" ? "$" : "₹"}
  />
  {shouldShowError("currentCTC") && <small className="p-error">{errors.currentCTC}</small>}
</div>

{/* Expected CTC */}
<div className="field col-12 md:col-6">
  <label className="font-bold">Expected CTC *</label>
  <InputNumber
    value={formData.expectedCTC}
    onChange={(e) => handleChange("expectedCTC", Number(e.value))}
    onBlur={() => handleBlur("expectedCTC")}
    className={shouldShowError("expectedCTC") ? "p-invalid" : ""}
    prefix={formData.preferredJobLocation === "San Francisco" ? "$" : "₹"}
  />
  {shouldShowError("expectedCTC") && <small className="p-error">{errors.expectedCTC}</small>}
</div>

        {/* Notice Period */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Notice Period (Days) *</label>
          <InputNumber
            value={formData.noticePeriod}
            onChange={(e) => handleChange("noticePeriod", Number(e.value))}
            onBlur={() => handleBlur("noticePeriod")}
            min={0}
            className={shouldShowError("noticePeriod") ? "p-invalid" : ""}
          />
          {shouldShowError("noticePeriod") && <small className="p-error">{errors.noticePeriod}</small>}
        </div>

        {/* Experience */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Experience (Years) *</label>
          <InputNumber
            value={formData.experienceYears}
            onChange={(e) => handleChange("experienceYears", Number(e.value))}
            onBlur={() => handleBlur("experienceYears")}
            min={0}
            className={shouldShowError("experienceYears") ? "p-invalid" : ""}
          />
          {shouldShowError("experienceYears") && <small className="p-error">{errors.experienceYears}</small>}
        </div>

        {/* Status */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Status *</label>
          <Dropdown
            value={formData.statusName}
            options={statusOptions}
            onChange={(e) => handleChange("statusName", e.value)}
            onBlur={() => handleBlur("statusName")}
            placeholder="Select Status"
            className={shouldShowError("statusName") ? "p-invalid" : ""}
          />
          {shouldShowError("statusName") && <small className="p-error">{errors.statusName}</small>}
        </div>

        {/* LinkedIn URL */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">LinkedIn Profile URL *</label>
          <InputText
            value={formData.linkedinProfileUrl}
            onChange={(e) => handleChange("linkedinProfileUrl", e.target.value)}
            onBlur={() => handleBlur("linkedinProfileUrl")}
            placeholder="https://www.linkedin.com/in/..."
            className={shouldShowError("linkedinProfileUrl") ? "p-invalid" : ""}
          />
          {shouldShowError("linkedinProfileUrl") && <small className="p-error">{errors.linkedinProfileUrl}</small>}
        </div>

        {/* Resume Upload */}
        <div className="field col-12 md:col-6">
          <label className="font-bold">Upload Resume (PDF Only)</label>
          <FileUpload
            mode="basic"
            name="resume"
            accept=".pdf"
            maxFileSize={5 * 1024 * 1024}
            auto={false}
            customUpload
            onSelect={(e) => {
              if (e.files && e.files.length > 0) {
                setFormData((prev) => ({
                  ...prev,
                  resumeFile: e.files[0],
                }));
                validateField("resumeFile");
              }
            }}
            chooseLabel="Select File"
            chooseOptions={{
              icon: "pi pi-file-pdf",
              label: "Upload PDF",
              className: "p-button-danger p-button-sm",
            }}
            className={shouldShowError("resumeFile") ? "p-invalid" : ""}
          />
          {formData.resumeFile && (
            <small className="p-success">File selected: {formData.resumeFile.name}</small>
          )}
          {shouldShowError("resumeFile") && <small className="p-error">{errors.resumeFile}</small>}
        </div>
      </div>
    </Dialog>
  );
};

export default ResumeAddEdit;