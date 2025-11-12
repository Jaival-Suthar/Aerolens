import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReducer, useRef, useEffect, lazy, Suspense } from 'react';
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
    const { handleSaveContact, handleDeleteContact, refreshTrigger, } = useContactOperations((msg) => showToast('success', msg), (msg) => showToast('error', msg));
    // Get contacts for this client
    const { contacts: clientContacts, loading: loadingContacts, error: contactsError, clearError: clearContactsError, } = useContactsByClient(selectedClient?.clientId, refreshTrigger);
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
                payload: {
                    mode: DIALOG_MODES.ADD,
                    contact: null
                },
            });
        },
        editContact: (contact) => {
            if (!contact?.clientContactId) {
                showToast('error', 'Select a valid contact first');
                return;
            }
            dispatch({
                type: 'OPEN_DIALOG',
                payload: { mode: DIALOG_MODES.EDIT, contact }
            });
        },
        deleteSelected: () => {
            if (!state.selectedContact) {
                showToast('error', 'Select a contact first to delete');
                return;
            }
            dispatch({ type: 'OPEN_DELETE_DIALOG', payload: state.selectedContact });
        },
        editSelected: () => {
            if (state.selectedContact) {
                handlers.editContact(state.selectedContact);
            }
        },
        saveContact: async (contactData) => {
            const result = await handleSaveContact(contactData, state.dialogMode, selectedClient);
            if (result.success)
                dispatch({ type: 'CLOSE_DIALOG' });
        },
        deleteContact: async (contactToDelete) => {
            const result = await handleDeleteContact(contactToDelete);
            if (result.success)
                dispatch({ type: 'CLOSE_DELETE_DIALOG' });
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
        return (_jsxs("div", { className: "dashboard-container p-2", style: { width: '100%', maxWidth: '100%' }, children: [_jsx(ContactViewHeader, { onBackClick: onBackClick, onAddContact: () => { }, selectedContact: null, onEditContact: () => { }, onDeleteContact: () => { } }), _jsx("div", { className: "text-center p-4", children: "Please select a client to view contacts." })] }));
    }
    return (_jsxs("div", { className: "dashboard-container p-2", style: { width: '100%', maxWidth: '100%' }, children: [_jsx(Toast, { ref: toast }), _jsx(ContactViewHeader, { onBackClick: onBackClick, onAddContact: handlers.addContact, selectedContact: state.selectedContact, onEditContact: handlers.editSelected, onDeleteContact: handlers.deleteSelected, selectedClient: selectedClient }), _jsxs("h4", { className: "mb-3", children: ["Contacts for: ", selectedClient.clientName] }), _jsx(ContactTable, { contacts: clientContacts, loading: loadingContacts, selectedContact: state.selectedContact, onSelectionChange: handlers.selectContact, onRowDoubleClick: handlers.editContact }), state.dialogVisible && (_jsx(Suspense, { fallback: null, children: _jsx(ContactAddEdit, { visible: state.dialogVisible, onHide: () => dispatch({ type: 'CLOSE_DIALOG' }), onSave: handlers.saveContact, mode: state.dialogMode, contact: state.editContact, clientId: selectedClient?.clientId }) })), state.deleteDialogVisible && (_jsx(Suspense, { fallback: null, children: _jsx(ContactDelete, { visible: state.deleteDialogVisible, onHide: () => dispatch({ type: 'CLOSE_DELETE_DIALOG' }), contact: state.contactToDelete, onDelete: handlers.deleteContact }) }))] }));
};
export default ClientContactsView;
