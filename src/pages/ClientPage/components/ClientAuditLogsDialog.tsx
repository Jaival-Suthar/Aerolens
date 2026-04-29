import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import type { ClientAuditLogsDialogProps, ClientAuditLog, ClientDeletedRecord } from "../types/clientTypes";
import { getClientAuditLogsById, getDeletedClients, restoreClient } from "../services/clientService";
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

const normalizeDeletedRows = (payload: unknown): ClientDeletedRecord[] => {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as any)?.data)
      ? (payload as any).data
      : [];
  return rows.map((row: any) => ({
    clientId: Number(row.clientId ?? row.clientid ?? row.id ?? 0),
    clientName: String(row.clientName ?? row.clientname ?? "—"),
    address: row.address ?? row.Address ?? "—",
    is_deleted: Boolean(row.is_deleted ?? row.isDeleted ?? true),
    deleted_at: row.deleted_at ?? row.deletedAt ?? null,
  }));
};

const ClientAuditLogsDialog: React.FC<ClientAuditLogsDialogProps> = ({
  isOpen,
  onClose,
  defaultTab = "deleted",
  onRestoreSuccess,
  clientId,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);

  // Deleted tab state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [deletedItems, setDeletedItems] = useState<ClientDeletedRecord[]>([]);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  // Change logs state
  const [logs, setLogs] = useState<ClientAuditLog[]>([]);
  const [logsError, setLogsError] = useState("");
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalRecords, setLogsTotalRecords] = useState(0);
  const [logsLimit, setLogsLimit] = useState(20);

  // Fetch deleted clients
  useEffect(() => {
    if (!isOpen || defaultTab !== "deleted") return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedClients(accessToken);
        setDeletedItems(normalizeDeletedRows(response.data));
      } catch (err: any) {
        setError(err?.message || "Failed to fetch deleted clients");
        setDeletedItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, defaultTab, accessToken, reloadKey]);

  // Fetch change logs
  useEffect(() => {
    if (!isOpen || defaultTab !== "changes" || !clientId || !accessToken) return;
    const load = async () => {
      try {
        setLogsError("");
        const res = await getClientAuditLogsById(accessToken, clientId, logsPage, logsLimit);
        setLogs(Array.isArray(res.data) ? res.data : []);
        setLogsTotalRecords(res.pagination?.total ?? 0);
      } catch (err: any) {
        setLogsError(err?.message || "Failed to fetch change logs");
        setLogs([]);
      } finally {
      }
    };
    load();
  }, [isOpen, defaultTab, clientId, accessToken, logsPage, logsLimit, reloadKey]);

  useEffect(() => {
    if (!isOpen) return;
    setLogsPage(1);
  }, [isOpen]);

  const handleRestore = async (row: ClientDeletedRecord) => {
    setRestoringIds((prev) => new Set(prev).add(row.clientId));
    try {
      await restoreClient(accessToken, row.clientId);
      toast.current?.show({ severity: "success", summary: "Restored", detail: `${row.clientName} has been restored` });
      setDeletedItems((prev) => prev.filter((r) => r.clientId !== row.clientId));
      onRestoreSuccess?.();
    } catch (err: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err?.message || "Failed to restore client" });
    } finally {
      setRestoringIds((prev) => { const next = new Set(prev); next.delete(row.clientId); return next; });
    }
  };

  const title = useMemo(
    () => defaultTab === "changes" && clientId ? `Client #${clientId} — Change Logs` : "Client Activity",
    [defaultTab, clientId]
  );

  // ── CHANGE LOGS VIEW ──────────────────────────────────────────────────────
  if (defaultTab === "changes") {
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
            emptyMessage="No change logs found for this client."
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
              body={(row: ClientAuditLog) => row.resource_id || "—"}
              style={{ width: "8rem" }}
            />
            <Column
              field="actor_name"
              header="Actor"
              body={(row: ClientAuditLog) => row.actor_name || "—"}
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="action"
              header="Action"
              body={(row: ClientAuditLog) => <Tag value={row.action} severity={actionSeverity(row.action)} />}
              style={{ width: "8rem" }}
            />
            <Column
              field="verb"
              header="Verb"
              body={(row: ClientAuditLog) => row.verb || "—"}
              style={{ minWidth: "8rem" }}
            />
            <Column
              field="summary"
              header="Summary"
              body={(row: ClientAuditLog) => row.summary || "—"}
              style={{ minWidth: "18rem" }}
            />
            <Column
              field="resource_type"
              header="Resource Type"
              body={(row: ClientAuditLog) => row.resource_type || "—"}
              style={{ minWidth: "10rem" }}
            />
            <Column
              field="occurred_at"
              header="Occurred At"
              body={(row: ClientAuditLog) => formatAuditTimestamp(row.occurred_at || row.timestamp)}
              style={{ minWidth: "13rem" }}
            />
          </DataTable>
        )}
      </Dialog>
    );
  }

  // ── DELETED CLIENTS VIEW ──────────────────────────────────────────────────
  return (
    <Dialog visible={isOpen} onHide={onClose} header={title} modal style={{ width: "90vw", maxWidth: "1200px" }}>
      <Toast ref={toast} />
      {loading ? (
        <div className="text-center p-4">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
          <p className="mt-3">Loading audit logs...</p>
        </div>
      ) : error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span>
          <Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : deletedItems.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted clients found</div>
      ) : (
        <DataTable value={deletedItems} dataKey="clientId" paginator rows={20} rowsPerPageOptions={[20, 50, 100]} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <Column
            header=""
            body={(row: ClientDeletedRecord) => (
              <Button label="Restore" size="small" severity="success" loading={restoringIds.has(row.clientId)} onClick={() => handleRestore(row)} />
            )}
            style={{ width: "8rem" }}
          />
          <Column field="clientId" header="Client ID" body={(row: ClientDeletedRecord) => row.clientId || "—"} style={{ width: "7rem" }} />
          <Column field="clientName" header="Client Name" body={(row: ClientDeletedRecord) => row.clientName || "—"} style={{ minWidth: "14rem" }} />
          <Column field="address" header="Address" body={(row: ClientDeletedRecord) => row.address || "—"} style={{ minWidth: "16rem" }} />
          <Column field="deleted_at" header="Deleted At" body={(row: ClientDeletedRecord) => formatAuditTimestamp(row.deleted_at || "")} style={{ minWidth: "12rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default ClientAuditLogsDialog;
