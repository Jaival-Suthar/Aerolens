import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getDeletedCandidates } from "../services/useResume";

type DeletedCandidate = {
  candidateId: number;
  candidateName: string;
  contactNumber: string | null;
  email: string | null;
  recruiterName: string | null;
  jobRole: string | null;
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

const normalizeRows = (payload: unknown): DeletedCandidate[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(envelope?.data)
      ? envelope.data
      : [];
  return rows.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      candidateId: Number(r.candidateId ?? 0),
      candidateName: String(r.candidateName ?? "—"),
      contactNumber: r.contactNumber == null ? null : String(r.contactNumber),
      email: r.email == null ? null : String(r.email),
      recruiterName: r.recruiterName == null ? null : String(r.recruiterName),
      jobRole: r.jobRole == null ? null : String(r.jobRole),
      deleted_at: r.deleted_at == null ? null : String(r.deleted_at),
    };
  });
};

const ResumeDeletedRecordsDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<DeletedCandidate[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedCandidates(accessToken);
        setItems(normalizeRows(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted candidates");
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
          tableStyle={{ minWidth: "90rem" }}
        >
          <Column
            field="deleted_at"
            header="Deleted At"
            body={(row: DeletedCandidate) => formatDeletedAt(row.deleted_at)}
            style={{ minWidth: "15rem" }}
          />
          <Column field="candidateId" header="ID" style={{ minWidth: "6rem" }} />
          <Column
            field="candidateName"
            header="Candidate Name"
            body={(row: DeletedCandidate) => row.candidateName || "—"}
            style={{ minWidth: "16rem" }}
          />
          <Column
            field="email"
            header="Email"
            body={(row: DeletedCandidate) => row.email || "—"}
            style={{ minWidth: "18rem" }}
          />
          <Column
            field="contactNumber"
            header="Phone"
            body={(row: DeletedCandidate) => row.contactNumber || "—"}
            style={{ minWidth: "13rem" }}
          />
          <Column
            field="jobRole"
            header="Role"
            body={(row: DeletedCandidate) => row.jobRole || "—"}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="recruiterName"
            header="Recruiter"
            body={(row: DeletedCandidate) => row.recruiterName || "—"}
            style={{ minWidth: "14rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default ResumeDeletedRecordsDialog;
