import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Candidate } from "../types/resumeTypes";
import { createCandidate,updateCandidate} from "../services/useResume";
import { InputNumber } from "primereact/inputnumber";

interface ResumeAddEditProps {
  visible: boolean;
  onHide: () => void;
  selectedResume: Candidate | null;
//   candidateId: number;
  onSuccess: () => void;
}

const statusOptions = [
  { label: "Selected", value: "Selected" },
  { label: "Rejected", value: "Rejected" },
  { label: "Interview Pending", value: "Interview Pending" },
];

const ResumeAddEdit: React.FC<ResumeAddEditProps> = ({
  visible,
  onHide,
  selectedResume,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Candidate>({
    candidateId: Date.now(),
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
    status: "",
    linkedinProfileUrl: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const isEditMode = selectedResume !== null;

  useEffect(() => {
    if (isEditMode && selectedResume) {
      setFormData({ ...selectedResume });
    } else {
      setFormData({
        candidateId: Date.now(),
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
        status: "",
        linkedinProfileUrl: "",
      });
    }
  }, [selectedResume, visible, isEditMode]);

  const handleChange = (field: keyof Candidate, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSubmitted(true);

    if (!formData.candidateName.trim() || !formData.email.trim()) {
      return;
    }

    try {
        if (isEditMode && selectedResume) {
          // ✅ pass id + updated data
          await updateCandidate(selectedResume.candidateId, formData);
        } else {
          // ✅ pass candidate data (without id)
          const { candidateId, ...newCandidate } = formData;
          await createCandidate(newCandidate);
        }
      } catch (err) {
        console.error("Error saving candidate:", err);
      }
    };

  const handleCancel = () => {
    setSubmitted(false);
    onHide();
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancel" icon="pi pi-times" outlined onClick={handleCancel} />
      <Button
        label={isEditMode ? "Update" : "Save"}
        icon={isEditMode ? "pi pi-check" : "pi pi-plus"}
        onClick={handleSave}
        disabled={!formData.candidateName.trim() || !formData.email.trim()}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={handleCancel}
      header={isEditMode ? "Edit Resume" : "Add New Resume"}
      footer={dialogFooter}
      style={{ width: "600px" }}
      modal
      className="p-fluid"
    >
      {/* Candidate Name */}
      <div className="field">
        <label className="font-bold">Candidate Name *</label>
        <InputText
          value={formData.candidateName}
          onChange={(e) => handleChange("candidateName", e.target.value)}
          className={submitted && !formData.candidateName.trim() ? "p-invalid" : ""}
        />
        {submitted && !formData.candidateName.trim() && (
          <small className="p-error">Candidate Name is required.</small>
        )}
      </div>

      {/* Email */}
      <div className="field">
        <label className="font-bold">Email *</label>
        <InputText
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className={submitted && !formData.email.trim() ? "p-invalid" : ""}
        />
        {submitted && !formData.email.trim() && (
          <small className="p-error">Email is required.</small>
        )}
      </div>

      {/* Contact Number */}
      <div className="field">
        <label className="font-bold">Contact Number</label>
        <InputText
          value={formData.contactNumber}
          onChange={(e) => handleChange("contactNumber", e.target.value)}
        />
      </div>

      {/* Recruiter */}
      <div className="field">
        <label className="font-bold">Recruiter</label>
        <InputText
          value={formData.recruiterName}
          onChange={(e) => handleChange("recruiterName", e.target.value)}
        />
      </div>

      {/* Job Role */}
      <div className="field">
        <label className="font-bold">Job Role</label>
        <InputText
          value={formData.jobRole}
          onChange={(e) => handleChange("jobRole", e.target.value)}
        />
      </div>

      {/* Preferred Job Location */}
      {/* Preferred Job Location */}
<div className="field">
  <label className="font-bold">Preferred Job Location</label>
  <Dropdown
    value={formData.preferredJobLocation}
    options={[
      { label: "Ahmedabad", value: "Ahmedabad" },
      { label: "Bangalore", value: "Bangalore" },
    ]}
    onChange={(e) => handleChange("preferredJobLocation", e.value)}
    // placeholder="Select Location"
  />
</div>

      {/* Current CTC */}
      <div className="field">
        <label className="font-bold">Current CTC</label>
        <InputNumber
          value={formData.currentCTC}
          onChange={(e) => handleChange("currentCTC", Number(e.value))}
        />
      </div>

      {/* Expected CTC */}
      <div className="field">
        <label className="font-bold">Expected CTC</label>
        <InputNumber
          type="number"
          value={formData.expectedCTC}
          onChange={(e) => handleChange("expectedCTC", Number(e.value))}
        />
      </div>

      {/* Notice Period */}
      <div className="field">
        <label className="font-bold">Notice Period</label>
        <InputNumber
          value={formData.noticePeriod}
          onChange={(e) => handleChange("noticePeriod", e.value)}
        />
      </div>

      {/* Experience Years */}
      <div className="field">
        <label className="font-bold">Experience (Years)</label>
        <InputNumber
          type="number"
          value={formData.experienceYears}
          onChange={(e) => handleChange("experienceYears", Number(e.value))}
        />
      </div>

      {/* Status */}
      <div className="field">
        {/* Status */}
        
<div className="field">
  <label className="font-bold">Status</label>
  <Dropdown
    value={statusOptions.find(option => option.value === formData.status)?.value || null}         // current state pre-fills the dropdown
    options={statusOptions}
    onChange={(e) => handleChange("status", e.value)}
  />
</div>

      </div>

      {/* LinkedIn */}
      <div className="field">
        <label className="font-bold">LinkedIn Profile URL</label>
        <InputText
          value={formData.linkedinProfileUrl}
          onChange={(e) => handleChange("linkedinProfileUrl", e.target.value)}
        />
      </div>
    </Dialog>
  );
};

export default ResumeAddEdit;
