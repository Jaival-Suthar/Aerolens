import React, { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
// import ExportExcelButton from "../../../shared/ExportExcelButton";
import SearchButton from "../../../shared/SearchButton";
import SignupForm from "../../Signup/components/SignupForm";
import { useSearchParams } from "react-router-dom";
import { Member, MemberFormData } from "../types/memberTypes";
import { getMembers, deleteMember, getMemberFormData } from "../services/memberService";
import { useAuth } from "../../../shared/auth/AuthContext";
import { FilterMatchMode } from "primereact/api";
import { Toast } from 'primereact/toast';
import { Tooltip } from "primereact/tooltip";
import MemberEdit from "./MembersEdit";
import MemberDelete from "./MembersDelete";
import ColumnSettingsButton from "../../../shared/ColumnSettingsButton";
import ViewButton from "../../../shared/ViewButton";
import PremiumDetailsDialog from "../../../shared/PremiumDetailsDialog";
import DetailsGrid from "../../../shared/DetailsGrid";
import DetailsSection from "../../../shared/DetailsSection";
import { Dropdown } from 'primereact/dropdown';
import CogButton from "../../../shared/CogButton";
import ChangeLogsDialog from "../../../shared/ChangeLogsDialog";
import MembersDeletedRecordsDialog from "./membersDeletedRecordsDialog";

const ALL_MEMBER_COLUMNS = [
  { field: "memberName", header: "Member", sortable: true, filter: false },
  { field: "contactDetails", header: "Contact Details", sortable: false, filter: false },
  { field: "skills", header: "Skills", sortable: false, filter: false },
  { field: "interviewerCapacity", header: "Capacity", sortable: true, filter: false },
  { field: "isRecruiter", header: "Recruiter", sortable: true, filter: false },
  { field: "isInterviewer", header: "Interviewer", sortable: true, filter: false },
  { field: "location", header: "Location", sortable: true, filter: false },
  { field: "vendorName", header: "Vendor", sortable: true, filter: true },
  { field: "clientName", header: "Client", sortable: true, filter: true },
  { field: "organisation", header: "Organisation", sortable: true, filter: false },
];
const DEFAULT_MEMBER_COLUMNS = [
  "memberName",
  "contactDetails",
  "skills",
  "interviewerCapacity",
  "isRecruiter",
  "isInterviewer",
];

/* -------------------- Column Persistence -------------------- */
const STORAGE_KEY = "member-management:visible-columns";

const loadVisibleColumns = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const fields: string[] = JSON.parse(raw);

    return ALL_MEMBER_COLUMNS.filter(col =>
      fields.includes(col.field)
    );
  } catch {
    return null;
  }
};

