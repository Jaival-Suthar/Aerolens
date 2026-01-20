import React, { useState, useEffect, useCallback, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { Chips } from "primereact/chips";
import { FaCheck, FaTimes } from "react-icons/fa";
import DialogButton from "../../../shared/DialogAddEditButton";
import { JobProfileAddEditProps, AddEditJobProfile } from "../types/jobProfileAddEdit.types";
import { extractPdfText, parseJobProfileFromText } from "../util/pdfParser.util";
import { convertToRichSections } from "../util/richSectionConverter.util";

const INITIAL_FORM: AddEditJobProfile = {
  position: "",
  experience: "",
  overview: [],
  responsibilities: undefined,
  requiredSkills: undefined,
  niceToHave: undefined,
  jdFile: null
};

// Validation
const validateField = (field: keyof AddEditJobProfile, value: any) => {
  switch (field) {
    case "position":
      return value.trim() ? "" : "Position is required.";
    case "experience":
      return value.trim() ? "" : "Experience is required.";
    case "jdFile":
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

  // Simple string arrays for editable UI
  const [responsibilitiesArray, setResponsibilitiesArray] = useState<string[]>([]);
  const [skillsArray, setSkillsArray] = useState<string[]>([]);
  const [niceToHaveArray, setNiceToHaveArray] = useState<string[]>([]);
  const [overviewText, setOverviewText] = useState("");

  // Initialize form
  useEffect(() => {
    if (visible) {
      if (isEditMode && selectedJobProfile) {
        // Edit mode
        setFormData({
          position: selectedJobProfile.position,
          experience: selectedJobProfile.experience,
          overview: selectedJobProfile.overview,
          responsibilities: selectedJobProfile.responsibilities,
          requiredSkills: selectedJobProfile.requiredSkills,
          niceToHave: selectedJobProfile.niceToHave,
          jdFile: null
        });

        // Populate editable arrays
        setOverviewText(
          selectedJobProfile.overview?.[0]?.type === "paragraph"
            ? selectedJobProfile.overview[0].content[0]?.text || ""
            : ""
        );

        setResponsibilitiesArray(
          selectedJobProfile.responsibilities?.type === "bullets"
            ? selectedJobProfile.responsibilities.content.map(b => b.text)
            : []
        );

        setSkillsArray(
          selectedJobProfile.requiredSkills?.type === "bullets"
            ? selectedJobProfile.requiredSkills.content.map(b => b.text)
            : []
        );

        setNiceToHaveArray(
          selectedJobProfile.niceToHave?.type === "bullets"
            ? selectedJobProfile.niceToHave.content.map(b => b.text)
            : []
        );
      } else {
        // Add mode
        setFormData(INITIAL_FORM);
        setOverviewText("");
        setResponsibilitiesArray([]);
        setSkillsArray([]);
        setNiceToHaveArray([]);
      }
      setErrors({});
      setSubmitted(false);
    }
  }, [visible, isEditMode, selectedJobProfile]);

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

    // ✅ Update formData with parsed rich sections
    handleChange("position", parsed.position);
    handleChange("experience", parsed.experience);
    handleChange("overview", parsed.overview);
    handleChange("responsibilities", parsed.responsibilities);
    handleChange("requiredSkills", parsed.requiredSkills);
    handleChange("niceToHave", parsed.niceToHave);

    // ✅ Update UI state arrays for editing
    setOverviewText(
      parsed.overview?.[0]?.type === "paragraph"
        ? parsed.overview[0].content[0]?.text || ""
        : ""
    );

    setResponsibilitiesArray(
      parsed.responsibilities?.type === "bullets"
        ? parsed.responsibilities.content.map(b => b.text)
        : []
    );

    setSkillsArray(
      parsed.requiredSkills?.type === "bullets"
        ? parsed.requiredSkills.content.map(b => b.text)
        : []
    );

    setNiceToHaveArray(
      parsed.niceToHave?.type === "bullets"
        ? parsed.niceToHave.content.map(b => b.text)
        : []
    );

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
    (Object.keys(formData) as (keyof AddEditJobProfile)[]).forEach(key => {
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
      // Convert editable arrays back to RichSection format
      const finalData = {
        ...formData,
        overview: overviewText
          ? [
              {
                type: "paragraph" as const,
                content: [{ id: `o_${Date.now()}`, text: overviewText }]
              }
            ]
          : [],
        responsibilities:
          responsibilitiesArray.length > 0
            ? {
                type: "bullets" as const,
                content: responsibilitiesArray.map((text, idx) => ({
                  id: `r_${idx}`,
                  text
                }))
              }
            : undefined,
        requiredSkills:
          skillsArray.length > 0
            ? {
                type: "bullets" as const,
                content: skillsArray.map((text, idx) => ({
                  id: `s_${idx}`,
                  text
                }))
              }
            : undefined,
        niceToHave:
          niceToHaveArray.length > 0
            ? {
                type: "bullets" as const,
                content: niceToHaveArray.map((text, idx) => ({
                  id: `n_${idx}`,
                  text
                }))
              }
            : undefined
      };

      // ✅ Console log final payload
      console.log("💾 Final Payload being sent to backend:", JSON.stringify(finalData, null, 2));

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
    overviewText,
    responsibilitiesArray,
    skillsArray,
    niceToHaveArray,
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
            <label className="font-bold">Upload Job Description (PDF / DOCX)</label>

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
                    accept=".pdf,.docx"
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
              Supported formats: PDF, DOCX (max 5MB). Upload will auto-fill the form.
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

          {/* Job Overview */}
          <div className="field col-12">
            <label className="font-bold">Job Overview</label>
            <InputTextarea
              value={overviewText}
              onChange={e => setOverviewText(e.target.value)}
              rows={3}
              placeholder="Brief description of the role..."
              style={{ maxHeight: "120px", overflow: "auto" }}
            />
          </div>

          {/* Key Responsibilities - WITH SCROLLABLE CONTAINER */}
          <div className="field col-12">
            <label className="font-bold">Key Responsibilities</label>
            <div style={{ maxHeight: "200px", overflow: "auto", border: "1px solid #ced4da", borderRadius: "4px", padding: "0.5rem" }}>
              <Chips
                value={responsibilitiesArray}
                onChange={e => setResponsibilitiesArray(e.value || [])}
                placeholder="Press Enter to add each responsibility"
                separator=","
              />
            </div>
            <small className="text-muted">
              {responsibilitiesArray.length > 0 
                ? `${responsibilitiesArray.length} responsibilities added` 
                : "Press Enter after each item"}
            </small>
          </div>

          {/* Required Skills - WITH SCROLLABLE CONTAINER */}
          <div className="field col-12">
            <label className="font-bold">Required Skills & Experience</label>
            <div style={{ maxHeight: "200px", overflow: "auto", border: "1px solid #ced4da", borderRadius: "4px", padding: "0.5rem" }}>
              <Chips
                value={skillsArray}
                onChange={e => setSkillsArray(e.value || [])}
                placeholder="Press Enter to add each skill"
                separator=","
              />
            </div>
            <small className="text-muted">
              {skillsArray.length > 0 
                ? `${skillsArray.length} skills added` 
                : "Press Enter after each item"}
            </small>
          </div>

          {/* Nice to Have - WITH SCROLLABLE CONTAINER */}
          <div className="field col-12">
            <label className="font-bold">Nice to Have</label>
            <div style={{ maxHeight: "200px", overflow: "auto", border: "1px solid #ced4da", borderRadius: "4px", padding: "0.5rem" }}>
              <Chips
                value={niceToHaveArray}
                onChange={e => setNiceToHaveArray(e.value || [])}
                placeholder="Press Enter to add each item"
                separator=","
              />
            </div>
            <small className="text-muted">
              {niceToHaveArray.length > 0 
                ? `${niceToHaveArray.length} items added` 
                : "Press Enter after each item"}
            </small>
          </div>

          
        </div>
      </Dialog>
    </>
  );
};

export default JobProfileAddEdit;