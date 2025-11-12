import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { FaDownload, FaEye } from "react-icons/fa";
import ResumeAddEdit from "../components/resumeAddEdit";
import ResumeDelete from "./resumeDelete";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import ExportExcelButton from "../../../shared/ExportExcelButton";
import { useSearchParams } from "react-router-dom";
import { getCandidates, downloadResume } from "../services/useResume";
import { useAuth } from "../../../shared/auth/AuthContext";
const ResumeTable = () => {
    const { accessToken } = useAuth(); // ✅ from AuthContext
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [showAddEditDialog, setShowAddEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingResume, setEditingResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const pageFromUrl = Number(searchParams.get("page")) || 1;
    const [first, setFirst] = useState((pageFromUrl - 1) * 5); // 5 = rows per page
    const dt = useRef(null);
    /** ------------------- Data Loading ------------------- */
    const loadResumes = useCallback(async () => {
        if (!accessToken)
            return;
        setLoading(true);
        try {
            const { candidates } = await getCandidates(accessToken, 1, 10000);
            setResumes(Array.isArray(candidates) ? candidates : []);
        }
        catch (error) {
            console.error("Error loading resumes:", error);
            setResumes([]);
        }
        finally {
            setLoading(false);
        }
    }, [accessToken]);
    useEffect(() => {
        loadResumes();
    }, [loadResumes]);
    const onPageChange = (event) => {
        setFirst(event.first);
        const newPage = event.page + 1; // PrimeReact pages start from 0
        setSearchParams({ page: newPage.toString() });
    };
    /** ------------------- CRUD Handlers ------------------- */
    const handleAdd = () => {
        setEditingResume(null);
        setShowAddEditDialog(true);
    };
    const handleEdit = () => {
        if (selectedResume) {
            setEditingResume(selectedResume);
            setShowAddEditDialog(true);
        }
    };
    const handleDelete = () => {
        if (selectedResume) {
            setShowDeleteDialog(true);
        }
    };
    const handleAddEditSuccess = () => {
        setShowAddEditDialog(false);
        loadResumes();
    };
    const handleDeleteSuccess = () => {
        setShowDeleteDialog(false);
        setSelectedResume(null);
        loadResumes();
    };
    /** ------------------- Resume Actions ------------------- */
    const handleDownloadResume = async (candidateId) => {
        try {
            if (!accessToken)
                throw new Error("Unauthorized");
            const blob = await downloadResume(accessToken, candidateId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `resume_${candidateId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error("Resume download failed:", error);
        }
    };
    const handlePreviewResume = async (candidateId) => {
        try {
            if (!accessToken)
                throw new Error("Unauthorized");
            const previewUrl = `${import.meta.env.VITE_BASE_URL}/candidate/${candidateId}/resume/preview`;
            const response = await fetch(previewUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (!response.ok)
                throw new Error("Preview failed");
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
            // Clean up after a delay to ensure the window opens
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        catch (error) {
            console.error("Resume preview failed:", error);
        }
    };
    /** ------------------- Column Templates ------------------- */
    const resumeActionTemplate = (candidate) => {
        if (!candidate.resumeFilename) {
            return _jsx("span", { className: "text-400", children: "No Resume" });
        }
        return (_jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { icon: _jsx(FaDownload, {}), className: "p-button-outlined p-button-sm", tooltip: "Download Resume", onClick: () => handleDownloadResume(candidate.candidateId) }), _jsx(Button, { icon: _jsx(FaEye, {}), className: "p-button-outlined p-button-sm", tooltip: "Preview Resume", onClick: () => handlePreviewResume(candidate.candidateId) })] }));
    };
    const linkedInTemplate = (rowData) => {
        if (!rowData.linkedinProfileUrl) {
            return _jsx("span", { className: "text-400", children: "N/A" });
        }
        return (_jsx("a", { href: rowData.linkedinProfileUrl, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 underline hover:text-blue-800", children: "View Profile" }));
    };
    /** ------------------- JSX ------------------- */
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-content-between align-items-center mb-2", children: [_jsx("h2", { children: "Candidate Resume Management" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(ExportExcelButton, { dtRef: dt }), _jsx(AddButton, { onClick: handleAdd }), _jsx(EditButton, { onClick: handleEdit, disabled: !selectedResume }), _jsx(DeleteButton, { onClick: handleDelete, disabled: !selectedResume })] })] }), _jsxs(DataTable, { ref: dt, value: resumes, paginator: true, rows: 5, first: first, onPage: onPageChange, rowsPerPageOptions: [5, 10, 20, 50], selectionMode: "single", selection: selectedResume, dataKey: "candidateId", onSelectionChange: (e) => setSelectedResume(e.value), tableStyle: { minWidth: "80rem" }, loading: loading, emptyMessage: "No candidates found.", children: [_jsx(Column, { selectionMode: "single", headerStyle: { width: "3rem" } }), _jsx(Column, { field: "candidateName", header: "Candidate Name", sortable: true }), _jsx(Column, { field: "contactNumber", header: "Contact Number", sortable: true }), _jsx(Column, { field: "email", header: "Email", sortable: true }), _jsx(Column, { field: "recruiterName", header: "Recruiter", sortable: true }), _jsx(Column, { field: "jobRole", header: "Role", sortable: true }), _jsx(Column, { field: "preferredJobLocation", header: "Preferred Location", sortable: true }), _jsx(Column, { field: "currentCTC", header: "Current CTC", sortable: true }), _jsx(Column, { field: "expectedCTC", header: "Expected CTC", sortable: true }), _jsx(Column, { field: "noticePeriod", header: "Notice Period", sortable: true }), _jsx(Column, { field: "experienceYears", header: "Experience", sortable: true }), _jsx(Column, { field: "statusName", header: "Status", sortable: true }), _jsx(Column, { field: "linkedinProfileUrl", header: "LinkedIn Profile", body: linkedInTemplate }), _jsx(Column, { header: "Resume", body: resumeActionTemplate, style: { width: "8rem" } })] }), _jsx(ResumeAddEdit, { visible: showAddEditDialog, onHide: () => setShowAddEditDialog(false), selectedResume: editingResume, onSuccess: handleAddEditSuccess }), _jsx(ResumeDelete, { visible: showDeleteDialog, onHide: () => setShowDeleteDialog(false), selectedResume: selectedResume, onSuccess: handleDeleteSuccess, onClearSelection: () => setSelectedResume(null) })] }));
};
export default ResumeTable;
