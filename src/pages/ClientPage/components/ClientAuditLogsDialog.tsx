import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { ClientAuditLog, ClientAuditLogsDialogProps, ClientDeletedRecord } from "../types/clientTypes";
import { getDeletedClients } from "../services/clientService";
import { useAuth } from "../../../shared/auth/AuthContext";

const parseTimestampToDate = (value: string) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // If timezone is missing, treat backend timestamp as UTC.
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
}) => {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"changes" | "deleted">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [changeItems, setChangeItems] = useState<ClientAuditLog[]>([]);
  const [deletedItems, setDeletedItems] = useState<ClientDeletedRecord[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        if (activeTab === "changes") {
          setChangeItems([]);
          setDeletedItems([]);
          return;
        }
        const response = await getDeletedClients(accessToken);
        const deletedRows = normalizeDeletedRows(response.data);
        setDeletedItems(deletedRows);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch audit logs");
        if (activeTab === "changes") {
          setChangeItems([]);
        } else {
          setDeletedItems([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, activeTab, reloadKey]);

  const title = useMemo(
    () => "Client Activity",
    []
  );

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header={title}
      modal
      style={{ width: "90vw", maxWidth: "1200px" }}
    >
      {/* <div className="flex gap-2 mb-3">
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
          label="Deleted Clients"
          size="small"
          severity={activeTab === "deleted" ? "danger" : "secondary"}
          onClick={() => {
            setActiveTab("deleted");
            setPage(1);
          }}
        />
      </div> */}

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
      ) : activeTab === "changes" ? (
        <div className="text-center text-600 p-4">
          No change logs found
        </div>
      ) : deletedItems.length === 0 ? (
        <div className="text-center text-600 p-4">
          No deleted clients found
        </div>
      ) : (
        <DataTable
          value={deletedItems}
          dataKey="clientId"
          scrollable
          scrollHeight="420px"
          tableStyle={{ minWidth: "95rem" }}
        >
          <Column
            field="deleted_at"
            header="Deleted At"
            body={(row: ClientDeletedRecord) => formatAuditTimestamp(row.deleted_at || "")}
            style={{ minWidth: "12rem" }}
          />
          <Column
            field="clientId"
            header="Client ID"
            body={(row: ClientDeletedRecord) => row.clientId || "—"}
            style={{ minWidth: "8rem" }}
          />
          <Column
            field="clientName"
            header="Client Name"
            body={(row: ClientDeletedRecord) => row.clientName || "—"}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="address"
            header="Address"
            body={(row: ClientDeletedRecord) => row.address || "—"}
            style={{ minWidth: "18rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default ClientAuditLogsDialog;
