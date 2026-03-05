import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";

import PremiumDetailsDialog from "../../../shared/PremiumDetailsDialog";
import ViewButton from "../../../shared/ViewButton";
import ColumnSettingsButton from "../../../shared/ColumnSettingsButton";
import DetailsSection from "../../../shared/DetailsSection";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";

import { useJobProfiles } from "../hooks/useJobProfiles";
import { JobProfile } from "../types/jobProfileTypes";
import JobProfileAddEdit from "../components/jobProfileAddEdit";
import JobProfileDelete from "./jobProfileDelete";
import { useAuth } from "../../../shared/auth/AuthContext"; 
import { useTechSpecifications } from "../hooks/useTechSpecifications";
import { Button } from "primereact/button";
import { FaDownload, FaEye, FaPlus } from "react-icons/fa";
import { Toast } from "primereact/toast";
import { Tooltip } from "primereact/tooltip";
import CogButton from "../../../shared/CogButton";
import JobProfileRequirementsAddEdit 
  from "../../JobProfileRequirements/components/jobProfileRequirementsAddEdit";
import {
  createJobProfileRequirements
} from "../../JobProfileRequirements/services/jobProfileRequirementsService";
const cleanBullet = (text: string) =>
  text
    // remove hidden/private unicode chars
    .replace(/[\uE000-\uF8FF]/g, "")
    // remove common bullet symbols
    .replace(/^[\s•▪–—\-*➤►●◦∙■□▪▫]+/g, "")
    .trim();


/* -------------------- Columns -------------------- */
const ALL_COLUMNS = [
  { field: "position", header: "Job Role", type: "text" },
  { field: "experience", header: "Experience", type: "text" },
  { field: "overview", header: "Job Overview", type: "text" },
  { field: "techSpecifications", header: "Tech Stack", type: "tech" },
  { field: "responsibilities", header: "Key Responsibilities", type: "list" },
  { field: "requiredSkills", header: "Required Skills", type: "list" },
  { field: "niceToHave", header: "Nice to Have", type: "list" }
];

const DEFAULT_COLUMNS = ["position", "experience"];
/* -------------------- Column Persistence -------------------- */
const STORAGE_KEY = "job-profile:visible-columns";

const loadVisibleColumns = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const fields: string[] = JSON.parse(raw);

    return ALL_COLUMNS.filter(col =>
      fields.includes(col.field)
    );
  } catch {
    return null;
  }
};

/* -------------------- Component -------------------- */
const JobProfileTable: React.FC = () => {
  const { accessToken } = useAuth();
  const { jobProfiles, loading, error, refetch } = useJobProfiles(accessToken);
  const {
  techSpecs,
  loading: techLoading,
  error: techError
} = useTechSpecifications(accessToken);

  const [selected, setSelected] = useState<JobProfile | null>(null);
  const [viewProfile, setViewProfile] = useState<JobProfile | null>(null);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editProfile, setEditProfile] = useState<JobProfile | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRequirementDialog, setShowRequirementDialog] = useState(false);
  const [selectedJobProfileForReq, setSelectedJobProfileForReq] =
    useState<JobProfile | null>(null);
  const toast = useRef<Toast>(null);

  /* -------------------- Column visibility -------------------- */
  const [visibleColumns, setVisibleColumns] = useState(() =>
    loadVisibleColumns() ??
    ALL_COLUMNS.filter(col =>
      DEFAULT_COLUMNS.includes(col.field)
    )
  );

  useEffect(() => {
    const fields = visibleColumns.map(c => c.field);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(fields)
    );
  }, [visibleColumns]);


  /* -------------------- URL-synced Pagination -------------------- */
  const PAGE_PARAM = "jobProfilePage";
  const SIZE_PARAM = "jobProfileSize";

  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = Number(searchParams.get(PAGE_PARAM)) || 1;
  const sizeFromUrl = Number(searchParams.get(SIZE_PARAM)) || 20;

  const [rows, setRows] = useState(sizeFromUrl);
  const [first, setFirst] = useState((pageFromUrl - 1) * sizeFromUrl);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const onPageChange = (event: DataTablePageEvent) => {
    const { first, rows } = event;

    setFirst(first);
    setRows(rows);

    const newPage = Math.floor(first / rows) + 1;

    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set(PAGE_PARAM, newPage.toString());
      params.set(SIZE_PARAM, rows.toString());
      return params;
    });
  };

  const settingsItems = [
  {
    label: "Create Job Profile Requirements",
    icon: <FaPlus style={{ marginRight: 8, marginLeft: 4 }} />,
    action: () => {
      if (!selected) {
        toast.current?.show({
          severity: "warn",
          summary: "No Selection",
          detail: "Please select a Job Profile first",
          life: 3000
        });
        return;
      }

      setShowSettingsMenu(false);

      // Pass selected job profile
      setSelectedJobProfileForReq(selected);
      setShowRequirementDialog(true);
    }
  }
];

  /* -------------------- Cell Renderer -------------------- */
