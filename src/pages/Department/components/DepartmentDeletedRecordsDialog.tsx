import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getDeletedDepartments, restoreDepartment } from "../services/useDepartment";

type DeletedDepartment = {
  departmentId: number;
  departmentName: string;
  departmentDescription: string;
  clientId: number;
  deleted_at: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  onRestoreSuccess?: () => void;
};

const parseTimestampToDate = (value: string | null) => {
  if (!value) return null;
  const raw = String(value).trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(raw);
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const candidate = hasTimezone ? normalized : `${normalized}Z`;
  const date = new Date(candidate);
  if (!Number.isNaN(date.getTime())) return date;
  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const formatDeletedAt = (value: string | null) => {
  const date = parseTimestampToDate(value);
  if (!date) return "—";
  return date.toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short",
  });
};

const normalizeRows = (payload: unknown): DeletedDepartment[] => {
  const rows = Array.isArray(payload) ? payload : (payload as any)?.data ?? [];
  return rows.map((item: any) => ({
    departmentId: Number(item.departmentId ?? 0),
    departmentName: String(item.departmentName ?? "—"),
    departmentDescription: String(item.departmentDescription ?? ""),
    clientId: Number(item.clientId ?? 0),
    deleted_at: item.deleted_at == null ? null : String(item.deleted_at),
  }));
};

const DepartmentDeletedRecordsDialog: React.FC<Props> = ({ isOpen, onClose, clientId, onRestoreSuccess }) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<DeletedDepartment[]>([]);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !accessToken || !clientId) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedDepartments(accessToken, clientId);
        setItems(normalizeRows(response));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted departments");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, clientId, reloadKey]);

  const handleRestore = async (row: DeletedDepartment) => {
    setRestoringIds(prev => new Set(prev).add(row.departmentId));
    try {
      await restoreDepartment(accessToken, row.departmentId);
      toast.current?.show({ severity: "success", summary: "Restored", detail: `${row.departmentName} has been restored` });
      setItems(prev => prev.filter(r => r.departmentId !== row.departmentId));
      onRestoreSuccess?.();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err instanceof Error ? err.message : "Failed to restore department" });
    } finally {
      setRestoringIds(prev => { const next = new Set(prev); next.delete(row.departmentId); return next; });
    }
  };

  return (
    <Dialog visible={isOpen} onHide={onClose} header="Deleted Departments" modal style={{ width: "95vw", maxWidth: "1000px" }}>
      <Toast ref={toast} />
      {loading ? (
        <div className="text-center p-4">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
          <p className="mt-3">Loading deleted records...</p>
        </div>
      ) : error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span>
          <Button label="Retry" size="small" onClick={() => setReloadKey(k => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted departments found</div>
      ) : (
        <DataTable value={items} dataKey="departmentId" scrollable scrollHeight="420px">
          <Column
            header=""
            body={(row: DeletedDepartment) => (
              <Button
                label="Restore"
                size="small"
                severity="success"
                loading={restoringIds.has(row.departmentId)}
                onClick={() => handleRestore(row)}
              />
            )}
            style={{ width: "8rem" }}
          />
          <Column field="departmentName" header="Department Name" style={{ minWidth: "15rem" }} />
          <Column field="departmentDescription" header="Description" body={(row: DeletedDepartment) => row.departmentDescription || "—"} style={{ minWidth: "20rem" }} />
          <Column field="deleted_at" header="Deleted At" body={(row: DeletedDepartment) => formatDeletedAt(row.deleted_at)} style={{ minWidth: "15rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default DepartmentDeletedRecordsDialog;
