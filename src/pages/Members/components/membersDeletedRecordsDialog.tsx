import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../shared/auth/AuthContext";
import { formatAuditTimestampLocal } from "../../../shared/utils/auditDateTime";
import { getDeletedMembers, restoreMember } from "../services/memberService";
import type { MemberDeletedRecord } from "../types/memberTypes";

type MembersDeletedRecordsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess?: () => void;
};


const normalizeDeletedRows = (payload: unknown): MemberDeletedRecord[] => {
  const envelope = payload as { data?: unknown } | null;
  const rows = Array.isArray(payload) ? payload : Array.isArray(envelope?.data) ? envelope.data : [];
  return rows.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      memberId: Number(row.memberId ?? row.memberid ?? 0),
      memberName: String(row.memberName ?? row.membername ?? "—"),
      memberContact: row.memberContact == null ? null : String(row.memberContact),
      email: row.email == null ? null : String(row.email),
      deleted_at: row.deleted_at == null ? null : String(row.deleted_at),
    };
  });
};

const MembersDeletedRecordsDialog: React.FC<MembersDeletedRecordsDialogProps> = ({
  isOpen, onClose, onRestoreSuccess,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<MemberDeletedRecord[]>([]);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedMembers(accessToken);
        setItems(normalizeDeletedRows(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted members");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, reloadKey]);

  const handleRestore = async (row: MemberDeletedRecord) => {
    setRestoringIds((prev) => new Set(prev).add(row.memberId));
    try {
      await restoreMember(accessToken, row.memberId);
      toast.current?.show({ severity: "success", summary: "Restored", detail: `${row.memberName} has been restored` });
      setItems((prev) => prev.filter((r) => r.memberId !== row.memberId));
      onRestoreSuccess?.();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err instanceof Error ? err.message : "Failed to restore member" });
    } finally {
      setRestoringIds((prev) => { const next = new Set(prev); next.delete(row.memberId); return next; });
    }
  };

  return (
    <Dialog visible={isOpen} onHide={onClose} header="Deleted Members" modal style={{ width: "95vw", maxWidth: "1200px" }}>
      <Toast ref={toast} />
      {loading ? (
        <div className="text-center p-4"><i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} /><p className="mt-3">Loading deleted records...</p></div>
      ) : error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span><Button label="Retry" size="small" onClick={() => setReloadKey((k) => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted members found</div>
      ) : (
        <DataTable value={items} dataKey="memberId" scrollable scrollHeight="420px">
          <Column header="" body={(row: MemberDeletedRecord) => (
            <Button label="Restore" size="small" severity="success" loading={restoringIds.has(row.memberId)} onClick={() => handleRestore(row)} />
          )} style={{ width: "8rem" }} />
          <Column field="memberId" header="Member ID" body={(row: MemberDeletedRecord) => row.memberId || "—"} style={{ minWidth: "10rem" }} />
          <Column field="memberName" header="Member Name" body={(row: MemberDeletedRecord) => row.memberName || "—"} style={{ minWidth: "16rem" }} />
          <Column field="memberContact" header="Contact" body={(row: MemberDeletedRecord) => row.memberContact || "—"} style={{ minWidth: "14rem" }} />
          <Column field="email" header="Email" body={(row: MemberDeletedRecord) => row.email || "—"} style={{ minWidth: "20rem" }} />
          <Column field="deleted_at" header="Deleted At" body={(row: MemberDeletedRecord) => formatAuditTimestampLocal(row.deleted_at)} style={{ minWidth: "15rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default MembersDeletedRecordsDialog;
