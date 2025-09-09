import React, { useReducer, useRef, useEffect, lazy, Suspense } from 'react';
import { SplitButton } from 'primereact/splitbutton';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

// Lazy load heavy components
const ContactAddEdit = lazy(() => import('./components/contactAddEdit'));
const ContactDelete = lazy(() => import('./components/contactDelete'));
const ClientContactsView = lazy(() => import('./components/clientContactsView'));

// Light components - keep normal imports
import ClientTable from './components/clientTable';

// Hooks
import useContact from './services/useContact';
import { useContactOperations } from './hooks/useContactOperations';

// Constants
import { VIEW_MODES, DIALOG_MODES, getMenuItems, getEmptyContact } from './constants/contactConstants';

// SINGLE SOURCE OF TRUTH - ONE REDUCER TO RULE THEM ALL
const initialState = {
  // View
  activeView: VIEW_MODES.TABLE,
  
  // Selections
  selectedClient: null,
  selectedContact: null,
  
  // Dialogs
  dialogVisible: false,
  deleteDialogVisible: false,
  dialogMode: DIALOG_MODES.ADD,
  editContact: null,
  contactToDelete: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
      
    case 'SELECT_CLIENT':
      return { 
        ...state, 
        selectedClient: action.payload, 
        selectedContact: null // Clear contact when client changes
      };
      
    case 'SELECT_CONTACT':
      return { ...state, selectedContact: action.payload };
      
    case 'OPEN_DIALOG':
      return {
        ...state,
        dialogVisible: true,
        dialogMode: action.payload.mode,
        editContact: action.payload.contact
      };
      
    case 'OPEN_DELETE_DIALOG':
      return {
        ...state,
        deleteDialogVisible: true,
        contactToDelete: action.payload
      };
      
    case 'CLOSE_DIALOG':
      return {
        ...state,
        dialogVisible: false,
        editContact: null
      };
      
    case 'CLOSE_DELETE_DIALOG':
      return {
        ...state,
        deleteDialogVisible: false,
        contactToDelete: null,
        selectedContact: null // Clear selection after delete
      };
      
    default:
      return state;
  }
}

