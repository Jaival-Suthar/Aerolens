import React, { useState, useRef } from "react";
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
import { RichSectionRenderer } from "./RichSectionRenderer";
import JobProfileAddEdit from "../components/jobProfileAddEdit";
import JobProfileDelete from "./jobProfileDelete";
import { useAuth } from "../../../shared/auth/AuthContext"; 
import { useTechSpecifications } from "../hooks/useTechSpecifications";
import { Button } from "primereact/button";
import { FaDownload, FaEye } from "react-icons/fa";
import { Toast } from "primereact/toast";
import { Tooltip } from "primereact/tooltip";

/* -------------------- Columns -------------------- */
const ALL_COLUMNS = [
  { field: "position", header: "Position", type: "text" },
  { field: "experience", header: "Experience", type: "text" },
  { field: "overview", header: "Job Overview", type: "rich" },
  { field: "techSpecifications", header: "Tech Stack", type: "tech" },
  { field: "responsibilities", header: "Key Responsibilities", type: "rich" },
  { field: "requiredSkills", header: "Required Skills", type: "rich" },
  { field: "niceToHave", header: "Nice to Have", type: "rich" }
];

const DEFAULT_COLUMNS = ["position", "experience"];

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
  const toast = useRef<Toast>(null);

  /* -------------------- Column visibility -------------------- */
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.filter(col => DEFAULT_COLUMNS.includes(col.field))
  );

  /* -------------------- URL-synced Pagination -------------------- */
  const PAGE_PARAM = "jobProfilePage";
  const SIZE_PARAM = "jobProfileSize";

  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = Number(searchParams.get(PAGE_PARAM)) || 1;
  const sizeFromUrl = Number(searchParams.get(SIZE_PARAM)) || 10;

  const [rows, setRows] = useState(sizeFromUrl);
  const [first, setFirst] = useState((pageFromUrl - 1) * sizeFromUrl);

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

  /* -------------------- Cell Renderer -------------------- */
  const renderCell = (row: JobProfile, col: any) => {
    if (col.type === "text") {
      return (row as any)[col.field] ?? "-";
    }
    if (col.type === "tech") {
    if (!row.techSpecifications?.length) return "-";

    return row.techSpecifications
      .map(t => t.label)
      .join(", ");
  }
    const section =
      col.field === "overview"
        ? row.overview?.[0]
        : (row as any)[col.field];

    const preview =
      section?.type === "paragraph"
        ? section.content[0]?.text
        : section?.content?.[0]?.text;

    return (
      <div
        style={{
          maxWidth: 360,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "#374151"
        }}
        title={preview}
      >
        {preview || "-"}
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
          rowsPerPageOptions={[10, 20, 50]}
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
            header="JD"
            body={jdBodyTemplate}
            style={{ width: "8rem", textAlign: "center" }}
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
              <DetailsSection title="Position & Experience">
                <p>
                  <strong>Position:</strong> {viewProfile.position}
                </p>
                <p>
                  <strong>Experience:</strong> {viewProfile.experience}
                </p>
              </DetailsSection>
              {/* Tech Specifications */}
              {viewProfile.techSpecifications?.length > 0 && (
                <DetailsSection title="Tech Specifications">
                  <p style={{ lineHeight: 1.6 }}>
                    {viewProfile.techSpecifications
                      .map(t => t.label)
                      .join(", ")}
                  </p>
                </DetailsSection>
              )}
              <DetailsSection title="Job Overview">
                <RichSectionRenderer sections={viewProfile.overview} />
              </DetailsSection>

              {viewProfile.responsibilities && (
                <DetailsSection title="Key Responsibilities">
                  <RichSectionRenderer sections={[viewProfile.responsibilities]} />
                </DetailsSection>
              )}

              {viewProfile.requiredSkills && (
                <DetailsSection title="Required Skills & Experience">
                  <RichSectionRenderer sections={[viewProfile.requiredSkills]} />
                </DetailsSection>
              )}

              {viewProfile.niceToHave && (
                <DetailsSection title="Nice to Have">
                  <RichSectionRenderer sections={[viewProfile.niceToHave]} />
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
      </section>
    </>
  );
};

export default JobProfileTable;