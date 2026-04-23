import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import ExportExcelButton from "../../../shared/ExportExcelButton";
import { Toast } from "primereact/toast";
import InterviewDelete from "./interviewDelete";
import InterviewAddEditForm from "./interviewAddEdit";
import SearchButton from "../../../shared/SearchButton";
import { DateTime } from "luxon";
import DateRangeFilter from "../../InterviewReport/components/DateRangeFilter";
import { Interview } from "../types/interviewTypes";
import { getInterviews } from "../services/interviewService";
import { useAuth } from "../../../shared/auth/AuthContext";
import CandidateRoundsDialog from "./CandidateRoundsDialog";
import CogButton from "../../../shared/CogButton";
import ChangeLogsDialog from "../../../shared/ChangeLogsDialog";
import InterviewDeletedRecordsDialog from "./interviewDeletedRecordsDialog";
import InterviewResultDialog from "./interviewResultDialog";
import { FaUserTie, FaClipboardCheck, FaLink, FaRoute } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { FilterMatchMode } from "primereact/api";
import type { DataTableFilterMeta } from "primereact/datatable";
import type { DataTableFilterMetaData } from "primereact/datatable";
import ColumnSettingsButton from "../../../shared/ColumnSettingsButton";
import ViewButton from "../../../shared/ViewButton";
import PremiumDetailsDialog from "../../../shared/PremiumDetailsDialog";
import DetailsSection from "../../../shared/DetailsSection";
import DetailsGrid from "../../../shared/DetailsGrid";

const formatTimeForTable = (
  backendDateTime: string,
  eventTimezone: string,
  browserTimezone: string
) => {
  const normalized = normalizeBackendDateTime(backendDateTime);
  if (!normalized) return null;

  // 1️⃣ Parse in EVENT timezone (how it was scheduled)
  const eventTime = DateTime
    .fromISO(normalized, { zone: 'utc' }) 
    .setZone(eventTimezone);                   

  // 2️⃣ Convert to VIEWER timezone
  const viewerTime = eventTime.setZone(browserTimezone);

  return {
    text: `${viewerTime.toFormat("hh:mm a")} (${viewerTime.offsetNameShort})`,
    tooltip: `Scheduled in ${eventTimezone}`
  };
};

const normalizeBackendDateTime = (value: string) => {
  if (!value) return null;

  // Convert "2025-12-20 09:15:00.000000" → "2025-12-20T09:15:00"
  return value.includes(" ")
    ? value.replace(" ", "T").split(".")[0]
    : value;
};

const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const ALL_COLUMNS = [
  { field: "candidateName", header: "Candidate Name", filter: true },
  { field: "interviewerName", header: "Interviewer", filter: true },
  { field: "scheduledByName", header: "Scheduled By", filter: true },

  { field: "roundProgress", header: "Round", body: "roundProgress" },
  { field: "result", header: "Result", body: "result", filter: true },
  { field: "interviewDate", header: "Interview Date", body: "date" },

  // ⬇️ Optional columns
  { field: "fromTime", header: "Start Time", body: "startTime", filter: true },
  { field: "toTime", header: "End Time", body: "endTime", filter: true },
  { field: "meetingUrl", header: "Recording", body: "recording" },
  { field: "durationMinutes", header: "Duration (min)", filter: true },
];

type ExportableInterviewRow = Record<string, string | number>;

const DEFAULT_COLUMN_FIELDS = [
  "candidateName",
  "interviewerName",
  "scheduledByName",
  "roundProgress",
  "result",
  "interviewDate",
  "fromTime" // start time stays visible
];
const COLUMN_STORAGE_KEY = "table:interview:columns";

// ============================================================
// MAIN COMPONENT
// ============================================================

