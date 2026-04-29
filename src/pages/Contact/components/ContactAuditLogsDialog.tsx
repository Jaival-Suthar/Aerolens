import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import type { ContactAuditLogsDialogProps, ContactAuditLog } from "../types/contactTypes";
import { getContactAuditLogsById } from "../services/useContact";
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

const getContactName = (row: ContactAuditLog): string | null => {
  const nv = row.new_values as any;
  const ov = row.old_values as any;
  return nv?.contactPersonName || ov?.contactPersonName || null;
};

const renderSummary = (row: ContactAuditLog): string => {
  const name = getContactName(row);
  if (!name) return row.summary || "—";
  switch (row.action) {
    case "CREATE":  return `Created new contact: ${name}`;
    case "UPDATE":  return `Updated contact: ${name}`;
    case "DELETE":  return `Deleted contact: ${name}`;
    case "RESTORE": return `Restored contact: ${name}`;
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

const ContactAuditLogsDialog: React.FC<ContactAuditLogsDialogProps> = ({
  isOpen,
  onClose,
  contactId,
  contactName,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);

  const [logs, setLogs] = useState<ContactAuditLog[]>([]);
  const [logsError, setLogsError] = useState("");
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalRecords, setLogsTotalRecords] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [logsLimit, setLogsLimit] = useState(20);

  useEffect(() => {
    if (!isOpen || !contactId || !accessToken) return;
    const load = async () => {
      try {
        setLogsError("");
        const res = await getContactAuditLogsById(accessToken, contactId, logsPage, logsLimit);
        const payload = res.data ?? res;
        setLogs(Array.isArray(payload.data) ? payload.data : []);
        setLogsTotalRecords(payload.pagination?.total ?? 0);
      } catch (err: any) {
        setLogsError(err?.message || "Failed to fetch change logs");
        setLogs([]);
      } finally {
      }
    };
    load();
  }, [isOpen, contactId, accessToken, logsPage, logsLimit, reloadKey]);

  useEffect(() => {
    if (!isOpen) return;
    setLogsPage(1);
  }, [isOpen]);

  const title = contactName
    ? `${contactName} — Change Logs`
    : contactId
    ? `Contact #${contactId} — Change Logs`
    : "Contact Change Logs";

  return (
    <Dialog visible={isOpen} onHide={onClose} header={title} modal style={{ width: "95vw", maxWidth: "1300px" }}>
      <Toast ref={toast} />
      {logsError && logs.length === 0 ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{logsError}</span>
          <Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : (
        <DataTable
          value={logs}
          dataKey="id"
          emptyMessage="No change logs found for this contact."
          paginator
          rows={logsLimit}
          totalRecords={logsTotalRecords}
          lazy
          first={(logsPage - 1) * logsLimit}
          onPage={(e) => { setLogsLimit(e.rows); setLogsPage(Math.floor(e.first / e.rows) + 1); }}
          rowsPerPageOptions={[20, 50, 100]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <Column
            field="resource_id"
            header="Resource ID"
            body={(row: ContactAuditLog) => row.resource_id || "—"}
            style={{ width: "8rem" }}
          />
          <Column
            field="actor_name"
            header="Actor"
            body={(row: ContactAuditLog) => row.actor_name || "—"}
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="action"
            header="Action"
            body={(row: ContactAuditLog) => <Tag value={row.action} severity={actionSeverity(row.action)} />}
            style={{ width: "8rem" }}
          />
          <Column
            field="verb"
            header="Verb"
            body={(row: ContactAuditLog) => renderVerb(row.verb)}
            style={{ minWidth: "8rem" }}
          />
          <Column
            field="summary"
            header="Summary"
            body={(row: ContactAuditLog) => renderSummary(row)}
            style={{ minWidth: "18rem" }}
          />
          <Column
            field="resource_type"
            header="Resource Type"
            body={(row: ContactAuditLog) => row.resource_type || "—"}
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="occurred_at"
            header="Occurred At"
            body={(row: ContactAuditLog) => formatAuditTimestamp(row.occurred_at || row.timestamp)}
            style={{ minWidth: "13rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default ContactAuditLogsDialog;
