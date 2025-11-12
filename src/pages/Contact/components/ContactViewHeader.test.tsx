import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactViewHeader from '../components/contactViewHeader';
import type { Contact, Client } from '../types/contactTypes';

// --- Mocks ---

// Mocking the custom shared button components to isolate ContactViewHeader logic
vi.mock('../../../shared/AddButton', () => ({
  default: vi.fn(({ onClick }) => <button data-testid="add-button" onClick={onClick}>Add</button>),
}));

vi.mock('../../../shared/EditButton', () => ({
  default: vi.fn(({ onClick, disabled }) => (
    <button data-testid="edit-button" onClick={onClick} disabled={disabled}>Edit</button>
  )),
}));

vi.mock('../../../shared/DeleteButton', () => ({
  default: vi.fn(({ onClick, disabled }) => (
    <button data-testid="delete-button" onClick={onClick} disabled={disabled}>Delete</button>
  )),
}));

// Mock the PrimeReact Button component as it's used for the "Back" button
vi.mock('primereact/button', () => ({
  Button: vi.fn(({ label, onClick, icon, disabled }) => (
    <button data-testid="pr-button" onClick={onClick} disabled={disabled}>
      {icon} {label}
    </button>
  )),
}));


// --- Setup Data ---

// FIX: Removed 'name' property as it does not exist on type 'Client'.
const mockClient: Client = { clientId: 1 } as Client;

const mockContact: Contact = {
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
    render(<ContactViewHeader {...baseProps} />);
    // FIX: Use regex matcher to handle potential extra content (like the icon text) in the mocked button
    expect(screen.getByText(/Back to Clients/i)).toBeInTheDocument();
  });

  it('renders Add, Edit, and Delete buttons', () => {
    render(<ContactViewHeader {...baseProps} />);
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  // --- Interaction Tests (Selected Contact) ---

  it('calls onBackClick when the "Back to Clients" button is clicked', async () => {
    render(<ContactViewHeader {...baseProps} />);
    const user = userEvent.setup();

    // FIX: Use regex matcher for clicking the button
    await user.click(screen.getByText(/Back to Clients/i));
    expect(mockOnBackClick).toHaveBeenCalledTimes(1);
  });

  it('calls onAddContact when the Add button is clicked', async () => {
    render(<ContactViewHeader {...baseProps} />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('add-button'));
    expect(mockOnAddContact).toHaveBeenCalledTimes(1);
  });

  it('calls onEditContact when the Edit button is clicked (contact selected)', async () => {
    render(<ContactViewHeader {...baseProps} />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('edit-button'));
    expect(mockOnEditContact).toHaveBeenCalledTimes(1);
  });

  it('calls onDeleteContact when the Delete button is clicked (contact selected)', async () => {
    render(<ContactViewHeader {...baseProps} />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('delete-button'));
    expect(mockOnDeleteContact).toHaveBeenCalledTimes(1);
  });

  // --- Conditional Disabling Tests ---

  it('Edit and Delete buttons are ENABLED when a contact is selected (has clientContactId)', () => {
    // Uses baseProps setup where mockContact is selected
    render(<ContactViewHeader {...baseProps} />);
    
    // Check if the disabled prop passed to the mock components is false
    expect(screen.getByTestId('edit-button')).not.toBeDisabled();
    expect(screen.getByTestId('delete-button')).not.toBeDisabled();
  });

  it('Edit and Delete buttons are DISABLED when selectedContact is null', () => {
    render(<ContactViewHeader {...baseProps} selectedContact={null} />);

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
    render(<ContactViewHeader {...baseProps} selectedContact={contactWithoutId as any} />);

    // Check if the disabled prop passed to the mock components is true
    expect(screen.getByTestId('edit-button')).toBeDisabled();
    expect(screen.getByTestId('delete-button')).toBeDisabled();
  });
});
