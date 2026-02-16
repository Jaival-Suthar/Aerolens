import React, { useState, useEffect, useCallback, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import EditableList from "../util/EditableList";
import { FaCheck, FaTimes } from "react-icons/fa";
import DialogButton from "../../../shared/DialogAddEditButton";
import { JobProfileAddEditProps, AddEditJobProfile } from "../types/jobProfileAddEdit.types";
import { extractPdfText, parseJobProfileFromText } from "../util/pdfParser.util";
import { MultiSelect } from "primereact/multiselect";
import { getTechSpecifications, getJobProfileById } from "../services/jobProfileService";
import { useAuth } from "../../../shared/auth/AuthContext";
import {
  createJobProfile,
  updateJobProfile
} from "../services/jobProfileService";


const INITIAL_FORM = {
  position: "",
  experience: "",
  overview: "",
  techSpecifications: [],
  responsibilities: [] as string[],
  requiredSkills: [] as string[],
  niceToHave: [] as string[],
  jdFile: null
};



const JobProfileAddEdit: React.FC<JobProfileAddEditProps> = ({
  visible,
  onHide,
  selectedJobProfile,
  onSuccess
}) => {
  const isEditMode = Boolean(selectedJobProfile);
  const [formData, setFormData] = useState<AddEditJobProfile>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();

  const [techOptions, setTechOptions] = useState<
    { id: number; label: string }[]
  >([]);

  

  useEffect(() => {
  if (!visible || !accessToken) return;

  const loadTechSpecs = async () => {
    try {
      const res = await getTechSpecifications(accessToken);
      setTechOptions(res.data);
    } catch (err) {
      console.error("Failed to load tech specs", err);
    }
  };

  loadTechSpecs();
}, [visible, accessToken]);

  // Initialize form
 useEffect(() => {
  if (!visible) return;

  // ---------- EDIT MODE ----------
  if (isEditMode && selectedJobProfile && accessToken) {
    (async () => {
      try {
        const res = await getJobProfileById(
          accessToken,
          selectedJobProfile.id
        );

        const profile = res.data;

        // Fill form
        setFormData({
          position: profile.position || "",
          experience: profile.experience || "",
          overview: profile.overview || "",

          responsibilities: Array.isArray(profile.responsibilities)
            ? profile.responsibilities
            : [],

          requiredSkills: Array.isArray(profile.requiredSkills)
            ? profile.requiredSkills
            : [],

          niceToHave: Array.isArray(profile.niceToHave)
            ? profile.niceToHave
            : [],

          techSpecifications: profile.techSpecifications.map(t => t.id),

          jdFile: null
        });


      } catch (err) {
        console.error("Failed to load job profile:", err);
      }
    })();

  // ---------- ADD MODE ----------
  } else {
    setFormData(INITIAL_FORM);
  }

  // Reset validation
  setErrors({});
  setSubmitted(false);

}, [visible, isEditMode, selectedJobProfile, accessToken]);

  const handleChange = useCallback(
    (field: keyof AddEditJobProfile, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleFileUpload = async (file: File) => {
  handleChange("jdFile", file);
  setIsParsing(true);

  try {
    const rawText = await extractPdfText(file);
    const parsed = parseJobProfileFromText(rawText);

    setFormData(prev => ({
  ...prev,

  position: parsed.position,
  experience: parsed.experience,

  overview:
    parsed.overview?.[0]?.content?.[0]?.text || "",

  responsibilities:
    parsed.responsibilities?.content?.map(b => b.text) || [],

  requiredSkills:
    parsed.requiredSkills?.content?.map(b => b.text) || [],

  niceToHave:
    parsed.niceToHave?.content?.map(b => b.text) || []
}));

    toast.current?.show({
      severity: "success",
      summary: "Auto-fill Complete",
      detail: "Job description parsed successfully!",
      life: 3000
    });
  } catch (err) {
    console.error("PDF parsing error:", err);
    toast.current?.show({
      severity: "error",
      summary: "Parse Error",
      detail: "Failed to parse PDF. Please fill manually.",
      life: 3000
    });
  } finally {
    setIsParsing(false);
  }
};

 const validateForm = useCallback(() => {
  const newErrors: Record<string, string> = {};

  // Position
  if (!(formData.position || "").trim()) {
    newErrors.position = "Position is required.";
  }

  // Experience
  if (!(formData.experience || "").trim()) {
    newErrors.experience = "Experience is required.";
  }

  // Overview
  if (!(formData.overview || "").trim()) {
    newErrors.overview = "Job overview is required.";
  }

  // Tech Specs
  if (!Array.isArray(formData.techSpecifications) || !formData.techSpecifications.length) {
    newErrors.techSpecifications = "At least one technology is required.";
  }

  // Required Skills
  if (!Array.isArray(formData.requiredSkills) || !formData.requiredSkills.length) {
    newErrors.requiredSkills = "Required skills are required.";
  }

  // JD (only in Add mode)
  if (!isEditMode && !formData.jdFile) {
    newErrors.jdFile = "Job description is required.";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
}, [formData, isEditMode]);


  const handleSave = useCallback(async () => {
    
  setSubmitted(true);

  if (!validateForm()) return;

  try {
    // ---------- Build FormData ----------
    const fd = new FormData();

fd.append("position", formData.position);
fd.append("experience", formData.experience);

fd.append("overview", formData.overview);

if (formData.responsibilities.length) {
  fd.append(
    "responsibilities",
    formData.responsibilities.join("\n")
  );
}

if (formData.requiredSkills.length) {
  fd.append(
    "requiredSkills",
    formData.requiredSkills.join("\n")
  );
}

if (formData.niceToHave.length) {
  fd.append(
    "niceToHave",
    formData.niceToHave.join("\n")
  );
}

if (formData.techSpecifications.length) {
  fd.append(
    "techSpecifications",
    formData.techSpecifications.join(",")
  );
}

if (formData.jdFile) {
  fd.append("JD", formData.jdFile);
}

        // ---------- API Call ----------
        let res;

        if (isEditMode && selectedJobProfile) {
          res = await updateJobProfile(
            accessToken,
            selectedJobProfile.id,
            fd
          );
        } else {
          res = await createJobProfile(accessToken, fd);
        }

        console.log("✅ API Response:", res);

        // ---------- Success ----------
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: isEditMode
            ? "Job Profile updated successfully!"
            : "Job Profile added successfully!",
          life: 3000
        });

        onSuccess();
        onHide();

      } catch (err: any) {
        console.error("Error saving job profile:", err);

        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: err?.message || "Something went wrong",
          life: 2000
        });
      }
    }, [
      formData,
      accessToken,
      selectedJobProfile,
      isEditMode,
      onHide,
      onSuccess,
      validateForm
    ]);


  const shouldShowError = (field: string): string | undefined =>
    submitted ? errors[field] : undefined;

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <DialogButton label="Cancel" severity="secondary" onClick={onHide} />
      <DialogButton
        label={isEditMode ? "Update Job Profile" : "Add Job Profile"}
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
        header={isEditMode ? "Edit Job Profile" : "Add New Job Profile"}
        onHide={onHide}
        footer={dialogFooter}
        style={{ width: "1200px", maxHeight: "90vh" }}
        modal
        className="p-fluid"
      >
        {/* File Upload */}
          <div className="field col-12">
            <label className="font-bold">
              Upload Job Description (PDF)
              {!isEditMode && <span className="text-red-500"> *</span>}
            </label>

            <div
              onDragOver={e => {
                if (formData.jdFile || isParsing) return;
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={e => {
                if (formData.jdFile || isParsing) return;
                e.preventDefault();
                e.stopPropagation();

                const file = e.dataTransfer.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "8px",
                padding: "1rem",
                textAlign: "center",
                background: "#f8fafc",
                opacity: formData.jdFile || isParsing ? 0.95 : 1
              }}
            >
              {/* No file */}
              {!formData.jdFile && !isParsing && (
                <>
                  <p
                    style={{
                      marginBottom: "0.75rem",
                      color: "#475569",
                      fontSize: "0.875rem"
                    }}
                  >
                    Drag & drop job description here or browse files
                  </p>

                  <FileUpload
                    mode="basic"
                    name="jdFile"
                    accept=".pdf"
                    maxFileSize={5 * 1024 * 1024}
                    auto={false}
                    customUpload
                    uploadHandler={() => {}}
                    chooseLabel="Browse Files"
                    chooseOptions={{
                      label: "Browse Files",
                      className: "p-button-secondary p-button-sm"
                    }}
                    onSelect={e => {
                      const selectedFile = e.files?.[0];
                      if (selectedFile) {
                        handleFileUpload(selectedFile);
                      }
                    }}
                  />
                </>
              )}

              {/* Parsing */}
              {isParsing && (
                <div style={{ padding: "1rem" }}>
                  <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
                  <p style={{ marginTop: "0.5rem", color: "#475569" }}>
                    Parsing job description...
                  </p>
                </div>
              )}

              {/* File selected */}
              {formData.jdFile && !isParsing && (
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
                      {formData.jdFile.name}
                    </strong>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {(formData.jdFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChange("jdFile", null)}
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
              Supported formats: PDF (max 5MB). Upload will auto-fill the form.
            </small>

            {shouldShowError("jdFile") && (
              <small className="p-error">{shouldShowError("jdFile")}</small>
            )}
          </div>
        <div className="formgrid grid">
          {/* Position & Experience */}
          <div className="field col-12 md:col-6">
            <label className="font-bold">
              Position <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.position}
              onChange={e => handleChange("position", e.target.value)}
              placeholder="e.g. Senior Ruby on Rails Developer"
              className={shouldShowError("position") ? "p-invalid" : ""}
            />
            {shouldShowError("position") && (
              <small className="p-error">{shouldShowError("position")}</small>
            )}
          </div>

          <div className="field col-12 md:col-6">
            <label className="font-bold">
              Experience <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.experience}
              onChange={e => handleChange("experience", e.target.value)}
              placeholder="e.g. 6+ Years"
              className={shouldShowError("experience") ? "p-invalid" : ""}
            />
            {shouldShowError("experience") && (
              <small className="p-error">{shouldShowError("experience")}</small>
            )}
          </div>
          {/* Tech Specifications */}
          <div className="field col-12">
            <label className="font-bold">Tech Specifications <span className="text-red-500">*</span></label>

            <MultiSelect
              className={`w-full ${
                shouldShowError("techSpecifications") ? "p-invalid" : ""
              }`}
              value={formData.techSpecifications}
              options={techOptions}
              optionLabel="label"
              optionValue="id"
              placeholder="Select technologies"
              display="chip"
              filter
              onChange={e =>
                handleChange("techSpecifications", e.value)
              }
            />
            {shouldShowError("techSpecifications") && (
              <small className="p-error">
                {shouldShowError("techSpecifications")}
              </small>
            )}
          </div>

          {/* Job Overview */}
          <div className="field col-12">
            <label className="font-bold">Job Overview <span className="text-red-500">*</span></label>
            <InputTextarea
              className={shouldShowError("overview") ? "p-invalid" : ""}
              value={formData.overview}
              onChange={e =>
                handleChange("overview", e.target.value)
              }
              rows={5}
              placeholder="Brief description of the role..."
              style={{ maxHeight: "180px", overflow: "auto" }}
            />
            {shouldShowError("overview") && (
              <small className="p-error">{shouldShowError("overview")}</small>
            )}
          </div>

          {/* Key Responsibilities - WITH SCROLLABLE CONTAINER */}
          <div className="field col-12">
            <label className="font-bold">Key Responsibilities</label>
            <EditableList
              items={formData.responsibilities}
              onChange={v => handleChange("responsibilities", v)}
              placeholder="Enter a responsibility and press Enter or click Add"
              label="Responsibilities"
            />
          </div>

          {/* Required Skills - WITH SCROLLABLE CONTAINER */}
          <div className="field col-12">
            <label className="font-bold">Required Skills & Experience <span className="text-red-500">*</span></label>
            <EditableList
              items={formData.requiredSkills}
              onChange={v => handleChange("requiredSkills", v)}
              placeholder="Enter a skill/requirement and press Enter or click Add"
              label="Skills"
            />
            {shouldShowError("requiredSkills") && (
              <small className="p-error block mt-1">
                {shouldShowError("requiredSkills")}
              </small>
            )}
          </div>

          {/* Nice to Have */}
          <div className="field col-12">
            <label className="font-bold">Nice to Have</label>
            <EditableList
              items={formData.niceToHave}
              onChange={v => handleChange("niceToHave", v)}
              placeholder="Enter a nice-to-have skill and press Enter or click Add"
              label="Nice-to-have items"
            />
          </div>

          
        </div>
      </Dialog>
    </>
  );
};

export default JobProfileAddEdit;