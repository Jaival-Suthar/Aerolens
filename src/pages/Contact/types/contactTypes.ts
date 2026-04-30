// src/types/common.types.ts

/**
 * Core domain entities and type definitions for contacts and clients.
 * Consistent naming. No duplication. Use strict types.
 */
import type { ApiError } from "../../../types/apiError";
export interface Contact {
  readonly clientContactId?: number; // Prefer clientContactId, fallback to id
  readonly contactId?: number;       // Backwards compatibility in codebase
  readonly clientId: number;
  readonly contactPersonName: string;
  readonly designation?: string;
  readonly phone?: string;
  readonly email?: string;
}
export interface ClientDetailsApiResponse {
  clientContact: Contact[];  // Note: lowercase 'c' to match API
  address?: string;
  clientId?: number;
  clientName?: string;
}
// Add this interface at the top of the file:
export interface ContactPayload {
  clientContactId?: number;
  clientId?: number;
  contactPersonName?: string;
  designation?: string;
  phone?: string;
  email?: string;
}
export interface Client {
  readonly clientId: number;
  readonly clientName: string;
  // Add more client fields if needed
}

/**
 * Dialog mode union type for stricter prop enforcement
 */
export type DialogMode = 'add' | 'edit';

/**
 * DIALOG_MODES constant type
 */
export enum DialogModesEnum {
  ADD = 'add',
  EDIT = 'edit',
}

/**
 * State shape for useReducer in ClientContactsView
 */
export interface ClientContactsViewState {
  selectedContact: Contact | null;
  dialogVisible: boolean;
  deleteDialogVisible: boolean;
  dialogMode: DialogMode;
  editContact: Contact | null;
  contactToDelete: Contact | null;
}

/**
 * Action types for reducer
 */
export type ClientContactsAction =
  | { type: 'SELECT_CONTACT'; payload: Contact | null }
  | { type: 'OPEN_DIALOG'; payload: { mode: DialogMode; contact: Contact | null } }
  | { type: 'OPEN_DELETE_DIALOG'; payload: Contact | null }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'CLOSE_DELETE_DIALOG' };

/**
 * Props for ClientContactsView component
 */
export interface ClientContactsViewProps {
  selectedClient: Client | null;
  onBackClick: () => void;
}

/**
 * Props for ContactAddEdit component
 */
export interface ContactAddEditProps {
  visible: boolean;
  onHide: () => void;
  onSave: (contactData: ContactAddEditPayload) => void | Promise<void>;
  mode: DialogMode;
  contact: Contact | null;
  clientId?: number | null; // Required if mode is 'add'
}

/**
 * Payload shape for ContactAddEdit onSave
 * - In 'add' mode, all fields required (except optional ones defined)
 * - In 'edit' mode, partial updates allowed (only changed fields)
 */
export type ContactAddEditPayload = 
  | (Pick<Contact, 'clientId' | 'contactPersonName' | 'designation' | 'phone' | 'email'> & { clientId: number })
  | Partial<Omit<Contact, 'clientId'>>;

/**
 * Props for ContactDelete component
 */
export interface ContactDeleteProps {
  visible: boolean;
  onHide: () => void;
  onDelete: (contact: Contact) => void | Promise<void>;
  contact: Contact | null;
}

/**
 * Props for ContactTable component
 */
export interface ContactTableProps {
  contacts: Contact[];
  loading: boolean;
  selectedContact: Contact | null;
  onSelectionChange: (contact: Contact | null) => void;
  onRowDoubleClick: (contact: Contact) => void;
}

/**
 * Props for ContactViewHeader component
 */
export interface ContactViewHeaderProps {
  onBackClick: () => void;
  selectedClient: Client | null;
  onAddContact: () => void;
  selectedContact: Contact | null;
  onEditContact: () => void;
  onDeleteContact: () => void;
}

/**
 * Return type of useContactOperations hook
 */
export interface UseContactOperationsReturn {
  refreshTrigger: number;
  handleSaveContact: (
    contactData: ContactAddEditPayload, 
    dialogMode: DialogMode, 
    selectedClient: Client | null
  ) => Promise<{ success: boolean; error?: unknown }>;
  handleDeleteContact: (contactToDelete: Contact) => Promise<{ success: boolean; error?: unknown }>;
  validateContactSelection: (contact: Contact | null, showError: (msg: string) => void) => boolean;
  triggerRefresh: () => void;
}

/**
 * Return type of useContactsByClient hook
 */
export interface UseContactsByClientReturn {
  contacts: Contact[];
  loading: boolean;
  error: ApiError | null;
  clearError: () => void;
}

/**
 * Generic API response interface wrapping data and error
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type ContactAuditLog = {
  id: number;
  user_id: number | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | string;
  verb: string | null;
  resource_type: string | null;
  resource_id: string | null;
  old_values: unknown;
  new_values: unknown;
  summary: string | null;
  timestamp: string;
  occurred_at: string | null;
  actor_name: string | null;
};

export type ContactAuditLogResponse = {
  success: boolean;
  data: ContactAuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ContactAuditLogsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  contactId?: number | null;
  contactName?: string | null;
};
