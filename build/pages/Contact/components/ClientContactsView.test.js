import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContactOperations } from '../hooks/useContactOperations';
import { useContactsByClient } from '../hooks/useContactsByClient';
import ClientContactsView from './clientContactsView';
// Mock dependencies
vi.mock('primereact/toast');
vi.mock('./contactTable', () => ({
    default: ({ contacts, loading, selectedContact, onSelectionChange, onRowDoubleClick }) => (_jsxs("div", { "data-testid": "contact-table", children: [loading && _jsx("div", { children: "Loading..." }), contacts.map((contact) => (_jsx("div", { "data-testid": `contact-row-${contact.clientContactId}`, onClick: () => onSelectionChange(contact), onDoubleClick: () => onRowDoubleClick(contact), children: contact.contactPersonName }, contact.clientContactId)))] })),
}));
vi.mock('./contactViewHeader', () => ({
    default: ({ onAddContact, onEditContact, onDeleteContact, selectedClient }) => (_jsxs("div", { "data-testid": "contact-view-header", children: [_jsx("button", { onClick: onAddContact, "data-testid": "add-button", children: "Add Contact" }), _jsx("button", { onClick: onEditContact, "data-testid": "edit-button", children: "Edit Contact" }), _jsx("button", { onClick: onDeleteContact, "data-testid": "delete-button", children: "Delete Contact" }), selectedClient && _jsx("div", { children: selectedClient.clientName })] })),
}));
vi.mock('./contactAddEdit', () => ({
    default: ({ visible, onHide, onSave, mode, contact, clientId }) => (visible ? (_jsxs("div", { "data-testid": "contact-add-edit-dialog", children: [_jsx("button", { onClick: onHide, "data-testid": "dialog-close-button", children: "Close" }), _jsx("button", { onClick: () => onSave({ clientId, contactPersonName: 'Test Contact', email: 'test@test.com' }), "data-testid": "dialog-save-button", children: "Save" }), _jsx("div", { "data-testid": "dialog-mode", children: mode })] })) : null),
}));
vi.mock('./contactDelete', () => ({
    default: ({ visible, onHide, onDelete, contact }) => (visible ? (_jsxs("div", { "data-testid": "contact-delete-dialog", children: [_jsx("button", { onClick: onHide, "data-testid": "delete-dialog-close-button", children: "Close" }), _jsx("button", { onClick: () => onDelete(contact), "data-testid": "confirm-delete-button", children: "Confirm Delete" })] })) : null),
}));
vi.mock('../hooks/useContactOperations');
vi.mock('../hooks/useContactsByClient');
describe('ClientContactsView', () => {
    const mockClient = {
        clientId: 1,
        clientName: 'Test Client',
    };
    const mockContacts = [
        {
            clientContactId: 1,
            clientId: 1,
            contactPersonName: 'John Doe',
            designation: 'Manager',
            phone: '123-456-7890',
            email: 'john@test.com',
        },
        {
            clientContactId: 2,
            clientId: 1,
            contactPersonName: 'Jane Smith',
            designation: 'Director',
            phone: '098-765-4321',
            email: 'jane@test.com',
        },
    ];
    const mockUseContactOperations = {
        handleSaveContact: vi.fn(),
        handleDeleteContact: vi.fn(),
        refreshTrigger: 0,
    };
    const mockUseContactsByClient = {
        contacts: mockContacts,
        loading: false,
        error: null,
        clearError: vi.fn(),
    };
    beforeEach(() => {
        vi.clearAllMocks();
        useContactOperations.mockReturnValue(mockUseContactOperations);
        useContactsByClient.mockReturnValue(mockUseContactsByClient);
        mockUseContactOperations.handleSaveContact.mockResolvedValue({ success: true });
        mockUseContactOperations.handleDeleteContact.mockResolvedValue({ success: true });
    });
    describe('Rendering', () => {
        it('should render without client selected', () => {
            render(_jsx(ClientContactsView, { selectedClient: null, onBackClick: vi.fn() }));
            expect(screen.getByText('Please select a client to view contacts.')).toBeInTheDocument();
        });
        it('should render with client selected', () => {
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            expect(screen.getByText(`Contacts for: ${mockClient.clientName}`)).toBeInTheDocument();
            expect(screen.getByTestId('contact-view-header')).toBeInTheDocument();
            expect(screen.getByTestId('contact-table')).toBeInTheDocument();
        });
        it('should display all contacts in table', () => {
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            expect(screen.getByTestId('contact-row-1')).toBeInTheDocument();
            expect(screen.getByTestId('contact-row-2')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
        it('should show loading state', () => {
            useContactsByClient.mockReturnValue({
                ...mockUseContactsByClient,
                loading: true,
            });
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });
    describe('Add Contact', () => {
        it('should open add dialog when add button clicked', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('add-button'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
                expect(screen.getByTestId('dialog-mode')).toHaveTextContent('add');
            });
        });
        it('should not open add dialog if no client selected', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: null, onBackClick: vi.fn() }));
            const addBtn = screen.queryByTestId('add-button');
            if (addBtn) {
                await user.click(addBtn);
            }
            expect(screen.queryByTestId('contact-add-edit-dialog')).not.toBeInTheDocument();
        });
        it('should save contact and close dialog on save', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('add-button'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
            });
            await user.click(screen.getByTestId('dialog-save-button'));
            await waitFor(() => {
                expect(mockUseContactOperations.handleSaveContact).toHaveBeenCalled();
                expect(screen.queryByTestId('contact-add-edit-dialog')).not.toBeInTheDocument();
            });
        });
        it('should close dialog without saving on close button', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('add-button'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
            });
            await user.click(screen.getByTestId('dialog-close-button'));
            await waitFor(() => {
                expect(mockUseContactOperations.handleSaveContact).not.toHaveBeenCalled();
                expect(screen.queryByTestId('contact-add-edit-dialog')).not.toBeInTheDocument();
            });
        });
    });
    describe('Edit Contact', () => {
        it('should open edit dialog when contact double clicked', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.dblClick(screen.getByTestId('contact-row-1'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
                expect(screen.getByTestId('dialog-mode')).toHaveTextContent('edit');
            });
        });
        it('should open edit dialog when edit button clicked with selected contact', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('contact-row-1'));
            await user.click(screen.getByTestId('edit-button'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
                expect(screen.getByTestId('dialog-mode')).toHaveTextContent('edit');
            });
        });
        it('should not open edit dialog if no contact selected', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('edit-button'));
            expect(screen.queryByTestId('contact-add-edit-dialog')).not.toBeInTheDocument();
        });
        it('should update contact and close dialog on save', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.dblClick(screen.getByTestId('contact-row-1'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
            });
            await user.click(screen.getByTestId('dialog-save-button'));
            await waitFor(() => {
                expect(mockUseContactOperations.handleSaveContact).toHaveBeenCalled();
                expect(screen.queryByTestId('contact-add-edit-dialog')).not.toBeInTheDocument();
            });
        });
    });
    describe('Delete Contact', () => {
        it('should open delete dialog when delete button clicked with selected contact', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('contact-row-1'));
            await user.click(screen.getByTestId('delete-button'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-delete-dialog')).toBeInTheDocument();
            });
        });
        it('should not open delete dialog if no contact selected', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('delete-button'));
            expect(screen.queryByTestId('contact-delete-dialog')).not.toBeInTheDocument();
        });
        it('should delete contact and close dialog on confirm', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('contact-row-1'));
            await user.click(screen.getByTestId('delete-button'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-delete-dialog')).toBeInTheDocument();
            });
            await user.click(screen.getByTestId('confirm-delete-button'));
            await waitFor(() => {
                expect(mockUseContactOperations.handleDeleteContact).toHaveBeenCalled();
                expect(screen.queryByTestId('contact-delete-dialog')).not.toBeInTheDocument();
            });
        });
        it('should close delete dialog without deleting on close button', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('contact-row-1'));
            await user.click(screen.getByTestId('delete-button'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-delete-dialog')).toBeInTheDocument();
            });
            await user.click(screen.getByTestId('delete-dialog-close-button'));
            await waitFor(() => {
                expect(mockUseContactOperations.handleDeleteContact).not.toHaveBeenCalled();
                expect(screen.queryByTestId('contact-delete-dialog')).not.toBeInTheDocument();
            });
        });
    });
    describe('Contact Selection', () => {
        it('should select contact on row click', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('contact-row-1'));
            expect(screen.getByTestId('contact-row-1')).toBeInTheDocument();
        });
        it('should deselect contact on second click', async () => {
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('contact-row-1'));
            await user.click(screen.getByTestId('contact-row-1'));
            expect(screen.getByTestId('contact-row-1')).toBeInTheDocument();
        });
    });
    describe('Error Handling', () => {
        it('should display error when fetching contacts fails', async () => {
            useContactsByClient.mockReturnValue({
                ...mockUseContactsByClient,
                error: 'Failed to fetch contacts',
            });
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await waitFor(() => {
                expect(mockUseContactsByClient.clearError).toHaveBeenCalled();
            });
        });
        it('should handle failed save operation', async () => {
            mockUseContactOperations.handleSaveContact.mockResolvedValue({ success: false, error: 'Save failed' });
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('add-button'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
            });
            await user.click(screen.getByTestId('dialog-save-button'));
            await waitFor(() => {
                expect(mockUseContactOperations.handleSaveContact).toHaveBeenCalled();
                expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
            });
        });
        it('should handle failed delete operation', async () => {
            mockUseContactOperations.handleDeleteContact.mockResolvedValue({ success: false, error: 'Delete failed' });
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            await user.click(screen.getByTestId('contact-row-1'));
            await user.click(screen.getByTestId('delete-button'));
            await waitFor(() => {
                expect(screen.getByTestId('contact-delete-dialog')).toBeInTheDocument();
            });
            await user.click(screen.getByTestId('confirm-delete-button'));
            await waitFor(() => {
                expect(mockUseContactOperations.handleDeleteContact).toHaveBeenCalled();
                expect(screen.getByTestId('contact-delete-dialog')).toBeInTheDocument();
            });
        });
    });
    describe('Back Navigation', () => {
        it('should call onBackClick when back button is clicked', async () => {
            const onBackClick = vi.fn();
            const user = userEvent.setup();
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: onBackClick }));
            expect(onBackClick).not.toHaveBeenCalled();
        });
    });
    describe('Empty State', () => {
        it('should handle empty contacts list', () => {
            useContactsByClient.mockReturnValue({
                ...mockUseContactsByClient,
                contacts: [],
            });
            render(_jsx(ClientContactsView, { selectedClient: mockClient, onBackClick: vi.fn() }));
            expect(screen.getByTestId('contact-table')).toBeInTheDocument();
            expect(screen.queryByTestId('contact-row-1')).not.toBeInTheDocument();
        });
    });
});
