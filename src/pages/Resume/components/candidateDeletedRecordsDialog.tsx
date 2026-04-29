import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getDeletedCandidates, restoreCandidate } from "../services/useResume";
import type { CandidateDeletedRecord } from "../types/resumeTypes";

type CandidateDeletedRecordsDialogProps = {
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

const normalizeDeletedRows = (payload: unknown): CandidateDeletedRecord[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload) ? payload : Array.isArray(envelope?.data) ? envelope.data : [];
  return rows.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      candidateId: Number(row.candidateId ?? 0),
      candidateName: String(row.candidateName ?? "—"),
      contactNumber: row.contactNumber == null ? null : String(row.contactNumber),
      email: row.email == null ? null : String(row.email),
      jobRole: row.jobRole == null ? null : String(row.jobRole),
      deleted_at: row.deleted_at == null ? null : String(row.deleted_at),
    };
  });
};

const CandidateDeletedRecordsDialog: React.FC<CandidateDeletedRecordsDialogProps> = ({
  isOpen, onClose, onRestoreSuccess,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<CandidateDeletedRecord[]>([]);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedCandidates(accessToken);
        setItems(normalizeDeletedRows(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted candidates");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, reloadKey]);

  const handleRestore = async (row: CandidateDeletedRecord) => {
    setRestoringIds((prev) => new Set(prev).add(row.candidateId));
    try {
      await restoreCandidate(accessToken, row.candidateId);
      toast.current?.show({ severity: "success", summary: "Restored", detail: `${row.candidateName} has been restored` });
      setItems((prev) => prev.filter((r) => r.candidateId !== row.candidateId));
      onRestoreSuccess?.();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err instanceof Error ? err.message : "Failed to restore candidate" });
    } finally {
      setRestoringIds((prev) => { const next = new Set(prev); next.delete(row.candidateId); return next; });
    }
  };

  return (
    <Dialog visible={isOpen} onHide={onClose} header="Deleted Candidates" modal style={{ width: "95vw", maxWidth: "1200px" }}>
      <Toast ref={toast} />
      {error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span><Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted candidates found</div>
      ) : (
        <DataTable value={items} dataKey="candidateId" paginator
          rows={20}
          rowsPerPageOptions={[20, 50, 100]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <Column header="" body={(row: CandidateDeletedRecord) => (
            <Button label="Restore" size="small" severity="success" loading={restoringIds.has(row.candidateId)} onClick={() => handleRestore(row)} />
          )} style={{ width: "8rem" }} />
          <Column field="candidateId" header="Candidate ID" body={(row: CandidateDeletedRecord) => row.candidateId || "—"} style={{ minWidth: "10rem" }} />
          <Column field="candidateName" header="Candidate Name" body={(row: CandidateDeletedRecord) => row.candidateName || "—"} style={{ minWidth: "16rem" }} />
          <Column field="jobRole" header="Job Role" body={(row: CandidateDeletedRecord) => row.jobRole || "—"} style={{ minWidth: "14rem" }} />
          <Column field="contactNumber" header="Contact" body={(row: CandidateDeletedRecord) => row.contactNumber || "—"} style={{ minWidth: "13rem" }} />
          <Column field="email" header="Email" body={(row: CandidateDeletedRecord) => row.email || "—"} style={{ minWidth: "18rem" }} />
          <Column field="deleted_at" header="Deleted At" body={(row: CandidateDeletedRecord) => formatDeletedAt(row.deleted_at)} style={{ minWidth: "15rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default CandidateDeletedRecordsDialog;
