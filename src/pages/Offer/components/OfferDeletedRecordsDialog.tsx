import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getDeletedOffers } from "../services/offerService";

type DeletedOffer = {
  offerId: number;
  candidateName: string | null;
  jobRole: string | null;
  offerStatus: string | null;
  offeredCTCAmount: number | null;
  joiningDate: string | null;
  deleted_at: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const parseTimestampToDate = (value: string | null): Date | null => {
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

const formatDeletedAt = (value: string | null): string => {
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

const formatDate = (value: string | null): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const normalizeRows = (payload: unknown): DeletedOffer[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(envelope?.data)
      ? envelope.data
      : [];
  return rows.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      offerId: Number(r.offerId ?? 0),
      candidateName: r.candidateName == null ? null : String(r.candidateName),
      jobRole: r.jobRole == null ? null : String(r.jobRole),
      offerStatus: r.offerStatus == null ? null : String(r.offerStatus),
      offeredCTCAmount: r.offeredCTCAmount == null ? null : Number(r.offeredCTCAmount),
      joiningDate: r.joiningDate == null ? null : String(r.joiningDate),
      deleted_at: r.deleted_at == null ? null : String(r.deleted_at),
    };
  });
};

const OfferDeletedRecordsDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<DeletedOffer[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedOffers(accessToken);
        setItems(normalizeRows(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted offers");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, reloadKey]);

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header="Deleted Offers"
      modal
      style={{ width: "95vw", maxWidth: "1200px" }}
    >
      {loading ? (
        <div className="text-center p-4">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
          <p className="mt-3">Loading deleted records...</p>
        </div>
      ) : error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span>
          <Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted offers found</div>
      ) : (
        <DataTable
          value={items}
          dataKey="offerId"
          scrollable
          scrollHeight="420px"
          tableStyle={{ minWidth: "90rem" }}
        >
          <Column
            field="deleted_at"
            header="Deleted At"
            body={(row: DeletedOffer) => formatDeletedAt(row.deleted_at)}
            style={{ minWidth: "15rem" }}
          />
          <Column field="offerId" header="ID" style={{ minWidth: "6rem" }} />
          <Column
            field="candidateName"
            header="Candidate"
            body={(row: DeletedOffer) => row.candidateName || "—"}
            style={{ minWidth: "16rem" }}
          />
          <Column
            field="jobRole"
            header="Role"
            body={(row: DeletedOffer) => row.jobRole || "—"}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="offerStatus"
            header="Status"
            body={(row: DeletedOffer) => row.offerStatus || "—"}
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="offeredCTCAmount"
            header="Offered CTC"
            body={(row: DeletedOffer) => row.offeredCTCAmount != null ? row.offeredCTCAmount.toLocaleString() : "—"}
            style={{ minWidth: "12rem" }}
          />
          <Column
            field="joiningDate"
            header="Joining Date"
            body={(row: DeletedOffer) => formatDate(row.joiningDate)}
            style={{ minWidth: "12rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default OfferDeletedRecordsDialog;
