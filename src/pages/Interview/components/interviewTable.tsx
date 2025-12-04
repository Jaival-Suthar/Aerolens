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

import CogButton from "../../../shared/CogButton";
import InterviewResultDialog from "./interviewResultDialog";
import { FaUserTie, FaClipboardCheck } from "react-icons/fa";

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
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
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
    if (!selectedInterview) {
      toast.current?.show({
        severity: "warn",
        summary: "No Selection",
        detail: "Please select an interview row to schedule next round for that candidate",
        life: 3000,
      });
      return;
    }
    
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

  const handleResultDialogOpen = () => {
    if (!selectedInterview) {
      toast.current?.show({
        severity: "warn",
        summary: "No Selection",
        detail: "Please select an interview to finalize",
        life: 3000,
      });
      return;
    }
    setShowSettingsMenu(false);
    setShowResultDialog(true);
  };

  const handleResultSuccess = () => {
    setShowResultDialog(false);
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

  // Result badge styling
  const resultBodyTemplate = (rowData: Interview) => {
    const result = rowData.result || "Pending";
    
    const getBadgeClass = (result: string) => {
      switch (result) {
        case "Selected":
          return "bg-green-100 text-green-800";
        case "Rejected":
          return "bg-red-100 text-red-800";
        case "Cancelled":
          return "bg-gray-100 text-gray-800";
        case "Pending":
        default:
          return "bg-yellow-100 text-yellow-800";
      }
    };

    return (
      <span
        className={`px-2 py-1 border-round text-sm font-semibold ${getBadgeClass(result)}`}
        style={{ display: "inline-block" }}
      >
        {result}
      </span>
    );
  };

  // Global Search Filter Logic
  const filteredInterviews = interviews.filter((item) => {
    if (!searchText.trim()) return true;
    const text = searchText.toLowerCase();
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(text)
    );
  });

  const settingsItems = [
    {
      label: "Schedule Next Interview",
      icon: <FaUserTie style={{ marginRight: 8, marginLeft: 4 }} />,
      action: () => {
        setShowSettingsMenu(false);
        handleAdd();
      }
    },
    {
      label: "Interview Result",
      icon: <FaClipboardCheck style={{ marginRight: 8, marginLeft: 4 }} />,
      action: handleResultDialogOpen
    }
  ];

  return (
    <>
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Interviews</h2>

        <div className="flex gap-2 align-items-center">
          <SearchButton value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <EditButton onClick={handleEdit} disabled={!selectedInterview} />
          <DeleteButton onClick={handleDelete} disabled={!selectedInterview} />
          <div style={{ position: "relative" }}>
            <CogButton
              onClick={(e) => {
                e.stopPropagation();      // prevents the opening click from closing it
                setShowSettingsMenu((prev) => !prev);
              }}
            />

            {showSettingsMenu && (
              <div
                className="card shadow-3"
                style={{
                  position: "absolute",
                  right: 0,
                  top: 50,
                  zIndex: 1000,
                  minWidth: 220,
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }}
              >
                {settingsItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 cursor-pointer border-round transition-colors transition-duration-150"
                    onClick={item.action}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "6px",
                      marginBottom: idx < settingsItems.length - 1 ? "4px" : "0",
                      transition: "background-color 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span style={{ fontSize: "16px", color: "#6b7280" }}>
                      {item.icon}
                    </span>
                    <span 
                      style={{ 
                        marginLeft: "12px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151"
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DataTable
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
        <Column field="roundNumber" header="Round No." />
        <Column field="totalInterviews" header="Total Rounds" />
        <Column field="result" header="Result" body={resultBodyTemplate} />
        <Column field="interviewDate" header="Date" body={dateBodyTemplate} />
        <Column field="fromTime" header="Start Time" body={timeBodyTemplate} />
        <Column field="toTime" header="End Time" body={endTimeBodyTemplate} />
        <Column field="durationMinutes" header="Duration (min)" />
      </DataTable>

      <InterviewAddEditForm
        visible={visible}
        isEdit={isEdit}
        interviewToEdit={editingInterview}
        candidateId={isEdit ? editingInterview?.candidateId : selectedInterview?.candidateId}
        candidateName={isEdit ? editingInterview?.candidateName : selectedInterview?.candidateName}
        onHide={() => setVisible(false)}
        onSuccess={() => {
          setVisible(false);
          fetchInterviews();
        }}
        externalToast={toast}
      />

      <InterviewDelete
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        selectedInterview={selectedInterview}
        onSuccess={handleDeleteSuccess}
        onClearSelection={() => setSelectedInterview(null)}
      />

      <InterviewResultDialog
        visible={showResultDialog}
        onHide={() => setShowResultDialog(false)}
        selectedInterview={selectedInterview}
        onSuccess={handleResultSuccess}
        externalToast={toast}
      />
    </>
  );
};

export default InterviewTable;