const InterviewTable: React.FC = () => {
  const { accessToken } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showDeletedRecordsDialog, setShowDeletedRecordsDialog] = useState(false);
  const [showChangeLogsDialog, setShowChangeLogsDialog] = useState(false);
  const cogMenuRef = useRef<HTMLDivElement | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const toast = useRef<Toast>(null);
  const exportDt = useRef<DataTable<any>>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [viewInterview, setViewInterview] = useState<Interview | null>(null);
  const [rows, setRows] = useState(20);
  const [first, setFirst] = useState((pageFromUrl - 1) * rows);
  const [showRoundsDialog, setShowRoundsDialog] = useState(false);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [visibleColumns, setVisibleColumns] = useState(() => {
  const saved = localStorage.getItem(COLUMN_STORAGE_KEY);

  if (saved) {
    try {
      const savedFields: string[] = JSON.parse(saved);

      return ALL_COLUMNS.filter(col =>
        savedFields.includes(col.field)
      );
    } catch {
      return ALL_COLUMNS.filter(col =>
        DEFAULT_COLUMN_FIELDS.includes(col.field)
      );
    }
  }

  return ALL_COLUMNS.filter(col =>
    DEFAULT_COLUMN_FIELDS.includes(col.field)
  );
});
  useEffect(() => {
  const fields = visibleColumns.map(col => col.field);
  localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(fields));
}, [visibleColumns]);

  useEffect(() => {
    if (!showSettingsMenu) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (cogMenuRef.current && !cogMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showSettingsMenu]);
  const resetToDefaultColumns = () => {
  const defaults = ALL_COLUMNS.filter(col =>
    DEFAULT_COLUMN_FIELDS.includes(col.field)
  );

  setVisibleColumns(defaults);

  localStorage.setItem(
    COLUMN_STORAGE_KEY,
    JSON.stringify(defaults.map(c => c.field))
  );
};


  const onPageChange = (e: any) => {
  setFirst(e.first);
  setRows(e.rows);

  // PrimeReact page starts from 0, but URL starts from 1
  const newPage = e.page + 1;
  setSearchParams({ page: newPage.toString() });
};
const handleViewAllRounds = () => {
  if (!selectedInterview) {
    toast.current?.show({
      severity: "warn",
      summary: "No Selection",
      detail: "Please select an interview first",
      life: 3000,
    });
    return;
  }

  setShowRoundsDialog(true);
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
  if (!rowData.fromTime) return <span>-</span>;

  const normalized = normalizeBackendDateTime(rowData.fromTime);
  if (!normalized) return <span>-</span>;

  // Parse UTC → convert to browser timezone
  const localDT = DateTime
    .fromISO(normalized, { zone: "utc" })
    .setZone(browserTimezone);

  return (
    <span>
      {localDT.toFormat("dd MMM yyyy")}
    </span>
  );
};

  
  const timeBodyTemplate = (rowData: Interview) => {
    const result = formatTimeForTable(
      rowData.fromTime,
      rowData.eventTimezone,
      browserTimezone
    );

    if (!result) return <span>-</span>;

    return <span title={result.tooltip}>{result.text}</span>;
  };


  const endTimeBodyTemplate = (rowData: Interview) => {
    const result = formatTimeForTable(
      rowData.toTime,
      rowData.eventTimezone,
      browserTimezone
    );

    if (!result) return <span>-</span>;

    return <span title={result.tooltip}>{result.text}</span>;
  };

  const resultBodyTemplate = (rowData: Interview) => {
  const result = rowData.result || "Pending";

  const styles: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    Selected: {
      bg: "#ecfdf5",
      border: "#10b981",
      text: "#065f46",
      dot: "#10b981",
    },
    Rejected: {
      bg: "#fef2f2",
      border: "#ef4444",
      text: "#7f1d1d",
      dot: "#ef4444",
    },
    Cancelled: {
      bg: "#f3f4f6",
      border: "#9ca3af",
      text: "#374151",
      dot: "#9ca3af",
    },
    Pending: {
      bg: "#fffbeb",
      border: "#f59e0b",
      text: "#92400e",
      dot: "#f59e0b",
    },
  };

  const s = styles[result];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px 10px",
        borderRadius: "999px",
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
        fontSize: "12px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: s.dot,
        }}
      />
      {result}
    </div>
  );
};


  const meetingUrlBodyTemplate = (rowData: Interview) => {
    if (!rowData.meetingUrl) {
      return <span style={{ color: "#9ca3af" }}>-</span>;
    }

    return (
      <a
        href={rowData.meetingUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Open Interview Recording"
        style={{
          color: "#2563eb",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          textDecoration: "none",
        }}
        onClick={(e) => e.stopPropagation()} // ⛔ prevent row selection change
      >
        <FaLink />
      </a>
    );
  };


  const settingsItems = [
    {
      label: "View Interview Rounds",
      icon: <FaRoute style={{ marginRight: 8, marginLeft: 4 }} />,
      action: () => {
        setShowSettingsMenu(false);
        handleViewAllRounds();
      }
    },
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
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  setFilters((prev) => {
    const next = { ...prev };
    const globalFilter = next.global;

    if (globalFilter && "value" in globalFilter) {
      (globalFilter as DataTableFilterMetaData).value = value;
    }

    return next;
  });
};


const roundProgressBodyTemplate = (rowData: Interview) => {
  const current = rowData.roundNumber;
  const total = rowData.totalInterviews;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "999px",
        background: "#eef2ff",
        color: "#3730a3",
        fontSize: "12px",
        fontWeight: 600,
        border: "1px solid #c7d2fe",
        whiteSpace: "nowrap",
      }}
    >
      <span>Round</span>
      <span>{current}</span>
      <span style={{ opacity: 0.6 }}>/</span>
      <span>{total}</span>
    </div>
  );
};

