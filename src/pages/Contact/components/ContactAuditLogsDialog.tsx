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
import { formatAuditTimestampLocal } from "../../../shared/utils/auditDateTime";

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

const normalizeAuditResponse = (res: any): { logs: ContactAuditLog[]; total: number } => {
  const payload = res?.data ?? res;
  const rows = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];
  const total = Number(payload?.pagination?.total ?? rows.length ?? 0);
  return { logs: rows, total };
};

const ContactAuditLogsDialog: React.FC<ContactAuditLogsDialogProps> = ({
  isOpen,
  onClose,
  contactId,
  contactName,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);
  const latestRequestRef = useRef(0);

  const [logs, setLogs] = useState<ContactAuditLog[]>([]);
  const [logsError, setLogsError] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalRecords, setLogsTotalRecords] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [logsLimit, setLogsLimit] = useState(20);
  const [fetchedForContactId, setFetchedForContactId] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    if (!contactId) {
      setLogs([]);
      setLogsTotalRecords(0);
      setLogsError("");
      setLogsLoading(false);
      return;
    }

    const requestId = ++latestRequestRef.current;
    const load = async () => {
      try {
        setLogs([]);
        setLogsTotalRecords(0);
        setLogsError("");
        setLogsLoading(true);
        const res = await getContactAuditLogsById(accessToken, contactId, logsPage, logsLimit);
        if (requestId !== latestRequestRef.current) return;
        const normalized = normalizeAuditResponse(res);
        setLogs(normalized.logs);
        setLogsTotalRecords(normalized.total);
        setFetchedForContactId(contactId);
      } catch (err: any) {
        if (requestId !== latestRequestRef.current) return;
        setLogsError(err?.message || "Failed to fetch change logs");
        setLogs([]);
      } finally {
        if (requestId !== latestRequestRef.current) return;
        setLogsLoading(false);
      }
    };
    load();
  }, [isOpen, contactId, accessToken, logsPage, logsLimit, reloadKey]);

  useEffect(() => {
    if (!isOpen) return;
    setLogsPage(1);
    setFetchedForContactId(undefined);
  }, [isOpen, contactId]);

  const title = contactId
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
      ) : logsLoading || fetchedForContactId !== contactId ? (
        <div className="text-center p-4">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
          <p className="mt-3">Loading change logs...</p>
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
            body={(row: ContactAuditLog) => formatAuditTimestampLocal(row.occurred_at || row.timestamp)}
            style={{ minWidth: "13rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default ContactAuditLogsDialog;
