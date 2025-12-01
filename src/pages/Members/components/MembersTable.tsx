import React, { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import ExportExcelButton from "../../../shared/ExportExcelButton";
import SearchButton from "../../../shared/SearchButton";

import { useSearchParams } from "react-router-dom";
import { Member } from "../types/memberTypes";
import { getMembers, deleteMember } from "../services/memberService";
import { useAuth } from "../../../shared/auth/AuthContext";
import { FilterMatchMode } from "primereact/api";
import { Toast } from 'primereact/toast';

// import MemberEdit from "./MemberEdit";     // ✔ Only Edit dialog
import MemberDelete from "./MembersDelete"; // ✔ Delete dialog only

const MembersTable: React.FC = () => {
     const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [loading, setLoading] = useState(false);


  const dt = useRef<DataTable<any>>(null);

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [searchParams, setSearchParams] = useSearchParams();
const pageFromUrl = Number(searchParams.get("page")) || 1;

const [first, setFirst] = useState((pageFromUrl - 1) * 10); 
const [rows, setRows] = useState(10);
 
  useEffect(() => {
    loadMembers();
  }, []);
  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 4000
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  };

  /** ------------------- Load Data ------------------- */
  const loadMembers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);

    try {
      const res = await getMembers(accessToken);
        setMembers(Array.isArray(res.data) ? res.data : []);

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

  const handleDeleteSuccess = async () => {
    if (!selectedMember) return;
    
    setLoading(true);
    try {
      const response = await deleteMember(accessToken, selectedMember.memberId);
      
      // 👈 Use PARENT toast instead of dialog toast
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


  /** ------------------- JSX ------------------- */
  return (
    <>
        <Toast ref={toast} position="top-right" />
      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Member Management</h2>

        <div className="flex gap-2">
          <SearchButton
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search members..."
          />

          <ExportExcelButton dtRef={dt} />

          {/* Removed AddButton */}
          <EditButton onClick={handleEdit} disabled={!selectedMember} />
          <DeleteButton onClick={handleDelete} disabled={!selectedMember} />
        </div>
      </div>

      <DataTable
        ref={dt}
        value={members}
        paginator
        rows={rows}
        first={first}
        onPage={onPageChange}
        rowsPerPageOptions={[10, 20, 50]}
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
            "memberContact",
            "email",
            "designation",
            "location.city",
            "location.country",
            "clientName",
            "organisation",
            "skills"
        ]}
      >
        <Column selectionMode="single" headerStyle={{ width: "3rem" }} />

        <Column field="memberName" header="Name" sortable/>
        <Column field="email" header="Email" sortable />
        <Column field="memberContact" header="Contact" sortable />
        <Column field="designation" header="Designation" sortable />

        {/* Nested fields */}
        <Column field="location.city" header="City" sortable body={(row) => formatValue(row.location?.city)}/>
        <Column field="location.country" header="Country" sortable body={(row) => formatValue(row.location?.country)}/>

        <Column field="clientName" header="Client" sortable body={(row) => formatValue(row.clientName)}/>
        <Column field="organisation" header="Organisation" sortable body={(row) => formatValue(row.organisation)}/>

        {/* Boolean fields with transform */}
        <Column
        field="isActive"
        header="Active"
        body={(row) => (row.isActive ? "Yes" : "No")}
        sortable
        />
        <Column
        field="isRecruiter"
        header="Recruiter"
        body={(row) => (row.isRecruiter ? "Yes" : "No")}
        sortable
        />

        <Column field="skills" header="Skills" sortable body={(row) => formatValue(row.skills)}/>

      </DataTable>

      {/* ------------------- Dialogs ------------------- */}
      {/* <MemberEdit
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        selectedMember={editingMember}
        onSuccess={handleEditSuccess}
      /> */}

        <MemberDelete
            visible={showDeleteDialog}
            onHide={() => setShowDeleteDialog(false)}
            selectedMember={selectedMember}
            onDelete={handleDeleteSuccess}   // after API success, reload & close
            loading={loading}
            />
    </>
  );
};

export default MembersTable;
