import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { FaCopy, FaDownload, FaEye, FaRoute, FaWhatsapp } from "react-icons/fa";
import BulkExcelUploadButton from "../../../shared/BulkExcepUploadButton";
import ResumeAddEdit from "../components/resumeAddEdit";
import ResumeDelete from "./resumeDelete";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import { useSearchParams } from "react-router-dom";
import DateRangeFilter from "../../InterviewReport/components/DateRangeFilter";
import { Candidate, CandidateCreateData, type WhatsAppGroup } from "../types/resumeTypes";
import { getCandidates, downloadResume, fetchCandidateCreateData, bulkUploadCandidates, bulkUploadResumes } from "../services/useResume";
import { getWhatsAppGroups, getWhatsAppShareLog, queueWhatsAppSendResume } from "../services/whatsappService";
import { buildWhatsAppSharePreviewText } from "../utils/whatsappSharePreview";
import { showGlobalToast } from "../../../shared/services/globalToastService";
import { useAuth } from "../../../shared/auth/AuthContext";
import SearchButton from "../../../shared/SearchButton";
import ExportExcelButton from "../../../shared/ExportExcelButton";
import { FilterMatchMode } from 'primereact/api';
import { FaUserTie } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";
import CogButton from "../../../shared/CogButton";
import { Toast } from "primereact/toast";
import InterviewScheduler from "../../../shared/InterviewScheduler";
import ResumeOnBoarding from "./resumeOnBoarding";
import ViewButton from "../../../shared/ViewButton";
import DetailsGrid from "../../../shared/DetailsGrid";
import DetailsSection from "../../../shared/DetailsSection";
import PremiumDetailsDialog from "../../../shared/PremiumDetailsDialog";
import ColumnSettingsButton from "../../../shared/ColumnSettingsButton";
import CandidateRoundsDialog from "../../Interview/components/CandidateRoundsDialog";
import { Dropdown } from "primereact/dropdown";
import BulkPdfUploadButton from "../../../shared/BulkPdfUploadButton";
import CandidateDeletedRecordsDialog from "./candidateDeletedRecordsDialog";
import ChangeLogsDialog from "../../../shared/ChangeLogsDialog";
import ResumeAnalysisDialog from "./ResumeAnalysisDialog";
import {
  RESUME_BULK_BATCH_FINISHED_EVENT,
  startBulkResumeBatchTracking,
} from "../../../shared/services/bulkResumeBatchTracker";

const ALL_COLUMNS = [
  { field: "dateOfEntry", header: "Sourced On ", sortable: true, body: "dateTemplate" },
  { field: "candidateName", header: "Candidate Name", sortable: true, filter: true },
  { field: "contact", header: "Candidate Contact", body: "candidateContactTemplate", sortable: true, filter: true, filterField: "contactNumber" },
  { field: "jobRole", header: "Role", sortable: true, filter: true },
  { field: "noticePeriod", header: "Notice Period", sortable: true, filter: true },
  { field: "experienceYears", header: "YOE", sortable: true, filter: true },
  { field: "workMode", header: "Mode of Work", sortable: true, filter: true },
  { field: "expectedLocation.city", header: "Expected Working Location", body: "formatLocation", sortable: true, filter: true },
  { field: "currentCTCAmount", header: "Current CTC", sortable: true, filter: true },
  { field: "expectedCTCAmount", header: "Expected CTC", sortable: true, filter: true },
  { field: "statusName", header: "Interview Result", sortable: true, filter: true },
  { field: "recruiterName", header: "Recruiter", sortable: true, filter: true },
  { field: "vendorName", header: "Vendor", sortable: true, filter: true },
  { field: "referredBy", header: "Referred By", sortable: true, filter: true },
  { field: "currentLocation.city", header: "Current Working Location", body: "formatCurrentLocation", sortable: true, filter: true },
  { field: "linkedinProfileUrl", header: "LinkedIn Profile", body: "linkedInTemplate" },
  { field: "notes", header: "Notes", sortable: true, filter: true },
];

type ExportColumnDef = {
  field: string;
  header: string;
};

const EXPORT_COLUMN_CONFIG_BY_FIELD: Record<string, ExportColumnDef[]> = {
  dateOfEntry: [{ field: "sourcedOn", header: "Sourced On" }],
  candidateName: [{ field: "candidateName", header: "Candidate Name" }],
  contact: [
    { field: "candidateContactNumber", header: "Candidate Contact Number" },
    { field: "candidateEmail", header: "Candidate Email" },
  ],
  jobRole: [{ field: "role", header: "Role" }],
  noticePeriod: [{ field: "noticePeriod", header: "Notice Period" }],
  experienceYears: [{ field: "yoe", header: "YOE" }],
  workMode: [{ field: "modeOfWork", header: "Mode of Work" }],
  "expectedLocation.city": [{ field: "expectedWorkingLocation", header: "Expected Working Location" }],
  "currentLocation.city": [{ field: "currentWorkingLocation", header: "Current Working Location" }],
  currentCTCAmount: [{ field: "currentCTC", header: "Current CTC" }],
  expectedCTCAmount: [{ field: "expectedCTC", header: "Expected CTC" }],
  statusName: [{ field: "interviewResult", header: "Interview Result" }],
  recruiterName: [{ field: "recruiter", header: "Recruiter" }],
  vendorName: [{ field: "vendor", header: "Vendor" }],
  referredBy: [{ field: "referredBy", header: "Referred By" }],
  linkedinProfileUrl: [{ field: "linkedInProfile", header: "LinkedIn Profile" }],
  notes: [{ field: "notes", header: "Notes" }],
};

