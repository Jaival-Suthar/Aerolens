import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { createCandidate, updateCandidate } from "../services/useResume";
import { InputNumber } from "primereact/inputnumber";
import { ResumeAddEditProps, AddCandidate } from "../types/resumeTypes";

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
        statusName: "",
        linkedinProfileUrl: "",
    });
    const [submitted, setSubmitted] = useState(false);
    //used for form validation if submit is clicked and field is empty then show error message

    // Determine if we are in edit mode   
    const isEditMode = selectedResume !== null;
    console.log(selectedResume)
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
                statusName: "",
                linkedinProfileUrl: "",
            });
        }
    }, [selectedResume, visible, isEditMode]);
    //these three dependencies means whenever any of these change the useEffect will run again

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
                console.log(selectedResume)
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

    //   const isFormValid =
    //   // Candidate and recruiter name: 2–100 chars, letters, spaces, ., -, '
    //   formData.candidateName.trim().length >= 2 &&
    //   formData.candidateName.trim().length <= 100 &&
    //   /^[a-zA-Z .'-]+$/.test(formData.candidateName) &&
    //   formData.recruiterName.trim().length >= 2 &&
    //   formData.recruiterName.trim().length <= 100 &&
    //   /^[a-zA-Z .'-]+$/.test(formData.recruiterName) &&

    //   // Contact number: 7–25 chars, numbers, +, -
    //   formData.contactNumber.trim().length >= 7 &&
    //   formData.contactNumber.trim().length <= 25 &&
    //   /^[0-9+\- ]+$/.test(formData.contactNumber) &&

    //   // Email: valid format, max 255 chars
    //   formData.email.trim().length > 0 &&
    //   formData.email.length <= 255 &&
    //   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&

    //   // Job role: 2–100 chars
    //   formData.jobRole.trim().length >= 2 &&
    //   formData.jobRole.trim().length <= 100 &&

    //   // Preferred job location: Ahmedabad or Bangalore
    //   (formData.preferredJobLocation === "Ahmedabad" || formData.preferredJobLocation === "Bangalore") &&

    //   // Current and expected CTC: positive integers, expected >= current
    //   formData.currentCTC > 0 &&
    //   formData.expectedCTC > 0 &&
    //   formData.expectedCTC >= formData.currentCTC &&

    //   // Notice period: 0–365
    //   formData.noticePeriod >= 0 &&
    //   formData.noticePeriod <= 365 &&

    //   // Experience: 0–50
    //   formData.experienceYears >= 0 &&
    //   formData.experienceYears <= 50 &&

    //   // LinkedIn URL: non-empty, max 500 chars, must be a URL
    //   formData.linkedinProfileUrl.trim().length > 0 &&
    //   formData.linkedinProfileUrl.length <= 500 &&
    //   /^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(formData.linkedinProfileUrl) &&

    //   // Status: Selected, Rejected, Interview Pending
    //   ["Selected", "Rejected", "Interview Pending"].includes(formData.statusName);

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancel" icon="pi pi-times" outlined onClick={handleCancel} />
            <Button
                label={isEditMode ? "Update" : "Save"}
                icon={isEditMode ? "pi pi-check" : "pi pi-plus"}
                onClick={handleSave}
            // disabled={!isFormValid}
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
            {/* Candidate Name */}
            <div className="field">
                <label className="font-bold">Candidate Name *</label>
                <InputText
                    value={formData.candidateName}
                    onChange={(e) => handleChange("candidateName", e.target.value)}
                    className={
                        submitted &&
                            (formData.candidateName.trim().length < 2 ||
                                formData.candidateName.trim().length > 100 ||
                                !/^[a-zA-Z .'-]+$/.test(formData.candidateName))
                            ? "p-invalid"
                            : ""
                    }
                />
                {submitted && formData.candidateName.trim().length < 2 && (
                    <small className="p-error">Candidate Name must be at least 2 characters</small>
                )}
                {submitted && formData.candidateName.trim().length > 100 && (
                    <small className="p-error">Candidate Name cannot exceed 100 characters</small>
                )}
                {submitted && !/^[a-zA-Z .'-]+$/.test(formData.candidateName) && (
                    <small className="p-error">Candidate Name contains invalid characters</small>
                )}
            </div>

            {/* Recruiter Name */}
            <div className="field">
                <label className="font-bold">Recruiter *</label>
                <Dropdown
                    value={formData.recruiterName}
                    options={recruitorsOptions}
                    onChange={(e) => handleChange("recruiterName", e.value)}
                    placeholder="Select Recruiter"
                    className={
                        submitted &&
                            (formData.recruiterName.trim().length < 2 ||
                                formData.recruiterName.trim().length > 100 ||
                                !/^[a-zA-Z .'-]+$/.test(formData.recruiterName))
                            ? "p-invalid"
                            : ""
                    }
                />
                {submitted && formData.recruiterName.trim().length < 2 && (
                    <small className="p-error">Recruiter Name must be at least 2 characters</small>
                )}
                {submitted && formData.recruiterName.trim().length > 100 && (
                    <small className="p-error">Recruiter Name cannot exceed 100 characters</small>
                )}
                {submitted && !/^[a-zA-Z .'-]+$/.test(formData.recruiterName) && (
                    <small className="p-error">Recruiter Name contains invalid characters</small>
                )}
            </div>

            {/* Contact Number */}
            <div className="field">
                <label className="font-bold">Contact Number *</label>
                <InputText
                    value={formData.contactNumber}
                    onChange={(e) => handleChange("contactNumber", e.target.value)}
                    className={
                        submitted &&
                            (formData.contactNumber.trim().length < 7 ||
                                formData.contactNumber.trim().length > 25 ||
                                !/^[0-9+\- ]+$/.test(formData.contactNumber))
                            ? "p-invalid"
                            : ""
                    }
                />
                {submitted && formData.contactNumber.trim().length < 7 && (
                    <small className="p-error">Contact Number must be at least 7 digits</small>
                )}
                {submitted && formData.contactNumber.trim().length > 25 && (
                    <small className="p-error">Contact Number cannot exceed 25 digits</small>
                )}
                {submitted && !/^[0-9+\- ]+$/.test(formData.contactNumber) && (
                    <small className="p-error">Contact Number contains invalid characters</small>
                )}
            </div>

            {/* Email */}
            <div className="field">
                <label className="font-bold">Email *</label>
                <InputText
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={
                        submitted &&
                            (formData.email.trim().length === 0 ||
                                formData.email.length > 255 ||
                                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                            ? "p-invalid"
                            : ""
                    }
                />
                {submitted && formData.email.trim().length === 0 && (
                    <small className="p-error">Email is required</small>
                )}
                {submitted && formData.email.length > 255 && (
                    <small className="p-error">Email cannot exceed 255 characters</small>
                )}
                {submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <small className="p-error">Email format is invalid</small>
                )}
            </div>

            {/* Job Role */}
            <div className="field">
                <label className="font-bold">Job Role *</label>
                <InputText
                    value={formData.jobRole}
                    onChange={(e) => handleChange("jobRole", e.target.value)}
                    className={
                        submitted &&
                            (formData.jobRole.trim().length < 2 || formData.jobRole.trim().length > 100)
                            ? "p-invalid"
                            : ""
                    }
                />
                {submitted && formData.jobRole.trim().length < 2 && (
                    <small className="p-error">Job Role must be at least 2 characters</small>
                )}
                {submitted && formData.jobRole.trim().length > 100 && (
                    <small className="p-error">Job Role cannot exceed 100 characters</small>
                )}
            </div>

            {/* Preferred Job Location */}
            <div className="field">
                <label className="font-bold">Preferred Job Location *</label>
                <Dropdown
                    value={formData.preferredJobLocation}
                    options={locationOptions}
                    onChange={(e) => handleChange("preferredJobLocation", e.value)}
                    placeholder="Select Location"
                    className={
                        submitted &&
                            !["Ahmedabad", "Bangalore"].includes(formData.preferredJobLocation)
                            ? "p-invalid"
                            : ""
                    }
                />
                {submitted && !["Ahmedabad", "Bangalore"].includes(formData.preferredJobLocation) && (
                    <small className="p-error">Preferred Job Location must be Ahmedabad or Bangalore</small>
                )}
            </div>

            {/* Current CTC */}
            <div className="field">
                <label className="font-bold">Current CTC *</label>
                <InputNumber
                    value={formData.currentCTC}
                    onChange={(e) => handleChange("currentCTC", Number(e.value))}
                    className={submitted && formData.currentCTC <= 0 ? "p-invalid" : ""}
                />
                {submitted && formData.currentCTC <= 0 && (
                    <small className="p-error">Current CTC must be greater than 0</small>
                )}
            </div>

            {/* Expected CTC */}
            <div className="field">
                <label className="font-bold">Expected CTC *</label>
                <InputNumber
                    value={formData.expectedCTC}
                    onChange={(e) => handleChange("expectedCTC", Number(e.value))}
                    className={
                        submitted &&
                            (formData.expectedCTC <= 0 || formData.expectedCTC < formData.currentCTC)
                            ? "p-invalid"
                            : ""
                    }
                />
                {submitted && formData.expectedCTC <= 0 && (
                    <small className="p-error">Expected CTC must be greater than 0</small>
                )}
                {submitted && formData.expectedCTC < formData.currentCTC && (
                    <small className="p-error">Expected CTC cannot be less than Current CTC</small>
                )}
            </div>

            {/* Notice Period */}
            <div className="field">
                <label className="font-bold">Notice Period *</label>
                <InputNumber
                    value={formData.noticePeriod}
                    onChange={(e) => handleChange("noticePeriod", Number(e.value))}
                    className={
                        submitted && (formData.noticePeriod < 0 || formData.noticePeriod > 365)
                            ? "p-invalid"
                            : ""
                    }
                />
                {submitted && (formData.noticePeriod < 0 || formData.noticePeriod > 365) && (
                    <small className="p-error">Notice Period must be between 0 and 365 days</small>
                )}
            </div>

            {/* Experience Years */}
            <div className="field">
                <label className="font-bold">Experience (Years) *</label>
                <InputNumber
                    value={formData.experienceYears}
                    onChange={(e) => handleChange("experienceYears", Number(e.value))}
                    className={
                        submitted && (formData.experienceYears < 0 || formData.experienceYears > 50)
                            ? "p-invalid"
                            : ""
                    }
                />
                {submitted && (formData.experienceYears < 0 || formData.experienceYears > 50) && (
                    <small className="p-error">Experience must be between 0 and 50 years</small>
                )}
                {/* // */}
            </div>

            {/* Status */}
            <div className="field">
                <label className="font-bold">Status *</label>
                <Dropdown
                    value={formData.statusName}
                    options={statusOptions}
                    onChange={(e) => handleChange("statusName", e.value)}
                    placeholder="Select Status"
                    className={
                        submitted && !["Selected", "Rejected", "Interview Pending"].includes(formData.statusName)
                            ? "p-invalid"
                            : ""
                    }
                />
                {submitted && !["Selected", "Rejected", "Interview Pending"].includes(formData.statusName) && (
                    <small className="p-error">Status must be Selected, Rejected, or Interview Pending</small>
                )}
            </div>

            {/* LinkedIn URL */}
            <div className="field">
                <label className="font-bold">LinkedIn Profile URL *</label>
                <InputText
                    value={formData.linkedinProfileUrl}
                    onChange={(e) => handleChange("linkedinProfileUrl", e.target.value)}
                    className={
                        submitted &&
                            (formData.linkedinProfileUrl.trim().length === 0 ||
                                formData.linkedinProfileUrl.length > 500 ||
                                !/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(formData.linkedinProfileUrl))
                            ? "p-invalid"
                            : ""
                    }
                />

            </div>

        </Dialog>

    );
};

export default ResumeAddEdit;
