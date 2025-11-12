import type { Contact } from '../types/contactTypes';

// Define VIEW_MODES type
export type ViewMode = 'table' | 'department' | 'contacts';

export const VIEW_MODES = {
  TABLE: 'table' as const,
  DEPARTMENT: 'department' as const,
  CONTACTS: 'contacts' as const
};

export const DIALOG_MODES = {
  ADD: 'add' as const,
  EDIT: 'edit' as const
};

// Type for PrimeReact menu items
interface MenuItem {
  label: string;
  icon: string;
  command?: () => void;
  disabled?: boolean;
}

export const getMenuItems = (setActiveView: (view: ViewMode) => void): MenuItem[] => [
  {
    label: 'View Department',
    icon: 'pi pi-building',
    command: () => setActiveView(VIEW_MODES.DEPARTMENT)
  },
  {
    label: 'View Contacts',
    icon: 'pi pi-users',
    command: () => setActiveView(VIEW_MODES.CONTACTS)
  }
];

export const getContactMenuItems = (
  handleAddContact: () => void,
  handleEditContact: () => void,
  handleDeleteContact: () => void,
  selectedContact: Contact | null
): MenuItem[] => [
  {
    label: 'Add Contact',
    icon: 'pi pi-plus',
    command: handleAddContact
  },
  {
    label: 'Edit Contact',
    icon: 'pi pi-pencil',
    command: handleEditContact,
    disabled: !selectedContact?.clientContactId
  },
  {
    label: 'Delete Contact',
    icon: 'pi pi-trash',
    command: handleDeleteContact,
    disabled: !selectedContact?.clientContactId
  }
];

export const getEmptyContact = (clientId: number): Contact => ({
  clientId,
  contactPersonName: '',
  email: '',
  phone: '',
  designation: ''
});