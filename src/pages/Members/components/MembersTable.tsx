import React, { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import ExportExcelButton from "../../../shared/ExportExcelButton";
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

const MembersTable: React.FC = () => {
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const dt = useRef<DataTable<any>>(null);

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState((pageFromUrl - 1) * 10);
  const tooltipRef = useRef<Tooltip>(null);
  const [formData, setFormData] = useState<MemberFormData | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    getMemberFormData(accessToken)
      .then(setFormData)
      .catch(err => {
        console.error("Failed to load member form data:", err);
        showError("Failed to load form data");
      });
  }, [accessToken]);

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 2000
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 2000
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
    loadMembers();
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

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <Tooltip ref={tooltipRef} target=".skill-tag" />
      
      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Member Management</h2>

        <div className="flex gap-2">
          <SearchButton
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search members..."
          />
          <ExportExcelButton dtRef={dt} />
          <AddButton onClick={handleAddNew} />
          <EditButton onClick={handleEdit} disabled={!selectedMember} />
          <DeleteButton onClick={handleDelete} disabled={!selectedMember} />
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
          rowsPerPageOptions={[10, 20, 50]}
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
          <Column field="memberName" header="Member" body={formatNameDesignation} sortable />
          <Column header="Contact Details" body={formatContactDetails} sortable />
          <Column field="locationString" header="Location" body={(row) => formatLocation(row)} sortable />
          <Column field="skillsString" header="Skills" body={(row) => formatSkillsDetailed(row.skills)} style={{ width: "17rem", maxWidth: "17rem" }} sortable/>
          <Column field="interviewerCapacity" header="Capacity" sortable body={(row) => row.interviewerCapacity ?? "-"} />
          <Column header="Recruiter" body={(row) => (row.isRecruiter ? "Yes" : "No")} sortable />
          <Column header="Interviewer" body={(row) => (row.isInterviewer ? "Yes" : "No")} sortable />
          <Column field="vendorName" header="Vendor" sortable body={(row) => formatValue(row.vendorName)} />
          <Column field="clientName" header="Client" sortable body={(row) => formatValue(row.clientName)}/>
          <Column field="organisation" header="Organisation" sortable body={(row) => formatValue(row.organisation)}/>
        </DataTable>
      </div>

      {formData && (
        <MemberEdit
          visible={showEditDialog}
          onHide={() => setShowEditDialog(false)}
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
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

export default MembersTable;