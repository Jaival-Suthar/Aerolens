import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getDeletedInterviews } from "../services/interviewService";

type DeletedInterview = {
  interviewId: number;
  candidateName: string | null;
  interviewerName: string | null;
  interviewDate: string | null;
  result: string | null;
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

const normalizeRows = (payload: unknown): DeletedInterview[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(envelope?.data)
      ? envelope.data
      : [];
  return rows.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      interviewId: Number(r.interviewId ?? 0),
      candidateName: r.candidateName == null ? null : String(r.candidateName),
      interviewerName: r.interviewerName == null ? null : String(r.interviewerName),
      interviewDate: r.interviewDate == null ? null : String(r.interviewDate),
      result: r.result == null ? null : String(r.result),
      deleted_at: r.deleted_at == null ? null : String(r.deleted_at),
    };
  });
};

const InterviewDeletedRecordsDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<DeletedInterview[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedInterviews(accessToken);
        setItems(normalizeRows(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted interviews");
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
      header="Deleted Interviews"
      modal
      style={{ width: "95vw", maxWidth: "1100px" }}
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
        <div className="text-center text-600 p-4">No deleted interviews found</div>
      ) : (
        <DataTable
          value={items}
          dataKey="interviewId"
          scrollable
          scrollHeight="420px"
          tableStyle={{ minWidth: "80rem" }}
        >
          <Column
            field="deleted_at"
            header="Deleted At"
            body={(row: DeletedInterview) => formatDeletedAt(row.deleted_at)}
            style={{ minWidth: "15rem" }}
          />
          <Column field="interviewId" header="ID" style={{ minWidth: "6rem" }} />
          <Column
            field="candidateName"
            header="Candidate"
            body={(row: DeletedInterview) => row.candidateName || "—"}
            style={{ minWidth: "16rem" }}
          />
          <Column
            field="interviewerName"
            header="Interviewer"
            body={(row: DeletedInterview) => row.interviewerName || "—"}
            style={{ minWidth: "16rem" }}
          />
          <Column
            field="interviewDate"
            header="Interview Date"
            body={(row: DeletedInterview) => row.interviewDate || "—"}
            style={{ minWidth: "13rem" }}
          />
          <Column
            field="result"
            header="Result"
            body={(row: DeletedInterview) => row.result || "—"}
            style={{ minWidth: "10rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default InterviewDeletedRecordsDialog;
