import React, { useEffect, useState, useCallback, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { ApiError } from "../../../types/apiError";
import { getDepartments } from "../services/useDepartment";
import DepartmentAddEdit from "../components/departmentAddEdit";
import DepartmentDelete from "../components/departmentDelete";
import DepartmentDeletedRecordsDialog from "../components/DepartmentDeletedRecordsDialog";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import CogButton from "../../../shared/CogButton";
import DepartmentAuditLogsDialog from "../components/DepartmentAuditLogsDialog";
import { Department, DepartmentTableProps } from "../types/departmentTypes";
import { useAuth } from "../../../shared/auth/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
import { ApiResponse } from "../types/departmentTypes";

const DepartmentTable: React.FC<DepartmentTableProps> = ({
  clientId,
  clientName,
  onBackClick,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showAddEditDialog, setShowAddEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showCogMenu, setShowCogMenu] = useState(false);
  const [showChangeLogsDialog, setShowChangeLogsDialog] = useState(false);
  const [showDeletedRecordsDialog, setShowDeletedRecordsDialog] = useState(false);
  const cogMenuRef = useRef<HTMLDivElement | null>(null);

  const savedPage = Number(localStorage.getItem("departmentTablePage") || 0);
  const savedRowsRaw = Number(localStorage.getItem("departmentTableRows"));
  const savedRows = [20, 50, 100].includes(savedRowsRaw) ? savedRowsRaw : 20;
  const [error, setError] = useState<ApiError | null>(null);
  const [first, setFirst] = useState(savedPage * savedRows);
  const [rows, setRows] = useState(savedRows);

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
    localStorage.setItem("departmentTablePage", String(event.page));
    localStorage.setItem("departmentTableRows", String(event.rows));
  };

  const toast = React.useRef<Toast>(null);

  const showToast = (severity: "success" | "error", message?: string) => {
    if (!message) return;
    toast.current?.show({ severity, summary: severity === "success" ? "Success" : "Error", detail: message });
  };

  const { accessToken } = useAuth();

  const loadDepartments = useCallback(async () => {
    if (!clientId || !accessToken) return;
    try {
      const data = await getDepartments(accessToken, clientId);
      setDepartments(data.departments || []);
      setError(null);
    } catch (err) {
      setError(err as ApiError);
    }
  }, [clientId, accessToken]);

  useEffect(() => { loadDepartments(); }, [loadDepartments]);
  useEffect(() => { if (error?.message) showToast("error", error.message); }, [error]);

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

  const handleAdd = () => { setEditingDepartment(null); setShowAddEditDialog(true); };
  const handleEdit = () => { if (!selectedDepartment) return; setEditingDepartment(selectedDepartment); setShowAddEditDialog(true); };
  const handleDelete = () => { if (!selectedDepartment) return; setShowDeleteDialog(true); };

  const handleAddEditSuccess = async (_response: ApiResponse<Department>) => {
    showToast("success", editingDepartment ? "Department updated successfully." : "Department added successfully.");
    await loadDepartments();
    setSelectedDepartment(null);
  };

  const handleDeleteSuccess = async (response: ApiResponse<null>) => {
    showToast("success", response.message);
    setSelectedDepartment(null);
    await loadDepartments();
  };

  const handleAddEditError = (error: any) => {
    if (error?.message && !error?.details?.validationErrors) showToast("error", error.message);
  };

  const handleSelectionChange = (e: any) => {
    const dept = Array.isArray(e.value) ? e.value[0] || null : e.value;
    setSelectedDepartment(dept);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mt-1 w-full">
        <div className="flex justify-content-start align-items-center">
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-100 transition"
          >
            <FaArrowLeft />
            Back to Clients
          </button>
        </div>

        <div className="flex gap-2 ml-auto mr-6">
          <AddButton onClick={handleAdd} disabled={!clientId} />
          <EditButton onClick={handleEdit} disabled={!selectedDepartment} />
          <DeleteButton onClick={handleDelete} disabled={!selectedDepartment} />

          <div ref={cogMenuRef} style={{ position: "relative" }}>
            <CogButton
              onClick={() => setShowCogMenu(prev => !prev)}
              tooltip="Department Activity"
            />
            {showCogMenu && (
              <div
                className="card shadow-3"
                style={{ position: "absolute", right: 0, top: 50, zIndex: 9999, minWidth: 220, backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.5rem" }}
              >
                <div
                  className="p-2 border-round"
                  role="button"
                  tabIndex={selectedDepartment ? 0 : -1}
                  aria-disabled={!selectedDepartment}
                  onClick={() => { if (!selectedDepartment) return; setShowCogMenu(false); setShowChangeLogsDialog(true); }}
                  onKeyDown={(e) => { if (!selectedDepartment) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCogMenu(false); setShowChangeLogsDialog(true); } }}
                  style={{ display: "flex", alignItems: "center", cursor: selectedDepartment ? "pointer" : "not-allowed", opacity: selectedDepartment ? 1 : 0.4 }}
                  onMouseEnter={(e) => { if (selectedDepartment) e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <i className="pi pi-history" style={{ fontSize: "14px", color: "#374151" }} />
                  <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>Change Logs</span>
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
                  <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>Deleted Departments</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <h4 className="mb-3" style={{ color: "#07253f" }}>Departments for: {clientName}</h4>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <DataTable
          value={departments}
          paginator
          rows={rows}
          first={first}
          scrollable
          scrollHeight="flex"
          onPage={onPageChange}
          rowsPerPageOptions={[20, 50, 100]}
          dataKey="departmentId"
          selectionMode="single"
          selection={selectedDepartment}
          onSelectionChange={handleSelectionChange}
          tableStyle={{ minWidth: "50rem" }}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Departments"
        >
          <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
          <Column field="departmentId" header="ID" />
          <Column field="departmentName" header="Department Name" />
          <Column field="departmentDescription" header="Description" />
        </DataTable>
      </div>

      <DepartmentAddEdit
        visible={showAddEditDialog}
        onHide={() => { setShowAddEditDialog(false); setEditingDepartment(null); }}
        selectedDepartment={editingDepartment}
        clientId={clientId}
        onSuccess={handleAddEditSuccess}
        onError={handleAddEditError}
      />

      <DepartmentDelete
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        selectedDepartment={selectedDepartment}
        onSuccess={handleDeleteSuccess}
        onClearSelection={() => setSelectedDepartment(null)}
      />

      <DepartmentDeletedRecordsDialog
        isOpen={showDeletedRecordsDialog}
        onClose={() => setShowDeletedRecordsDialog(false)}
        clientId={clientId}
        onRestoreSuccess={loadDepartments}
      />

      <DepartmentAuditLogsDialog
        isOpen={showChangeLogsDialog}
        onClose={() => setShowChangeLogsDialog(false)}
        departmentId={selectedDepartment?.departmentId ?? null}
      />
    </div>
  );
};

export default DepartmentTable;
