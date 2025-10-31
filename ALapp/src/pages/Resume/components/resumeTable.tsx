import React, { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import ResumeAddEdit from "../components/resumeAddEdit";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import { Candidate } from "../types/resumeTypes";
import { getCandidates } from "../services/useResume";
import ResumeDelete from "./resumeDelete";
import ExportExcelButton from "../../../shared/ExportExcelButton";
import { Button } from "primereact/button";
import { FaDownload, FaEye } from "react-icons/fa";

import { useAuth } from "../../../shared/auth/AuthContext";
const ResumeTable: React.FC<any> = () => {
  const { accessToken } = useAuth();

  const [resumes, setResumes] = useState<Candidate[]>([]);
  const [selectedResume, setSelectedResume] = useState<Candidate | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingResume, setEditingResume] = useState<Candidate | null>(null);
  const dt = useRef<DataTable<any>>(null);
  const loadResumes = useCallback(async () => {
    try {
      
      // TODO pass dynamic pagenumber and pageSize
      const data = await getCandidates(1, 10000);
      setResumes(Array.isArray(data) ? data : []); // Add safety check
    } catch (error) {
      console.error("Error loading resumes:", error);
      setResumes([]); // Set empty array on error
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, []);

  const handleAdd = () => {
    setEditingResume(null);
    setShowAddEditDialog(true);
  };

  const handleEdit = () => {
    if (!selectedResume) return;
    setEditingResume(selectedResume);
    setShowAddEditDialog(true);
  };

  const handleDelete = () => {
    if (!selectedResume) return;
    setShowDeleteDialog(true);
  };

  const handleAddEditSuccess = () => loadResumes();
  const handleDeleteSuccess = () => loadResumes();
  const handleClearSelection = () => setSelectedResume(null);
  const resumeActionTemplate = (candidate: Candidate) => {
    if (!candidate.resumeFilename) {
      return <span className="text-400">No Resume</span>;
    }
  
    return (
      <div className="flex gap-1">
        <Button
          icon={<span style={{ fontSize: 16, lineHeight: 0 }}>
            <FaDownload />
          </span>}
          className="p-button-outlined"
          tooltip="Download Resume"
          onClick={() => handleDownloadResume(candidate.candidateId)}
        />
        <Button
          icon={<span style={{ fontSize: 16, lineHeight: 0 }}>
            <FaEye />
          </span>}
          className="p-button-sm p-button-outlined"
          tooltip="Preview Resume"
          onClick={() => handlePreviewResume(candidate.candidateId)}
        />
      </div>
    );
  };
  const handleDownloadResume = async (candidateId: number) => {
    if (!accessToken) {
      alert("You are not authenticated. Please log in first.");
      return;
    }
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/candidate/${candidateId}/resume`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to download resume");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
  
      // Optional: extract filename from headers
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      link.download = filenameMatch ? filenameMatch[1] : "resume.pdf";
  
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error downloading resume:", error);
      alert("Failed to download resume. Please try again.");
    }
  };
  
 
  const handlePreviewResume = async (candidateId: number) => {
    if (!accessToken) {
      alert("You are not authenticated. Please log in first.");
      return;
    }
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/candidate/${candidateId}/resume/preview`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to preview resume");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("❌ Error previewing resume:", error);
      alert("Failed to preview resume. Please try again.");
    }
  };
  
  return (
    <>
      <div className="flex justify-content-between mb-2">
        <h2>Candidate Resume Management</h2>
        <div className="flex gap-2">
          <ExportExcelButton dtRef={dt} />
          <AddButton onClick={handleAdd} />
          <EditButton onClick={handleEdit} disabled={!selectedResume} />
          <DeleteButton onClick={handleDelete} disabled={!selectedResume} />
        </div>
      </div>

      {/* <h4>Resumes for: {candidateName}</h4> */}
      <DataTable
        ref={dt}
        value={resumes}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 20]}
        selectionMode="single"
        selection={selectedResume}
        dataKey="candidateId"
        onSelectionChange={(e: any) => setSelectedResume(e.value)}
        tableStyle={{ minWidth: "80rem" }}
      >
        <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
        <Column field="candidateName" sortable header="Candidate Name" />
        <Column field="contactNumber" sortable header="Contact Number" />
        <Column field="email" sortable header="Email" />
        <Column field="recruiterName" sortable header="Recruiter" />
        <Column field="jobRole" sortable header="Role" />
        <Column field="preferredJobLocation" sortable header="Preferable Location" />
        <Column field="currentCTC" sortable header="Current CTC" />
        <Column field="expectedCTC" sortable header="Expected CTC" />
        <Column field="noticePeriod" header="Notice Period" />
        <Column field="experienceYears" header="Experience" />
        <Column field="statusName" header="Status" />
        <Column
  field="linkedinProfileUrl"
  header="LinkedIn Profile"
  body={(rowData: Candidate) =>
    rowData.linkedinProfileUrl ? (
      <a
        href={rowData.linkedinProfileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        {rowData.linkedinProfileUrl}
      </a>
    ) : (
      <span className="text-400">N/A</span>
    )
  }
/>

        <Column 
          header="Resume" 
          body={(rowData: Candidate) => resumeActionTemplate(rowData)}
          style={{ width: '8rem' }}
        />

      </DataTable>
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
        onClearSelection={handleClearSelection}
      />
    </>
  );
};

export default ResumeTable;
