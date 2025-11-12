import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactTable from '../components/contactTable';
// Mock PrimeReact components
vi.mock('primereact/datatable', () => ({
    DataTable: ({ children, value, loading, emptyMessage, onPage, onSelectionChange, onRowDoubleClick, selection }) => {
        return (_jsx("div", { "data-testid": "datatable", children: loading ? (_jsx("div", { children: emptyMessage })) : value && value.length > 0 ? (_jsxs(_Fragment, { children: [children, _jsx("button", { onClick: () => onPage && onPage({ rows: 10, first: 0, page: 1 }), "data-testid": "page-change-btn", children: "Change Page" }), value.map((contact) => (_jsxs("div", { "data-testid": `contact-row-${contact.clientContactId}`, style: {
                            backgroundColor: selection?.clientContactId === contact.clientContactId ? 'lightblue' : 'transparent'
                        }, children: [_jsx("button", { "data-testid": `select-btn-${contact.clientContactId}`, onClick: () => onSelectionChange && onSelectionChange({ value: contact }), children: "Select" }), _jsx("button", { "data-testid": `dblclick-btn-${contact.clientContactId}`, onClick: () => onRowDoubleClick && onRowDoubleClick({ data: contact }), children: "Double Click" }), _jsx("button", { "data-testid": `dblclick-no-data-btn-${contact.clientContactId}`, onClick: () => onRowDoubleClick && onRowDoubleClick({ data: null }), children: "Double Click No Data" }), _jsx("span", { "data-testid": `contact-id-${contact.clientContactId}`, children: contact.clientContactId }), _jsxs("div", { "data-testid": `contact-person-${contact.clientContactId}`, children: [_jsx("div", { children: contact.contactPersonName }), _jsx("div", { children: contact.email })] }), _jsxs("div", { "data-testid": `designation-${contact.clientContactId}`, children: [_jsx("div", { children: contact.designation }), _jsx("div", { children: contact.phone })] })] }, contact.clientContactId)))] })) : (_jsx("div", { children: emptyMessage })) }));
    }
}));
vi.mock('primereact/column', () => ({
    Column: ({ field, header }) => (_jsx("div", { "data-testid": `column-${field || 'selection'}`, children: header }))
}));
describe('ContactTable', () => {
    const mockContacts = [
        {
            clientContactId: 1,
            contactPersonName: 'John Doe',
            email: 'john@example.com',
            designation: 'Manager',
            phone: '1234567890',
            clientId: 1
        },
        {
            clientContactId: 2,
            contactPersonName: 'Jane Smith',
            email: 'jane@example.com',
            designation: 'Director',
            phone: '0987654321',
            clientId: 1
        }
    ];
    const mockOnSelectionChange = vi.fn();
    const mockOnRowDoubleClick = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders the contact table with contacts', () => {
        render(_jsx(ContactTable, { contacts: mockContacts, loading: false, selectedContact: null, onSelectionChange: mockOnSelectionChange, onRowDoubleClick: mockOnRowDoubleClick }));
        expect(screen.getByTestId('datatable')).toBeInTheDocument();
        expect(screen.getByTestId('contact-row-1')).toBeInTheDocument();
        expect(screen.getByTestId('contact-row-2')).toBeInTheDocument();
    });
    it('displays loading message when loading', () => {
        render(_jsx(ContactTable, { contacts: [], loading: true, selectedContact: null, onSelectionChange: mockOnSelectionChange, onRowDoubleClick: mockOnRowDoubleClick }));
        expect(screen.getByText('Loading contacts...')).toBeInTheDocument();
    });
    it('displays empty message when no contacts', () => {
        render(_jsx(ContactTable, { contacts: [], loading: false, selectedContact: null, onSelectionChange: mockOnSelectionChange, onRowDoubleClick: mockOnRowDoubleClick }));
        expect(screen.getByText('No contacts found.')).toBeInTheDocument();
    });
    it('renders contact person template correctly', () => {
        render(_jsx(ContactTable, { contacts: mockContacts, loading: false, selectedContact: null, onSelectionChange: mockOnSelectionChange, onRowDoubleClick: mockOnRowDoubleClick }));
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
    it('renders designation template correctly', () => {
        render(_jsx(ContactTable, { contacts: mockContacts, loading: false, selectedContact: null, onSelectionChange: mockOnSelectionChange, onRowDoubleClick: mockOnRowDoubleClick }));
        expect(screen.getByText('Manager')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
    });
    it('calls onSelectionChange when row is selected', async () => {
        const user = userEvent.setup();
        render(_jsx(ContactTable, { contacts: mockContacts, loading: false, selectedContact: null, onSelectionChange: mockOnSelectionChange, onRowDoubleClick: mockOnRowDoubleClick }));
        await user.click(screen.getByTestId('select-btn-1'));
        await waitFor(() => {
            expect(mockOnSelectionChange).toHaveBeenCalledWith(mockContacts[0]);
            expect(mockOnSelectionChange).toHaveBeenCalledTimes(1);
        });
    });
    it('does not call onSelectionChange when callback is not provided', async () => {
        const user = userEvent.setup();
        render(_jsx(ContactTable, { contacts: mockContacts, loading: false, onSelectionChange: undefined, selectedContact: null, onRowDoubleClick: mockOnRowDoubleClick }));
        await user.click(screen.getByTestId('select-btn-1'));
        expect(mockOnSelectionChange).not.toHaveBeenCalled();
    });
    it('calls onRowDoubleClick when row is double clicked with data', async () => {
        const user = userEvent.setup();
        render(_jsx(ContactTable, { contacts: mockContacts, loading: false, selectedContact: null, onSelectionChange: mockOnSelectionChange, onRowDoubleClick: mockOnRowDoubleClick }));
        await user.click(screen.getByTestId('dblclick-btn-1'));
        await waitFor(() => {
            expect(mockOnRowDoubleClick).toHaveBeenCalledWith(mockContacts[0]);
            expect(mockOnRowDoubleClick).toHaveBeenCalledTimes(1);
        });
    });
    it('does not call onRowDoubleClick when data is null', async () => {
        const user = userEvent.setup();
        render(_jsx(ContactTable, { contacts: mockContacts, loading: false, selectedContact: null, onSelectionChange: mockOnSelectionChange, onRowDoubleClick: mockOnRowDoubleClick }));
        await user.click(screen.getByTestId('dblclick-no-data-btn-1'));
        expect(mockOnRowDoubleClick).not.toHaveBeenCalled();
    });
    it('does not call onRowDoubleClick when callback is not provided', async () => {
        const user = userEvent.setup();
        render(_jsx(ContactTable, { contacts: mockContacts, loading: false, onRowDoubleClick: undefined, selectedContact: null, onSelectionChange: mockOnSelectionChange }));
        await user.click(screen.getByTestId('dblclick-btn-1'));
        expect(mockOnRowDoubleClick).not.toHaveBeenCalled();
    });
    it('handles page change and updates rows per page', async () => {
        const user = userEvent.setup();
        render(_jsx(ContactTable, { contacts: mockContacts, loading: false, selectedContact: null, onSelectionChange: mockOnSelectionChange, onRowDoubleClick: mockOnRowDoubleClick }));
        await user.click(screen.getByTestId('page-change-btn'));
        expect(screen.getByTestId('datatable')).toBeInTheDocument();
    });
    it('highlights selected contact', () => {
        render(_jsx(ContactTable, { contacts: mockContacts, loading: false, selectedContact: mockContacts[0], onSelectionChange: mockOnSelectionChange, onRowDoubleClick: mockOnRowDoubleClick }));
        const selectedRow = screen.getByTestId('contact-row-1');
        const unselectedRow = screen.getByTestId('contact-row-2');
        expect(selectedRow.style.backgroundColor).toBe('lightblue');
        expect(unselectedRow.style.backgroundColor).toBe('transparent');
    });
    it('uses default values for optional props', () => {
        render(_jsx(ContactTable, { contacts: [], selectedContact: null, loading: false, onSelectionChange: undefined, onRowDoubleClick: undefined }));
        expect(screen.getByText('No contacts found.')).toBeInTheDocument();
    });
});
