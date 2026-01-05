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
import { Member, Location, ClientOption } from "../types/memberTypes";
import { getMembers, deleteMember, fetchMemberLookupData, getClients } from "../services/memberService";
import { useAuth } from "../../../shared/auth/AuthContext";
import { FilterMatchMode } from "primereact/api";
import { Toast } from 'primereact/toast';
import { Tooltip } from "primereact/tooltip";


import MemberEdit from "./MembersEdit";     // ✔ Only Edit dialog
import MemberDelete from "./MembersDelete"; // ✔ Delete dialog only

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
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [designations, setDesignations] = useState<string[]>([]);
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        const [clientsData, memberLookup] = await Promise.all([
          getClients(accessToken),
          fetchMemberLookupData(accessToken)
        ]);
        
        setClients(clientsData.clients);
        setLocations(clientsData.locations);
        setDesignations(memberLookup.designations);
        setSkillOptions(memberLookup.skills);
      } catch (error) {
        console.error('Failed to load lookup data:', error);
      }
    };
    
    if (accessToken) {
      loadLookupData();
    }
  }, [accessToken]);
  useEffect(() => {
  if (accessToken) {
    loadMembers();
  }
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

  /** ------------------- Load Data ------------------- */
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

  /** ------------------- Handlers ------------------- */
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
  loadMembers(); // refresh table
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

  const newPage = event.page + 1; // PrimeReact starts from 0
    setSearchParams({ page: newPage.toString() });
  };


  /** ------------------- Global Search ------------------- */
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


  /** ------------------- JSX ------------------- */
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
          "member",
          "Contact Details",
          "Location",
          "Skills",
          "interviewerCapacity",
          "Recruiter",
          "Interviewer",
          "clientName",
          "organisation",
        ]}
      >
        <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
        <Column header="Member" body={formatNameDesignation} sortable />
        <Column header="Contact Details" body={formatContactDetails} sortable />
        <Column header="Location" body={(row) => formatLocation(row)} sortable />
        <Column header="Skills" body={(row) => formatSkillsDetailed(row.skills)} style={{ width: "17rem", maxWidth: "17rem" }} />
        <Column field="interviewerCapacity" header="Capacity" sortable body={(row) => row.interviewerCapacity ?? "-"} />
        <Column header="Recruiter" body={(row) => (row.isRecruiter ? "Yes" : "No")} sortable />
        <Column header="Interviewer" body={(row) => (row.isInterviewer ? "Yes" : "No")} sortable />
        <Column field="clientName" header="Client" sortable body={(row) => formatValue(row.clientName)}/>
        <Column field="organisation" header="Organisation" sortable body={(row) => formatValue(row.organisation)}/>
      </DataTable>
      </div>
      {/* ------------------- Dialogs ------------------- */}
      <MemberEdit
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        selectedMember={editingMember}
        onSuccess={handleEditSuccess}
        clients={clients}
        locations={locations}
        designations={designations}
        skillOptions={skillOptions}
      />

        <MemberDelete
          visible={showDeleteDialog}
          onHide={() => setShowDeleteDialog(false)}
          selectedMember={selectedMember}
          onDelete={handleDeleteSuccess}   // after API success, reload & close
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
