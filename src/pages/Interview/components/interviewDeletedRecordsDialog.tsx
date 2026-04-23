import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getDeletedInterviews } from "../services/interviewService";
import type { InterviewDeletedRecord } from "../types/interviewTypes";

type InterviewDeletedRecordsDialogProps = {
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

const normalizeDeletedRows = (payload: unknown): InterviewDeletedRecord[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(envelope?.data)
      ? envelope.data
      : [];
  return rows.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      interviewId: Number(row.interviewId ?? 0),
      candidateName: String(row.candidateName ?? "—"),
      interviewerName: row.interviewerName == null ? null : String(row.interviewerName),
      roundNumber: row.roundNumber == null ? null : Number(row.roundNumber),
      result: row.result == null ? null : String(row.result),
      deleted_at: row.deleted_at == null ? null : String(row.deleted_at),
    };
  });
};

const InterviewDeletedRecordsDialog: React.FC<InterviewDeletedRecordsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<InterviewDeletedRecord[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedInterviews(accessToken);
        setItems(normalizeDeletedRows(response.data));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch deleted interviews";
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
      header="Deleted Interviews"
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
            body={(row: InterviewDeletedRecord) => formatDeletedAt(row.deleted_at)}
            style={{ minWidth: "15rem" }}
          />
          <Column
            field="interviewId"
            header="Interview ID"
            body={(row: InterviewDeletedRecord) => row.interviewId || "—"}
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="candidateName"
            header="Candidate Name"
            body={(row: InterviewDeletedRecord) => row.candidateName || "—"}
            style={{ minWidth: "16rem" }}
          />
          <Column
            field="interviewerName"
            header="Interviewer"
            body={(row: InterviewDeletedRecord) => row.interviewerName || "—"}
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="roundNumber"
            header="Round"
            body={(row: InterviewDeletedRecord) => (row.roundNumber != null ? `Round ${row.roundNumber}` : "—")}
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="result"
            header="Result"
            body={(row: InterviewDeletedRecord) => row.result || "—"}
            style={{ minWidth: "12rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default InterviewDeletedRecordsDialog;
