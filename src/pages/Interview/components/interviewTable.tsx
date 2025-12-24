import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
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
import { useSearchParams } from "react-router-dom";
import { FilterMatchMode } from "primereact/api";
import type { DataTableFilterMeta } from "primereact/datatable";

const convert24to12Hour = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

const InterviewTable: React.FC = () => {
  const { accessToken } = useAuth();
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
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState((pageFromUrl - 1) * rows);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    candidateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    interviewerName: { value: null, matchMode: FilterMatchMode.EQUALS },
    scheduledByName: { value: null, matchMode: FilterMatchMode.EQUALS },
    roundNumber: { value: null, matchMode: FilterMatchMode.EQUALS },
    totalInterviews: { value: null, matchMode: FilterMatchMode.EQUALS },
    result: { value: null, matchMode: FilterMatchMode.EQUALS },
    interviewDate: { value: null, matchMode: FilterMatchMode.EQUALS },
    fromTime: { value: null, matchMode: FilterMatchMode.CONTAINS },
    toTime: { value: null, matchMode: FilterMatchMode.CONTAINS },
    durationMinutes: { value: null, matchMode: FilterMatchMode.EQUALS }
  });

  const onPageChange = (e: any) => {
    setFirst(e.first);
    setRows(e.rows);
    const newPage = e.page + 1;
    setSearchParams({ page: newPage.toString() });
  };

  const fetchInterviews = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await getInterviews(accessToken);
      if (response?.success) {
        setInterviews(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.current?.show({ severity: "error", summary: "Error", detail: response?.message || "Unknown error" });
      }
    } catch (err: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to fetch interviews" });
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchInterviews(); }, [fetchInterviews]);

  const handleAdd = () => {
    if (!selectedInterview) {
      toast.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select an interview row to schedule next round for that candidate", life: 3000 });
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
      toast.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select an interview to finalize", life: 3000 });
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
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  
  const timeBodyTemplate = (rowData: Interview) => convert24to12Hour(rowData.fromTime);
  const endTimeBodyTemplate = (rowData: Interview) => convert24to12Hour(rowData.toTime);

  const resultBodyTemplate = (rowData: Interview) => {
    const result = rowData.result || "Pending";
    const getBadgeClass = (result: string) => {
      switch (result) {
        case "Selected": return "bg-green-100 text-green-800";
        case "Rejected": return "bg-red-100 text-red-800";
        case "Cancelled": return "bg-gray-100 text-gray-800";
        case "Pending":
        default: return "bg-yellow-100 text-yellow-800";
      }
    };
    return (
      <span className={`px-2 py-1 border-round text-sm font-semibold ${getBadgeClass(result)}`} style={{ display: "inline-block" }}>
        {result}
      </span>
    );
  };

  const settingsItems = [
    {
      label: "Schedule Next Interview",
      icon: <FaUserTie style={{ marginRight: 8, marginLeft: 4 }} />,
      action: () => { setShowSettingsMenu(false); handleAdd(); }
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
          <EditButton onClick={handleEdit} disabled={!selectedInterview} />
          <DeleteButton onClick={handleDelete} disabled={!selectedInterview} />
          <div style={{ position: "relative" }}>
            <CogButton
              onClick={(e) => { e.stopPropagation(); setShowSettingsMenu((prev) => !prev); }}
            />
            {showSettingsMenu && (
              <div className="card shadow-3" style={{ position: "absolute", right: 0, top: 50, zIndex: 1000, minWidth: 220, backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.5rem" }}>
                {settingsItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 cursor-pointer border-round transition-colors transition-duration-150"
                    onClick={item.action}
                    style={{ display: "flex", alignItems: "center", borderRadius: "6px", marginBottom: idx < settingsItems.length - 1 ? "4px" : "0", transition: "background-color 0.15s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <span style={{ fontSize: "16px", color: "#6b7280" }}>{item.icon}</span>
                    <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <DataTable
          value={interviews}
          loading={loading}
          selectionMode="single"
          selection={selectedInterview}
          onSelectionChange={(e) => setSelectedInterview(e.value as Interview | null)}
          dataKey="interviewId"
          emptyMessage="No interviews found."
          scrollable
          scrollHeight="flex"
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          filterDisplay="menu"
          filters={filters}
          onFilter={(e) => setFilters(e.filters)}
          rowsPerPageOptions={[10, 20, 50]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Members"
          totalRecords={interviews.length}
        >
          <Column selectionMode="single" headerStyle={{ width: "3rem" }} />

          <Column field="candidateName" header="Candidate Name" filter />
          
          <Column
            field="interviewerName"
            header="Interviewer"
            filter
            filterElement={(options) => (
              <Dropdown
                value={options.value}
                options={interviews.map(i => i.interviewerName).filter((v, i, a) => a.indexOf(v) === i)}
                onChange={(e) => options.filterCallback(e.value)}
                placeholder="Select Interviewer"
                showClear
              />
            )}
          />

          <Column
            field="scheduledByName"
            header="Scheduled By"
            filter
            filterElement={(options) => (
              <Dropdown
                value={options.value}
                options={interviews.map(i => i.scheduledByName).filter((v, i, a) => a.indexOf(v) === i)}
                onChange={(e) => options.filterCallback(e.value)}
                placeholder="Select Scheduler"
                showClear
              />
            )}
          />

          <Column field="roundNumber" header="Round No." filter />
          <Column field="totalInterviews" header="Total Rounds" filter />

          <Column
            field="result"
            header="Result"
            body={resultBodyTemplate}
            filter
            filterElement={(options) => (
              <Dropdown
                value={options.value}
                options={["Pending", "Selected", "Rejected", "Cancelled"]}
                onChange={(e) => options.filterCallback(e.value)}
                placeholder="Select Result"
                showClear
              />
            )}
          />

          <Column
            field="interviewDate"
            header="Date"
            body={dateBodyTemplate}
            filter
            filterElement={(options) => (
              <Calendar
                value={options.value}
                onChange={(e) => options.filterCallback(e.value)}
                dateFormat="dd/mm/yy"
                placeholder="Select a date"
                showIcon
                showButtonBar
              />
            )}
          />

          <Column field="fromTime" header="Start Time" body={timeBodyTemplate} filter />
          <Column field="toTime" header="End Time" body={endTimeBodyTemplate} filter />
          <Column field="durationMinutes" header="Duration (min)" filter />
        </DataTable>
      </div>

      <InterviewAddEditForm
        visible={visible}
        isEdit={isEdit}
        interviewToEdit={editingInterview}
        candidateId={isEdit ? editingInterview?.candidateId : selectedInterview?.candidateId}
        candidateName={isEdit ? editingInterview?.candidateName : selectedInterview?.candidateName}
        onHide={() => setVisible(false)}
        onSuccess={() => { setVisible(false); fetchInterviews(); }}
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
