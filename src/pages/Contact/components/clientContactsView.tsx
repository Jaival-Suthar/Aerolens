import React, { useState, useCallback, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { FaArrowLeft } from 'react-icons/fa';
import type { DataTablePageEvent, DataTableRowClickEvent, DataTableSelectionSingleChangeEvent } from 'primereact/datatable';

import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';
import CogButton from '../../../shared/CogButton';
import ContactDeletedRecordsDialog from './ContactDeletedRecordsDialog';
import ContactAuditLogsDialog from './ContactAuditLogsDialog';

import { useContactOperations } from '../hooks/useContactOperations';
import { useContactsByClient } from '../hooks/useContactsByClient';
import { DIALOG_MODES } from '../constants/contactConstants';
import type { Client, Contact, DialogMode } from '../types/contactTypes';

const ContactAddEdit = lazy(() => import('./contactAddEdit'));
const ContactDelete = lazy(() => import('./contactDelete'));

interface ClientContactsViewProps {
  selectedClient: Client | null;
  onBackClick: () => void;
}

const ClientContactsView: React.FC<ClientContactsViewProps> = ({ selectedClient, onBackClick }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(DIALOG_MODES.ADD as DialogMode);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [showCogMenu, setShowCogMenu] = useState(false);
  const [showChangeLogsDialog, setShowChangeLogsDialog] = useState(false);
  const [showDeletedRecordsDialog, setShowDeletedRecordsDialog] = useState(false);
  const [auditTargetContact, setAuditTargetContact] = useState<Contact | null>(null);
  const cogMenuRef = useRef<HTMLDivElement | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [first, setFirst] = useState<number>(0);

  const toast = useRef<Toast>(null);

  const showToast = (severity: 'success' | 'error', message: string) => {
    toast.current?.show({ severity, summary: severity === 'error' ? 'Error' : 'Success', detail: message });
  };

  const { handleSaveContact, handleDeleteContact, refreshTrigger, triggerRefresh } = useContactOperations();

  const { contacts: clientContacts, loading: loadingContacts, error: contactsError, clearError: clearContactsError } = useContactsByClient(selectedClient?.clientId, refreshTrigger);

  useEffect(() => {
    if (contactsError) { showToast('error', contactsError.message); clearContactsError(); }
  }, [contactsError, clearContactsError]);

  useEffect(() => {
    if (!showCogMenu) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (cogMenuRef.current && !cogMenuRef.current.contains(event.target as Node)) {
        setShowCogMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showCogMenu]);

  const onPageChange = useCallback((event: DataTablePageEvent) => {
    setRowsPerPage(event.rows);
    setFirst(event.first);
  }, []);

  const handleAddContact = useCallback(() => {
    if (!selectedClient) { showToast('error', 'Please select a client first'); return; }
    setDialogMode(DIALOG_MODES.ADD as DialogMode);
    setEditContact(null);
    setDialogVisible(true);
  }, [selectedClient]);

  const handleEditContact = useCallback((contact?: Contact) => {
    const contactToEdit = contact || selectedContact;
    if (!contactToEdit?.clientContactId) { showToast('error', 'Select a valid contact first'); return; }
    setDialogMode(DIALOG_MODES.EDIT as DialogMode);
    setEditContact(contactToEdit);
    setDialogVisible(true);
  }, [selectedContact]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedContact) { showToast('error', 'Select a contact first to delete'); return; }
    setContactToDelete(selectedContact);
    setDeleteDialogVisible(true);
  }, [selectedContact]);

  const handleSaveContactWrapper = useCallback(
    async (contactData: Partial<Contact> & { clientId?: number }) => {
      try {
        const result = await handleSaveContact(contactData, dialogMode, selectedClient);
        if (result?.message) showToast("success", result.message);
        setDialogVisible(false);
        setEditContact(null);
        setSelectedContact(null);
      } catch (error: any) {
        if (error?.error === "VALIDATION_ERROR") throw error;
        showToast("error", error?.message);
      }
    },
    [handleSaveContact, dialogMode, selectedClient]
  );

  const handleDeleteContactWrapper = useCallback(
    async (contact: Contact) => {
      try {
        const result = await handleDeleteContact(contact);
        if (result?.message) showToast("success", result.message);
        setDeleteDialogVisible(false);
        setContactToDelete(null);
        setSelectedContact(null);
      } catch (error: any) {
        showToast("error", error?.message);
      }
    },
    [handleDeleteContact]
  );

  const handleSelectionChange = useCallback((e: DataTableSelectionSingleChangeEvent<Contact[]>) => {
    const contact = e.value as Contact | null;
    if (contact && !contact.clientContactId) { showToast('error', 'Invalid contact selection. ID missing.'); return; }
    setSelectedContact(contact);
  }, []);

  const handleRowDoubleClick = useCallback((e: DataTableRowClickEvent) => {
    if (e.data) handleEditContact(e.data as Contact);
  }, [handleEditContact]);

  const contactPersonTemplate = useCallback((rowData: Contact) => (
    <div>
      <div className="font-medium">{rowData.contactPersonName}</div>
      <div className="text-sm text-gray-600">{rowData.email}</div>
    </div>
  ), []);

  const designationTemplate = useCallback((rowData: Contact) => (
    <div>
      <div className="font-medium">{rowData.designation}</div>
      <div className="text-sm text-gray-600">{rowData.phone}</div>
    </div>
  ), []);

  const cellClass = useMemo(() => "py-1 px-2", []);
  const headerClass = useMemo(() => "py-1 px-2 font-semibold", []);
  const auditTargetContactId = auditTargetContact?.clientContactId ?? auditTargetContact?.contactId ?? null;

  if (!selectedClient) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <div className="flex justify-content-between align-items-center mb-4 w-full">
          <button onClick={onBackClick} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-100 transition">
            <FaArrowLeft /> Back to Clients
          </button>
        </div>
        <div className="text-center p-4">Please select a client to view contacts.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mt-1 w-full">
        <div className="flex justify-content-start align-items-center">
          <button onClick={onBackClick} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-100 transition">
            <FaArrowLeft /> Back to Clients
          </button>
        </div>

        <div className="flex gap-2 ml-auto mr-6">
          <AddButton onClick={handleAddContact} />
          <EditButton onClick={() => handleEditContact()} disabled={!selectedContact?.clientContactId} />
          <DeleteButton onClick={handleDeleteSelected} disabled={!selectedContact?.clientContactId} />

          <div ref={cogMenuRef} style={{ position: "relative" }}>
            <CogButton
              onClick={() => setShowCogMenu(prev => !prev)}
              tooltip="Contact Activity"
            />
            {showCogMenu && (
              <div
                className="card shadow-3"
                style={{ position: "absolute", right: 0, top: 50, zIndex: 9999, minWidth: 220, backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.5rem" }}
              >
                <div
                  className="p-2 border-round"
                  role="button"
                  tabIndex={selectedContact ? 0 : -1}
                  aria-disabled={!selectedContact}
                  onClick={() => {
                    if (!selectedContact) return;
                    setAuditTargetContact(selectedContact);
                    setShowCogMenu(false);
                    setShowChangeLogsDialog(true);
                  }}
                  onKeyDown={(e) => {
                    if (!selectedContact) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setAuditTargetContact(selectedContact);
                      setShowCogMenu(false);
                      setShowChangeLogsDialog(true);
                    }
                  }}
                  style={{ display: "flex", alignItems: "center", cursor: selectedContact ? "pointer" : "not-allowed", opacity: selectedContact ? 1 : 0.4 }}
                  onMouseEnter={(e) => { if (selectedContact) e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <i className="pi pi-history" style={{ fontSize: "14px", color: "#374151" }} />
                  <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>Change Logs</span>
                </div>
                <div
                  className="p-2 border-round"
                  role="button"
                  tabIndex={0}
                  onClick={() => { setShowCogMenu(false); setShowDeletedRecordsDialog(true); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCogMenu(false); setShowDeletedRecordsDialog(true); } }}
                  style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <i className="pi pi-trash" style={{ fontSize: "14px", color: "#374151" }} />
                  <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>Deleted Contacts</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <h4 className="mb-3" style={{ color: "#07253f" }}>Contacts for: {selectedClient.clientName}</h4>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <DataTable
          value={clientContacts}
          loading={loadingContacts}
          stripedRows
          className="text-sm"
          paginator
          first={first}
          rows={rowsPerPage}
          scrollable
          scrollHeight="flex"
          onPage={onPageChange}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Contacts"
          emptyMessage={loadingContacts ? "Loading contacts..." : "No contacts found."}
          selectionMode="single"
          selection={selectedContact}
          onRowDoubleClick={handleRowDoubleClick}
          onSelectionChange={handleSelectionChange}
          dataKey="clientContactId"
          showGridlines
          metaKeySelection={false}
          rowsPerPageOptions={[20, 50, 100]}
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column selectionMode="single" headerStyle={{ width: '3rem' }} />
          <Column field="clientContactId" header="Contact ID" sortable bodyClassName={cellClass} headerClassName={headerClass} style={{ minWidth: '8rem' }} />
          <Column field="contactPersonName" header="Contact Person" sortable body={contactPersonTemplate} bodyClassName={cellClass} headerClassName={headerClass} style={{ minWidth: '16rem' }} />
          <Column field="designation" header="Designation" sortable body={designationTemplate} bodyClassName={cellClass} headerClassName={headerClass} style={{ minWidth: '14rem' }} />
        </DataTable>
      </div>

      {dialogVisible && (
        <Suspense fallback={null}>
          <ContactAddEdit
            visible={dialogVisible}
            onHide={() => { setDialogVisible(false); setEditContact(null); setSelectedContact(null); }}
            onSave={handleSaveContactWrapper}
            mode={dialogMode}
            contact={editContact}
            clientId={selectedClient?.clientId}
          />
        </Suspense>
      )}

      {deleteDialogVisible && (
        <Suspense fallback={null}>
          <ContactDelete
            visible={deleteDialogVisible}
            onHide={() => { setDeleteDialogVisible(false); setContactToDelete(null); }}
            contact={contactToDelete}
            onDelete={handleDeleteContactWrapper}
          />
        </Suspense>
      )}

      <ContactDeletedRecordsDialog
        isOpen={showDeletedRecordsDialog}
        onClose={() => setShowDeletedRecordsDialog(false)}
        clientId={selectedClient.clientId}
        onRestoreSuccess={triggerRefresh}
      />

      <ContactAuditLogsDialog
        key={`contact-audit-${auditTargetContactId ?? "none"}`}
        isOpen={showChangeLogsDialog}
        onClose={() => {
          setShowChangeLogsDialog(false);
          setAuditTargetContact(null);
        }}
        contactId={auditTargetContactId}
        contactName={auditTargetContact?.contactPersonName ?? null}
      />
    </div>
  );
};

export default ClientContactsView;
