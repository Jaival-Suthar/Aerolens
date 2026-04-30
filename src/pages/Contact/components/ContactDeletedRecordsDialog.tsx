import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getDeletedContacts, restoreContact } from "../services/useContact";
import { formatAuditTimestampLocal } from "../../../shared/utils/auditDateTime";

type DeletedContact = {
  clientContactId: number;
  contactPersonName: string;
  designation: string;
  emailAddress: string;
  phone: string;
  deleted_at: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  onRestoreSuccess?: () => void;
};

const normalizeRows = (payload: unknown): DeletedContact[] => {
  const rows = Array.isArray(payload) ? payload : (payload as any)?.data ?? [];
  return rows.map((item: any) => ({
    clientContactId: Number(item.clientContactId ?? 0),
    contactPersonName: String(item.contactPersonName ?? "—"),
    designation: String(item.designation ?? ""),
    emailAddress: String(item.emailAddress ?? ""),
    phone: String(item.phone ?? ""),
    deleted_at: item.deleted_at == null ? null : String(item.deleted_at),
  }));
};

const ContactDeletedRecordsDialog: React.FC<Props> = ({ isOpen, onClose, clientId, onRestoreSuccess }) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<DeletedContact[]>([]);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !accessToken || !clientId) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDeletedContacts(accessToken, clientId);
        setItems(normalizeRows(response));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch deleted contacts");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, accessToken, clientId, reloadKey]);

  const handleRestore = async (row: DeletedContact) => {
    setRestoringIds(prev => new Set(prev).add(row.clientContactId));
    try {
      await restoreContact(accessToken!, row.clientContactId);
      toast.current?.show({ severity: "success", summary: "Restored", detail: `${row.contactPersonName} has been restored` });
      setItems(prev => prev.filter(r => r.clientContactId !== row.clientContactId));
      onRestoreSuccess?.();
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err instanceof Error ? err.message : "Failed to restore contact" });
    } finally {
      setRestoringIds(prev => { const next = new Set(prev); next.delete(row.clientContactId); return next; });
    }
  };

  return (
    <Dialog visible={isOpen} onHide={onClose} header="Deleted Contacts" modal style={{ width: "95vw", maxWidth: "1100px" }}>
      <Toast ref={toast} />
      {error ? (
        <div className="p-message p-message-error flex align-items-center justify-content-between">
          <span>{error}</span>
          <Button label="Retry" size="small" onClick={() => setReloadKey(k => k + 1)} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-600 p-4">No deleted contacts found</div>
      ) : (
        <DataTable value={items} dataKey="clientContactId" paginator
          rows={20}
          rowsPerPageOptions={[20, 50, 100]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <Column
            header=""
            body={(row: DeletedContact) => (
              <Button
                label="Restore"
                size="small"
                severity="success"
                loading={restoringIds.has(row.clientContactId)}
                onClick={() => handleRestore(row)}
              />
            )}
            style={{ width: "8rem" }}
          />
          <Column field="contactPersonName" header="Name" style={{ minWidth: "14rem" }} />
          <Column field="designation" header="Designation" body={(row: DeletedContact) => row.designation || "—"} style={{ minWidth: "12rem" }} />
          <Column field="emailAddress" header="Email" body={(row: DeletedContact) => row.emailAddress || "—"} style={{ minWidth: "16rem" }} />
          <Column field="phone" header="Phone" body={(row: DeletedContact) => row.phone || "—"} style={{ minWidth: "12rem" }} />
          <Column field="deleted_at" header="Deleted At" body={(row: DeletedContact) => formatAuditTimestampLocal(row.deleted_at)} style={{ minWidth: "15rem" }} />
        </DataTable>
      )}
    </Dialog>
  );
};

export default ContactDeletedRecordsDialog;
