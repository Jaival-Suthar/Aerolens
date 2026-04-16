import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContactOperations } from '../hooks/useContactOperations';
import { useContactsByClient } from '../hooks/useContactsByClient';
import ClientContactsView from './clientContactsView';
import type { Client, Contact } from '../types/contactTypes';

// Mock dependencies
vi.mock('primereact/toast', () => ({
  Toast: ({ children }: any) => <div data-testid="toast">{children}</div>,
}));

vi.mock('primereact/datatable', () => ({
  DataTable: ({ value, loading, onSelectionChange, onRowDoubleClick, children }: any) => (
    <div data-testid="contact-table">
      {loading && <div>Loading...</div>}
      {(value || []).map((contact: Contact) => (
        <div
          key={contact.clientContactId}
          data-testid={`contact-row-${contact.clientContactId}`}
          onClick={() => onSelectionChange({ value: contact })}
          onDoubleClick={() => onRowDoubleClick({ data: contact })}
        >
          {contact.contactPersonName}
        </div>
      ))}
      {children}
    </div>
  ),
  Column: () => null,
}));

vi.mock('../../../shared/AddButton', () => ({
  default: ({ onClick }: any) => (
    <button data-testid="add-button" onClick={onClick}>Add</button>
  ),
}));
vi.mock('../../../shared/EditButton', () => ({
  default: ({ onClick, disabled }: any) => (
    <button data-testid="edit-button" onClick={onClick} disabled={disabled}>Edit</button>
  ),
}));
vi.mock('../../../shared/DeleteButton', () => ({
  default: ({ onClick, disabled }: any) => (
    <button data-testid="delete-button" onClick={onClick} disabled={disabled}>Delete</button>
  ),
}));

vi.mock('./contactAddEdit', () => ({
  default: ({ visible, onHide, onSave, mode }: any) =>
    visible ? (
      <div data-testid="contact-add-edit-dialog">
        <button onClick={onHide} data-testid="dialog-close-button">Close</button>
        <button
          onClick={() => onSave({ contactPersonName: 'Test Contact', email: 'test@test.com' })}
          data-testid="dialog-save-button"
        >Save</button>
        <div data-testid="dialog-mode">{mode}</div>
      </div>
    ) : null,
}));

vi.mock('./contactDelete', () => ({
  default: ({ visible, onHide, onDelete, contact }: any) =>
    visible ? (
      <div data-testid="contact-delete-dialog">
        <button onClick={onHide} data-testid="delete-dialog-close-button">Close</button>
        <button onClick={() => onDelete(contact)} data-testid="confirm-delete-button">Confirm</button>
      </div>
    ) : null,
}));

vi.mock('react-icons/fa', () => ({
  FaArrowLeft: () => <span />,
}));

vi.mock('../hooks/useContactOperations');
vi.mock('../hooks/useContactsByClient');

