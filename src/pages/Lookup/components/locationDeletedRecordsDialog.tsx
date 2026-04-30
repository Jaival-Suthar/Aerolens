import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../shared/auth/AuthContext";
import { formatAuditTimestampLocal } from "../../../shared/utils/auditDateTime";
import { locationService } from "../services/locationService";

type DeletedLocation = {
  locationId: number;
  city: string;
  state: string | null;
  country: string;
  deleted_at: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess?: () => void;
};


const normalizeRows = (payload: unknown): DeletedLocation[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload) ? payload : Array.isArray((envelope as any)?.data) ? (envelope as any).data : [];
  return rows.map((item: any) => ({
    locationId: Number(item.locationId ?? 0),
    city: String(item.city ?? "—"),
    state: item.state ? String(item.state) : null,
    country: String(item.country ?? "—"),
    deleted_at: item.deleted_at == null ? null : String(item.deleted_at),
  }));
};

const LocationDeletedRecordsDialog: React.FC<Props> = ({ isOpen, onClose, onRestoreSuccess }) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<DeletedLocation[]>([]);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await locationService.getDeleted(accessToken);
        setItems(normalizeRows(response));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted locations");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, reloadKey]);

  const handleRestore = async (row: DeletedLocation) => {
    setRestoringIds(prev => new Set(prev).add(row.locationId));
    try {
      await locationService.restore(accessToken!, row.locationId);
      toast.current?.show({ severity: "success", summary: "Restored", detail: `${row.city} has been restored` });
      setItems(prev => prev.filter(r => r.locationId !== row.locationId));
      onRestoreSuccess?.();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err instanceof Error ? err.message : "Failed to restore location" });
    } finally {
      setRestoringIds(prev => { const next = new Set(prev); next.delete(row.locationId); return next; });
    }
  };

  return (
    <Dialog visible={isOpen} onHide={onClose} header="Deleted Locations" modal style={{ width: "95vw", maxWidth: "1000px" }}>
      <Toast ref={toast} />
      {error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span>
          <Button label="Retry" size="small" onClick={() => setReloadKey(k => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted locations found</div>
      ) : (
        <DataTable value={items} dataKey="locationId" paginator
          rows={20}
          rowsPerPageOptions={[20, 50, 100]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <Column
            header=""
            body={(row: DeletedLocation) => (
              <Button
                label="Restore"
                size="small"
                severity="success"
                loading={restoringIds.has(row.locationId)}
                onClick={() => handleRestore(row)}
              />
            )}
            style={{ width: "8rem" }}
          />
          <Column field="city" header="City" style={{ minWidth: "12rem" }} />
          <Column field="state" header="State" body={(row: DeletedLocation) => row.state || "—"} style={{ minWidth: "12rem" }} />
          <Column field="country" header="Country" style={{ minWidth: "12rem" }} />
          <Column field="deleted_at" header="Deleted At" body={(row: DeletedLocation) => formatAuditTimestampLocal(row.deleted_at)} style={{ minWidth: "15rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default LocationDeletedRecordsDialog;
