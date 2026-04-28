import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../shared/auth/AuthContext";
import { lookupService } from "../services/lookupService";
import type { LookupDeletedRecord } from "../types/lookupTypes";

type LookupDeletedRecordsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess?: () => void;
};

const parseTimestampToDate = (value: string | null) => {
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

const formatDeletedAt = (value: string | null) => {
  const date = parseTimestampToDate(value);
  if (!date) return "—";
  return date.toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short",
  });
};

const normalizeDeletedRows = (payload: unknown): LookupDeletedRecord[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload) ? payload : Array.isArray(envelope?.data) ? envelope.data : [];
  return rows.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      lookupKey: Number(row.lookupKey ?? row.lookupkey ?? 0),
      tag: String(row.tag ?? "—"),
      value: String(row.value ?? "—"),
      deleted_at: row.deleted_at == null ? null : String(row.deleted_at),
    };
  });
};

const LookupDeletedRecordsDialog: React.FC<LookupDeletedRecordsDialogProps> = ({
  isOpen, onClose, onRestoreSuccess,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<LookupDeletedRecord[]>([]);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await lookupService.getDeleted(accessToken);
        setItems(normalizeDeletedRows(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted lookups");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, reloadKey]);

  const handleRestore = async (row: LookupDeletedRecord) => {
    setRestoringIds((prev) => new Set(prev).add(row.lookupKey));
    try {
      await lookupService.restore(row.lookupKey, accessToken!);
      toast.current?.show({ severity: "success", summary: "Restored", detail: `${row.value} has been restored` });
      setItems((prev) => prev.filter((r) => r.lookupKey !== row.lookupKey));
      onRestoreSuccess?.();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err instanceof Error ? err.message : "Failed to restore lookup" });
    } finally {
      setRestoringIds((prev) => { const next = new Set(prev); next.delete(row.lookupKey); return next; });
    }
  };

  return (
    <Dialog visible={isOpen} onHide={onClose} header="Deleted Lookup Data" modal style={{ width: "95vw", maxWidth: "1000px" }}>
      <Toast ref={toast} />
      {loading ? (
        <div className="text-center p-4"><i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} /><p className="mt-3">Loading deleted records...</p></div>
      ) : error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span><Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted lookup entries found</div>
      ) : (
        <DataTable value={items} dataKey="lookupKey" scrollable scrollHeight="420px">
          <Column header="" body={(row: LookupDeletedRecord) => (
            <Button label="Restore" size="small" severity="success" loading={restoringIds.has(row.lookupKey)} onClick={() => handleRestore(row)} />
          )} style={{ width: "8rem" }} />
          <Column field="lookupKey" header="Lookup Key" body={(row: LookupDeletedRecord) => row.lookupKey || "—"} style={{ minWidth: "10rem" }} />
          <Column field="tag" header="Tag" body={(row: LookupDeletedRecord) => row.tag || "—"} style={{ minWidth: "15rem" }} />
          <Column field="value" header="Value" body={(row: LookupDeletedRecord) => row.value || "—"} style={{ minWidth: "20rem" }} />
          <Column field="deleted_at" header="Deleted At" body={(row: LookupDeletedRecord) => formatDeletedAt(row.deleted_at)} style={{ minWidth: "15rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default LookupDeletedRecordsDialog;