const EXPORT_COLUMNS: ExportColumnDef[] = [
  ...ALL_COLUMNS.flatMap((column) => {
    const mappedColumns = EXPORT_COLUMN_CONFIG_BY_FIELD[column.field];
    if (mappedColumns) return mappedColumns;
    return [{ field: column.field.replace(/\./g, "_"), header: column.header.trim() || column.field }];
  }),
  { field: "resume", header: "Resume" },
];

const DEFAULT_COLUMN_FIELDS = ["dateOfEntry","candidateName", "contact", "jobRole", "experienceYears", "noticePeriod", "workMode", "expectedLocation.city", "currentCTCAmount", "expectedCTCAmount", "statusName", "recruiterName", "vendorName", "referredBy"];
const COLUMN_STORAGE_KEY = "candidateTable.visibleColumns";
/** Backend max for customMessage / template {{9}} */
const WHATSAPP_NOTE_MAX_LENGTH = 1024;
const WHATSAPP_POLL_INTERVAL_MS = 2000;
const WHATSAPP_POLL_MAX_ATTEMPTS = 120;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Poll GET /whatsapp/shares/:queueId until queue status is DONE or FAILED; final toast uses global host (works across routes). */
async function pollWhatsAppShareUntilTerminal(
  accessToken: string,
  queueId: number,
  candidateLabel: string
): Promise<void> {
  for (let attempt = 0; attempt < WHATSAPP_POLL_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await delay(WHATSAPP_POLL_INTERVAL_MS);
    }
    try {
      const data = await getWhatsAppShareLog(accessToken, queueId);
      const status = String(data.queue.status || "").toUpperCase();

      if (status === "DONE") {
        const msgs = data.messages;
        const sent = msgs.filter((m) => String(m.messageStatus || "").toUpperCase() === "SENT").length;
        const failed = msgs.filter((m) => String(m.messageStatus || "").toUpperCase() === "FAILED").length;
        let detail =
          msgs.length === 0
            ? "Job finished; no per-recipient log rows returned."
            : `${sent} sent${failed ? `, ${failed} failed` : ""}.`;
        const firstFail = msgs.find((m) => String(m.messageStatus || "").toUpperCase() === "FAILED");
        if (firstFail?.errorMessage?.trim()) {
          detail += ` ${firstFail.errorMessage.trim()}`;
        }
        showGlobalToast({
          severity: failed > 0 ? "warn" : "success",
          summary: `WhatsApp share #${queueId} complete`,
          detail: `${candidateLabel}: ${detail}`,
          life: 8000,
        });
        return;
      }

      if (status === "FAILED") {
        showGlobalToast({
          severity: "error",
          summary: `WhatsApp share #${queueId} failed`,
          detail: `${candidateLabel}: The job did not complete successfully.`,
          life: 8000,
        });
        return;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load share status.";
      showGlobalToast({
        severity: "error",
        summary: "WhatsApp share status",
        detail: msg,
        life: 7000,
      });
      return;
    }
  }

  showGlobalToast({
    severity: "warn",
    summary: "WhatsApp share status",
    detail: `Job #${queueId} (${candidateLabel}): timed out waiting for completion.`,
    life: 8000,
  });
}

const ResumeTable: React.FC = () => {
  const { accessToken } = useAuth();
  const [resumes, setResumes] = useState<Candidate[]>([]);
  const [selectedResume, setSelectedResume] = useState<Candidate | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingResume, setEditingResume] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showDeletedRecordsDialog, setShowDeletedRecordsDialog] = useState(false);
  const [showChangeLogsDialog, setShowChangeLogsDialog] = useState(false);
  const [auditTargetCandidate, setAuditTargetCandidate] = useState<Candidate | null>(null);
  const cogMenuRef = useRef<HTMLDivElement | null>(null);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [whatsAppGroups, setWhatsAppGroups] = useState<WhatsAppGroup[]>([]);
  const [whatsAppGroupsLoading, setWhatsAppGroupsLoading] = useState(false);
  const [whatsAppGroupError, setWhatsAppGroupError] = useState<string | null>(null);
  const [whatsAppSelectedGroupId, setWhatsAppSelectedGroupId] = useState<number | null>(null);
  const [whatsAppNote, setWhatsAppNote] = useState("");
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const toastRef = useRef<Toast>(null);
  const [rows, setRows] = useState(20);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [first, setFirst] = useState((pageFromUrl - 1) * 10);
  const [showRoundsDialog, setShowRoundsDialog] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const dt = useRef<DataTable<any>>(null);
  const exportDt = useRef<DataTable<any>>(null);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (saved) {
      const savedFields = JSON.parse(saved);
      return ALL_COLUMNS.filter(col => savedFields.includes(col.field));
    }
    return ALL_COLUMNS.filter(col => DEFAULT_COLUMN_FIELDS.includes(col.field));
  });
  useEffect(() => {
    const fields = visibleColumns.map(col => col.field);
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(fields));
  }, [visibleColumns]);
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [createData, setCreateData] = useState<CandidateCreateData | null>(null);
  const [loadingCreateData, setLoadingCreateData] = useState(false);
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    candidateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    recruiterName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    vendorName: { value: null, matchMode: FilterMatchMode.EQUALS },
    referredBy: { value: null, matchMode: FilterMatchMode.CONTAINS },
    recruiterContact: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "expectedLocation.city": { value: null, matchMode: FilterMatchMode.CONTAINS },
    "currentLocation.city": { value: null, matchMode: FilterMatchMode.CONTAINS },
    jobRole: { value: null, matchMode: FilterMatchMode.CONTAINS },
    statusName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    contactNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    workMode: { value: null, matchMode: FilterMatchMode.CONTAINS },
    currentCTCAmount: { value: null, matchMode: FilterMatchMode.EQUALS },
    expectedCTCAmount: { value: null, matchMode: FilterMatchMode.EQUALS },
    noticePeriod: { value: null, matchMode: FilterMatchMode.EQUALS },
    experienceYears: { value: null, matchMode: FilterMatchMode.EQUALS },
    notes: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // dateOfEntry: { value: null, matchMode: FilterMatchMode.CUSTOM }
  });

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    // const date = new Date(dateString);
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const loadAllData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setLoadingCreateData(true);
    try {
      const [candidatesResult, createDataResult] = await Promise.all([
        getCandidates(accessToken, 1, 10000),
        fetchCandidateCreateData(accessToken)
      ]);
      setResumes(Array.isArray(candidatesResult.candidates) ? candidatesResult.candidates : []);
      setCreateData(createDataResult);
    } catch (error) {
      console.error("Error loading data:", error);
      setResumes([]);
    } finally {
      setLoading(false);
      setLoadingCreateData(false);
    }
  }, [accessToken]);