const normalizeExportValue = (value: unknown): string | number => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : "-";
  }
  return value as string | number;
};

const formatMeetingUrlForExport = (meetingUrl?: string) => {
  if (!meetingUrl) return "-";
  const trimmed = meetingUrl.trim();
  if (!trimmed) return "-";
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
};

const formatInterviewDateForExport = (interview: Interview) => {
  if (!interview.fromTime) return "-";
  const normalized = normalizeBackendDateTime(interview.fromTime);
  if (!normalized) return "-";
  const localDT = DateTime
    .fromISO(normalized, { zone: "utc" })
    .setZone(browserTimezone);
  return localDT.toFormat("dd MMM yyyy");
};

const buildInterviewExportData = (interviewRows: Interview[]): ExportableInterviewRow[] => {
  return interviewRows.map((interview) => {
    const row: ExportableInterviewRow = {};

    ALL_COLUMNS.forEach((col) => {
      let exportValue: string | number = "-";

      switch (col.body) {
        case "roundProgress":
          exportValue = `Round ${normalizeExportValue(interview.roundNumber)} / ${normalizeExportValue(interview.totalInterviews)}`;
          break;
        case "result":
          exportValue = interview.result || "Pending";
          break;
        case "date":
          exportValue = formatInterviewDateForExport(interview);
          break;
        case "startTime": {
          const start = formatTimeForTable(interview.fromTime, interview.eventTimezone, browserTimezone);
          exportValue = start?.text || "-";
          break;
        }
        case "endTime": {
          const end = formatTimeForTable(interview.toTime, interview.eventTimezone, browserTimezone);
          exportValue = end?.text || "-";
          break;
        }
        case "recording":
          exportValue = formatMeetingUrlForExport(interview.meetingUrl);
          break;
        default:
          exportValue = normalizeExportValue((interview as any)[col.field]);
      }

      row[col.header] = normalizeExportValue(exportValue);
    });

    row["Timezone"] = normalizeExportValue(interview.eventTimezone);
    row["Interviewer Feedback"] = normalizeExportValue(interview.interviewerFeedback);
    row["Recruiter Notes"] = normalizeExportValue(interview.recruiterNotes);

    return row;
  });
};

const getInterviewExportHeaders = () => [
  ...ALL_COLUMNS.map((col) => col.header),
  "Timezone",
  "Interviewer Feedback",
  "Recruiter Notes",
];

