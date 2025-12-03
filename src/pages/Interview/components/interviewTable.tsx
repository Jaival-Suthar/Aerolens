import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import RecordResultsButton from "./RecordResultsButton"; // NEW
import { Toast } from "primereact/toast";
import InterviewDelete from "./interviewDelete";
import InterviewAddEditForm from "./interviewAddEdit";
import InterviewRoundsDialog from "./InterviewRoundsDialog"; // NEW

import { Interview } from "../types/interviewTypes";
import { getInterviews } from "../services/interviewService";
import { useAuth } from "../../../shared/auth/AuthContext";

const InterviewTable: React.FC = () => {
  const { accessToken } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoundsDialog, setShowRoundsDialog] = useState(false); // NEW
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const toast = useRef<Toast>(null);

  /* ------------------------------------------------------------------
      FETCH INTERVIEWS
  ------------------------------------------------------------------ */
  const fetchInterviews = useCallback(async () => {

    if (!accessToken) {
      return;
    }

    setLoading(true);

    try {
      const response = await getInterviews(accessToken);
      if (response?.success) {
        setInterviews(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error("API Error:", response?.message);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: response?.message || "Unknown error",
        });
      }
    } catch (err: any) {
      console.error("Exception while fetching interviews:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch interviews",
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  /* ------------------------------------------------------------------
      ACTION HANDLERS
  ------------------------------------------------------------------ */
  const handleAdd = () => {
    setIsEdit(false);
    setEditingInterview(null);
    setVisible(true);
  };

  const handleEdit = () => {
    if (!selectedInterview) return;
    setIsEdit(true);
    setEditingInterview(selectedInterview);
    setVisible(true);
  };

  const handleDelete = () => {
    if (selectedInterview) setShowDeleteDialog(true);
  };

  // NEW: Handle Record Results button click
  const handleRecordResults = () => {
    if (!selectedInterview) return;
    
    // Allow opening dialog irrespective of status for now
    // TODO: Uncomment below validation once status workflow is finalized
    /*
    if (selectedInterview.status !== 'COMPLETED') {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please mark interview as completed before recording results",
      });
      return;
    }
    */
    
    setShowRoundsDialog(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setSelectedInterview(null);
    fetchInterviews();
  };

  const handleRoundsSuccess = () => {
    setShowRoundsDialog(false);
    setSelectedInterview(null);
    fetchInterviews();
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Interview results recorded successfully",
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Interviews</h2>
        <div className="flex gap-2 align-items-center">
          {/* NEW: Record Results Button - Special CTA */}
          <RecordResultsButton 
            onClick={handleRecordResults} 
            disabled={!selectedInterview}
          />
          
          <AddButton onClick={handleAdd} />
          <EditButton onClick={handleEdit} disabled={!selectedInterview} />
          <DeleteButton onClick={handleDelete} disabled={!selectedInterview} />
        </div>
      </div>

      <DataTable
        value={interviews}
        paginator
        rows={10}
        loading={loading}
        selectionMode="single"
        selection={selectedInterview}
        onSelectionChange={(e) => setSelectedInterview(e.value as Interview | null)}
        dataKey="interviewId"
        emptyMessage="No interviews found."
        scrollable
      >
        <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
        <Column field="candidateName" header="Candidate Name" />
        <Column field="interviewerName" header="Interviewer" />
        <Column field="scheduledByName" header="Scheduled By" />

        <Column
          field="interviewDate"
          header="Date"
          body={(row) => new Date(row.interviewDate).toLocaleDateString("en-GB")}
        />

        <Column
          field="fromTime"
          header="Start Time"
          body={(row) => row.fromTime?.slice(0, 5)}
        />

        <Column field="durationMinutes" header="Duration (min)" />
        
        {/* NEW: Status column to show interview state */}
        {/* <Column 
          field="status" 
          header="Status"
          body={(row) => (
            <span className={`badge ${
              row.status === 'COMPLETED' ? 'badge-success' : 
              row.status === 'SCHEDULED' ? 'badge-info' : 
              'badge-secondary'
            }`}>
              {row.status || 'SCHEDULED'}
            </span>
          )}
        /> */}
      </DataTable>

      {/* Existing Add/Edit Dialog for scheduling */}
      <InterviewAddEditForm
        visible={visible}
        isEdit={isEdit}
        interviewToEdit={editingInterview}
        onHide={() => setVisible(false)}
        onSuccess={() => {
          setVisible(false);
          fetchInterviews();
        }}
      />

      {/* NEW: Rounds Dialog for post-interview results */}
      <InterviewRoundsDialog
        visible={showRoundsDialog}
        interview={selectedInterview}
        onHide={() => setShowRoundsDialog(false)}
        onSuccess={handleRoundsSuccess}
      />

      <InterviewDelete
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        selectedInterview={selectedInterview}
        onSuccess={handleDeleteSuccess}
        onClearSelection={() => setSelectedInterview(null)}
      />
    </>
  );
};

export default InterviewTable;