const renderCell = (row: JobProfile, col: any) => {
  if (col.type === "text") {
    const value = (row as any)[col.field] ?? "-";
    
    // Special handling for overview to show only first line
    if (col.field === "overview" && value !== "-") {
      return (
        <div
          style={{
            maxWidth: 360,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
          title={value}
        >
          {value}
        </div>
      );
    }
    
    return value;
  }

  if (col.type === "tech") {
    return row.techSpecifications?.length
      ? row.techSpecifications.map(t => t.label).join(", ")
      : "-";
  }

  const list = (row as any)[col.field] as string[];

  if (!Array.isArray(list) || !list.length) return "-";

  const preview = list[0];

  return (
    <div
      style={{
        maxWidth: 360,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}
      title={list.join("\n")}
    >
      {preview}
    </div>
  );
};



  /* -------------------- Handlers -------------------- */
  const handleAddNew = () => {
    setEditProfile(null);
    setShowAddEdit(true);
  };

  const handleEdit = () => {
    if (selected) {
      setEditProfile(selected);
      setShowAddEdit(true);
    }
  };

  const handleDelete = () => {
    if (selected) {
      setShowDeleteDialog(true);
    }
  };

  const handleAddEditSuccess = async () => {
    // In real app, refetch data from API
    setShowAddEdit(false);
    setEditProfile(null);
    setSelected(null);
    await refetch();
    console.log("Job profile saved successfully");
  };

  const downloadJD = async (jobProfileId: number) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/jobProfile/${jobProfileId}/get-JD`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (err: any) {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: err.message
    });
  }
};


const previewJD = async (jobProfileId: number) => {
  try {
    const previewUrl = `${import.meta.env.VITE_BASE_URL}/jobProfile/${jobProfileId}/get-JD/preview`;

    const response = await fetch(previewUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message);
    }

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/pdf")) {
      throw new Error("Preview only supported for PDF files.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err: any) {
    toast.current?.show({
      severity: "error",
      summary: "Preview Error",
      detail: err.message
    });
  }
};

  const jdBodyTemplate = (rowData: JobProfile) => {
    if (!rowData.jdFileName) {
      return <span className="text-muted">—</span>;
    }

    const isPdf = rowData.jdOriginalName
      ?.toLowerCase()
      .endsWith(".pdf");

    const downloadId = `jd-download-${rowData.id}`;
    const previewId = `jd-preview-${rowData.id}`;

    return (
      <div
        className="flex justify-content-center align-items-center gap-2"
        style={{ width: "100%" }}
      >
        {/* Tooltips */}
        <Tooltip target={`#${downloadId}`} content="Download JD" />
        {isPdf && (
          <Tooltip target={`#${previewId}`} content="Preview JD" />
        )}

        {/* Download */}
        <Button
          id={downloadId}
          type="button"
          className="p-button-text p-button-sm p-0"
          onClick={() => downloadJD(rowData.id)}
          style={{
            width: "28px",
            height: "28px"
          }}
        >
          <FaDownload size={14} />
        </Button>

        {/* Preview */}
        {isPdf && (
          <Button
            id={previewId}
            type="button"
            className="p-button-text p-button-sm p-0"
            onClick={() => previewJD(rowData.id)}
            style={{
              width: "28px",
              height: "28px"
            }}
          >
            <FaEye size={14} />
          </Button>
        )}
      </div>
    );
  };
  const createRequirement = async (payload: any) => {
  return createJobProfileRequirements(accessToken, payload);
};

  /* -------------------- Render -------------------- */
  return (
    <>
      <Toast ref={toast} />
      {/* 🔹 Header */}
      <div className="flex justify-content-between align-items-center mb-3">
        <h2>Job Profiles</h2>

        <div className="flex gap-2">
          <ColumnSettingsButton
            value={visibleColumns}
            options={ALL_COLUMNS}
            optionLabel="header"
            onChange={setVisibleColumns}
            onReset={() =>
              setVisibleColumns(
                ALL_COLUMNS.filter(col => DEFAULT_COLUMNS.includes(col.field))
              )
            }
          />

          <AddButton onClick={handleAddNew} />
          <EditButton onClick={handleEdit} disabled={!selected} />
          <DeleteButton onClick={handleDelete} disabled={!selected} />

          <ViewButton
            disabled={!selected}
            tooltip="View Job Profile Details"
            onClick={() => setViewProfile(selected)}
          />
          <div style={{ position: "relative" }}>
          <CogButton
            onClick={() => setShowSettingsMenu(prev => !prev)}
            disabled={!selected}
            tooltip="More Actions"
          />

          {showSettingsMenu && (
            <div
              className="card shadow-3"
              style={{
                position: "absolute",
                right: 0,
                top: 45,
                zIndex: 1000,
                minWidth: 220,
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "0.5rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
              }}
            >
              {settingsItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={item.action}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginBottom:
                      idx < settingsItems.length - 1 ? "4px" : "0",
                    transition: "background-color 0.15s ease"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Icon */}
                  <span style={{ fontSize: 16, color: "#374151" }}>
                    {item.icon}
                  </span>

                  {/* Label */}
                  <span
                    style={{
                      marginLeft: 12,
                      fontSize: 14,
                      fontWeight: 500,
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

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          borderRadius: 8
        }}
      >
        {/* 🔹 Table */}
        <DataTable
          value={jobProfiles}
          scrollable
          scrollHeight="flex"
          selectionMode="single"
          selection={selected}
          onSelectionChange={e => setSelected(e.value as JobProfile)}
          dataKey="id"
          paginator
          first={first}
          rows={rows}
          onPage={onPageChange}
          rowsPerPageOptions={[20, 50, 100]}
          emptyMessage="No job profiles found"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Job Profiles"
          responsiveLayout="scroll"
        >
          <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
          {visibleColumns.map(col => (
            <Column
              key={col.field}
              header={col.header}
              body={(row: JobProfile) => renderCell(row, col)}
            />
          ))}
          <Column
            field="__jd"
            header="JD"
            body={jdBodyTemplate}
            frozen
            alignFrozen="right"
            style={{ width: "8rem" }}
            bodyStyle={{ textAlign: "center" }}
            headerStyle={{ textAlign: "center" }}
          />
        </DataTable>

        {/* 🔍 Details Dialog */}
        <PremiumDetailsDialog
          visible={!!viewProfile}
          title="Job Profile Details"
          onHide={() => setViewProfile(null)}
        >
          {viewProfile && (
  <>
    <DetailsSection title="Job Role & Experience">
      <p>
        <strong>Job Role:</strong> {viewProfile.position}
      </p>
      <p>
        <strong>Experience:</strong> {viewProfile.experience}
      </p>
    </DetailsSection>

    {/* Tech */}
    {viewProfile.techSpecifications?.length > 0 && (
      <DetailsSection title="Tech Specifications">
        <p style={{ lineHeight: 1.6 }}>
          {viewProfile.techSpecifications.map(t => t.label).join(", ")}
        </p>
      </DetailsSection>
    )}

    {/* Overview */}
    {viewProfile.overview && (
      <DetailsSection title="Job Overview">
        <p style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
          {viewProfile.overview}
        </p>
      </DetailsSection>
    )}

    {/* Responsibilities */}
    {viewProfile.responsibilities?.length > 0 && (
      <DetailsSection title="Key Responsibilities">
        <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
          {viewProfile.responsibilities.map((r, i) => (
            <li key={i} style={{ marginBottom: "0.25rem" }}>
              {cleanBullet(r)}
            </li>
          ))}
        </ul>
      </DetailsSection>
    )}

    {/* Skills */}
    {viewProfile.requiredSkills?.length > 0 && (
      <DetailsSection title="Required Skills & Experience">
        <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
          {viewProfile.requiredSkills.map((s, i) => (
            <li key={i} style={{ marginBottom: "0.25rem" }}>
              {cleanBullet(s)}
            </li>
          ))}
        </ul>
      </DetailsSection>
    )}

    {/* Nice to have */}
    {viewProfile.niceToHave?.length > 0 && (
      <DetailsSection title="Nice to Have">
        <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
          {viewProfile.niceToHave.map((n, i) => (
            <li key={i} style={{ marginBottom: "0.25rem" }}>
              {cleanBullet(n)}
            </li>
          ))}
        </ul>
      </DetailsSection>
    )}
  </>
)}

        </PremiumDetailsDialog>

        {/* ✏️ Add/Edit Dialog */}
        <JobProfileAddEdit
          visible={showAddEdit}
          onHide={() => setShowAddEdit(false)}
          selectedJobProfile={editProfile}
          onSuccess={handleAddEditSuccess}
          techOptions={techSpecs}
        />

        <JobProfileDelete
          visible={showDeleteDialog}
          onHide={() => setShowDeleteDialog(false)}
          onSuccess={refetch}
          selectedJobProfile={selected}
        />

        {selectedJobProfileForReq && (
          <JobProfileRequirementsAddEdit
            visible={showRequirementDialog}
            onHide={() => {
              setShowRequirementDialog(false);
              setSelectedJobProfileForReq(null);
            }}
            jobProfileId={selectedJobProfileForReq.id}
            onSave={createRequirement}
          />
        )}


      </section>
    </>
  );
};

export default JobProfileTable;