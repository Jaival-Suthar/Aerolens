import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import { Toast } from "primereact/toast";
import InterviewDelete from "./interviewDelete";
import InterviewAddEditForm from "./interviewAddEdit";
import SearchButton from "../../../shared/SearchButton";

import { Interview } from "../types/interviewTypes";
import { getInterviews } from "../services/interviewService";
import { useAuth } from "../../../shared/auth/AuthContext";

// ============================================================
// TIME CONVERSION UTILITY
// ============================================================
const convert24to12Hour = (time24: string): string => {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12; 
  
  const period = hours >= 12 ? 'PM' : 'AM';
  
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const InterviewTable: React.FC = () => {
  const { accessToken } = useAuth();
  const [searchText, setSearchText] = useState("");

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const toast = useRef<Toast>(null);

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
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: response?.message || "Unknown error",
        });
      }
    } catch (err: any) {
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

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setSelectedInterview(null);
    fetchInterviews();
  };

  const dateBodyTemplate = (rowData: Interview) => {
    const date = new Date(rowData.interviewDate);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  
  const timeBodyTemplate = (rowData: Interview) => {
    return convert24to12Hour(rowData.fromTime);
  };

  const endTimeBodyTemplate = (rowData: Interview) => {
    return convert24to12Hour(rowData.toTime);
  };

  // ------------------------------------------------------------
  // ✅ ADDITION #1 — Global Search Filter Logic (NO CHANGES)
  // ------------------------------------------------------------
  const filteredInterviews = interviews.filter((item) => {
    if (!searchText.trim()) return true;
    const text = searchText.toLowerCase();
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(text)
    );
  });

  return (
    <>
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Interviews</h2>

        <div className="flex gap-2 align-items-center">

          {/* ------------------------------------------------------------ */}
          {/* ✅ ADDITION #2 — Add Search Button */}
          {/* ------------------------------------------------------------ */}
          <SearchButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <AddButton onClick={handleAdd} />
          <EditButton onClick={handleEdit} disabled={!selectedInterview} />
          <DeleteButton onClick={handleDelete} disabled={!selectedInterview} />
        </div>
      </div>

      <DataTable
        /* ------------------------------------------------------------ */
        /* ✅ ADDITION #3 — Use filtered list instead of interviews     */
        /* ------------------------------------------------------------ */
        value={filteredInterviews}
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

        <Column field="interviewDate" header="Date" body={dateBodyTemplate} />
        <Column field="fromTime" header="Start Time" body={timeBodyTemplate} />
        <Column field="toTime" header="End Time" body={endTimeBodyTemplate} />
        <Column field="durationMinutes" header="Duration (min)" />
      </DataTable>

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
