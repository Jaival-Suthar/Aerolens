import React, { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { FaDownload, FaEye, FaRoute } from "react-icons/fa";
import BulkExcelUploadButton from "../../../shared/BulkExcepUploadButton";
import ResumeAddEdit from "../components/resumeAddEdit";
import ResumeDelete from "./resumeDelete";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import { useSearchParams } from "react-router-dom";
import DateRangeFilter from "../../InterviewReport/components/DateRangeFilter";
import { Candidate, CandidateCreateData } from "../types/resumeTypes";
import { getCandidates, downloadResume, fetchCandidateCreateData, bulkUploadCandidates } from "../services/useResume";
import { useAuth } from "../../../shared/auth/AuthContext";
import SearchButton from "../../../shared/SearchButton";
import { FilterMatchMode } from 'primereact/api';
import { FaUserTie } from "react-icons/fa";
import CogButton from "../../../shared/CogButton";
import { Toast } from "primereact/toast";
import InterviewScheduler from "../../../shared/InterviewScheduler";
import ViewButton from "../../../shared/ViewButton";
import DetailsGrid from "../../../shared/DetailsGrid";
import DetailsSection from "../../../shared/DetailsSection";
import PremiumDetailsDialog from "../../../shared/PremiumDetailsDialog";
import ColumnSettingsButton from "../../../shared/ColumnSettingsButton";
import CandidateRoundsDialog from "../../Interview/components/CandidateRoundsDialog";
import { Dropdown } from "primereact/dropdown";

const ALL_COLUMNS = [
  { field: "candidateName", header: "Candidate Name", sortable: true, filter: true },
  { field: "contact", header: "Candidate Contact", body: "candidateContactTemplate", sortable: true, filter: true, filterField: "contactNumber" },
  { field: "jobRole", header: "Role", sortable: true, filter: true },
  { field: "currentLocation.city", header: "Current Working Location", body: "formatCurrentLocation", sortable: true, filter: true },
  { field: "expectedLocation.city", header: "Expected Working Location", body: "formatLocation", sortable: true, filter: true },
  { field: "experienceYears", header: "YOE", sortable: true, filter: true },
  { field: "statusName", header: "Interview Result", sortable: true, filter: true },
  { field: "currentCTC", header: "Current CTC", sortable: true, filter: true },
  { field: "expectedCTC", header: "Expected CTC", sortable: true, filter: true },
  { field: "noticePeriod", header: "Notice Period", sortable: true, filter: true },
  { field: "linkedinProfileUrl", header: "LinkedIn Profile", body: "linkedInTemplate" },
  { field: "recruiterName", header: "Recruiter", sortable: true, filter: true },
  { field: "vendorName", header: "Vendor", sortable: true, filter: true },
  { field: "referredBy", header: "Referred By", sortable: true, filter: true },
  { field: "dateOfEntry", header: "Date Of Entry", sortable: true, body: "dateTemplate" },
  { field: "email", header: "Email", sortable: true, filter: true },
  { field: "contactNumber", header: "Contact Number", sortable: true, filter: true },
  { field: "jobProfileName", header: "Job Profile", sortable: true, filter: true },
  { field: "clientName", header: "Client Name", sortable: true, filter: true },
  { field: "departmentName", header: "Department", sortable: true, filter: true },
  { field: "notes", header: "Notes", sortable: true, filter: true },


];

const DEFAULT_COLUMN_FIELDS = ["candidateName", "contact", "expectedLocation.city", "jobRole", "experienceYears", "statusName"];
const COLUMN_STORAGE_KEY = "candidateTable.visibleColumns";

const ResumeTable: React.FC = () => {
  const { accessToken } = useAuth();
  const [resumes, setResumes] = useState<Candidate[]>([]);
  const [selectedResume, setSelectedResume] = useState<Candidate | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingResume, setEditingResume] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const toastRef = useRef<Toast>(null);
  const [rows, setRows] = useState(20);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [first, setFirst] = useState((pageFromUrl - 1) * 10);
  const [showRoundsDialog, setShowRoundsDialog] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const dt = useRef<DataTable<any>>(null);
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
    currentCTC: { value: null, matchMode: FilterMatchMode.EQUALS },
    expectedCTC: { value: null, matchMode: FilterMatchMode.EQUALS },
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

  const getColumnDisplayValue = (col: any, candidate: Candidate) => {
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

  const recruiterFilterTemplate = createDropdownFilterTemplate("recruiterName", "Recruiter");
  const statusFilterTemplate = createDropdownFilterTemplate("statusName", "Status");
  const roleFilterTemplate = createDropdownFilterTemplate("jobRole", "Job Role");

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

  const settingsItems = [
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
    }
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
      <Toast ref={toastRef} />
      <div className="flex justify-content-between align-items-center mb-2">
        <h2 style={{ color: "#07253f" }}>Candidate Resume Management</h2>
        <div className="flex gap-2">
          <SearchButton value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search candidates..." />
          <ColumnSettingsButton value={visibleColumns} options={ALL_COLUMNS} optionLabel="header" onChange={setVisibleColumns} onReset={resetToDefaultColumns} />
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
          <AddButton onClick={handleAdd} />
          <EditButton onClick={handleEdit} disabled={!selectedResume} />
          <DeleteButton onClick={handleDelete} disabled={!selectedResume} />
          <ViewButton onClick={() => setViewCandidate(selectedResume)} disabled={!selectedResume} tooltip="View Candidate Details" />
          <div style={{ position: "relative" }}>
            <CogButton onClick={() => setShowSettingsMenu((prev) => !prev)} disabled={!selectedResume} />
            {showSettingsMenu && (
              <div className="card shadow-3" style={{ position: "absolute", right: 0, top: 50, zIndex: 1000, minWidth: 220, backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.5rem" }}>
                {settingsItems.map((item, idx) => (
                  <div key={idx} className="p-2 cursor-pointer border-round" onClick={item.action} style={{ display: "flex", alignItems: "center" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
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
            // if (col.body === "dateTemplate") {
            //   bodyTemplate = (row: Candidate) => formatDate(row.dateOfEntry);
            //   filterElement = dateFilterTemplate;
            //   filterFunction = dateRangeFilterFunction;
            // }
            if (col.field === "dateOfEntry") {
              return (
                <Column
                  key="dateOfEntry"
                  field="dateOfEntry"
                  style={{ minWidth: "280px" }}   // 🔥 THIS FIXES IT

                  header={
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span>Date Of Entry</span>
            
                      <DateRangeFilter
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
          <Column header="Resume" body={resumeActionTemplate} style={{ width: "8rem" }} />
        </DataTable>
      </div>

      <ResumeAddEdit visible={showAddEditDialog} onHide={() => setShowAddEditDialog(false)} selectedResume={editingResume} onSuccess={handleAddEditSuccess} createData={createData} loadingOptions={loadingCreateData}   existingCandidates={resumes}   // ✅ ADD THIS
 />
      <ResumeDelete visible={showDeleteDialog} onHide={() => setShowDeleteDialog(false)} selectedResume={selectedResume} onSuccess={handleDeleteSuccess} onClearSelection={() => setSelectedResume(null)} />
      <InterviewScheduler visible={showInterviewDialog} onHide={() => setShowInterviewDialog(false)} candidateId={selectedResume?.candidateId || null} candidateName={selectedResume?.candidateName || null} toast={toastRef} />
      <PremiumDetailsDialog visible={!!viewCandidate} title="Candidate Details" onHide={() => setViewCandidate(null)}>
        {viewCandidate && <DetailsSection title="Complete Candidate Information"><DetailsGrid items={buildDetailsData(viewCandidate)} /></DetailsSection>}
      </PremiumDetailsDialog>
      <CandidateRoundsDialog visible={showRoundsDialog} candidateId={selectedResume?.candidateId ?? null} candidateName={selectedResume?.candidateName} onHide={() => setShowRoundsDialog(false)} />
    </>
  );
};

export default ResumeTable;