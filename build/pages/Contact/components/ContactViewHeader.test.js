import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactViewHeader from '../components/contactViewHeader';
// --- Mocks ---
// Mocking the custom shared button components to isolate ContactViewHeader logic
vi.mock('../../../shared/AddButton', () => ({
    default: vi.fn(({ onClick }) => _jsx("button", { "data-testid": "add-button", onClick: onClick, children: "Add" })),
}));
vi.mock('../../../shared/EditButton', () => ({
    default: vi.fn(({ onClick, disabled }) => (_jsx("button", { "data-testid": "edit-button", onClick: onClick, disabled: disabled, children: "Edit" }))),
}));
vi.mock('../../../shared/DeleteButton', () => ({
    default: vi.fn(({ onClick, disabled }) => (_jsx("button", { "data-testid": "delete-button", onClick: onClick, disabled: disabled, children: "Delete" }))),
}));
// Mock the PrimeReact Button component as it's used for the "Back" button
vi.mock('primereact/button', () => ({
    Button: vi.fn(({ label, onClick, icon, disabled }) => (_jsxs("button", { "data-testid": "pr-button", onClick: onClick, disabled: disabled, children: [icon, " ", label] }))),
}));
// --- Setup Data ---
// FIX: Removed 'name' property as it does not exist on type 'Client'.
const mockClient = { clientId: 1 };
const mockContact = {
    clientContactId: 101,
    clientId: 1,
    contactPersonName: 'John Doe',
    designation: 'Manager',
    phone: '1234567890',
    email: 'john@doe.com',
};
const mockOnBackClick = vi.fn();
const mockOnAddContact = vi.fn();
const mockOnEditContact = vi.fn();
const mockOnDeleteContact = vi.fn();
const baseProps = {
    onBackClick: mockOnBackClick,
    selectedClient: mockClient,
    onAddContact: mockOnAddContact,
    selectedContact: mockContact, // Start with a selected contact
    onEditContact: mockOnEditContact,
    onDeleteContact: mockOnDeleteContact,
};
describe('ContactViewHeader Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    // --- Rendering and Initial State Tests ---
    it('renders the "Back to Clients" button', () => {
        render(_jsx(ContactViewHeader, { ...baseProps }));
        // FIX: Use regex matcher to handle potential extra content (like the icon text) in the mocked button
        expect(screen.getByText(/Back to Clients/i)).toBeInTheDocument();
    });
    it('renders Add, Edit, and Delete buttons', () => {
        render(_jsx(ContactViewHeader, { ...baseProps }));
        expect(screen.getByTestId('add-button')).toBeInTheDocument();
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
        expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });
    // --- Interaction Tests (Selected Contact) ---
    it('calls onBackClick when the "Back to Clients" button is clicked', async () => {
        render(_jsx(ContactViewHeader, { ...baseProps }));
        const user = userEvent.setup();
        // FIX: Use regex matcher for clicking the button
        await user.click(screen.getByText(/Back to Clients/i));
        expect(mockOnBackClick).toHaveBeenCalledTimes(1);
    });
    it('calls onAddContact when the Add button is clicked', async () => {
        render(_jsx(ContactViewHeader, { ...baseProps }));
        const user = userEvent.setup();
        await user.click(screen.getByTestId('add-button'));
        expect(mockOnAddContact).toHaveBeenCalledTimes(1);
    });
    it('calls onEditContact when the Edit button is clicked (contact selected)', async () => {
        render(_jsx(ContactViewHeader, { ...baseProps }));
        const user = userEvent.setup();
        await user.click(screen.getByTestId('edit-button'));
        expect(mockOnEditContact).toHaveBeenCalledTimes(1);
    });
    it('calls onDeleteContact when the Delete button is clicked (contact selected)', async () => {
        render(_jsx(ContactViewHeader, { ...baseProps }));
        const user = userEvent.setup();
        await user.click(screen.getByTestId('delete-button'));
        expect(mockOnDeleteContact).toHaveBeenCalledTimes(1);
    });
    // --- Conditional Disabling Tests ---
    it('Edit and Delete buttons are ENABLED when a contact is selected (has clientContactId)', () => {
        // Uses baseProps setup where mockContact is selected
        render(_jsx(ContactViewHeader, { ...baseProps }));
        // Check if the disabled prop passed to the mock components is false
        expect(screen.getByTestId('edit-button')).not.toBeDisabled();
        expect(screen.getByTestId('delete-button')).not.toBeDisabled();
    });
    it('Edit and Delete buttons are DISABLED when selectedContact is null', () => {
        render(_jsx(ContactViewHeader, { ...baseProps, selectedContact: null }));
        // Check if the disabled prop passed to the mock components is true
        expect(screen.getByTestId('edit-button')).toBeDisabled();
        expect(screen.getByTestId('delete-button')).toBeDisabled();
        // Verify clicks do not trigger handlers when disabled
        const user = userEvent.setup();
        user.click(screen.getByTestId('edit-button'));
        user.click(screen.getByTestId('delete-button'));
        expect(mockOnEditContact).not.toHaveBeenCalled();
        expect(mockOnDeleteContact).not.toHaveBeenCalled();
    });
    it('Edit and Delete buttons are DISABLED when selectedContact has no clientContactId', () => {
        const contactWithoutId = { ...mockContact, clientContactId: undefined };
        render(_jsx(ContactViewHeader, { ...baseProps, selectedContact: contactWithoutId }));
        // Check if the disabled prop passed to the mock components is true
        expect(screen.getByTestId('edit-button')).toBeDisabled();
        expect(screen.getByTestId('delete-button')).toBeDisabled();
    });
});
