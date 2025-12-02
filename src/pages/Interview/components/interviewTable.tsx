import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";

// import InterviewAddEdit from "./interviewAddEdit";
import InterviewDelete from "./interviewDelete";

import { Interview } from "../types/useInterview";
import { getInterviews, deleteInterview } from "../services/useInterview";

const InterviewTable: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  const toast = useRef<Toast>(null);

  const fetchInterviews = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const response = await getInterviews(token);
      if (response.success) setInterviews(response.data);
      else toast.current?.show({ severity: "error", summary: "Error", detail: response.message });
    } catch (error: any) {
      console.error(error);
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to fetch interviews" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  /** ------------------- Handlers ------------------- */
  const handleAdd = () => {
    setEditingInterview(null);
    setShowAddEditDialog(true);
  };

  const handleEdit = () => {
    if (selectedInterview) {
      setEditingInterview(selectedInterview);
      setShowAddEditDialog(true);
    }
  };

  const handleDelete = () => {
    if (selectedInterview) {
      setShowDeleteDialog(true);
    }
  };

  const handleAddEditSuccess = () => {
    setShowAddEditDialog(false);
    fetchInterviews();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setSelectedInterview(null);
    fetchInterviews();
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="flex justify-content-end mb-4">
        <div className="flex gap-2">
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
        <Column field="interviewId" header="ID" style={{ width: "80px" }} />
        <Column field="candidateName" header="Candidate" />
        <Column field="interviewerName" header="Interviewer" />
        <Column field="scheduledByName" header="Scheduled By" />
        <Column field="interviewDate" header="Date" />
        <Column field="fromTime" header="Start Time" />
        <Column field="durationMinutes" header="Duration (min)" />
        <Column field="result" header="Result" />
      </DataTable>

      {/* ------------------- Dialogs ------------------- */}
      {/* <InterviewAddEdit
        visible={showAddEditDialog}
        onHide={() => setShowAddEditDialog(false)}
        selectedInterview={editingInterview}
        onSuccess={handleAddEditSuccess}
      /> */}

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
