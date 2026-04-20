import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { ClientAuditLog, ClientAuditLogsDialogProps } from "../types/clientTypes";
import { getClientAuditLogsById, getClientChangeLogs, getClientDeleteLogs } from "../services/clientService";
import { useAuth } from "../../../shared/auth/AuthContext";

const parseMaybeJson = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const actionSeverity = (action: string) => {
  if (action === "CREATE") return "success";
  if (action === "UPDATE") return "info";
  if (action === "DELETE") return "danger";
  return "secondary";
};

const formatAuditTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const ClientAuditLogsDialog: React.FC<ClientAuditLogsDialogProps> = ({
  isOpen,
  onClose,
  clientId,
  defaultTab = "changes",
}) => {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"changes" | "deletions">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [items, setItems] = useState<ClientAuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(defaultTab);
    setPage(1);
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = clientId
          ? await getClientAuditLogsById(accessToken, clientId, page, limit)
          : activeTab === "changes"
            ? await getClientChangeLogs(accessToken, page, limit)
            : await getClientDeleteLogs(accessToken, page, limit);

        setItems(response.data || []);
        setTotal(response.pagination?.total || 0);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch audit logs");
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, clientId, activeTab, page, limit, reloadKey]);

  const title = useMemo(
    () => (clientId ? `Audit Logs — ${clientId}` : "Client Audit Logs"),
    [clientId]
  );

  const jsonBody = (raw: unknown) => {
    const parsed = parseMaybeJson(raw);
    if (parsed == null) return "—";
    return (
      <details>
        <summary>View</summary>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: 320 }}>
          {typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2)}
        </pre>
      </details>
    );
  };

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header={title}
      modal
      style={{ width: "90vw", maxWidth: "1200px" }}
    >
      {!clientId && (
        <div className="flex gap-2 mb-3">
          <Button
            label="Change Logs"
            size="small"
            severity={activeTab === "changes" ? "info" : "secondary"}
            onClick={() => {
              setActiveTab("changes");
              setPage(1);
            }}
          />
          <Button
            label="Delete Logs"
            size="small"
            severity={activeTab === "deletions" ? "danger" : "secondary"}
            onClick={() => {
              setActiveTab("deletions");
              setPage(1);
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center p-4">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
          <p className="mt-3">Loading audit logs...</p>
        </div>
      ) : error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span>
          <Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No audit logs found for this client</div>
      ) : (
        <DataTable
          value={items}
          dataKey="id"
          paginator
          lazy
          first={(page - 1) * limit}
          rows={limit}
          totalRecords={total}
          onPage={(e) => {
            setPage((e.page ?? 0) + 1);
            setLimit(e.rows);
          }}
          rowsPerPageOptions={[20, 50, 100]}
          scrollable
          scrollHeight="420px"
          tableStyle={{ minWidth: "95rem" }}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Logs"
        >
          <Column
            field="timestamp"
            header="Timestamp"
            body={(row: ClientAuditLog) => formatAuditTimestamp(row.timestamp)}
            style={{ minWidth: "12rem" }}
          />
          <Column
            field="action"
            header="Action"
            body={(row: ClientAuditLog) => (
              <Tag value={row.action} severity={actionSeverity(row.action) as any} />
            )}
            style={{ minWidth: "9rem" }}
          />
          <Column field="summary" header="Summary" style={{ minWidth: "18rem" }} />
          <Column field="user_id" header="Changed By" style={{ minWidth: "8rem" }} />
          <Column
            field="old_values"
            header="Old Values"
            body={(row: ClientAuditLog) => jsonBody(row.old_values)}
            style={{ minWidth: "16rem" }}
          />
          <Column
            field="new_values"
            header="New Values"
            body={(row: ClientAuditLog) => jsonBody(row.new_values)}
            style={{ minWidth: "16rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default ClientAuditLogsDialog;