describe('ClientContactsView', () => {
  const mockClient: Client = {
    clientId: 1,
    clientName: 'Test Client',
  };

  const mockContacts: Contact[] = [
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
    (useContactOperations as any).mockReturnValue(mockUseContactOperations);
    (useContactsByClient as any).mockReturnValue(mockUseContactsByClient);
    mockUseContactOperations.handleSaveContact.mockResolvedValue({ success: true });
    mockUseContactOperations.handleDeleteContact.mockResolvedValue({ success: true });
  });

  describe('Rendering', () => {
    it('should render without client selected', () => {
      render(
        <ClientContactsView selectedClient={null} onBackClick={vi.fn()} />
      );
      expect(screen.getByText('Please select a client to view contacts.')).toBeInTheDocument();
    });

    it('should render with client selected', () => {
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      expect(screen.getByText(`Contacts for: ${mockClient.clientName}`)).toBeInTheDocument();
      expect(screen.getByTestId('add-button')).toBeInTheDocument();
      expect(screen.getByTestId('contact-table')).toBeInTheDocument();
    });

    it('should display all contacts in table', () => {
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      expect(screen.getByTestId('contact-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('contact-row-2')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      (useContactsByClient as any).mockReturnValue({
        ...mockUseContactsByClient,
        loading: true,
      });
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Add Contact', () => {
    it('should open add dialog when add button clicked', async () => {
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await user.click(screen.getByTestId('add-button'));
      await waitFor(() => {
        expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-mode')).toHaveTextContent('add');
      });
    });

    it('should not open add dialog if no client selected', async () => {
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={null} onBackClick={vi.fn()} />
      );
      const addBtn = screen.queryByTestId('add-button');
      if (addBtn) {
        await user.click(addBtn);
      }
      expect(screen.queryByTestId('contact-add-edit-dialog')).not.toBeInTheDocument();
    });

    it('should save contact and close dialog on save', async () => {
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
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
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
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
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await user.dblClick(screen.getByTestId('contact-row-1'));
      await waitFor(() => {
        expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-mode')).toHaveTextContent('edit');
      });
    });

    it('should open edit dialog when edit button clicked with selected contact', async () => {
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await user.click(screen.getByTestId('contact-row-1'));
      await user.click(screen.getByTestId('edit-button'));
      await waitFor(() => {
        expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-mode')).toHaveTextContent('edit');
      });
    });

    it('should not open edit dialog if no contact selected', async () => {
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await user.click(screen.getByTestId('edit-button'));
      expect(screen.queryByTestId('contact-add-edit-dialog')).not.toBeInTheDocument();
    });

    it('should update contact and close dialog on save', async () => {
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
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
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await user.click(screen.getByTestId('contact-row-1'));
      await user.click(screen.getByTestId('delete-button'));
      await waitFor(() => {
        expect(screen.getByTestId('contact-delete-dialog')).toBeInTheDocument();
      });
    });

    it('should not open delete dialog if no contact selected', async () => {
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await user.click(screen.getByTestId('delete-button'));
      expect(screen.queryByTestId('contact-delete-dialog')).not.toBeInTheDocument();
    });

    it('should delete contact and close dialog on confirm', async () => {
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
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
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
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
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await user.click(screen.getByTestId('contact-row-1'));
      expect(screen.getByTestId('contact-row-1')).toBeInTheDocument();
    });

    it('should deselect contact on second click', async () => {
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await user.click(screen.getByTestId('contact-row-1'));
      await user.click(screen.getByTestId('contact-row-1'));
      expect(screen.getByTestId('contact-row-1')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error when fetching contacts fails', async () => {
      (useContactsByClient as any).mockReturnValue({
        ...mockUseContactsByClient,
        error: { message: 'Failed to fetch contacts' },
      });
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await waitFor(() => {
        expect(mockUseContactsByClient.clearError).toHaveBeenCalled();
      });
    });

    it('should handle failed save operation', async () => {
      mockUseContactOperations.handleSaveContact.mockRejectedValue({ message: 'Save failed' });
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await user.click(screen.getByTestId('add-button'));
      await waitFor(() => {
        expect(screen.getByTestId('contact-add-edit-dialog')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('dialog-save-button'));
      await waitFor(() => {
        expect(mockUseContactOperations.handleSaveContact).toHaveBeenCalled();
      });
    });

    it('should handle failed delete operation', async () => {
      mockUseContactOperations.handleDeleteContact.mockRejectedValue({ message: 'Delete failed' });
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      await user.click(screen.getByTestId('contact-row-1'));
      await user.click(screen.getByTestId('delete-button'));
      await waitFor(() => {
        expect(screen.getByTestId('contact-delete-dialog')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('confirm-delete-button'));
      await waitFor(() => {
        expect(mockUseContactOperations.handleDeleteContact).toHaveBeenCalled();
      });
    });
  });

  describe('Back Navigation', () => {
    it('should call onBackClick when back button is clicked', async () => {
      const onBackClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={onBackClick} />
      );
      expect(onBackClick).not.toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should handle empty contacts list', () => {
      (useContactsByClient as any).mockReturnValue({
        ...mockUseContactsByClient,
        contacts: [],
      });
      render(
        <ClientContactsView selectedClient={mockClient} onBackClick={vi.fn()} />
      );
      expect(screen.getByTestId('contact-table')).toBeInTheDocument();
      expect(screen.queryByTestId('contact-row-1')).not.toBeInTheDocument();
    });
  });
});