const Contact = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const toast = useRef(null);
  
  // Hooks
  const { loading, error, clearError } = useContact();
  
  // CENTRALIZED ERROR/SUCCESS HANDLING - NO MORE SCATTERED TOASTS
  const showToast = (severity, message) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Error' : 'Success', 
      detail: message 
    });
  };
  
  // Custom operations hook
  const { 
    refreshTrigger, 
    handleSaveContact, 
    handleDeleteContact,
    validateContactSelection 
  } = useContactOperations(
    (msg) => showToast('success', msg),
    (msg) => showToast('error', msg)
  );

  // Error handling - CENTRALIZED
  useEffect(() => {
    if (error) {
      showToast('error', error);
      clearError();
    }
  }, [error, clearError]);

  // ATOMIC HANDLERS - NO MORE SCATTERED LOGIC
  const handlers = {
    addContact: () => {
      if (!state.selectedClient) {
        showToast('error', 'Please select a client first to add a contact');
        return;
      }
      dispatch({
        type: 'OPEN_DIALOG',
        payload: {
          mode: DIALOG_MODES.ADD,
          contact: getEmptyContact(state.selectedClient.clientId)
        }
      });
    },
    
    editContact: (contact) => {
      if (!validateContactSelection(contact, (msg) => showToast('error', msg))) return;
      
      dispatch({
        type: 'OPEN_DIALOG',
        payload: {
          mode: DIALOG_MODES.EDIT,
          contact: {
            ...contact,
            clientContactId: contact.clientContactId,
            clientId: contact.clientId || state.selectedClient?.clientId
          }
        }
      });
    },
    
    deleteSelected: () => {
      if (!validateContactSelection(state.selectedContact, (msg) => showToast('error', msg))) return;
      
      dispatch({
        type: 'OPEN_DELETE_DIALOG',
        payload: {
          ...state.selectedContact,
          clientContactId: state.selectedContact.clientContactId
        }
      });
    },
    
    editSelected: () => {
      if (!validateContactSelection(state.selectedContact, (msg) => showToast('error', msg))) return;
      handlers.editContact(state.selectedContact);
    },
    
    // ASYNC HANDLERS
    saveContact: async (contactData) => {
      const result = await handleSaveContact(contactData, state.dialogMode, state.selectedClient);
      if (result.success) {
        dispatch({ type: 'CLOSE_DIALOG' });
      }
    },
    
    deleteContact: async (contactToDelete) => {
      const result = await handleDeleteContact(contactToDelete);
      if (result.success) {
        dispatch({ type: 'CLOSE_DELETE_DIALOG' });
      }
    },
    
    // SELECTION HANDLERS
    selectClient: (client) => {
      dispatch({ type: 'SELECT_CLIENT', payload: client });
    },
    
    selectContact: (contact) => {
      if (contact && !contact.clientContactId) {
        console.warn('Selected contact is missing clientContactId:', contact);
        showToast('error', 'Invalid contact selection. Contact ID is missing.');
        return;
      }
      dispatch({ type: 'SELECT_CONTACT', payload: contact });
    },
    
    // VIEW HANDLERS
    setView: (view) => {
      dispatch({ type: 'SET_VIEW', payload: view });
    },
    
    backToClients: () => {
      dispatch({ type: 'SET_VIEW', payload: VIEW_MODES.TABLE });
    }
  };

  // SINGLE VIEW RENDERER - NO MORE SCATTERED CONDITIONALS
  const renderView = () => {
    switch (state.activeView) {
      case VIEW_MODES.DEPARTMENT:
        return (
          <div>
            <Button 
              icon="pi pi-arrow-left" 
              label="Back to Clients" 
              onClick={handlers.backToClients} 
              className="mb-3" 
            />
            <h3>Department view is under construction</h3>
          </div>
        );
        
      case VIEW_MODES.CONTACTS:
        return (
          <Suspense fallback={<div>Loading contacts...</div>}>
            <ClientContactsView 
              selectedClient={state.selectedClient}
              onBackClick={handlers.backToClients}
              onAddContact={handlers.addContact}
              selectedContact={state.selectedContact}
              onSelectionChange={handlers.selectContact}
              onEditContact={handlers.editSelected}
              onDeleteContact={handlers.deleteSelected}
              refreshTrigger={refreshTrigger}
              loading={loading}
            />
          </Suspense>
        );
      
      case VIEW_MODES.TABLE:
      default:
        return (
          <ClientTable
            refreshTrigger={refreshTrigger}
            selectedClient={state.selectedClient}
            onSelectionChange={handlers.selectClient}
          />
        );
    }
  };

  // Menu items
  const menuItems = getMenuItems(handlers.setView);

  // SIMPLIFIED RENDER - NO MORE CONDITIONAL CONTAINERS
  const isContactsView = state.activeView === VIEW_MODES.CONTACTS;

  return (
    <div className={isContactsView ? '' : 'dashboard-container shadow-3 p-4'} 
         style={isContactsView ? {} : { width: "100%", maxWidth: "100%" }}>
      
      <Toast ref={toast} />

      {!isContactsView && (
        <div className="flex justify-content-between align-items-center mb-4 w-full">
          <div className="flex gap-2 mr-6">
            <SplitButton
              icon="pi pi-cog"
              model={menuItems}
              tooltip="Settings"
              tooltipOptions={{ position: 'bottom' }}
              disabled={!state.selectedClient}
              aria-label="Settings"
            />
          </div>
        </div>
      )}

      <div className={isContactsView ? '' : 'card'}>
        {renderView()}
      </div>

      {/* LAZY LOADED DIALOGS - PERFORMANCE MULTIPLIER */}
      {state.dialogVisible && (
        <Suspense fallback={null}>
          <ContactAddEdit
            visible={state.dialogVisible}
            onHide={() => dispatch({ type: 'CLOSE_DIALOG' })}
            onSave={handlers.saveContact}
            mode={state.dialogMode}
            contact={state.editContact}
            clientId={state.selectedClient?.clientId}
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

export default Contact;