// src/pages/Department/components/DepartmentTable.tsx
import React, { useEffect, useState, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { ApiError } from "../../../types/apiError";
import { getDepartments } from "../services/useDepartment";
import DepartmentAddEdit from "../components/departmentAddEdit";
import DepartmentDelete from "../components/departmentDelete";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
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
  
  // ✅ LocalStorage Pagination (isolated for Department table)
  const savedPage = Number(localStorage.getItem("departmentTablePage") || 0);
  const savedRowsRaw = Number(localStorage.getItem("departmentTableRows"));
  const savedRows = [20, 50, 100].includes(savedRowsRaw) ? savedRowsRaw : 20;
  const [error, setError] = useState<ApiError | null>(null);
  const [first, setFirst] = useState(savedPage * savedRows);
  const [rows, setRows] = useState(savedRows);
  
  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);

    const pageIndex = event.page;
    localStorage.setItem("departmentTablePage", pageIndex.toString());
    localStorage.setItem("departmentTableRows", event.rows.toString());
  };
  
  const toast = React.useRef<Toast>(null);
  
  const showToast = (
    severity: "success" | "error",
    message?: string
  ) => {
    if (!message) return;

    toast.current?.show({
      severity,
      summary: severity === "success" ? "Success" : "Error",
      detail: message,
    });
  };

  const { accessToken } = useAuth();

  // ✅ Load departments
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

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    if (error?.message) {
      showToast("error", error.message);
    }
  }, [error]);

  const handleAdd = (): void => {
    setEditingDepartment(null);
    setShowAddEditDialog(true);
  };

  const handleEdit = (): void => {
    if (!selectedDepartment) return;
    setEditingDepartment(selectedDepartment);
    setShowAddEditDialog(true);
  };

  const handleDelete = (): void => {
    if (!selectedDepartment) return;
    setShowDeleteDialog(true);
  };

  // ✅ FIXED: Clear selection after successful Add/Edit
  const handleAddEditSuccess = async (response: ApiResponse<Department>): Promise<void> => {
    try {
      showToast("success", response.message);
      await loadDepartments();
      
      // ✅ Clear selection after CRUD operation
      setSelectedDepartment(null);
    } catch (err) {
      showToast("error", "Failed to refresh departments");
    }
  };
  
  // ✅ FIXED: Properly handle delete success
  const handleDeleteSuccess = async (response: ApiResponse<null>): Promise<void> => {
    try {
      showToast("success", response.message);
      
      // ✅ Clear selection BEFORE reloading (already cleared in delete component)
      setSelectedDepartment(null);
      
      await loadDepartments();
    } catch (err) {
      showToast("error", "Failed to refresh departments");
    }
  };

  // ✅ FIXED: Added error handler for Add/Edit operations
  const handleAddEditError = (error: any): void => {
    // Only show toast if it's a general error (field errors are shown in dialog)
    if (error?.message && !error?.details?.validationErrors) {
      showToast("error", error.message);
    }
  };
  
  const handleClearSelection = (): void => setSelectedDepartment(null);
  
  const handleAddEditDialogHide = (): void => {
    setShowAddEditDialog(false);
    setEditingDepartment(null);
  };
  
  const handleDeleteDialogHide = (): void => setShowDeleteDialog(false);

  const handleSelectionChange = (e: any): void => {
    const dept = Array.isArray(e.value) ? e.value[0] || null : e.value;
    setSelectedDepartment(dept);
  };

  return (
    <div style={{display: "flex", flexDirection: "column", flex: 1, overflow: "hidden"}}>
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
      
      {/* Add/Edit Dialog */}
      <DepartmentAddEdit
        visible={showAddEditDialog}
        onHide={handleAddEditDialogHide}
        selectedDepartment={editingDepartment}
        clientId={clientId}
        onSuccess={handleAddEditSuccess}
        onError={handleAddEditError}
      />
      
      {/* Delete Dialog */}
      <DepartmentDelete
        visible={showDeleteDialog}
        onHide={handleDeleteDialogHide}
        selectedDepartment={selectedDepartment}
        onSuccess={handleDeleteSuccess}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
};

export default DepartmentTable;