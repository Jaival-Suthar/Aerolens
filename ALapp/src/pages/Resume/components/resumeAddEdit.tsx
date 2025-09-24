import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { InputNumber } from "primereact/inputnumber";
import { ResumeAddEditProps, AddEditCandidate } from "../types/resumeTypes";

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
        resumeFile: null, // ✅ added field
    });
    const [submitted, setSubmitted] = useState(false);

    const isEditMode = selectedResume !== null;

    useEffect(() => {
        if (isEditMode && selectedResume) {
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
    }, [selectedResume, visible, isEditMode]);

    const handleChange = (field: keyof AddEditCandidate, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileUpload = (event: any) => {
        if (event.files && event.files.length > 0) {
            setFormData((prev) => ({
                ...prev,
                resumeFile: event.files[0], // store locally only
            }));
        }
    };

    const handleSave = () => {
        setSubmitted(true);
        // no API logic yet, just close and trigger success
        onSuccess();
        onHide();
        setSubmitted(false);
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
            />
        </div>
    );

    return (
        <Dialog
        visible={visible}
        onHide={handleCancel}
        header={isEditMode ? "Edit Resume" : "Add New Resume"}
        footer={dialogFooter}
        style={{ width: "600px", maxHeight: "90vh" }}
        modal
        className="p-fluid"
    >

            {/* Candidate Name */}
            <div className="field">
                <label className="font-bold">Candidate Name *</label>
                <InputText
                    value={formData.candidateName}
                    onChange={(e) => handleChange("candidateName", e.target.value)}
                />
            </div>

            {/* Recruiter */}
            <div className="field">
                <label className="font-bold">Recruiter *</label>
                <Dropdown
                    value={formData.recruiterName}
                    options={recruitorsOptions}
                    onChange={(e) => handleChange("recruiterName", e.value)}
                    placeholder="Select Recruiter"
                />
            </div>

            {/* Contact Number */}
            <div className="field">
                <label className="font-bold">Contact Number *</label>
                <InputText
                    value={formData.contactNumber}
                    onChange={(e) => handleChange("contactNumber", e.target.value)}
                />
            </div>

            {/* Email */}
            <div className="field">
                <label className="font-bold">Email *</label>
                <InputText
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                />
            </div>

            {/* Job Role */}
            <div className="field">
                <label className="font-bold">Job Role *</label>
                <InputText
                    value={formData.jobRole}
                    onChange={(e) => handleChange("jobRole", e.target.value)}
                />
            </div>

            {/* Preferred Job Location */}
            <div className="field">
                <label className="font-bold">Preferred Job Location *</label>
                <Dropdown
                    value={formData.preferredJobLocation}
                    options={locationOptions}
                    onChange={(e) => handleChange("preferredJobLocation", e.value)}
                    placeholder="Select Location"
                />
            </div>

            {/* Current CTC */}
            <div className="field">
                <label className="font-bold">Current CTC *</label>
                <InputNumber
                    value={formData.currentCTC}
                    onChange={(e) => handleChange("currentCTC", Number(e.value))}
                />
            </div>

            {/* Expected CTC */}
            <div className="field">
                <label className="font-bold">Expected CTC *</label>
                <InputNumber
                    value={formData.expectedCTC}
                    onChange={(e) => handleChange("expectedCTC", Number(e.value))}
                />
            </div>

            {/* Notice Period */}
            <div className="field">
                <label className="font-bold">Notice Period *</label>
                <InputNumber
                    value={formData.noticePeriod}
                    onChange={(e) => handleChange("noticePeriod", Number(e.value))}
                />
            </div>

            {/* Experience */}
            <div className="field">
                <label className="font-bold">Experience (Years) *</label>
                <InputNumber
                    value={formData.experienceYears}
                    onChange={(e) => handleChange("experienceYears", Number(e.value))}
                />
            </div>

            {/* Status */}
            <div className="field">
                <label className="font-bold">Status *</label>
                <Dropdown
                    value={formData.statusName}
                    options={statusOptions}
                    onChange={(e) => handleChange("statusName", e.value)}
                    placeholder="Select Status"
                />
            </div>

            {/* LinkedIn URL */}
            <div className="field">
                <label className="font-bold">LinkedIn Profile URL *</label>
                <InputText
                    value={formData.linkedinProfileUrl}
                    onChange={(e) => handleChange("linkedinProfileUrl", e.target.value)}
                />
            </div>

            {/* Resume Upload */}
<div className="field">
    <label className="font-bold">Upload Resume</label>
    <FileUpload
        mode="basic"
        name="resume"
        accept=".pdf,.doc,.docx"
        maxFileSize={5 * 1024 * 1024}
        auto={false}
        customUpload
        uploadHandler={handleFileUpload}
        chooseLabel="Select File"
        chooseOptions={{
            icon: "pi pi-file-pdf", // 👈 PrimeIcons PDF icon
            label: "Upload PDF",    // 👈 Custom label (optional)
            className: "p-button-danger p-button-sm" // 👈 red PDF-style button
        }}
    />
    {formData.resumeFile && (
        <small className="p-success">File selected: {formData.resumeFile.name}</small>
    )}
</div>

        </Dialog>
    );
};

export default ResumeAddEdit;
