import React, { useReducer, useRef, useEffect, lazy, Suspense } from 'react';
import { Toast } from 'primereact/toast';

import ContactTable from './contactTable';
import ContactViewHeader from './contactViewHeader';

import { useContactOperations } from '../hooks/useContactOperations';
import { useContactsByClient } from '../hooks/useContactsByClient';
import { DIALOG_MODES } from '../constants/contactConstants';

const ContactAddEdit = lazy(() => import('./contactAddEdit'));
const ContactDelete = lazy(() => import('./contactDelete'));

const initialState = {
  selectedContact: null,
  dialogVisible: false,
  deleteDialogVisible: false,
  dialogMode: DIALOG_MODES.ADD,
  editContact: null,
  contactToDelete: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT_CONTACT':
      return { ...state, selectedContact: action.payload };
    case 'OPEN_DIALOG':
      return {
        ...state,
        dialogVisible: true,
        dialogMode: action.payload.mode,
        editContact: action.payload.contact,
      };
    case 'OPEN_DELETE_DIALOG':
      return {
        ...state,
        deleteDialogVisible: true,
        contactToDelete: action.payload,
      };
    case 'CLOSE_DIALOG':
      return { ...state, dialogVisible: false, editContact: null };
    case 'CLOSE_DELETE_DIALOG':
      return {
        ...state,
        deleteDialogVisible: false,
        contactToDelete: null,
        selectedContact: null,
      };
    default:
      return state;
  }
}

const ClientContactsView = ({ selectedClient, onBackClick }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toast = useRef(null);

  const showToast = (severity, message) => {
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
    validateContactSelection,
    triggerRefresh,
  } = useContactOperations(
    (msg) => showToast('success', msg),
    (msg) => showToast('error', msg)
  );

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
      showToast('error', contactsError);
      clearContactsError();
    }
  }, [contactsError, clearContactsError]);

  const handlers = {
    addContact: () => {
      if (!selectedClient) {
        showToast('error', 'Please select a client first');
        return;
      }
      dispatch({
        type: 'OPEN_DIALOG',
        payload: { mode: DIALOG_MODES.ADD, contact: { clientId: selectedClient.clientId } },
      });
    },
    editContact: (contact) => {
      if (!contact?.clientContactId) {
        showToast('error', 'Select a valid contact first');
        return;
      }
      dispatch({ type: 'OPEN_DIALOG', payload: { mode: DIALOG_MODES.EDIT, contact } });
    },
    deleteSelected: () => {
      if (!state.selectedContact) {
        showToast('error', 'Select a contact first to delete');
        return;
      }
      dispatch({ type: 'OPEN_DELETE_DIALOG', payload: state.selectedContact });
    },
    editSelected: () => {
      handlers.editContact(state.selectedContact);
    },
    saveContact: async (contactData) => {
      const result = await handleSaveContact(contactData, state.dialogMode, selectedClient);
      if (result.success) dispatch({ type: 'CLOSE_DIALOG' });
    },
    deleteContact: async (contactToDelete) => {
      const result = await handleDeleteContact(contactToDelete);
      if (result.success) dispatch({ type: 'CLOSE_DELETE_DIALOG' });
    },
    selectContact: (contact) => {
      if (contact && !contact.clientContactId) {
        showToast('error', 'Invalid contact selection. ID missing.');
        return;
      }
      dispatch({ type: 'SELECT_CONTACT', payload: contact });
    },
  };

  if (!selectedClient) {
    return (
      <div className="dashboard-container shadow-3 p-4" style={{ width: '100%', maxWidth: '100%' }}>
        <ContactViewHeader onBackClick={onBackClick} />
        <div className="text-center p-4">Please select a client to view contacts.</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container shadow-3 p-4" style={{ width: '100%', maxWidth: '100%' }}>
      <Toast ref={toast} />

      <ContactViewHeader
        onBackClick={onBackClick}
        onAddContact={handlers.addContact}
        selectedContact={state.selectedContact}
        onEditContact={handlers.editSelected}
        onDeleteContact={handlers.deleteSelected}
        selectedClient={selectedClient}
      />

      <h4 className="mb-3">Contacts for: {selectedClient.clientName}</h4>

      <ContactTable
        contacts={clientContacts}
        loading={loadingContacts}
        selectedContact={state.selectedContact}
        onSelectionChange={handlers.selectContact}
      />

      {state.dialogVisible && (
        <Suspense fallback={null}>
          <ContactAddEdit
            visible={state.dialogVisible}
            onHide={() => dispatch({ type: 'CLOSE_DIALOG' })}
            onSave={handlers.saveContact}
            mode={state.dialogMode}
            contact={state.editContact}
            clientId={selectedClient?.clientId}
          />
        </Suspense>
      )}

      {state.deleteDialogVisible && (
        <Suspense fallback={null}>
          <ContactDelete
            visible={state.deleteDialogVisible}
            onHide={() => dispatch({ type: 'CLOSE_DELETE_DIALOG' })}
            contact={state.contactToDelete}
            onDelete={handlers.deleteContact}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ClientContactsView;