const MembersTable: React.FC = () => {
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeletedRecordsDialog, setShowDeletedRecordsDialog] = useState(false);
  const [showCogMenu, setShowCogMenu] = useState(false);
  const [showChangeLogsDialog, setShowChangeLogsDialog] = useState(false);
  const [auditTargetMember, setAuditTargetMember] = useState<Member | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const cogMenuRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  const dt = useRef<DataTable<any>>(null);

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },

    vendorName: { value: null, matchMode: FilterMatchMode.EQUALS },

    clientName: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [rows, setRows] = useState(20);
  const [first, setFirst] = useState((pageFromUrl - 1) * 10);
  const tooltipRef = useRef<Tooltip>(null);
  const [formData, setFormData] = useState<MemberFormData | null>(null);
  const [visibleColumns, setVisibleColumns] = useState(() =>
    loadVisibleColumns() ??
    ALL_MEMBER_COLUMNS.filter(col =>
      DEFAULT_MEMBER_COLUMNS.includes(col.field)
    )
  );


  useEffect(() => {
    if (!showCogMenu) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (cogMenuRef.current && !cogMenuRef.current.contains(event.target as Node)) {
        setShowCogMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showCogMenu]);

  useEffect(() => {
    if (!accessToken) return;

    getMemberFormData(accessToken)
      .then(setFormData)
      .catch(err => {
        console.error("Failed to load member form data:", err);
        showError("Failed to load form data");
      });
  }, [accessToken]);

  useEffect(() => {
    const fields = visibleColumns.map(c => c.field);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(fields)
    );
  }, [visibleColumns]);

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 4000
    });
  };

  const handleAddNew = () => {
    setShowCreateUser(true);
  };

  const loadMembers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);

    try {
      const res = await getMembers(accessToken);
      setMembers(
        Array.isArray(res.data)
          ? res.data.map((m: Member) => ({
              ...m,
              locationString: `${m.location?.city || ""} ${m.location?.country || ""}`.trim(),
              skillsString: m.skills?.map(s => s.skillName).join(", ") || ""
            }))
          : []
      );
      setTimeout(() => {
        tooltipRef.current?.updateTargetEvents();
      }, 0);
    } catch (err) {
      console.error("Error loading members:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleEdit = () => {
    if (selectedMember) {
      setEditingMember(selectedMember);
      setShowEditDialog(true);
    }
  };

  const handleDelete = () => {
    if (selectedMember) {
      setShowDeleteDialog(true);
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedMember(null);
    setSelectedMember(null);
    loadMembers();
  };

  const handleEditCancel = () => {
    setShowEditDialog(false);
    setEditingMember(null);
    setSelectedMember(null);
  };

  const handleCreateSuccess = () => {
    setShowCreateUser(false);
    loadMembers();
  };

  const handleDeleteSuccess = async () => {
    if (!selectedMember) return;
    
    setLoading(true);
    try {
      const response = await deleteMember(accessToken, selectedMember.memberId);
      showSuccess(response.message || 'Member deactivated successfully');
      
      setShowDeleteDialog(false);
      setSelectedMember(null);
      loadMembers();
      
    } catch (error: any) {
      console.error("Delete failed:", error);
      showError(error.message || 'Failed to deactivate member');
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);

    const newPage = event.page + 1;
    setSearchParams({ page: newPage.toString() });
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const formatValue = (value: any) => {
    return value === null || value === undefined || value === "" ? "-" : value;
  };

  const formatSkillsDetailed = (skills: Member["skills"]) => {
    if (!skills?.length) return "-";

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          maxWidth: "100%",
        }}
      >
        {skills.map((skill, index) => (
          <span
            key={index}
            className="skill-tag"
            data-pr-tooltip={
              `Proficiency: ${skill.proficiencyLevel || "-"}\n` +
              `YOE: ${skill.yearsOfExperience || 0} yrs`
            }
            data-pr-position="top"
            style={{
              background: "#eef3ff",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-block",
              color: "#3957e8",
              border: "1px solid #cdd5ff",
              maxWidth: "120px",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {skill.skillName}
          </span>
        ))}
      </div>
    );
  };

  const formatContactDetails = (row: Member) => {
    return (
      <div>
        <div>{row.email || "-"}</div>
        <div>{row.memberContact || "-"}</div>
      </div>
    );
  };

  const formatLocation = (row: Member) => {
    const city = row.location?.city || "";
    const country = row.location?.country || "";
    if (!city && !country) return "-";
    return `${city}, ${country}`;
  };

  const formatNameDesignation = (row: Member) => {
    return (
      <div>
        <div><strong>{row.memberName}</strong></div>
        <div style={{ fontSize: "12px", color: "#666" }}>{row.designation}</div>
      </div>
    );
  };

  const buildMemberDetails = (member: Member) => {
  return [
    { label: "Name", value: member.memberName || "-", field: "memberName" },
    { label: "Designation", value: member.designation || "-", field: "designation" },
    { label: "Email", value: member.email || "-", field: "email" },
    { label: "Contact", value: member.memberContact || "-", field: "memberContact" },
    {
      label: "Location",
      value: member.location
        ? `${member.location.city}, ${member.location.country}`
        : "-",
      field: "location",
    },
    { label: "Capacity", value: member.interviewerCapacity ?? "-", field: "interviewerCapacity" },
    { label: "Recruiter", value: member.isRecruiter ? "Yes" : "No", field: "isRecruiter" },
    { label: "Interviewer", value: member.isInterviewer ? "Yes" : "No", field: "isInterviewer" },
    { label: "Vendor", value: member.vendorName || "-", field: "vendorName" },
    { label: "Client", value: member.clientName || "-", field: "clientName" },
    { label: "Organisation", value: member.organisation || "-", field: "organisation" },
  ];
};

  const uniqueValues = <T,>(arr: (T | null | undefined)[]) =>
  Array.from(new Set(arr.filter(Boolean)));

  const toOptions = (values: (string | null | undefined)[]) =>
    uniqueValues(values).map(v => ({
      label: String(v),
      value: v
    }));

  const vendorFilterTemplate = (options: any) => (
      <Dropdown
        value={options.value}
        options={toOptions(members.map(m => m.vendorName))}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Select Vendor"
        showClear
        style={{ minWidth: "12rem" }}
      />
    );
  
  const clientFilterTemplate = (options: any) => (
    <Dropdown
      value={options.value}
      options={toOptions(members.map(m => m.clientName))}
      onChange={(e) => options.filterCallback(e.value)}
      placeholder="Select Client"
      showClear
      style={{ minWidth: "12rem" }}
    />
  );


  return (
    <>
      <Toast ref={toast} position="top-right" />
      <Tooltip ref={tooltipRef} target=".skill-tag" />
      
      <div className="flex justify-content-between align-items-center mb-2">
        <h2 style={{ color: "#07253f" }}>Member Management</h2>

        <div className="flex gap-2 align-items-center">
          <SearchButton
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search members..."
          />
          <ColumnSettingsButton
            value={visibleColumns}
            options={ALL_MEMBER_COLUMNS}
            optionLabel="header"
            onChange={setVisibleColumns}
            onReset={() =>
              setVisibleColumns(
                ALL_MEMBER_COLUMNS.filter(col =>
                  DEFAULT_MEMBER_COLUMNS.includes(col.field)
                )
              )
            }
          />
          {/* <ExportExcelButton dtRef={dt} /> */}
          <AddButton onClick={handleAddNew} />
          <EditButton onClick={handleEdit} disabled={!selectedMember} />
          <DeleteButton onClick={handleDelete} disabled={!selectedMember} />
          <ViewButton
            onClick={() => setViewMember(selectedMember)}
            disabled={!selectedMember}
            tooltip="View Member Details"
          />
          <div ref={cogMenuRef} style={{ position: "relative" }}>
            <CogButton
              onClick={() => setShowCogMenu((prev) => !prev)}
              tooltip="Member Activity"
            />
            {showCogMenu && (
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
                }}
              >
                <div
                  className="p-2 border-round"
                  role="button"
                  tabIndex={selectedMember ? 0 : -1}
                  aria-disabled={!selectedMember}
                  onClick={() => {
                    if (!selectedMember) return;
                    setAuditTargetMember(selectedMember);
                    setShowCogMenu(false);
                    setShowChangeLogsDialog(true);
                  }}
                  onKeyDown={(e) => {
                    if (!selectedMember) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setAuditTargetMember(selectedMember);
                      setShowCogMenu(false);
                      setShowChangeLogsDialog(true);
                    }
                  }}
                  style={{ display: "flex", alignItems: "center", cursor: selectedMember ? "pointer" : "not-allowed", opacity: selectedMember ? 1 : 0.4 }}
                  onMouseEnter={(e) => { if (selectedMember) e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <i className="pi pi-history" style={{ fontSize: "14px", color: "#374151" }} />
                  <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    Change Logs
                  </span>
                </div>
                <div
                  className="p-2 border-round"
                  role="button"
                  tabIndex={0}
                  onClick={() => { setShowCogMenu(false); setShowDeletedRecordsDialog(true); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCogMenu(false); setShowDeletedRecordsDialog(true); } }}
                  style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <i className="pi pi-trash" style={{ fontSize: "14px", color: "#374151" }} />
                  <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    Deleted Members
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1, overflow: "auto" }}>
        <DataTable
          ref={dt}
          value={members}
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          scrollable
          scrollHeight="flex"
          rowsPerPageOptions={[20, 50, 100]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Members"
          selectionMode="single"
          selection={selectedMember}
          dataKey="memberId"
          onSelectionChange={(e) => setSelectedMember(e.value)}
          tableStyle={{ minWidth: "80rem" }}
          loading={loading}
          emptyMessage="No members found."
          responsiveLayout="scroll"
          filters={filters}
          globalFilterFields={[
            "memberName",
            "email",
            "memberContact",
            "location.city",
            "location.country",
            "skills.skillName",
            "interviewerCapacity",
            "clientName",
            "organisation",
            "vendorName",
          ]}
        >
          <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
          {visibleColumns.map((col) => {
          let body;

          switch (col.field) {
            case "memberName":
              body = formatNameDesignation;
              break;

            case "contactDetails":
              body = formatContactDetails;
              break;

            case "skills":
              body = (row: Member) => formatSkillsDetailed(row.skills);
              break;

            case "location":
              body = (row: Member) => formatLocation(row);
              break;

            case "isRecruiter":
              body = (row: Member) => (row.isRecruiter ? "Yes" : "No");
              break;

            case "isInterviewer":
              body = (row: Member) => (row.isInterviewer ? "Yes" : "No");
              break;

            default:
              body = (row: Member) => formatValue((row as any)[col.field]);
          }

          let filterElement;

          if (col.field === "vendorName")
            filterElement = vendorFilterTemplate;

          if (col.field === "clientName")
            filterElement = clientFilterTemplate;

          return (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={body}
              sortable={col.sortable}
              filter={col.filter}
              filterElement={filterElement}
              showFilterMatchModes={false}
            />
          );
        })}
        </DataTable>
      </div>

      {formData && (
        <MemberEdit
          visible={showEditDialog}
          onHide={handleEditCancel}
          selectedMember={editingMember}
          onSuccess={handleEditSuccess}
          formData={formData}
        />
      )}

      <MemberDelete
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        selectedMember={selectedMember}
        onDelete={handleDeleteSuccess}
        loading={loading}
      />
      
      <SignupForm
        visible={showCreateUser}
        onHide={() => setShowCreateUser(false)}
        onSuccess={(msg) => {
          showSuccess(msg);
          setShowCreateUser(false);
          loadMembers();
        }}
        onError={(msg) => {
          showError(msg);
        }}
      />

      <PremiumDetailsDialog
        visible={!!viewMember}
        title="Member Details"
        onHide={() => setViewMember(null)}
      >
        {viewMember && (
          <>
            {/* 🔹 Core Information */}
            <DetailsSection title="Member Overview">
              <DetailsGrid items={buildMemberDetails(viewMember)} />
            </DetailsSection>

            {/* 🔹 Skills */}
            {viewMember.skills?.length > 0 && (
              <DetailsSection title="Skills">
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {viewMember.skills.map((skill, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        background: "#eef3ff",
                        border: "1px solid #cdd5ff",
                        color: "#3957e8",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {skill.skillName}
                      <span style={{ fontWeight: 400 }}>
                        {" "}
                        • {skill.proficiencyLevel || "-"} • {skill.yearsOfExperience || 0} yrs
                      </span>
                    </div>
                  ))}
                </div>
              </DetailsSection>
            )}
          </>
        )}
      </PremiumDetailsDialog>
      <MembersDeletedRecordsDialog
        isOpen={showDeletedRecordsDialog}
        onClose={() => setShowDeletedRecordsDialog(false)}
        onRestoreSuccess={loadMembers}
      />
      <ChangeLogsDialog
        key={`member-audit-${auditTargetMember?.memberId ?? "none"}`}
        isOpen={showChangeLogsDialog}
        onClose={() => {
          setShowChangeLogsDialog(false);
          setAuditTargetMember(null);
        }}
        title="Member Change Logs"
        resourceType="member"
        resourceId={auditTargetMember?.memberId ?? null}
      />

    </>
  );
};

export default MembersTable;
