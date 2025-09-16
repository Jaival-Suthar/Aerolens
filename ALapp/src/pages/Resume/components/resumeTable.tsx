import React, { useState, useEffect, useCallback } from "react";
import { DataTable, DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
// import ResumeAddEdit from "../components/resumeAddEdit";
// import ResumeDelete from "../components/resumeDelete";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import { Candidate, ResumeTableProps } from "../types/resumeTypes";
import { getCandidates } from "../services/useResume";

const ResumeTable: React.FC<ResumeTableProps> = ({ candidateId, candidateName, onBackClick }) => {
  const [resumes, setResumes] = useState<Candidate[]>([]);
  const [selectedResume, setSelectedResume] = useState<Candidate | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingResume, setEditingResume] = useState<Candidate | null>(null);

  const loadResumes = useCallback(async () => {
    try {
      const data = await getCandidates();
      setResumes(data.candidates);
      console.log(resumes)
    } catch (error) {
      console.error("Error loading resumes:", error);
    }
  }, []);

  useEffect(() => {
    if (candidateId) loadResumes();
  }, [candidateId, loadResumes]);

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

  return (
    <>
      <div className="flex justify-content-between mb-4 w-full">
        <div className="flex gap-2">

        </div>
        <div className="flex gap-2">
          <AddButton onClick={handleAdd} disabled={!candidateId} />
          <EditButton onClick={handleEdit} disabled={!selectedResume} />
          <DeleteButton onClick={handleDelete} disabled={!selectedResume} />
        </div>
      </div>

      <h4>Resumes for: {candidateName}</h4>

      <DataTable
  value={resumes}
  paginator
  rows={5}
  rowsPerPageOptions={[5, 10, 20]}
  selectionMode="single"
  selection={selectedResume}
  onSelectionChange={(e:any) => setSelectedResume(e.value)}
  tableStyle={{ minWidth: "80rem" }}
>
  <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
  <Column field="candidateName" header="Candidate Name" />
  <Column field="contactNumber" header="Contact Number" />
  <Column field="email" header="Email" />
  <Column field="recruiter" header="Recruiter" />
  <Column field="role" header="Role" />
  <Column field="preferredLocation" header="Preferable Location" />
  <Column field="currentCTC" header="Current CTC" />
  <Column field="expectedCTC" header="Expected CTC" />
  <Column field="noticePeriod" header="Notice Period" />
  <Column field="experience" header="Experience" />
  <Column field="status" header="Status" />
  <Column field="linkedinProfile" header="LinkedIn Profile URL" />
</DataTable>


      {/* Add/Edit Dialog */}
      {/* <ResumeAddEdit
        visible={showAddEditDialog}
        onHide={() => setShowAddEditDialog(false)}
        selectedResume={editingResume}
        candidateId={candidateId}
        resumes={resumes}
        setResumes={setResumes}
        onSuccess={handleAddEditSuccess}
      /> */}

      {/* Delete Dialog */}
      {/* <ResumeDelete
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        selectedResume={selectedResume}
        resumes={resumes}
        setResumes={setResumes}
        onSuccess={handleDeleteSuccess}
        onClearSelection={handleClearSelection}
      /> */}
    </>
  );
};

export default ResumeTable;
