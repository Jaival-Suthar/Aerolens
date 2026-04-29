import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import type { DepartmentAuditLogsDialogProps, DepartmentAuditLog } from "../types/departmentTypes";
import { getDepartmentAuditLogsById } from "../services/useDepartment";
import { useAuth } from "../../../shared/auth/AuthContext";

const parseTimestampToDate = (value: string) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(raw);
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const candidate = hasTimezone ? normalized : `${normalized}Z`;
  const date = new Date(candidate);
  if (!Number.isNaN(date.getTime())) return date;
  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const formatAuditTimestamp = (value: string) => {
  const date = parseTimestampToDate(value);
  if (!date) return "—";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
};

const actionSeverity = (action: string): "success" | "danger" | "warning" | "info" | undefined => {
  switch (action) {
    case "CREATE":  return "success";
    case "DELETE":  return "danger";
    case "UPDATE":  return "warning";
    case "RESTORE": return "info";
    default:        return undefined;
  }
};

const getDeptName = (row: DepartmentAuditLog): string | null => {
  const nv = row.new_values as any;
  const ov = row.old_values as any;
  return nv?.departmentName || ov?.departmentName || null;
};

const renderSummary = (row: DepartmentAuditLog): string => {
  const name = getDeptName(row);
  if (!name) return row.summary || "—";
  switch (row.action) {
    case "CREATE":  return `Created new department: ${name}`;
    case "UPDATE":  return `Updated department: ${name}`;
    case "DELETE":  return `Deleted department: ${name}`;
    case "RESTORE": return `Restored department: ${name}`;
    default:        return row.summary || "—";
  }
};

const VERB_SUFFIX_MAP: Record<string, string> = {
  created: "CREATE", updated: "UPDATE", deleted: "DELETE",
  restored: "PATCH", bulk_updated: "BULK UPDATE", bulk_imported: "BULK IMPORT",
};

const renderVerb = (verb: string | null): string => {
  if (!verb) return "—";
  const upper = verb.toUpperCase();
  if (["CREATE", "UPDATE", "DELETE", "PATCH", "RESTORE"].includes(upper)) return upper;
  const suffix = verb.split(".").pop()?.toLowerCase() ?? "";
  return VERB_SUFFIX_MAP[suffix] || verb;
};

const DepartmentAuditLogsDialog: React.FC<DepartmentAuditLogsDialogProps> = ({
  isOpen,
  onClose,
  departmentId,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);

  const [logs, setLogs] = useState<DepartmentAuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalRecords, setLogsTotalRecords] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const logsLimit = 20;

  useEffect(() => {
    if (!isOpen || !departmentId || !accessToken) return;
    const load = async () => {
      try {
        setLogsLoading(true);
        setLogsError("");
        const res = await getDepartmentAuditLogsById(accessToken, departmentId, logsPage, logsLimit);
        setLogs(Array.isArray(res.data) ? res.data : []);
        setLogsTotalRecords(res.pagination?.total ?? 0);
      } catch (err: any) {
        setLogsError(err?.message || "Failed to fetch change logs");
        setLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };
    load();
  }, [isOpen, departmentId, accessToken, logsPage, reloadKey]);

  useEffect(() => {
    if (!isOpen) return;
    setLogsPage(1);
  }, [isOpen]);

  const title = departmentId ? `Department #${departmentId} — Change Logs` : "Department Change Logs";

  return (
    <Dialog visible={isOpen} onHide={onClose} header={title} modal style={{ width: "95vw", maxWidth: "1300px" }}>
      <Toast ref={toast} />
      {logsLoading ? (
        <div className="text-center p-4">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
          <p className="mt-3">Loading change logs...</p>
        </div>
      ) : logsError ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{logsError}</span>
          <Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center text-600 p-4">No change logs found for this department.</div>
      ) : (
        <DataTable
          value={logs}
          dataKey="id"
          scrollable
          scrollHeight="450px"
          paginator
          rows={logsLimit}
          totalRecords={logsTotalRecords}
          lazy
          first={(logsPage - 1) * logsLimit}
          onPage={(e) => setLogsPage(Math.floor(e.first / logsLimit) + 1)}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <Column
            field="occurred_at"
            header="Occurred At"
            body={(row: DepartmentAuditLog) => formatAuditTimestamp(row.occurred_at || row.timestamp)}
            style={{ minWidth: "13rem" }}
          />
          <Column
            field="action"
            header="Action"
            body={(row: DepartmentAuditLog) => <Tag value={row.action} severity={actionSeverity(row.action)} />}
            style={{ width: "8rem" }}
          />
          <Column
            field="verb"
            header="Verb"
            body={(row: DepartmentAuditLog) => renderVerb(row.verb)}
            style={{ minWidth: "8rem" }}
          />
          <Column
            field="summary"
            header="Summary"
            body={(row: DepartmentAuditLog) => renderSummary(row)}
            style={{ minWidth: "18rem" }}
          />
          <Column
            field="resource_type"
            header="Resource Type"
            body={(row: DepartmentAuditLog) => row.resource_type || "—"}
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="resource_id"
            header="Resource ID"
            body={(row: DepartmentAuditLog) => row.resource_id || "—"}
            style={{ width: "8rem" }}
          />
          <Column
            field="actor_name"
            header="Actor"
            body={(row: DepartmentAuditLog) => row.actor_name || "—"}
            style={{ minWidth: "10rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default DepartmentAuditLogsDialog;
