export const VIEW_MODES = {
    TABLE: 'table',
    DEPARTMENT: 'department',
    CONTACTS: 'contacts'
};
export const DIALOG_MODES = {
    ADD: 'add',
    EDIT: 'edit'
};
export const getMenuItems = (setActiveView) => [
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
export const getContactMenuItems = (handleAddContact, handleEditContact, handleDeleteContact, selectedContact) => [
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
export const getEmptyContact = (clientId) => ({
    clientId,
    contactPersonName: '',
    email: '',
    phone: '',
    designation: ''
});
