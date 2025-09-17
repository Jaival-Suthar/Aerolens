import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Candidate } from "../types/resumeTypes";
import { createCandidate,updateCandidate} from "../services/useResume";
import { InputNumber } from "primereact/inputnumber";
import { ResumeAddEditProps,AddCandidate } from "../types/resumeTypes";

const statusOptions = [
  { label: "Selected", value: "Selected" },
  { label: "Rejected", value: "Rejected" },
  { label: "Interview Pending", value: "Interview Pending" },
];
const recruitorsOptions = [
  { label: "Jayraj", value: "Jayraj" },
  { label: "Khushi", value: "Khushi" },
  { label: "Yash", value: "Yash" }
];
//
const locationOptions =
[
    { label: "Ahmedabad", value: "Ahmedabad" },
    { label: "Bangalore", value: "Bangalore" },
    { label: "San Francisco", value: "San Francisco" },


  ]

// Jayraj/Khushi/Yash


const ResumeAddEdit: React.FC<ResumeAddEditProps> = ({
  visible,
  onHide,
  selectedResume,
  onSuccess,
}) => {
    //state for form data
  const [formData, setFormData] = useState<AddCandidate>({
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
//used for form validation if submit is clicked and field is empty then show error message

  // Determine if we are in edit mode   
  const isEditMode = selectedResume !== null;

  useEffect(() => {
    if (isEditMode && selectedResume) {
      setFormData({ ...selectedResume });
      //exisitng blank will be overwritten by selectedResume
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
        status: "",
        linkedinProfileUrl: "",
      });
    }
  }, [selectedResume, visible, isEditMode]);

  const handleChange = (field: keyof AddCandidate, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSubmitted(true);
  
    if (!formData.candidateName.trim() || !formData.email.trim()) {
      return; // just show validation errors, don’t block dialog
    }
  
    try {
      if (isEditMode && selectedResume) {
        await updateCandidate(selectedResume.candidateId, formData);
        //this line means update 
        // the candidate with id selectedResume.candidateId 
        // using the data in formData.
      } else {
        //this line creates a new object newCandidate that contains all properties of formData except candidateId.
        //except candidateId.
        await createCandidate(formData); // create a new candidate
        //using the old formData but without candidateId
      }
  
      onSuccess();        // refresh list
      onHide();  
      setSubmitted(false); // ✅ reset validation state after success
  
    } catch (err) {
      console.error("Error saving candidate:", err);
    }
  };
  
  const handleCancel = () => {
    setSubmitted(false);
    onHide();
  };
  const isFormValid = 
  formData.candidateName.trim() &&
  formData.email.trim() &&
  formData.contactNumber.trim() &&
  formData.recruiterName.trim() &&
  formData.jobRole.trim() &&
  formData.preferredJobLocation &&
  formData.currentCTC > 0 &&
  formData.expectedCTC > 0 &&
  formData.noticePeriod > 0 &&
  formData.experienceYears > 0 &&
  formData.status.trim() &&
  formData.linkedinProfileUrl.trim();

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancel" icon="pi pi-times" outlined onClick={handleCancel} />
      <Button
        label={isEditMode ? "Update" : "Save"}
        icon={isEditMode ? "pi pi-check" : "pi pi-plus"}
        onClick={handleSave}
        disabled={!isFormValid}
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
    >{/* Candidate Name */}
    <div className="field">
      <label className="font-bold">Candidate Name *</label>
      <InputText
        value={formData.candidateName}
        onChange={(e) => handleChange("candidateName", e.target.value)}
        required
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
        required
        className={
          submitted &&
          (!formData.email.trim() || !formData.email.includes("@"))
            ? "p-invalid"
            : ""
        }
      />
      {submitted && !formData.email.trim() && (
        <small className="p-error">Email is required.</small>
      )}
    </div>
    
    {/* Contact Number */}
    <div className="field">
      <label className="font-bold">Contact Number *</label>
      <InputText
        value={formData.contactNumber}
        onChange={(e) => handleChange("contactNumber", e.target.value)}
        required
        className={submitted && !formData.contactNumber.trim() ? "p-invalid" : ""}
      />
      {submitted && !formData.contactNumber.trim() && (
        <small className="p-error">Contact Number is required.</small>
      )}
    </div>
    
    {/* Recruiter */}
   <div className="field">
        <label className="font-bold">Recruiter *</label>
        <Dropdown
          value={formData.recruiterName}
          options={recruitorsOptions}
          onChange={(e) => handleChange("recruiterName", e.value)}
          required
          placeholder="Select Recruiter"
          className={submitted && !formData.recruiterName.trim() ? "p-invalid" : ""}
        />
        {submitted && !formData.recruiterName.trim() && (
          <small className="p-error">Recruiter is required.</small>
        )}
      </div>


    {/* Job Role */}
    <div className="field">
      <label className="font-bold">Job Role *</label>
      <InputText
        value={formData.jobRole}
        onChange={(e) => handleChange("jobRole", e.target.value)}
        required
        className={submitted && !formData.jobRole.trim() ? "p-invalid" : ""}
      />
      {submitted && !formData.jobRole.trim() && (
        <small className="p-error">Job Role is required.</small>
      )}
    </div>
    {/* Preferred Job Location */}
    <div className="field">
      <label className="font-bold">Preferred Job Location *</label>
      <Dropdown
        value={formData.preferredJobLocation}
        options={locationOptions}
        onChange={(e) => handleChange("preferredJobLocation", e.value)}
        required
        className={submitted && !formData.preferredJobLocation ? "p-invalid" : ""}
        placeholder="Select Location"
      />
      {submitted && !formData.preferredJobLocation && (
        <small className="p-error">Preferred Job Location is required.</small>
      )}
    </div>    
    {/* Current CTC */}
    <div className="field">
      <label className="font-bold">Current CTC *</label>
      <InputNumber
        value={formData.currentCTC}
        onChange={(e) => handleChange("currentCTC", Number(e.value))}
        required
        className={submitted && !formData.currentCTC ? "p-invalid" : ""}
      />
      {submitted && !formData.currentCTC && (
        <small className="p-error">Current CTC is required.</small>
      )}
    </div>
    
    {/* Expected CTC */}
    <div className="field">
      <label className="font-bold">Expected CTC *</label>
      <InputNumber
        value={formData.expectedCTC}
        onChange={(e) => handleChange("expectedCTC", Number(e.value))}
        required
        className={submitted && !formData.expectedCTC ? "p-invalid" : ""}
      />
      {submitted && !formData.expectedCTC && (
        <small className="p-error">Expected CTC is required.</small>
      )}
    </div>
    
    {/* Notice Period */}
    <div className="field">
      <label className="font-bold">Notice Period *</label>
      <InputNumber
        value={formData.noticePeriod}
        onChange={(e) => handleChange("noticePeriod", Number(e.value))}
        required
        className={submitted && !formData.noticePeriod ? "p-invalid" : ""}
      />
      {submitted && !formData.noticePeriod && (
        <small className="p-error">Notice Period is required.</small>
      )}
    </div>
    
    {/* Experience Years */}
    <div className="field">
      <label className="font-bold">Experience (Years) *</label>
      <InputNumber
        value={formData.experienceYears}
        onChange={(e) => handleChange("experienceYears", Number(e.value))}
        required
        className={submitted && !formData.experienceYears ? "p-invalid" : ""}
      />
      {submitted && !formData.experienceYears && (
        <small className="p-error">Experience is required.</small>
      )}
    </div>
    
    {/* Status */}
    <div className="field">
      <label className="font-bold">Status *</label>
      <Dropdown
        value={formData.status}
        options={statusOptions}
        onChange={(e) => handleChange("status", e.value)}
        required
        className={submitted && !formData.status.trim() ? "p-invalid" : ""}
        placeholder="Select Status"
      />
      {submitted && !formData.status.trim() && (
        <small className="p-error">Status is required.</small>
      )}
    </div>
    
    {/* LinkedIn */}
    <div className="field">
      <label className="font-bold">LinkedIn Profile URL *</label>
      <InputText
        value={formData.linkedinProfileUrl}
        onChange={(e) => handleChange("linkedinProfileUrl", e.target.value)}
        required
        className={submitted && !formData.linkedinProfileUrl.trim() ? "p-invalid" : ""}
      />
      {submitted && !formData.linkedinProfileUrl.trim() && (
        <small className="p-error">LinkedIn Profile URL is required.</small>
      )}
    </div>
    
    </Dialog>
  );
};

export default ResumeAddEdit;
