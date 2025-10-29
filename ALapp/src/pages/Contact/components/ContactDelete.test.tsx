import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactDelete from '../components/contactDelete';
import type { Contact } from '../types/contactTypes';

// --- Mocks ---

// Mock PrimeReact Dialog to simplify testing visibility and structure
vi.mock('primereact/dialog', () => ({
  Dialog: vi.fn(({ children, visible, header, footer, onHide }) => (
    <div data-testid="mock-dialog" data-visible={visible ? 'true' : 'false'} data-header={header}>
      {/* Mock close button */}
      <button data-testid="dialog-close-button" onClick={onHide}>Close</button>
      {children}
      <div data-testid="dialog-footer-mock">{footer}</div>
    </div>
  )),
}));

// Mock the shared component to isolate ContactDelete logic
vi.mock('../../../shared/DialogDeleteButton', () => ({
  default: vi.fn(({ onCancel, onDelete }) => (
    <div data-testid="mock-delete-button-group">
      {/* Test Ids for interaction simulation */}
      <button data-testid="cancel-action-button" onClick={onCancel}>Cancel</button>
      <button data-testid="delete-action-button" onClick={onDelete}>Delete</button>
    </div>
  )),
}));

// --- Setup Data ---

const mockContact: Contact = {
  clientContactId: 101,
  clientId: 5,
  contactPersonName: 'Alice Johnson',
  designation: 'CTO',
  phone: '0987654321',
  email: 'alice@example.com',
};

const mockOnHide = vi.fn();
const mockOnDelete = vi.fn();

const defaultProps = {
  visible: true,
  onHide: mockOnHide,
  onDelete: mockOnDelete,
  contact: mockContact,
};

describe('ContactDelete Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Visibility and Basic Structure Tests ---

  it('renders the Dialog with the correct header when visible is true', () => {
    render(<ContactDelete {...defaultProps} />);

    // Check mock Dialog header and visibility attribute
    expect(screen.getByTestId('mock-dialog')).toHaveAttribute('data-visible', 'true');
    expect(screen.getByTestId('mock-dialog')).toHaveAttribute('data-header', 'Confirm Delete');
  });

  it('does not render the Dialog content when visible is false', () => {
    render(<ContactDelete {...defaultProps} visible={false} />);

    // Check mock Dialog visibility attribute
    expect(screen.getByTestId('mock-dialog')).toHaveAttribute('data-visible', 'false');
  });

  // --- Content Display Tests ---

  it('displays the confirmation message and all contact details when a contact is provided', () => {
    render(<ContactDelete {...defaultProps} />);

    // Check confirmation text using the contact's name
    expect(screen.getByText(/Are you sure you want to delete contact/i)).toBeInTheDocument();
    
    // FIX: 'Alice Johnson' appears twice. Use getAllByText and check the count to avoid the multiple elements error.
    expect(screen.getAllByText('Alice Johnson')).toHaveLength(2); 

    // Check details block. We can check for parts of the descriptive text.
    expect(screen.getByText('Designation:')).toBeInTheDocument();
    expect(screen.getByText(/CTO/i)).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
    expect(screen.getByText('Phone:')).toBeInTheDocument();
    expect(screen.getByText(/0987654321/i)).toBeInTheDocument();
  });

  it('displays the placeholder text "this contact" when contact is null', () => {
    render(<ContactDelete {...defaultProps} contact={null} />);

    // Check placeholder text
    expect(screen.getByText('this contact')).toBeInTheDocument();

    // Check that the details block is absent
    expect(screen.queryByText('Designation:')).not.toBeInTheDocument();
  });

  // --- Action and Callback Tests ---

  it('calls onDelete with the correct contact object when the Delete button is clicked', async () => {
    render(<ContactDelete {...defaultProps} />);
    const user = userEvent.setup();

    const deleteButton = screen.getByTestId('delete-action-button');
    await user.click(deleteButton);

    // Verify onDelete was called once with the mock contact
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockContact);
  });
  
  it('does not call onDelete if contact is null', async () => {
    render(<ContactDelete {...defaultProps} contact={null} />);
    const user = userEvent.setup();

    const deleteButton = screen.getByTestId('delete-action-button');
    await user.click(deleteButton);

    // Verify onDelete was not called
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('calls onHide when the Cancel button is clicked', async () => {
    render(<ContactDelete {...defaultProps} />);
    const user = userEvent.setup();

    const cancelButton = screen.getByTestId('cancel-action-button');
    await user.click(cancelButton);

    // Verify onHide was called
    expect(mockOnHide).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('calls onHide when the Dialog close button (X) is clicked', async () => {
    render(<ContactDelete {...defaultProps} />);
    const user = userEvent.setup();

    // The close button is part of the mocked Dialog component
    const closeButton = screen.getByTestId('dialog-close-button');
    await user.click(closeButton);

    // Verify onHide was called
    expect(mockOnHide).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});
