import React, { useState, useEffect, useCallback, useRef } from "react";
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

import { Candidate } from "../types/resumeTypes";
import { getCandidates, downloadResume } from "../services/useResume";
import { useAuth } from "../../../shared/auth/AuthContext";
import SearchButton from "../../../shared/SearchButton";
import { FilterMatchMode } from 'primereact/api';

const ResumeTable: React.FC = () => {
  const { accessToken } = useAuth(); // ✅ from AuthContext
  const [resumes, setResumes] = useState<Candidate[]>([]);
  const [selectedResume, setSelectedResume] = useState<Candidate | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingResume, setEditingResume] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [first, setFirst] = useState((pageFromUrl - 1) * 5); // 5 = rows per page
  const dt = useRef<DataTable<any>>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  /** ------------------- Data Loading ------------------- */
  const loadResumes = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const { candidates } = await getCandidates(accessToken, 1, 10000);
      setResumes(Array.isArray(candidates) ? candidates : []);
    } catch (error) {
      console.error("Error loading resumes:", error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const onPageChange = (event: any) => {
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

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  const _filters = { ...filters };
  _filters['global'].value = value;
  
  setFilters(_filters);
  setGlobalFilterValue(value);
};

  /** ------------------- Resume Actions ------------------- */
  const handleDownloadResume = async (candidateId: number) => {
  try {
    if (!accessToken) throw new Error("Unauthorized");
    const blob = await downloadResume(accessToken, candidateId);
    
    // Detect file type from blob's MIME type
    const fileExtension = blob.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      ? "docx" 
      : "pdf";
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume_${candidateId}.${fileExtension}`;  // ✅ Dynamic extension
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Resume download failed:", error);
  }
};

  const handlePreviewResume = async (candidateId: number) => {
  try {
    if (!accessToken) throw new Error("Unauthorized");
    
    const previewUrl = `${import.meta.env.VITE_BASE_URL}/candidate/${candidateId}/resume/preview`;
    
    const response = await fetch(previewUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("Preview failed");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    
    // Clean up after a delay to ensure the window opens
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error("Resume preview failed:", error);
  }
};
  /** ------------------- Column Templates ------------------- */
  const resumeActionTemplate = (candidate: Candidate) => {
    if (!candidate.resumeFilename) {
      return <span className="text-400">No Resume</span>;
    }

    return (
      <div className="flex gap-1">
        <Button
          icon={<FaDownload />}
          className="p-button-outlined p-button-m"
          tooltip="Download Resume"
          onClick={() => handleDownloadResume(candidate.candidateId)}
        />
        <Button
          icon={<FaEye />}
          className="p-button-outlined p-button-m"
          tooltip="Preview Resume"
          onClick={() => handlePreviewResume(candidate.candidateId)}
        />
      </div>
    );
  };

  const linkedInTemplate = (rowData: Candidate) => {
    if (!rowData.linkedinProfileUrl) {
      return <span className="text-400">N/A</span>;
    }
    return (
      <a
        href={rowData.linkedinProfileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        View Profile
      </a>
    );
  };

  /** ------------------- JSX ------------------- */
  return (
    <>
      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Candidate Resume Management</h2>
        <div className="flex gap-2">
          <SearchButton
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search candidates..."
          />
          <ExportExcelButton dtRef={dt} />
          <AddButton onClick={handleAdd} />
          <EditButton onClick={handleEdit} disabled={!selectedResume} />
          <DeleteButton onClick={handleDelete} disabled={!selectedResume} />
        </div>
      </div>

      <DataTable
        ref={dt}
        value={resumes}
        paginator
        rows={5}
        first={first}
        onPage={onPageChange}
        rowsPerPageOptions={[5, 10, 20, 50]}
        selectionMode="single"
        selection={selectedResume}
        dataKey="candidateId"
        onSelectionChange={(e) => setSelectedResume(e.value)}
        tableStyle={{ minWidth: "80rem" }}
        loading={loading}
        emptyMessage="No candidates found."
        filters={filters}  
        globalFilterFields={[  
          'candidateName', 
          'contactNumber', 
          'email', 
          'recruiterName', 
          'jobRole',
          'preferredJobLocation',
          'statusName'
        ]}
      >

        <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
        <Column field="candidateName" header="Candidate Name" sortable />
        <Column field="contactNumber" header="Contact Number" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="recruiterName" header="Recruiter" sortable />
        <Column field="jobRole" header="Role" sortable />
        <Column
          field="preferredJobLocation"
          header="Preferred Location"
          sortable
        />
        <Column field="currentCTC" header="Current CTC" sortable />
        <Column field="expectedCTC" header="Expected CTC" sortable />
        <Column field="noticePeriod" header="Notice Period" sortable />
        <Column field="experienceYears" header="Experience" sortable />
        <Column field="statusName" header="Status" sortable />
        <Column
          field="linkedinProfileUrl"
          header="LinkedIn Profile"
          body={linkedInTemplate}
        />
        <Column header="Resume" body={resumeActionTemplate} style={{ width: "8rem" }} />
      </DataTable>

      {/* ------------------- Dialogs ------------------- */}
      <ResumeAddEdit
        visible={showAddEditDialog}
        onHide={() => setShowAddEditDialog(false)}
        selectedResume={editingResume}
        onSuccess={handleAddEditSuccess}
      />

      <ResumeDelete
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        selectedResume={selectedResume}
        onSuccess={handleDeleteSuccess}
        onClearSelection={() => setSelectedResume(null)}
      />
    </>
  );
};

export default ResumeTable;
