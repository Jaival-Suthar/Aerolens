import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getDeletedOffers, restoreOffer } from "../services/offerService";
import type { OfferDeletedRecord } from "../types/offerTypes";

type OfferDeletedRecordsDialogProps = {
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

const normalizeDeletedRows = (payload: unknown): OfferDeletedRecord[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload) ? payload : Array.isArray(envelope?.data) ? envelope.data : [];
  return rows.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      offerId: Number(row.offerId ?? 0),
      candidateName: String(row.candidateName ?? "—"),
      jobRole: row.jobRole == null ? null : String(row.jobRole),
      offerStatus: row.offerStatus == null ? null : String(row.offerStatus),
      deleted_at: row.deleted_at == null ? null : String(row.deleted_at),
    };
  });
};

const OfferDeletedRecordsDialog: React.FC<OfferDeletedRecordsDialogProps> = ({
  isOpen, onClose, onRestoreSuccess,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<OfferDeletedRecord[]>([]);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedOffers(accessToken);
        setItems(normalizeDeletedRows(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted offers");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, reloadKey]);

  const handleRestore = async (row: OfferDeletedRecord) => {
    setRestoringIds((prev) => new Set(prev).add(row.offerId));
    try {
      await restoreOffer(accessToken, row.offerId);
      toast.current?.show({ severity: "success", summary: "Restored", detail: `Offer #${row.offerId} has been restored` });
      setItems((prev) => prev.filter((r) => r.offerId !== row.offerId));
      onRestoreSuccess?.();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err instanceof Error ? err.message : "Failed to restore offer" });
    } finally {
      setRestoringIds((prev) => { const next = new Set(prev); next.delete(row.offerId); return next; });
    }
  };

  return (
    <Dialog visible={isOpen} onHide={onClose} header="Deleted Offers" modal style={{ width: "95vw", maxWidth: "1200px" }}>
      <Toast ref={toast} />
      {error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span><Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted offers found</div>
      ) : (
        <DataTable value={items} dataKey="offerId" paginator
          rows={20}
          rowsPerPageOptions={[20, 50, 100]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <Column header="" body={(row: OfferDeletedRecord) => (
            <Button label="Restore" size="small" severity="success" loading={restoringIds.has(row.offerId)} onClick={() => handleRestore(row)} />
          )} style={{ width: "8rem" }} />
          <Column field="offerId" header="Offer ID" body={(row: OfferDeletedRecord) => row.offerId || "—"} style={{ minWidth: "10rem" }} />
          <Column field="candidateName" header="Candidate Name" body={(row: OfferDeletedRecord) => row.candidateName || "—"} style={{ minWidth: "16rem" }} />
          <Column field="jobRole" header="Job Role" body={(row: OfferDeletedRecord) => row.jobRole || "—"} style={{ minWidth: "14rem" }} />
          <Column field="offerStatus" header="Offer Status" body={(row: OfferDeletedRecord) => row.offerStatus || "—"} style={{ minWidth: "12rem" }} />
          <Column field="deleted_at" header="Deleted At" body={(row: OfferDeletedRecord) => formatDeletedAt(row.deleted_at)} style={{ minWidth: "15rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default OfferDeletedRecordsDialog;
