import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import type { JobProfileDeletedRecord } from "../types/jobProfileTypes";
import { getDeletedJobProfiles, restoreJobProfile } from "../services/jobProfileService";
import { useAuth } from "../../../shared/auth/AuthContext";
import { formatAuditTimestampLocal } from "../../../shared/utils/auditDateTime";

type JobProfileDeletedRecordsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess?: () => void;
};


const normalizeDeletedRows = (payload: unknown): JobProfileDeletedRecord[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload) ? payload : Array.isArray(envelope?.data) ? envelope.data : [];
  return rows.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      jobProfileId: Number(row.jobProfileId ?? row.jobprofileid ?? row.id ?? 0),
      jobRole: String(row.jobRole ?? row.jobrole ?? "—"),
      deleted_at: row.deleted_at ? String(row.deleted_at) : null,
    };
  });
};

const JobProfileDeletedRecordsDialog: React.FC<JobProfileDeletedRecordsDialogProps> = ({
  isOpen, onClose, onRestoreSuccess,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<JobProfileDeletedRecord[]>([]);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedJobProfiles(accessToken);
        setItems(normalizeDeletedRows(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted job profiles");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, reloadKey]);

  const handleRestore = async (row: JobProfileDeletedRecord) => {
    setRestoringIds((prev) => new Set(prev).add(row.jobProfileId));
    try {
      await restoreJobProfile(accessToken, row.jobProfileId);
      toast.current?.show({ severity: "success", summary: "Restored", detail: `${row.jobRole} has been restored` });
      setItems((prev) => prev.filter((r) => r.jobProfileId !== row.jobProfileId));
      onRestoreSuccess?.();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err instanceof Error ? err.message : "Failed to restore job profile" });
    } finally {
      setRestoringIds((prev) => { const next = new Set(prev); next.delete(row.jobProfileId); return next; });
    }
  };

  return (
    <Dialog visible={isOpen} onHide={onClose} header="Deleted Job Profiles" modal style={{ width: "90vw", maxWidth: "1000px" }}>
      <Toast ref={toast} />
      {error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span><Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted job profiles found</div>
      ) : (
        <DataTable value={items} dataKey="jobProfileId" paginator
          rows={20}
          rowsPerPageOptions={[20, 50, 100]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <Column header="" body={(row: JobProfileDeletedRecord) => (
            <Button label="Restore" size="small" severity="success" loading={restoringIds.has(row.jobProfileId)} onClick={() => handleRestore(row)} />
          )} style={{ width: "8rem" }} />
          <Column field="jobProfileId" header="Job Profile ID" body={(row: JobProfileDeletedRecord) => row.jobProfileId || "—"} style={{ minWidth: "12rem" }} />
          <Column field="jobRole" header="Job Role" body={(row: JobProfileDeletedRecord) => row.jobRole || "—"} style={{ minWidth: "20rem" }} />
          <Column field="deleted_at" header="Deleted At" body={(row: JobProfileDeletedRecord) => formatAuditTimestampLocal(row.deleted_at)} style={{ minWidth: "15rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default JobProfileDeletedRecordsDialog;
