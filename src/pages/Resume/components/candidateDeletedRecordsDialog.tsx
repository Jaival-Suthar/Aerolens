import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getDeletedCandidates } from "../services/useResume";
import type { CandidateDeletedRecord } from "../types/resumeTypes";

type CandidateDeletedRecordsDialogProps = {
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

const normalizeDeletedRows = (payload: unknown): CandidateDeletedRecord[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(envelope?.data)
      ? envelope.data
      : [];
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
  isOpen,
  onClose,
}) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<CandidateDeletedRecord[]>([]);
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
        const message = err instanceof Error ? err.message : "Failed to fetch deleted candidates";
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
      header="Deleted Candidates"
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
        <div className="text-center text-600 p-4">No deleted candidates found</div>
      ) : (
        <DataTable
          value={items}
          dataKey="candidateId"
          scrollable
          scrollHeight="420px"
          tableStyle={{ minWidth: "80rem" }}
        >
          <Column
            field="deleted_at"
            header="Deleted At"
            body={(row: CandidateDeletedRecord) => formatDeletedAt(row.deleted_at)}
            style={{ minWidth: "15rem" }}
          />
          <Column
            field="candidateId"
            header="Candidate ID"
            body={(row: CandidateDeletedRecord) => row.candidateId || "—"}
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="candidateName"
            header="Candidate Name"
            body={(row: CandidateDeletedRecord) => row.candidateName || "—"}
            style={{ minWidth: "16rem" }}
          />
          <Column
            field="jobRole"
            header="Job Role"
            body={(row: CandidateDeletedRecord) => row.jobRole || "—"}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="contactNumber"
            header="Contact"
            body={(row: CandidateDeletedRecord) => row.contactNumber || "—"}
            style={{ minWidth: "13rem" }}
          />
          <Column
            field="email"
            header="Email"
            body={(row: CandidateDeletedRecord) => row.email || "—"}
            style={{ minWidth: "18rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default CandidateDeletedRecordsDialog;
