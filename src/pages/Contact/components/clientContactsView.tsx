import React, { useState, useCallback, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { FaArrowLeft } from 'react-icons/fa';
import type { DataTablePageEvent, DataTableRowClickEvent, DataTableSelectionSingleChangeEvent } from 'primereact/datatable';

import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';

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
  // State management
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(DIALOG_MODES.ADD as DialogMode);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Pagination state - using in-memory state instead of localStorage
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [first, setFirst] = useState<number>(0);

  const toast = useRef<Toast>(null);

  const showToast = (severity: 'success' | 'error', message: string) => {
    toast.current?.show({
      severity,
      summary: severity === 'error' ? 'Error' : 'Success',
      detail: message,
    });
  };

  // Get operations
  const {
  handleSaveContact,
  handleDeleteContact,
  refreshTrigger,
} = useContactOperations();


  // Get contacts for this client
  const {
    contacts: clientContacts,
    loading: loadingContacts,
    error: contactsError,
    clearError: clearContactsError,
  } = useContactsByClient(selectedClient?.clientId, refreshTrigger);

  // Handle errors from contacts hook
  useEffect(() => {
    if (contactsError) {
      showToast('error', contactsError.message);
      clearContactsError();
    }
  }, [contactsError, clearContactsError]);


  // Event handler for page changes
  const onPageChange = useCallback((event: DataTablePageEvent) => {
    setRowsPerPage(event.rows);
    setFirst(event.first);
  }, []);

  // Handlers
  const handleAddContact = useCallback(() => {
    if (!selectedClient) {
      showToast('error', 'Please select a client first');
      return;
    }
    setDialogMode(DIALOG_MODES.ADD as DialogMode);
    setEditContact(null);
    setDialogVisible(true);
  }, [selectedClient]);

  const handleEditContact = useCallback((contact?: Contact) => {
    const contactToEdit = contact || selectedContact;
    if (!contactToEdit?.clientContactId) {
      showToast('error', 'Select a valid contact first');
      return;
    }
    setDialogMode(DIALOG_MODES.EDIT as DialogMode);
    setEditContact(contactToEdit);
    setDialogVisible(true);
  }, [selectedContact]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedContact) {
      showToast('error', 'Select a contact first to delete');
      return;
    }
    setContactToDelete(selectedContact);
    setDeleteDialogVisible(true);
  }, [selectedContact]);

  const handleSaveContactWrapper = useCallback(
  async (contactData: Partial<Contact> & { clientId?: number }) => {
    try {
      const result = await handleSaveContact(
        contactData,
        dialogMode,
        selectedClient
      );

      if (result?.message) {
        showToast("success", result.message);
      }

      setDialogVisible(false);
      setEditContact(null);
    } catch (error: any) {
      if (error?.error === "VALIDATION_ERROR") {
        throw error; // 🔥 dialog highlights fields
      }

      showToast("error", error?.message);
    }
  },
  [handleSaveContact, dialogMode, selectedClient]
);

  const handleDeleteContactWrapper = useCallback(
  async (contact: Contact) => {
    try {
      const result = await handleDeleteContact(contact);

      if (result?.message) {
        showToast("success", result.message);
      }

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
    if (contact && !contact.clientContactId) {
      showToast('error', 'Invalid contact selection. ID missing.');
      return;
    }
    setSelectedContact(contact);
  }, []);

  const handleRowDoubleClick = useCallback((e: DataTableRowClickEvent) => {
    if (e.data) {
      handleEditContact(e.data as Contact);
    }
  }, [handleEditContact]);

  // Template functions
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

  // Memoized constants
  const cellClass = useMemo(() => "py-1 px-2", []);
  const headerClass = useMemo(() => "py-1 px-2 font-semibold", []);

  if (!selectedClient) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <div className="flex justify-content-between align-items-center mb-4 w-full">
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-100 transition"
          >
            <FaArrowLeft />
            Back to Clients
          </button>
        </div>
        <div className="text-center p-4">Please select a client to view contacts.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <Toast ref={toast} />
      
      {/* Header with buttons */}
      <div className="flex justify-content-between align-items-center mb-4 w-full">
        <div className="flex justify-content-start align-items-center">
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-100 transition"
          >
            <FaArrowLeft />
            Back to Clients
          </button>
        </div>

        <div className="flex gap-2 ml-auto mr-6">
          <AddButton onClick={handleAddContact} />
          <EditButton
            onClick={() => handleEditContact()}
            disabled={!selectedContact?.clientContactId}
          />
          <DeleteButton
            onClick={handleDeleteSelected}
            disabled={!selectedContact?.clientContactId}
          />
        </div>
      </div>

      {/* Client name heading */}
      <h4 className="mb-3">Contacts for: {selectedClient.clientName}</h4>

      {/* Table with proper flex structure */}
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
          rowsPerPageOptions={[10, 20, 50]}
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            selectionMode="single"
            headerStyle={{ width: '3rem' }}
          />
          <Column
            field="clientContactId"
            header="Contact ID"
            sortable
            bodyClassName={cellClass}
            headerClassName={headerClass}
            style={{ minWidth: '8rem' }}
          />
          <Column
            field="contactPersonName"
            header="Contact Person"
            sortable
            body={contactPersonTemplate}
            bodyClassName={cellClass}
            headerClassName={headerClass}
            style={{ minWidth: '16rem' }}
          />
          <Column
            field="designation"
            header="Designation"
            sortable
            body={designationTemplate}
            bodyClassName={cellClass}
            headerClassName={headerClass}
            style={{ minWidth: '14rem' }}
          />
        </DataTable>
      </div>

      {/* Dialogs */}
      {dialogVisible && (
        <Suspense fallback={null}>
          <ContactAddEdit
            visible={dialogVisible}
            onHide={() => {
              setDialogVisible(false);
              setEditContact(null);
            }}
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
            onHide={() => {
              setDeleteDialogVisible(false);
              setContactToDelete(null);
            }}
            contact={contactToDelete}
            onDelete={handleDeleteContactWrapper}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ClientContactsView;