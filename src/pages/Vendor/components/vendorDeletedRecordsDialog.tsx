import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../shared/auth/AuthContext";
import { formatAuditTimestampLocal } from "../../../shared/utils/auditDateTime";
import { VendorService } from "../services/useVendor";
import type { VendorDeletedRecord } from "../types/vendorTypes";

type VendorDeletedRecordsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess?: () => void;
};


const normalizeDeletedRows = (payload: unknown): VendorDeletedRecord[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload) ? payload : Array.isArray(envelope?.data) ? envelope.data : [];
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
  isOpen, onClose, onRestoreSuccess,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<VendorDeletedRecord[]>([]);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
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
        setError(err instanceof Error ? err.message : "Failed to fetch deleted vendors");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, reloadKey]);

  const handleRestore = async (row: VendorDeletedRecord) => {
    setRestoringIds((prev) => new Set(prev).add(row.vendorId));
    try {
      await VendorService.restoreVendor(row.vendorId, accessToken!);
      toast.current?.show({ severity: "success", summary: "Restored", detail: `${row.vendorName} has been restored` });
      setItems((prev) => prev.filter((r) => r.vendorId !== row.vendorId));
      onRestoreSuccess?.();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err instanceof Error ? err.message : "Failed to restore vendor" });
    } finally {
      setRestoringIds((prev) => { const next = new Set(prev); next.delete(row.vendorId); return next; });
    }
  };

  return (
    <Dialog visible={isOpen} onHide={onClose} header="Deleted Vendors" modal style={{ width: "95vw", maxWidth: "1200px" }}>
      <Toast ref={toast} />
      {error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span><Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted vendors found</div>
      ) : (
        <DataTable value={items} dataKey="vendorId" paginator
          rows={20}
          rowsPerPageOptions={[20, 50, 100]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <Column header="" body={(row: VendorDeletedRecord) => (
            <Button label="Restore" size="small" severity="success" loading={restoringIds.has(row.vendorId)} onClick={() => handleRestore(row)} />
          )} style={{ width: "8rem" }} />
          <Column field="vendorId" header="Vendor ID" body={(row: VendorDeletedRecord) => row.vendorId || "—"} style={{ minWidth: "10rem" }} />
          <Column field="vendorName" header="Organization Name" body={(row: VendorDeletedRecord) => row.vendorName || "—"} style={{ minWidth: "16rem" }} />
          <Column field="contactPersonName" header="Person of Contact" body={(row: VendorDeletedRecord) => row.contactPersonName || "—"} style={{ minWidth: "16rem" }} />
          <Column field="vendorPhone" header="Phone" body={(row: VendorDeletedRecord) => row.vendorPhone || "—"} style={{ minWidth: "14rem" }} />
          <Column field="vendorEmail" header="Email" body={(row: VendorDeletedRecord) => row.vendorEmail || "—"} style={{ minWidth: "20rem" }} />
          <Column field="deleted_at" header="Deleted At" body={(row: VendorDeletedRecord) => formatAuditTimestampLocal(row.deleted_at)} style={{ minWidth: "15rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default VendorDeletedRecordsDialog;
