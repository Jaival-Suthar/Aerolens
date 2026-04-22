import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { JobProfileRequirementDeletedRecord } from "../types/jobProfileRequirementsTypes";
import { getDeletedJobProfileRequirements } from "../services/jobProfileRequirementsService";
import { useAuth } from "../../../shared/auth/AuthContext";

type JobProfileRequirementsDeletedRecordsDialogProps = {
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

const normalizeDeletedRows = (payload: unknown): JobProfileRequirementDeletedRecord[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(envelope?.data)
      ? envelope.data
      : [];

  return rows.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      jobProfileRequirementId: Number(row.jobProfileRequirementId ?? row.jobprofilerequirementid ?? 0),
      jobProfileId: Number(row.jobProfileId ?? row.jobprofileid ?? 0),
      clientId: row.clientId == null ? null : Number(row.clientId),
      departmentId: row.departmentId == null ? null : Number(row.departmentId),
      positions: row.positions == null ? null : Number(row.positions),
      deleted_at: row.deleted_at ? String(row.deleted_at) : null,
    };
  });
};

const JobProfileRequirementsDeletedRecordsDialog: React.FC<JobProfileRequirementsDeletedRecordsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<JobProfileRequirementDeletedRecord[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedJobProfileRequirements(accessToken);
        setItems(normalizeDeletedRows(response.data));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch deleted job profile requirements";
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
      header="Deleted Job Profile Requirements"
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
        <div className="text-center text-600 p-4">No deleted job profile requirements found</div>
      ) : (
        <DataTable
          value={items}
          dataKey="jobProfileRequirementId"
          scrollable
          scrollHeight="420px"
          tableStyle={{ minWidth: "80rem" }}
        >
          <Column
            field="deleted_at"
            header="Deleted At"
            body={(row: JobProfileRequirementDeletedRecord) => formatDeletedAt(row.deleted_at)}
            style={{ minWidth: "15rem" }}
          />
          <Column
            field="jobProfileRequirementId"
            header="Requirement ID"
            body={(row: JobProfileRequirementDeletedRecord) => row.jobProfileRequirementId || "—"}
            style={{ minWidth: "12rem" }}
          />
          <Column
            field="jobProfileId"
            header="Job Profile ID"
            body={(row: JobProfileRequirementDeletedRecord) => row.jobProfileId || "—"}
            style={{ minWidth: "12rem" }}
          />
          <Column
            field="clientId"
            header="Client ID"
            body={(row: JobProfileRequirementDeletedRecord) => row.clientId ?? "—"}
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="departmentId"
            header="Department ID"
            body={(row: JobProfileRequirementDeletedRecord) => row.departmentId ?? "—"}
            style={{ minWidth: "12rem" }}
          />
          <Column
            field="positions"
            header="Positions"
            body={(row: JobProfileRequirementDeletedRecord) => row.positions ?? "—"}
            style={{ minWidth: "10rem" }}
          />
        </DataTable>
      )}
    </Dialog>
  );
};

export default JobProfileRequirementsDeletedRecordsDialog;