useEffect(() => {
  loadAllData();
}, [loadAllData]);

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

useEffect(() => {
  const handleBatchFinished = () => {
    loadAllData();
  };

  window.addEventListener(
    RESUME_BULK_BATCH_FINISHED_EVENT,
    handleBatchFinished
  );

  return () => {
    window.removeEventListener(
      RESUME_BULK_BATCH_FINISHED_EVENT,
      handleBatchFinished
    );
  };
}, [loadAllData]);

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
    const newPage = event.page + 1;
    setSearchParams({ page: newPage.toString() });
  };

  const handleAdd = () => { setEditingResume(null); setShowAddEditDialog(true); };
  const handleEdit = () => { if (selectedResume) { setEditingResume(selectedResume); setShowAddEditDialog(true); } };
  const handleDelete = () => { if (selectedResume) setShowDeleteDialog(true); };
  const handleAddEditSuccess = () => { setShowAddEditDialog(false); setSelectedResume(null); loadAllData(); };
  const handleDeleteSuccess = () => { setShowDeleteDialog(false); setSelectedResume(null); loadAllData(); };

  const getNestedValue = (obj: any, path: string) => path.split(".").reduce((acc, key) => acc?.[key], obj);
  const getExportField = (field: string) =>
    EXPORT_COLUMN_CONFIG_BY_FIELD[field]?.[0]?.field || field.replace(/\./g, "_");

  const normalizeExportValue = (value: unknown): string | number => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed ? trimmed : "-";
    }
    return value as string | number;
  };

  const formatLocationForExport = (
    location: { city?: string | null; country?: string | null } | null | undefined
  ) => {
    const city = location?.city?.trim() || "";
    const country = location?.country?.trim() || "";
    const parts = [city, country].filter(Boolean);
    return parts.length ? parts.join(", ") : "-";
  };

  const formatLinkedInForExport = (linkedinProfileUrl?: string | null) => {
    const trimmed = linkedinProfileUrl?.trim();
    if (!trimmed) return "-";
    return trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  };

  const getColumnDisplayValue = (col: any, candidate: Candidate) => {
    if (col.field === "currentCTCAmount") {
      return currentCTCTemplate(candidate);
    }
  
    if (col.field === "expectedCTCAmount") {
      return expectedCTCTemplate(candidate);
    }
  
    switch (col.body) {
      
      case "dateTemplate":
        return formatDate(candidate.dateOfEntry);
      case "candidateContactTemplate":
        return `${candidate.contactNumber || "-"} | ${candidate.email || "-"}`;
      case "formatLocation":
        const city = candidate.expectedLocation?.city;
        const country = candidate.expectedLocation?.country;
        return city || country ? `${city}, ${country}` : "-";
      case "linkedInTemplate":
        if (!candidate.linkedinProfileUrl) return "-";
        const url = candidate.linkedinProfileUrl.startsWith("http") ? candidate.linkedinProfileUrl : `https://${candidate.linkedinProfileUrl}`;
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 500, wordBreak: "break-all" }}>
            {url}
          </a>
        );
        // ⭐ ADD THESE TWO CASES
      default:
        return getNestedValue(candidate, col.field);
    }
  };

  const buildDetailsData = (candidate: Candidate) => {
    return ALL_COLUMNS
      .filter(col => col.field !== "resume")
      .map(col => ({ label: col.header, value: getColumnDisplayValue(col, candidate) }))
      .filter(item => item.value !== null && item.value !== undefined && item.value !== "");
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const handleViewAllRounds = () => {
    if (!selectedResume) {
      toastRef.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select a candidate first", life: 3000 });
      return;
    }
    setShowRoundsDialog(true);
  };

  const handleDownloadResume = async (candidateId: number) => {
    try {
      if (!accessToken) throw new Error("Unauthorized");
      const blob = await downloadResume(accessToken, candidateId);
      const fileExtension = blob.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? "docx" : "pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_${candidateId}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) { console.error("Resume download failed:", error); }
  };

  const handlePreviewResume = async (candidateId: number) => {
    try {
      if (!accessToken) throw new Error("Unauthorized");
      const previewUrl = `${import.meta.env.VITE_BASE_URL}/candidate/${candidateId}/resume/preview`;
      const response = await fetch(previewUrl, { method: "GET", headers: { Authorization: `Bearer ${accessToken}` } });
      if (!response.ok) throw new Error("Preview failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { console.error("Resume preview failed:", error); }
  };

  // ✅ DateRangeFilter Template
  // const dateFilterTemplate = (options: any) => (
  //   <DateRangeFilter
  //     onApply={(start, end) => {
  //       setDateRange({ start, end });
  //       options.filterApplyCallback([start, end]);
  //     }}
  //     onClear={() => {
  //       setDateRange(null);
  //       options.filterApplyCallback(null);
  //     }}
  //     initialStartDate={dateRange?.start}
  //     initialEndDate={dateRange?.end}
  //   />
  // );

  // // ✅ DateRangeFilter Function
  // const dateRangeFilterFunction = (value: any, filter: any) => {
  //   if (!filter || !Array.isArray(filter)) return true;
    
  //   const [start, end] = filter;
  //   if (!start || !end) return true;
    
  //   const rowDate = new Date(value);
  //   const startDate = new Date(start);
  //   const endDate = new Date(end);
    
  //   return rowDate >= startDate && rowDate <= endDate;
  // };

  /** ------------------- Templates ------------------- */
  const resumeActionTemplate = (candidate: Candidate) => {
    if (!candidate.resumeFilename) return <span className="text-400">No Resume</span>;
    return (
      <div className="flex gap-1">
        <Button icon={<FaDownload />} className="p-button-outlined p-button-m" tooltip="Download" onClick={() => handleDownloadResume(candidate.candidateId)} />
        <Button icon={<FaEye />} className="p-button-outlined p-button-m" tooltip="Preview" onClick={() => handlePreviewResume(candidate.candidateId)} />
      </div>
    );
  };

  const linkedInTemplate = (rowData: Candidate) => {
    if (!rowData.linkedinProfileUrl) return <span className="text-400">N/A</span>;
    return <a href={rowData.linkedinProfileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">View Profile</a>;
  };

  const candidateContactTemplate = (row: Candidate) => (
    <div><div>{row.contactNumber || "-"}</div><div className="text-sm text-color-secondary">{row.email || "-"}</div></div>
  );

  const uniqueValues = (arr: (string | null | undefined)[]) => Array.from(new Set(arr.filter(Boolean)));
  const createDropdownFilterTemplate = (field: string, header: string) => (options: any) => {
    const values = uniqueValues(resumes.map(r => getNestedValue(r, field) as string));
    const dropdownOptions = values.map(v => ({ label: v, value: v }));
    return <Dropdown value={options.value} options={dropdownOptions} onChange={(e) => options.filterCallback(e.value)} placeholder={`Select ${header}`} showClear style={{ minWidth: "12rem" }} />;
  };

  const vendorFilterTemplate = (options: any) => {
    const vendors = uniqueValues(resumes.map(r => r.vendorName));
    const vendorOptions = vendors.map(v => ({ label: v, value: v }));
    return <Dropdown value={options.value} options={vendorOptions} onChange={(e) => options.filterCallback(e.value)} placeholder="Select Vendor" showClear style={{ minWidth: "12rem" }} />;
  };
  const currencySymbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    INR: "₹",
    GBP: "£",
    AED: "د.إ"
  };

  const compensationShort: Record<string, string> = {
    Annual: "yr",
    Yearly: "yr",
    Monthly: "mo",
    Hourly: "hr"
  };
  const currentCTCTemplate = (row: Candidate) => {
    if (!row.currentCTCAmount) return "-";
  
    const currencyName = createData?.currencies?.find(
      c => c.currencyId === row.currentCTCCurrencyId
    )?.currencyName;
  
    const type = createData?.compensationTypes?.find(
      t => t.compensationTypeId === row.currentCTCTypeId
    )?.compensationTypeName;
  
    const symbol = currencySymbols[currencyName || ""] || currencyName || "";
    const shortType = compensationShort[type || ""] || type || "";
  
    return `${symbol}${row.currentCTCAmount}/${shortType}`;
  };
  const expectedCTCTemplate = (row: Candidate) => {
    if (!row.expectedCTCAmount) return "-";
  
    const currencyName = createData?.currencies?.find(
      c => c.currencyId === row.expectedCTCCurrencyId
    )?.currencyName;
  
    const type = createData?.compensationTypes?.find(
      t => t.compensationTypeId === row.expectedCTCTypeId
    )?.compensationTypeName;
  
    const symbol = currencySymbols[currencyName || ""] || currencyName || "";
    const shortType = compensationShort[type || ""] || type || "";
  
    return `${symbol}${row.expectedCTCAmount}/${shortType}`;
  };


  useEffect(() => {
    if (!showWhatsAppDialog || !accessToken) return;

    let cancelled = false;
    setWhatsAppGroupsLoading(true);
    setWhatsAppGroupError(null);

    getWhatsAppGroups(accessToken)
      .then((data) => {
        if (!cancelled) setWhatsAppGroups(data.groups ?? []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load WhatsApp groups";
          setWhatsAppGroupError(msg);
          setWhatsAppGroups([]);
        }
      })
      .finally(() => {
        if (!cancelled) setWhatsAppGroupsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showWhatsAppDialog, accessToken]);

  /** Client-side preview only (official API is GET groups + POST send-resume; template body is built on the server when sending). */
  const whatsAppSharePreviewDisplay = useMemo(() => {
    if (!showWhatsAppDialog || !selectedResume) return "";
    return buildWhatsAppSharePreviewText(selectedResume, createData);
  }, [showWhatsAppDialog, selectedResume, createData]);

  const whatsAppNoteLooksLikeHtml = (text: string) => /<[a-z][\s\S]*>/i.test(text);

  const handleCopyWhatsAppPreview = async () => {
    const text = whatsAppSharePreviewDisplay.trim();
    if (!text) {
      showGlobalToast({ severity: "warn", summary: "Nothing to copy", detail: "No candidate preview available.", life: 3000 });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showGlobalToast({
        severity: "success",
        summary: "Copied",
        detail: "Candidate details preview copied to clipboard.",
        life: 3000,
      });
    } catch {
      showGlobalToast({
        severity: "error",
        summary: "Copy failed",
        detail: "Could not copy to clipboard. Select the text and copy manually.",
        life: 4000,
      });
    }
  };

  const openWhatsAppDialog = () => {
    if (!selectedResume) {
      toastRef.current?.show({
        severity: "warn",
        summary: "No selection",
        detail: "Select a candidate first.",
        life: 3000,
      });
      return;
    }
    setWhatsAppSelectedGroupId(null);
    setWhatsAppNote("");
    setWhatsAppGroupError(null);
    setShowWhatsAppDialog(true);
  };

  const closeWhatsAppDialog = () => {
    if (sendingWhatsApp) return;
    setShowWhatsAppDialog(false);
  };

  const handleSendWhatsApp = async () => {
    if (!selectedResume) return;
    if (whatsAppSelectedGroupId == null) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Group required",
        detail: "Select a WhatsApp group.",
        life: 3000,
      });
      return;
    }
    const note = whatsAppNote.trim();
    if (note.length > WHATSAPP_NOTE_MAX_LENGTH) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Message too long",
        detail: `Additional message must be at most ${WHATSAPP_NOTE_MAX_LENGTH} characters.`,
        life: 4000,
      });
      return;
    }
    if (note && whatsAppNoteLooksLikeHtml(note)) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Invalid message",
        detail: "Additional message must be plain text only (no HTML).",
        life: 4000,
      });
      return;
    }

    try {
      setSendingWhatsApp(true);
      const result = await queueWhatsAppSendResume(accessToken, {
        candidateId: selectedResume.candidateId,
        groupId: whatsAppSelectedGroupId,
        ...(note ? { customMessage: note } : {}),
      });
      const name = selectedResume.candidateName;
      setShowWhatsAppDialog(false);
      setWhatsAppSelectedGroupId(null);
      setWhatsAppNote("");
      showGlobalToast({
        severity: "info",
        summary: "WhatsApp queued",
        detail:
          result.queueId != null
            ? `Job #${result.queueId} for ${name}. Checking recipient results…`
            : result.message?.trim() ||
              "Share accepted but no job id was returned; per-recipient status unavailable.",
        life: 4500,
      });
      if (accessToken && result.queueId != null) {
        void pollWhatsAppShareUntilTerminal(accessToken, result.queueId, name);
      }
    } catch (error: unknown) {
      let message = "Failed to queue WhatsApp share.";
      if (error instanceof Error) message = error.message;
      else if (error && typeof error === "object" && "message" in error) {
        const m = (error as { message?: unknown }).message;
        if (typeof m === "string" && m.trim()) message = m;
      }
      showGlobalToast({ severity: "error", summary: "Queue failed", detail: message, life: 5000 });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const recruiterFilterTemplate = createDropdownFilterTemplate("recruiterName", "Recruiter");
  const statusFilterTemplate = createDropdownFilterTemplate("statusName", "Status");
  const roleFilterTemplate = createDropdownFilterTemplate("jobRole", "Job Role");
  const workModeFilterTemplate = createDropdownFilterTemplate("workMode", "Mode of Work");

  const formatLocation = (row: Candidate) => {
    const city = row.expectedLocation?.city || "";
    const country = row.expectedLocation?.country || "";
    return !city && !country ? "-" : `${city}, ${country}`;
  };

  const formatCurrentLocation = (row: Candidate) => {
    const city = row.currentLocation?.city || "";
    const country = row.currentLocation?.country || "";
    return !city && !country ? "-" : `${city}, ${country}`;
  };

  const buildExportData = (candidates: Candidate[]) => {
    return candidates.map((candidate) => {
      const exportRow: Record<string, string | number> = {};

      ALL_COLUMNS.forEach((column) => {
        switch (column.field) {
          case "dateOfEntry":
            exportRow.sourcedOn = formatDate(candidate.dateOfEntry);
            break;
          case "contact":
            exportRow.candidateContactNumber = normalizeExportValue(candidate.contactNumber);
            exportRow.candidateEmail = normalizeExportValue(candidate.email);
            break;
          case "expectedLocation.city":
            exportRow.expectedWorkingLocation = formatLocationForExport(candidate.expectedLocation);
            break;
          case "currentLocation.city":
            exportRow.currentWorkingLocation = formatLocationForExport(candidate.currentLocation);
            break;
          case "currentCTCAmount":
            exportRow.currentCTC = normalizeExportValue(currentCTCTemplate(candidate));
            break;
          case "expectedCTCAmount":
            exportRow.expectedCTC = normalizeExportValue(expectedCTCTemplate(candidate));
            break;
          case "linkedinProfileUrl":
            exportRow.linkedInProfile = formatLinkedInForExport(candidate.linkedinProfileUrl);
            break;
          default: {
            const exportField = getExportField(column.field);
            const fieldValue = getNestedValue(candidate, column.field);
            exportRow[exportField] = normalizeExportValue(fieldValue);
          }
        }
      });

      exportRow.resume = candidate.resumeFilename ? "Available" : "No Resume";
      return exportRow;
    });
  };

  const exportData = useMemo(() => buildExportData(resumes), [resumes, createData]);

  

  const settingsItems: {
    label: string;
    icon: React.ReactNode;
    action: () => void;
    disabled?: boolean;
  }[] = [
    // {
    //   label: "Share resume (WhatsApp)",
    //   icon: <FaWhatsapp style={{ marginRight: 8, marginLeft: 4, color: "#25D366" }} />,
    //   disabled: !selectedResume,
    //   action: () => {
    //     setShowSettingsMenu(false);
    //     openWhatsAppDialog();
    //   },
    // },
    { label: "View Interview Rounds", icon: <FaRoute style={{ marginRight: 8, marginLeft: 4 }} />, action: () => { setShowSettingsMenu(false); handleViewAllRounds(); } },
    {
      label: "Schedule Interview", icon: <FaUserTie style={{ marginRight: 8, marginLeft: 4 }} />, action: () => {
        setShowSettingsMenu(false);
        if (!selectedResume) {
          toastRef.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select a candidate first", life: 3000 });
          return;
        }
        setShowInterviewDialog(true);
      }
    },
    {
      label: "Initiate Onboarding",
      icon: <FaUserPlus style={{ marginRight: 8, marginLeft: 4 }} />,
      disabled: !selectedResume,
      action: () => {
        setShowSettingsMenu(false);
        setShowOnboardingDialog(true);
      }
    },
    {
      label: "Analyse Resume (AI)",
      icon: <i className="pi pi-sparkles" style={{ marginRight: 8, marginLeft: 4, fontSize: "14px", color: "#7c3aed" }} />,
      disabled: !selectedResume || !selectedResume.resumeFilename,
      action: () => {
        setShowSettingsMenu(false);
        setShowAnalysisDialog(true);
      }
    },
    {
      label: "Change Logs",
      icon: <i className="pi pi-history" style={{ marginRight: 8, marginLeft: 4, fontSize: "14px", color: "#374151" }} />,
      disabled: !selectedResume,
      action: () => {
        setShowSettingsMenu(false);
        setAuditTargetCandidate(selectedResume);
        setShowChangeLogsDialog(true);
      },
    },
    {
      label: "Deleted Candidates",
      icon: <i className="pi pi-trash" style={{ marginRight: 8, marginLeft: 4, fontSize: "14px", color: "#374151" }} />,
      disabled: false,
      action: () => {
        setShowSettingsMenu(false);
        setShowDeletedRecordsDialog(true);
      },
    },
  ];
  const filteredResumes = resumes.filter((candidate) => {
    if (!dateRange?.start && !dateRange?.end) return true;
    if (!candidate.dateOfEntry) return false;
  
    const rowDate = new Date(candidate.dateOfEntry);
    const startDate = dateRange?.start ? new Date(dateRange.start) : null;
    const endDate = dateRange?.end ? new Date(dateRange.end) : null;
  
    if (startDate && rowDate < startDate) return false;
  
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
      if (rowDate > endDate) return false;
    }
  
    return true;
  });
  const resetToDefaultColumns = () => setVisibleColumns(ALL_COLUMNS.filter(col => DEFAULT_COLUMN_FIELDS.includes(col.field)));

  return (
    <>
      <Toast ref={toastRef} position="top-right" />
      <DataTable ref={exportDt} value={exportData} exportFilename="candidate_resumes" style={{ display: "none" }}>
        {EXPORT_COLUMNS.map((column) => (
          <Column key={`export-${column.field}`} field={column.field} header={column.header} />
        ))}
      </DataTable>
      <div className="flex justify-content-between align-items-center mb-2">
        <h2 style={{ color: "#07253f" }}>Candidate Resume Management</h2>
        <div className="flex gap-2">
          <SearchButton value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search candidates..." />
          <ColumnSettingsButton value={visibleColumns} options={ALL_COLUMNS} optionLabel="header" onChange={setVisibleColumns} onReset={resetToDefaultColumns} />
          <ExportExcelButton
            {...({
              data: exportData,
              fileName: "candidate_resumes",
              dtRef: exportDt,
            } as any)}
          />
          <BulkExcelUploadButton onFileSelect={async (file) => {
            if (!accessToken) return;
            try {
              setLoading(true);
              const response = await bulkUploadCandidates(accessToken, file);
              const summary = response.data?.summary;
              const detailContent = (
                <div style={{ lineHeight: "1.6", fontSize: "14px" }}>
                  <div style={{ fontWeight: 500 }}>{response.message}</div>
                  {summary && (
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ fontWeight: 600, marginBottom: "2px" }}>Summary:</div>
                      <div>Total: <span style={{ fontWeight: 600 }}>{summary.totalRows}</span></div>
                      <div>Inserted: <span style={{ color: "#22c55e", fontWeight: 600 }}>{summary.inserted}</span></div>
                      <div>Failed: <span style={{ color: "#ef4444", fontWeight: 600 }}>{summary.failed}</span></div>
                      <div>Skipped: <span style={{ color: "#f59e0b", fontWeight: 600 }}>{summary.skipped}</span></div>
                      <div>Time: <span style={{ color: "#3b82f6", fontWeight: 600 }}>{summary.processingTime}</span></div>
                    </div>
                  )}
                </div>
              );
              toastRef.current?.show({ severity: response.success ? "success" : "warn", summary: "Bulk Upload", detail: detailContent, life: 6000 });
              loadAllData();
            } catch (error: any) {
              toastRef.current?.show({ severity: "error", summary: "Upload Failed", detail: error.message || "Something went wrong", life: 6000 });
            } finally { setLoading(false); }
          }} />
          <BulkPdfUploadButton
            onFileSelect={async (file) => {
              if (!accessToken) return;

              try {
                setLoading(true);

                const { batchId } = await bulkUploadResumes(accessToken, file);

                toastRef.current?.show({
                  severity: "info",
                  summary: "Upload Started",
                  detail: "Processing resumes...",
                  life: 3000
                });

                startBulkResumeBatchTracking(batchId);

              } catch (error: any) {
                toastRef.current?.show({
                  severity: "error",
                  summary: "Upload Failed",
                  detail: error.message || "ZIP upload failed",
                  life: 6000
                });
              } finally {
                setLoading(false);
              }
            }}
          />
          <AddButton onClick={handleAdd} />
          <EditButton onClick={handleEdit} disabled={!selectedResume} />
          <DeleteButton onClick={handleDelete} disabled={!selectedResume} />
          <ViewButton onClick={() => setViewCandidate(selectedResume)} disabled={!selectedResume} tooltip="View Candidate Details" />
          <div ref={cogMenuRef} style={{ position: "relative" }}>
            <CogButton onClick={() => setShowSettingsMenu((prev) => !prev)} tooltip="Candidate Activity" />
            {showSettingsMenu && (
              <div className="card shadow-3" style={{ position: "absolute", right: 0, top: 50, zIndex: 1000, minWidth: 220, backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.5rem" }}>
                {settingsItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 border-round"
                    role="button"
                    tabIndex={item.disabled ? -1 : 0}
                    onClick={() => {
                      if (item.disabled) return;
                      item.action();
                    }}
                    onKeyDown={(e) => {
                      if (item.disabled) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        item.action();
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: item.disabled ? "not-allowed" : "pointer",
                      opacity: item.disabled ? 0.45 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!item.disabled) e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span style={{ fontSize: "16px", color: "#374151" }}>{item.icon}</span>
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
          ref={dt} value={filteredResumes} paginator rows={rows} first={first} filterDisplay="menu" scrollable scrollHeight="flex"
          onFilter={(e) => setFilters(e.filters)} onPage={onPageChange} rowsPerPageOptions={[20, 50, 100]}
          selectionMode="single" selection={selectedResume} dataKey="candidateId" onSelectionChange={(e) => setSelectedResume(e.value)}
          tableStyle={{ minWidth: "80rem" }} loading={loading} emptyMessage="No candidates found." filters={filters}
          globalFilterFields={['candidateName', 'contactNumber', 'email', 'recruiterName', 'jobRole', 'statusName', 'vendorName']}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Candidates"
        >
          <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
          {visibleColumns.map((col) => {
            let bodyTemplate;
            let filterElement;
            let filterFunction;
            
            if (col.body === "candidateContactTemplate") bodyTemplate = candidateContactTemplate;
            if (col.body === "formatLocation") bodyTemplate = formatLocation;
            if (col.body === "linkedInTemplate") bodyTemplate = linkedInTemplate;
            if (col.body === "formatCurrentLocation") bodyTemplate = formatCurrentLocation;
            if (col.field === "dateOfEntry") {
              return (
                <Column
                  key="dateOfEntry"
                  field="dateOfEntry"
                  style={{ minWidth: "100px" }}   // 🔥 THIS FIXES IT

                  header={
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span>Sourced On </span>
            
                      <DateRangeFilter
                        compact
                        initialStartDate={dateRange?.start}
                        initialEndDate={dateRange?.end}
                        onApply={(start, end) => {
                          setDateRange({ start, end });
                          setFirst(0);
                        }}
                        onClear={() => {
                          setDateRange(null);
                          setFirst(0);
                        }}
                      />
                    </div>
                  }
                  body={(row: Candidate) => formatDate(row.dateOfEntry)}
                />
              );
            }


            if (col.field === "vendorName") filterElement = vendorFilterTemplate;
            if (col.field === "recruiterName") filterElement = recruiterFilterTemplate;
            if (col.field === "statusName") filterElement = statusFilterTemplate;
            if (col.field === "jobRole") filterElement = roleFilterTemplate;
            if (col.field === "workMode") filterElement = workModeFilterTemplate;
            if (col.field === "currentCTCAmount") bodyTemplate = currentCTCTemplate;
            if (col.field === "expectedCTCAmount") bodyTemplate = expectedCTCTemplate;


            return (
              <Column 
                key={col.field} 
                field={col.field} 
                header={col.header} 
                body={bodyTemplate} 
                sortable={col.sortable} 
                filter={col.filter} 
                filterField={col.filterField || col.field} 
                filterElement={filterElement} 
                filterFunction={filterFunction}
                showFilterMatchModes={false} 
              />
            );
          })}
          <Column header="Resume" body={resumeActionTemplate} style={{ width: "11rem" }} />
        </DataTable>
      </div>

      <ResumeAddEdit 
        visible={showAddEditDialog} 
        onHide={() => setShowAddEditDialog(false)} 
        selectedResume={editingResume} 
        onSuccess={handleAddEditSuccess} 
        createData={createData} 
        loadingOptions={loadingCreateData}   
        existingCandidates={resumes}   
      />
      <ResumeDelete 
        visible={showDeleteDialog} 
        onHide={() => setShowDeleteDialog(false)} 
        selectedResume={selectedResume} 
        onSuccess={handleDeleteSuccess} 
        onClearSelection={() => setSelectedResume(null)} 
      />
      <InterviewScheduler 
        visible={showInterviewDialog} 
        onHide={() => setShowInterviewDialog(false)} 
        candidateId={selectedResume?.candidateId || null} 
        candidateName={selectedResume?.candidateName || null} 
        toast={toastRef} 
      />
      <ResumeOnBoarding
        visible={showOnboardingDialog}
        onHide={() => setShowOnboardingDialog(false)}
        selectedCandidate={selectedResume}
        createData={createData}
        onSuccess={() => {
          setShowOnboardingDialog(false);
          loadAllData();
        }}
      />
      <ResumeAnalysisDialog
        visible={showAnalysisDialog}
        onHide={() => setShowAnalysisDialog(false)}
        candidate={selectedResume}
      />
      <PremiumDetailsDialog
        visible={!!viewCandidate}
        title="Candidate Details"
        onHide={() => setViewCandidate(null)}
      >
        {viewCandidate && 
          <DetailsSection 
            title="Complete Candidate Information">
              <DetailsGrid items={buildDetailsData(viewCandidate)} />
          </DetailsSection>}
      </PremiumDetailsDialog>
      <CandidateRoundsDialog
        visible={showRoundsDialog}
        candidateId={selectedResume?.candidateId ?? null}
        candidateName={selectedResume?.candidateName}
        onHide={() => setShowRoundsDialog(false)}
      />
      <CandidateDeletedRecordsDialog
        isOpen={showDeletedRecordsDialog}
        onClose={() => setShowDeletedRecordsDialog(false)}
        onRestoreSuccess={loadAllData}
      />
      <ChangeLogsDialog
        key={`candidate-audit-${auditTargetCandidate?.candidateId ?? "none"}`}
        isOpen={showChangeLogsDialog}
        onClose={() => {
          setShowChangeLogsDialog(false);
          setAuditTargetCandidate(null);
        }}
        title="Change Logs"
        resourceType="candidate"
        resourceId={auditTargetCandidate?.candidateId ?? null}
      />
      <Dialog
        visible={showWhatsAppDialog}
        onHide={closeWhatsAppDialog}
        modal
        header="Share resume via WhatsApp"
        style={{ width: "min(640px, 96vw)" }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" outlined onClick={closeWhatsAppDialog} disabled={sendingWhatsApp} />
            <Button
              type="button"
              label={sendingWhatsApp ? "Queueing…" : "Share resume"}
              icon={<FaWhatsapp style={{ marginRight: 6 }} />}
              onClick={handleSendWhatsApp}
              disabled={
                sendingWhatsApp ||
                whatsAppGroupsLoading ||
                whatsAppSelectedGroupId == null ||
                (!whatsAppGroupsLoading && whatsAppGroups.length === 0)
              }
              style={{ backgroundColor: "#25D366", borderColor: "#25D366", color: "#fff" }}
            />
          </div>
        }
      >
        {/*         <p className="text-sm text-600 mt-0 mb-3">
          Preview below matches the WhatsApp template body fields (Meta vars 1–8); the server builds the final text when you queue send. The PDF resume is attached separately via the backend. Pick a group and optional additional message (var 9); recipients are resolved on the server only.
        </p> */}
        <div className="flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
          <label className="block font-semibold m-0">Candidate details preview</label>
          <Button
            type="button"
            label="Copy to clipboard"
            icon={<FaCopy style={{ marginRight: 6 }} />}
            size="small"
            outlined
            severity="secondary"
            onClick={handleCopyWhatsAppPreview}
            disabled={sendingWhatsApp || !whatsAppSharePreviewDisplay.trim()}
          />
        </div>
        <InputTextarea
          readOnly
          value={whatsAppSharePreviewDisplay}
          rows={11}
          className="w-full mb-3"
          style={{ fontFamily: "ui-monospace, monospace", fontSize: "13px", lineHeight: 1.5 }}
          disabled={sendingWhatsApp}
        />
        <label className="block font-semibold mb-1">
          WhatsApp group <span className="text-red-500">*</span>
        </label>
        <Dropdown
          value={whatsAppSelectedGroupId}
          options={whatsAppGroups}
          optionLabel="groupName"
          optionValue="groupId"
          placeholder={whatsAppGroupsLoading ? "Loading groups…" : "Select group"}
          onChange={(e) => setWhatsAppSelectedGroupId(e.value ?? null)}
          className="w-full mb-2"
          disabled={sendingWhatsApp || whatsAppGroupsLoading || whatsAppGroups.length === 0}
          showClear
        />
        {whatsAppGroupError && (
          <small className="p-error block mb-3">{whatsAppGroupError}</small>
        )}
        {!whatsAppGroupsLoading && !whatsAppGroupError && whatsAppGroups.length === 0 && (
          <small className="text-600 block mb-3">No active WhatsApp groups are available.</small>
        )}
        <label className="block font-semibold mb-1">Additional message (optional)</label>
        <InputTextarea
          value={whatsAppNote}
          onChange={(e) => setWhatsAppNote(e.target.value)}
          rows={4}
          maxLength={WHATSAPP_NOTE_MAX_LENGTH}
          className="w-full"
          disabled={sendingWhatsApp}
          placeholder="Plain text only, max 1024 characters. Leave empty if not needed."
        />
        <small className="text-600 block mt-1">
          {whatsAppNote.length}/{WHATSAPP_NOTE_MAX_LENGTH} characters
        </small>
      </Dialog>
    </>
  );
};

export default ResumeTable;
