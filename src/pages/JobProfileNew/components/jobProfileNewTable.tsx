import React, { useState } from "react";
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

import { JOB_PROFILES } from "../util/jobProfile.mock";
import { JobProfile } from "../types/jobProfileTypes";
import { RichSectionRenderer } from "./RichSectionRenderer";
import JobProfileAddEdit from "../components/jobProfileAddEdit";

/* -------------------- Columns -------------------- */
const ALL_COLUMNS = [
  { field: "position", header: "Position", type: "text" },
  { field: "experience", header: "Experience", type: "text" },
  { field: "overview", header: "Job Overview", type: "rich" },
  { field: "responsibilities", header: "Key Responsibilities", type: "rich" },
  { field: "requiredSkills", header: "Required Skills", type: "rich" },
  { field: "niceToHave", header: "Nice to Have", type: "rich" }
];

const DEFAULT_COLUMNS = ["position", "experience"];

/* -------------------- Component -------------------- */
const JobProfileTable: React.FC = () => {
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>(JOB_PROFILES);
  const [selected, setSelected] = useState<JobProfile | null>(null);
  const [viewProfile, setViewProfile] = useState<JobProfile | null>(null);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editProfile, setEditProfile] = useState<JobProfile | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const confirmDelete = () => {
    if (selected) {
      // In real app, call delete API
      setJobProfiles(prev => prev.filter(jp => jp.id !== selected.id));
      setSelected(null);
      setShowDeleteDialog(false);
      console.log("Job profile deleted:", selected.id);
    }
  };

  const handleAddEditSuccess = () => {
    // In real app, refetch data from API
    setShowAddEdit(false);
    setEditProfile(null);
    setSelected(null);
    console.log("Job profile saved successfully");
  };

  /* -------------------- Render -------------------- */
  return (
    <>
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
        />

        {/* 🗑️ Delete Confirmation Dialog */}
        <PremiumDetailsDialog
          visible={showDeleteDialog}
          title="Delete Job Profile"
          onHide={() => setShowDeleteDialog(false)}
        >
          <div className="flex flex-column gap-3">
            <p>
              Are you sure you want to delete the job profile{" "}
              <strong>{selected?.position}</strong>?
            </p>
            <p className="text-sm text-color-secondary">
              This action cannot be undone.
            </p>
            <div className="flex justify-content-end gap-2 mt-3">
              <button
                className="p-button p-button-secondary"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                className="p-button p-button-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </PremiumDetailsDialog>
      </section>
    </>
  );
};

export default JobProfileTable;