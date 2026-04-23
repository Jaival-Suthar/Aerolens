import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useAuth } from "../../../shared/auth/AuthContext";
import { VendorService } from "../services/useVendor";
import type { VendorDeletedRecord } from "../types/vendorTypes";

type VendorDeletedRecordsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
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
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
};

const normalizeDeletedRows = (payload: unknown): VendorDeletedRecord[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(envelope?.data)
      ? envelope.data
      : [];

  return rows.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      vendorId: Number(row.vendorId ?? row.vendorid ?? 0),
      vendorName: String(row.vendorName ?? row.vendorname ?? "—"),
      vendorPhone: row.vendorPhone == null ? null : String(row.vendorPhone),
      vendorEmail: row.vendorEmail == null ? null : String(row.vendorEmail),
      contactPersonName: row.contactPersonName == null ? null : String(row.contactPersonName),
      deleted_at: row.deleted_at == null ? null : String(row.deleted_at),
    };
  });
};

const VendorDeletedRecordsDialog: React.FC<VendorDeletedRecordsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<VendorDeletedRecord[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !accessToken) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await VendorService.getDeletedVendors(accessToken);
        setItems(normalizeDeletedRows(response.data));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch deleted vendors";
        setError(message);
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
      header="Deleted Vendors"
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
        <div className="text-center text-600 p-4">No deleted vendors found</div>
      ) : (
        <DataTable
          value={items}
          dataKey="vendorId"
          scrollable
          scrollHeight="420px"
          tableStyle={{ minWidth: "90rem" }}
        >
          <Column
            field="deleted_at"
            header="Deleted At"
            body={(row: VendorDeletedRecord) => formatDeletedAt(row.deleted_at)}
            style={{ minWidth: "15rem" }}
          />
          <Column
            field="vendorId"
            header="Vendor ID"
            body={(row: VendorDeletedRecord) => row.vendorId || "—"}
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="vendorName"
            header="Organization Name"
            body={(row: VendorDeletedRecord) => row.vendorName || "—"}
            style={{ minWidth: "16rem" }}
          />
          <Column
            field="contactPersonName"
            header="Person of Contact"
            body={(row: VendorDeletedRecord) => row.contactPersonName || "—"}
            style={{ minWidth: "16rem" }}
          />
          <Column
            field="vendorPhone"
            header="Phone"
            body={(row: VendorDeletedRecord) => row.vendorPhone || "—"}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="vendorEmail"
            header="Email"
            body={(row: VendorDeletedRecord) => row.vendorEmail || "—"}
            style={{ minWidth: "20rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default VendorDeletedRecordsDialog;