const buildInterviewDetailsData = (interview: Interview) => {
  const mapped = ALL_COLUMNS.map(col => {
    let value: any = null;

    switch (col.body) {
      case "roundProgress":
        value = `Round ${interview.roundNumber} / ${interview.totalInterviews}`;
        break;
        case "date":
          value = new Date(interview.interviewDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          break;
      // case "date":
      //   value = new Date(interview.interviewDate).toLocaleDateString("en-GB");
      //   break;

      case "startTime": {
        const t = formatTimeForTable(
          interview.fromTime,
          interview.eventTimezone,
          browserTimezone
        );
        value = t ? t.text : "-";
        break;
      }

      case "endTime": {
        const t = formatTimeForTable(
          interview.toTime,
          interview.eventTimezone,
          browserTimezone
        );
        value = t ? t.text : "-";
        break;
      }

      case "result":
        value = interview.result || "Pending";
        break;

      case "recording":
        if (!interview.meetingUrl) {
          value = "-";
        } else {
          const url = interview.meetingUrl.startsWith("http")
            ? interview.meetingUrl
            : `https://${interview.meetingUrl}`;

          value = (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {url}
            </a>
          );
        }
        break;

      default:
        value = (interview as any)[col.field];
    }

    return {
      label: col.header,
      value: value ?? "-"
    };
  });

  // ✅ NOW return everything together
  return [
    ...mapped,
    {
      label: "Timezone",
      value: interview.eventTimezone ?? "-"
    },
    {
      label: "Interviewer Feedback",
      value: interview.interviewerFeedback ?? "-",
      fullWidth: true   // 👈 add this

    },
    {
      label: "Recruiter Notes",
      value: interview.recruiterNotes ?? "-",
      fullWidth: true   // 👈 add this
    }
  ];
};
  const uniqueValues = <T,>(arr: (T | null | undefined)[]) =>
  Array.from(new Set(arr.filter(Boolean)));

const interviewerFilterTemplate = (options: any) => (
  <Dropdown
    value={options.value}
    options={uniqueValues(interviews.map(i => i.interviewerName))}
    onChange={(e) => options.filterCallback(e.value)}
    placeholder="Select Interviewer"
    showClear
  />
);

const scheduledByFilterTemplate = (options: any) => (
  <Dropdown
    value={options.value}
    options={uniqueValues(interviews.map(i => i.scheduledByName))}
    onChange={(e) => options.filterCallback(e.value)}
    placeholder="Select Scheduler"
    showClear
  />
);

const resultFilterTemplate = (options: any) => (
  <Dropdown
    value={options.value}
    options={["Pending", "Selected", "Rejected", "Cancelled"]}
    onChange={(e) => options.filterCallback(e.value)}
    placeholder="Select Result"
    showClear
  />
);
const filteredInterviews = interviews.filter((interview) => {
  if (!dateRange.startDate && !dateRange.endDate) return true;
  if (!interview.fromTime) return false;

  const normalized = normalizeBackendDateTime(interview.fromTime);
  if (!normalized) return false;

  const interviewDate = DateTime
    .fromISO(normalized, { zone: "utc" })
    .setZone(browserTimezone)
    .toFormat("yyyy-MM-dd");

  if (dateRange.startDate && interviewDate < dateRange.startDate)
    return false;

  if (dateRange.endDate && interviewDate > dateRange.endDate)
    return false;

  return true;
});

const interviewExportData = useMemo(
  () => buildInterviewExportData(interviews),
  [interviews]
);
const interviewExportHeaders = useMemo(
  () => getInterviewExportHeaders(),
  []
);

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        ref={exportDt}
        value={interviewExportData}
        exportFilename="interviews"
        style={{ display: "none" }}
      >
        {interviewExportHeaders.map((header) => (
          <Column key={`export-${header}`} field={header} header={header} />
        ))}
      </DataTable>
      <div className="flex justify-content-between align-items-center mb-2">
        <h2 style={{ color: "#07253f" }}>Interviews</h2>
        <div className="flex gap-2 align-items-center">
          <SearchButton
            value={('value' in (filters.global || {}) ? (filters.global as DataTableFilterMetaData).value : "") || ""}
            onChange={onGlobalFilterChange}
            placeholder="Search interviews..."
          />
          <ColumnSettingsButton
            value={visibleColumns}
            options={ALL_COLUMNS}
            optionLabel="header"
            onChange={setVisibleColumns}
            onReset={resetToDefaultColumns}
          />
          <ExportExcelButton
            {...({
              data: interviewExportData,
              fileName: "interviews",
              dtRef: exportDt,
            } as any)}
          />
          <EditButton onClick={handleEdit} disabled={!selectedInterview} />
          <DeleteButton onClick={handleDelete} disabled={!selectedInterview} />
          <ViewButton onClick={() => setViewInterview(selectedInterview)} disabled={!selectedInterview} tooltip="View Interview Details" />
          <div ref={cogMenuRef} style={{ position: "relative" }}>
            <CogButton onClick={() => setShowSettingsMenu((prev) => !prev)} tooltip="More Actions" />
            {showSettingsMenu && (
              <div className="card shadow-3" style={{ position: "absolute", right: 0, top: 50, zIndex: 1000, minWidth: 220, backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" }}>
                {settingsItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 border-round"
                    role="button"
                    tabIndex={!selectedInterview ? -1 : 0}
                    onClick={() => { if (!selectedInterview) return; item.action(); }}
                    style={{ display: "flex", alignItems: "center", cursor: !selectedInterview ? "not-allowed" : "pointer", opacity: !selectedInterview ? 0.45 : 1, marginBottom: "4px" }}
                    onMouseEnter={(e) => { if (selectedInterview) e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <span style={{ fontSize: "16px", color: "#374151" }}>{item.icon}</span>
                    <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>{item.label}</span>
                  </div>
                ))}
                <div
                  className="p-2 border-round"
                  role="button"
                  tabIndex={0}
                  onClick={() => { setShowSettingsMenu(false); setShowChangeLogsDialog(true); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowSettingsMenu(false); setShowChangeLogsDialog(true); } }}
                  style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <i className="pi pi-history" style={{ fontSize: "14px", color: "#374151" }} />
                  <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>Change Logs</span>
                </div>
                <div
                  className="p-2 border-round"
                  role="button"
                  tabIndex={0}
                  onClick={() => { setShowSettingsMenu(false); setShowDeletedRecordsDialog(true); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowSettingsMenu(false); setShowDeletedRecordsDialog(true); } }}
                  style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <i className="pi pi-trash" style={{ fontSize: "14px", color: "#374151" }} />
                  <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>Deleted Interviews</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
      <DataTable
        value={filteredInterviews}
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
        rowsPerPageOptions={[20 ,50, 100]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Members"
        totalRecords={filteredInterviews.length}
        // globalFilter={searchText}
        // globalFilterFields={[
        //   "candidateName",
        //   "interviewerName",
        //   "scheduledByName",
        //   "roundNumber",
        //   "totalInterviews",
        //   "result",
        //   "interviewDate",
        //   "fromTime",
        //   "toTime",
        //   "durationMinutes"
        // ]}
      >
        <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
        {visibleColumns.map((col) => {
          let bodyTemplate;
          let filterElement;
          if (col.body === "roundProgress") bodyTemplate = roundProgressBodyTemplate;
          if (col.body === "result") bodyTemplate = resultBodyTemplate;

          // if (col.body === "date") bodyTemplate = dateBodyTemplate;

          if (col.body === "date") {
            return (
              <Column
                key={col.field}
                field={col.field}
                header={
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>{col.header}</span>
          
                    <DateRangeFilter
                      compact
                      initialStartDate={dateRange.startDate}
                      initialEndDate={dateRange.endDate}
                      onApply={(startDate, endDate) => {
                        setDateRange({ startDate, endDate });
                        setFirst(0);
                      }}
                      onClear={() => {
                        setDateRange({});
                        setFirst(0);
                      }}
                    />
                  </div>
                }
                body={dateBodyTemplate}
              />
            );
          }

          if (col.body === "recording") bodyTemplate = meetingUrlBodyTemplate;
          if (col.body === "startTime") bodyTemplate = timeBodyTemplate;
          if (col.body === "endTime") bodyTemplate = endTimeBodyTemplate;
          if (col.field === "interviewerName") {
            filterElement = interviewerFilterTemplate;
          }

          if (col.field === "scheduledByName") {
            filterElement = scheduledByFilterTemplate;
          }

          if (col.field === "result") {
            filterElement = resultFilterTemplate;
          }
          return (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={bodyTemplate}
              filter={col.filter}
              filterElement={filterElement}
              sortable
              showFilterMatchModes={false}
            />
          );
        })}
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
      <PremiumDetailsDialog
        visible={!!viewInterview}
        title="Interview Details"
        onHide={() => setViewInterview(null)}
      >
        {viewInterview && (
          <DetailsSection title="Complete Interview Information">
            <DetailsGrid
              items={buildInterviewDetailsData(viewInterview)}
            />
          </DetailsSection>
        )}
      </PremiumDetailsDialog>
      <CandidateRoundsDialog
        visible={showRoundsDialog}
        candidateId={selectedInterview?.candidateId ?? null}
        candidateName={selectedInterview?.candidateName}
        onHide={() => setShowRoundsDialog(false)}
      />
      <InterviewDeletedRecordsDialog
        isOpen={showDeletedRecordsDialog}
        onClose={() => setShowDeletedRecordsDialog(false)}
      />
      <ChangeLogsDialog
        isOpen={showChangeLogsDialog}
        onClose={() => setShowChangeLogsDialog(false)}
        title="Interview Change Logs"
      />
    </>
  );
};

export default InterviewTable;
