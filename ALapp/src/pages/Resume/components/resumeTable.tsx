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

const ResumeTable: React.FC<any> = () => {
  const [resumes, setResumes] = useState<Candidate[]>([]);
  const [selectedResume, setSelectedResume] = useState<Candidate | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingResume, setEditingResume] = useState<Candidate | null>(null);
  const dt = useRef<DataTable<any>>(null);
  const loadResumes = useCallback(async () => {
    try {
      const data = await getCandidates();
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
          icon="pi pi-download"
          className="p-button-sm p-button-outlined"
          tooltip="Download Resume"
          onClick={() => handleDownloadResume(candidate.candidateId)}
        />
        <Button
          icon="pi pi-eye"
          className="p-button-sm p-button-outlined"
          tooltip="Preview Resume"
          onClick={() => handlePreviewResume(candidate.candidateId)}
        />
      </div>
    );
  };
  
  const handleDownloadResume = (candidateId: number) => {
    const downloadUrl = `${import.meta.env.VITE_BASE_URL}/candidate/${candidateId}/resume`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePreviewResume = (candidateId: number) => {
    const previewUrl = `${import.meta.env.VITE_BASE_URL}/candidate/${candidateId}/resume/preview`;
    window.open(previewUrl, '_blank');
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
        <Column field="linkedinProfileUrl" header="LinkedIn Profile URL" />
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
