import React, { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { FaDownload, FaEye } from "react-icons/fa";

import ResumeAddEdit from "../components/resumeAddEdit";
import ResumeDelete from "./resumeDelete";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import ExportExcelButton from "../../../shared/ExportExcelButton";
import { useSearchParams } from "react-router-dom";

import { Candidate } from "../types/resumeTypes";
import { getCandidates, downloadResume } from "../services/useResume";
import { useAuth } from "../../../shared/auth/AuthContext";
import SearchButton from "../../../shared/SearchButton";
import { FilterMatchMode } from 'primereact/api';
import { FaUserTie } from "react-icons/fa";
import CogButton from "../../../shared/CogButton";
import { Toast } from "primereact/toast";
import InterviewScheduler from "../../../shared/InterviewScheduler";

const ResumeTable: React.FC = () => {
  const { accessToken } = useAuth(); // ✅ from AuthContext
  const [resumes, setResumes] = useState<Candidate[]>([]);
  const [selectedResume, setSelectedResume] = useState<Candidate | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingResume, setEditingResume] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const toastRef = useRef<Toast>(null);
  const [rows, setRows] = useState(10);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [first, setFirst] = useState((pageFromUrl - 1) * 10); 
  const dt = useRef<DataTable<any>>(null);
  // const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState<any>({
  candidateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  recruiterName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  recruiterContact: { value: null, matchMode: FilterMatchMode.CONTAINS },
  "preferredJobLocation.city": { value: null, matchMode: FilterMatchMode.CONTAINS },
  jobRole: { value: null, matchMode: FilterMatchMode.CONTAINS },
  statusName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  contactNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
  email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  currentCTC: { value: null, matchMode: FilterMatchMode.EQUALS },
  expectedCTC: { value: null, matchMode: FilterMatchMode.EQUALS },
  noticePeriod: { value: null, matchMode: FilterMatchMode.EQUALS },
  experienceYears: { value: null, matchMode: FilterMatchMode.EQUALS },
  notes: { value: null, matchMode: FilterMatchMode.CONTAINS }
});


  /** ------------------- Data Loading ------------------- */
  const loadResumes = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const { candidates } = await getCandidates(accessToken, 1, 10000);
      setResumes(Array.isArray(candidates) ? candidates : []);
    } catch (error) {
      console.error("Error loading resumes:", error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const onPageChange = (event: any) => {
  setFirst(event.first);
  setRows(event.rows); // IMPORTANT: sync when user changes rows dropdown

  const newPage = event.page + 1;
  setSearchParams({ page: newPage.toString() });
};


  /** ------------------- CRUD Handlers ------------------- */
  const handleAdd = () => {
    setEditingResume(null);
    setShowAddEditDialog(true);
  };

  const handleEdit = () => {
    if (selectedResume) {
      setEditingResume(selectedResume);
      setShowAddEditDialog(true);
    }
  };

  const handleDelete = () => {
    if (selectedResume) {
      setShowDeleteDialog(true);
    }
  };

  const handleAddEditSuccess = () => {
    setShowAddEditDialog(false);
    loadResumes();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setSelectedResume(null);
    loadResumes();
  };

//   const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const value = e.target.value;
//   const _filters = { ...filters };
//   _filters['global'].value = value;
  
//   setFilters(_filters);
//   setGlobalFilterValue(value);
// };

  /** ------------------- Resume Actions ------------------- */
  const handleDownloadResume = async (candidateId: number) => {
    try {
      if (!accessToken) throw new Error("Unauthorized");
      const blob = await downloadResume(accessToken, candidateId);

      // Detect file type from blob's MIME type
      const fileExtension = blob.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ? "docx"
        : "pdf";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_${candidateId}.${fileExtension}`;  // ✅ Dynamic extension
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Resume download failed:", error);
    }
  };

  const handlePreviewResume = async (candidateId: number) => {
    try {
      if (!accessToken) throw new Error("Unauthorized");

      const previewUrl = `${import.meta.env.VITE_BASE_URL}/candidate/${candidateId}/resume/preview`;

      const response = await fetch(previewUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Preview failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Clean up after a delay to ensure the window opens
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Resume preview failed:", error);
    }
  };
  /** ------------------- Column Templates ------------------- */
  const resumeActionTemplate = (candidate: Candidate) => {
    if (!candidate.resumeFilename) {
      return <span className="text-400">No Resume</span>;
    }
    
    return (
      <div className="flex gap-1">
        <Button
          icon={<FaDownload />}
          className="p-button-outlined p-button-m"
          tooltip="Download Resume"
          onClick={() => handleDownloadResume(candidate.candidateId)}
        />
        <Button
          icon={<FaEye />}
          className="p-button-outlined p-button-m"
          tooltip="Preview Resume"
          onClick={() => handlePreviewResume(candidate.candidateId)}
        />
      </div>
    );
  };

  const linkedInTemplate = (rowData: Candidate) => {
    if (!rowData.linkedinProfileUrl) {
      return <span className="text-400">N/A</span>;
    }
    return (
      <a
        href={rowData.linkedinProfileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        View Profile
      </a>
    );
  };

  /** ------------------- Custom Combined Cell Templates ------------------- */

const candidateContactTemplate = (row: Candidate) => {
  return (
    <div>
      <div>{row.contactNumber || "-"}</div>
      <div className="text-sm text-color-secondary">{row.email || "-"}</div>
    </div>
  );
};

const recruiterContactTemplate = (row: Candidate) => {
  const phone = row.recruiterContact;
  const email = row.recruiterEmail;

  return (
    <div>
      <div>{phone || "-"}</div>
      <div className="text-sm text-color-secondary">{email || "-"}</div>
    </div>
  );
};

const formatLocation = (row: Candidate) => {
  const city = row.preferredJobLocation?.city || "";
  const country = row.preferredJobLocation?.country || "";

  if (!city && !country) return "-";

  return `${city}, ${country}`;
};

const settingsItems = [
  {
    label: "Schedule Interview",
    icon: <FaUserTie style={{ marginRight: 8, marginLeft: 4 }} />,
    action: () => {
      setShowSettingsMenu(false);
      
      // ✅ Check if candidate is selected
      if (!selectedResume) {
        toastRef.current?.show({
          severity: "warn",
          summary: "No Selection",
          detail: "Please select a candidate first",
          life: 3000,
        });
        return;
      }
      
      setShowInterviewDialog(true);
    }
  }
];


  /** ------------------- JSX ------------------- */
  return (
    <>
      <Toast ref={toastRef} />
      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Candidate Resume Management</h2>
        <div className="flex gap-2">
          {/* <SearchButton
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search candidates..."
          /> */}
          <ExportExcelButton dtRef={dt} />
          <AddButton onClick={handleAdd} />
          <EditButton onClick={handleEdit} disabled={!selectedResume} />
          <DeleteButton onClick={handleDelete} disabled={!selectedResume} />
          <div style={{ position: "relative" }}>
            <CogButton onClick={() => setShowSettingsMenu((prev) => !prev)} />

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
      <div style={{ flex: 1, overflow: "auto" }}>
      <DataTable
        ref={dt}
        value={resumes}
        paginator
        rows={rows}
        first={first}
        filterDisplay="menu"
        scrollable
        scrollHeight="flex"
        onFilter={(e) => setFilters(e.filters)}
        onPage={onPageChange}
        rowsPerPageOptions={[10, 20, 50]}
        selectionMode="single"
        selection={selectedResume}
        dataKey="candidateId"
        onSelectionChange={(e) => setSelectedResume(e.value)}
        tableStyle={{ minWidth: "80rem" }}
        loading={loading}
        emptyMessage="No candidates found."
        filters={filters}  
        // globalFilterFields={[  
        //   'candidateName', 
        //   'contactNumber', 
        //   'email', 
        //   'recruiterName', 
        //   'jobRole',
        //   'preferredJobLocation',
        //   'statusName'
        // ]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Candidates"
      >

        <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
        <Column field="candidateName" header="Candidate Name" sortable filter/>
        <Column
          header="Candidate Contact"
          body={candidateContactTemplate}
          sortable
          filter
          filterField="contactNumber"
          showFilterMatchModes={false}
          showApplyButton={false}
          showClearButton={true}
        />
        <Column field="recruiterName" header="Recruiter" sortable filter/>
        <Column
          header="Recruiter Contact"
          body={recruiterContactTemplate}
          sortable
          filter
          filterField="recruiterContact"
          showFilterMatchModes={false}
          showApplyButton={false}
          showClearButton={true}
        />
        <Column field="jobRole" header="Role" sortable filter/>
        <Column
          header="Location"
          body={formatLocation}
          sortable
          filter
          filterField="preferredJobLocation.city"
          showFilterMatchModes={false}
        />
        <Column field="currentCTC" header="Current CTC" sortable filter/>
        <Column field="expectedCTC" header="Expected CTC" sortable filter/>  
        <Column field="noticePeriod" header="Notice Period" sortable filter/>
        <Column field="experienceYears" header="YOE" sortable filter/>
        <Column field="statusName" header="Status" sortable filter showFilterMatchModes={false}/>
        <Column
          field="linkedinProfileUrl"
          header="LinkedIn Profile"
          body={linkedInTemplate}
        />
        <Column header="Resume" body={resumeActionTemplate} style={{ width: "8rem" }} />
        <Column
          field="notes"
          header="Notes"
          body={(rowData) => rowData.notes || "-"}
          sortable
          filter
          showFilterMatchModes={false}
        />
      </DataTable>
      </div>

      {/* ------------------- Dialogs ------------------- */}
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
        onClearSelection={() => setSelectedResume(null)}
      />
      <InterviewScheduler
        visible={showInterviewDialog}
        onHide={() => setShowInterviewDialog(false)}
        candidateId={selectedResume?.candidateId || null}
        candidateName={selectedResume?.candidateName || null}
        toast={toastRef}
      />
    </>
  );
};

export default ResumeTable;
