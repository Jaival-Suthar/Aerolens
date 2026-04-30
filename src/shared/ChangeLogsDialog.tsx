import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { useAuth } from "./auth/AuthContext";
import { AuditLogService } from "../pages/AuditLogs/services/auditLogService";
import type { AuditLogItem } from "../pages/AuditLogs/types/auditLogTypes";
import { formatAuditTimestampLocal } from "./utils/auditDateTime";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  resourceType?: string | null;
  resourceId?: string | number | null;
};

const actionSeverity = (action: string): "success" | "danger" | "warning" | "info" | undefined => {
  switch (action) {
    case "CREATE":
      return "success";
    case "DELETE":
      return "danger";
    case "UPDATE":
      return "warning";
    case "RESTORE":
      return "info";
    default:
      return undefined;
  }
};

const ChangeLogsDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  title = "Change Logs",
  resourceType,
  resourceId,
}) => {
  const { accessToken } = useAuth();
  const latestRequestRef = useRef(0);

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [logsError, setLogsError] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit, setLogsLimit] = useState(20);
  const [logsTotalRecords, setLogsTotalRecords] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [fetchedForId, setFetchedForId] = useState<string | number | null | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) return;
    setLogsPage(1);
    setFetchedForId(undefined);
  }, [isOpen, resourceType, resourceId]);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    if (!resourceType || resourceId == null || resourceId === "") {
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

        const response = await AuditLogService.getAuditLogs(accessToken, {
          page: logsPage,
          pageSize: logsLimit,
          resourceType,
          resourceId: String(resourceId),
          includeDiff: false,
        });

        if (requestId !== latestRequestRef.current) return;
        setLogs(response?.data?.items ?? []);
        setLogsTotalRecords(response?.data?.meta?.total ?? 0);
        setFetchedForId(resourceId);
      } catch (error: any) {
        if (requestId !== latestRequestRef.current) return;
        setLogs([]);
        setLogsTotalRecords(0);
        setLogsError(error?.message || "Failed to fetch change logs");
      } finally {
        if (requestId !== latestRequestRef.current) return;
        setLogsLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, resourceType, resourceId, logsPage, logsLimit, reloadKey]);

  return (
    <Dialog visible={isOpen} onHide={onClose} header={title} modal style={{ width: "95vw", maxWidth: "1300px" }}>
      {!resourceType || resourceId == null || resourceId === "" ? (
        <div className="text-center text-600 p-4">Select a row to view change logs.</div>
      ) : logsError && logs.length === 0 ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{logsError}</span>
          <Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : logsLoading || fetchedForId !== resourceId ? (
        <div className="text-center p-4">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
          <p className="mt-3">Loading change logs...</p>
        </div>
      ) : (
        <DataTable
          value={logs}
          dataKey="id"
          emptyMessage="No change logs found."
          paginator
          rows={logsLimit}
          totalRecords={logsTotalRecords}
          lazy
          first={(logsPage - 1) * logsLimit}
          onPage={(e) => {
            setLogsLimit(e.rows);
            setLogsPage(Math.floor(e.first / e.rows) + 1);
          }}
          rowsPerPageOptions={[20, 50, 100]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <Column field="resourceId" header="Resource ID" body={(row: AuditLogItem) => row.resourceId || "—"} style={{ width: "8rem" }} />
          <Column field="actor.name" header="Actor" body={(row: AuditLogItem) => row.actor?.name || row.actor?.email || "—"} style={{ minWidth: "10rem" }} />
          <Column
            field="action"
            header="Action"
            body={(row: AuditLogItem) => <Tag value={row.action} severity={actionSeverity(row.action)} />}
            style={{ width: "8rem" }}
          />
          <Column field="verb" header="Verb" body={(row: AuditLogItem) => row.verb || "—"} style={{ minWidth: "8rem" }} />
          <Column field="summary" header="Summary" body={(row: AuditLogItem) => row.summary || "—"} style={{ minWidth: "18rem" }} />
          <Column field="resourceType" header="Resource Type" body={(row: AuditLogItem) => row.resourceType || "—"} style={{ minWidth: "10rem" }} />
          <Column field="occurredAt" header="Occurred At" body={(row: AuditLogItem) => formatAuditTimestampLocal(row.occurredAt)} style={{ minWidth: "13rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default ChangeLogsDialog;
