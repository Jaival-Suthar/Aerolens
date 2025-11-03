import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useContactOperations } from './useContactOperations';
import type { Contact, Client } from '../types/contactTypes';

// --- Mocks Setup ---

const mockCreateContact = vi.fn();
const mockUpdateContact = vi.fn();
const mockDeleteContact = vi.fn();

vi.mock('../../../shared/auth/AuthContext', () => ({
  useAuth: () => ({
    accessToken: 'mock-token-123'
  })
}));
// Mock the useContact hook dependency
vi.mock('../services/useContact', () => ({
  default: () => ({
    createContact: mockCreateContact,
    updateContact: mockUpdateContact,
    deleteContact: mockDeleteContact,
  }),
}));

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

// --- Test Data ---

const MOCK_CLIENT: Client = { clientId: 1, clientName: 'Mock Client' };

const MOCK_CONTACT_PAYLOAD = {
  contactPersonName: 'John Doe',
  designation: 'Manager',
  phone: '555-1234',
  email: 'john@example.com',
};

const MOCK_EDIT_CONTACT = {
  clientContactId: 101,
  clientId: 1,
  contactPersonName: 'Jane Smith',
  designation: 'CEO',
} as Contact;

describe('useContactOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful API responses
    mockCreateContact.mockResolvedValue(true);
    mockUpdateContact.mockResolvedValue(true);
    mockDeleteContact.mockResolvedValue(true);
  });

  // Helper to render the hook
  const setupHook = () => renderHook(() => useContactOperations(mockShowSuccess, mockShowError));

  // --- 1. Refresh Trigger and Helper ---

  it('initializes refreshTrigger to 0 and increments it when triggerRefresh is called', () => {
    const { result } = setupHook();
    
    expect(result.current.refreshTrigger).toBe(0);

    act(() => {
      result.current.triggerRefresh();
    });

    expect(result.current.refreshTrigger).toBe(1);

    act(() => {
      result.current.triggerRefresh();
    });

    expect(result.current.refreshTrigger).toBe(2);
  });

  // --- 2. handleSaveContact - ADD Mode ---

  describe('handleSaveContact - ADD Mode', () => {
    it('successfully calls createContact, shows success, and refreshes', async () => {
  const { result } = setupHook();
  
  const response = await act(() =>
    result.current.handleSaveContact(MOCK_CONTACT_PAYLOAD, 'add', MOCK_CLIENT)
  );

  expect(response.success).toBe(true);
  expect(mockCreateContact).toHaveBeenCalledWith(
    'mock-token-123',  // ✅ Add token as first param
    {
      ...MOCK_CONTACT_PAYLOAD,
      clientId: MOCK_CLIENT.clientId,
    }
  );
  expect(mockShowSuccess).toHaveBeenCalledWith('Contact added successfully');
  expect(result.current.refreshTrigger).toBe(1); 
});

    it('returns success: false and shows error on createContact failure', async () => {
      const errorMessage = 'API error during create.';
      mockCreateContact.mockRejectedValue(new Error(errorMessage));
      const { result } = setupHook();

      const response = await act(() =>
        result.current.handleSaveContact(MOCK_CONTACT_PAYLOAD, 'add', MOCK_CLIENT)
      );

      expect(response.success).toBe(false);
      expect(mockShowError).toHaveBeenCalledWith(errorMessage);
      expect(result.current.refreshTrigger).toBe(0); // Refresh should not be triggered
    });

    it('shows error if client ID is missing in ADD mode', async () => {
      const { result } = setupHook();

      const response = await act(() =>
        result.current.handleSaveContact(MOCK_CONTACT_PAYLOAD, 'add', null)
      );

      expect(response.success).toBe(false);
      expect(mockShowError).toHaveBeenCalledWith('Client ID is required for adding a contact');
      expect(mockCreateContact).not.toHaveBeenCalled();
    });
  });

  // --- 3. handleSaveContact - EDIT Mode ---

  describe('handleSaveContact - EDIT Mode', () => {
    const UPDATE_PAYLOAD = {
      clientContactId: MOCK_EDIT_CONTACT.clientContactId,
      designation: 'VP of Sales', // Only updated field
    };

    it('successfully calls updateContact, shows success, and refreshes', async () => {
  const { result } = setupHook();
  
  const response = await act(() =>
    result.current.handleSaveContact(UPDATE_PAYLOAD, 'edit', MOCK_CLIENT)
  );

  expect(response.success).toBe(true);
  expect(mockUpdateContact).toHaveBeenCalledWith(
    'mock-token-123',  // ✅ Add token as first param
    {
      clientContactId: MOCK_EDIT_CONTACT.clientContactId,
      designation: 'VP of Sales',
      clientId: MOCK_CLIENT.clientId,
    }
  );
  expect(mockShowSuccess).toHaveBeenCalledWith('Contact updated successfully');
  expect(result.current.refreshTrigger).toBe(1);
});

it('handles backwards compatibility using contactId fallback', async () => {
  const { result } = setupHook();
  const payloadWithContactId = {
    contactId: 99,
    designation: 'Old School',
  };
  
  await act(() =>
    result.current.handleSaveContact(payloadWithContactId, 'edit', MOCK_CLIENT)
  );

  expect(mockUpdateContact).toHaveBeenCalledWith(
    'mock-token-123',  // ✅ Add token as first param
    expect.objectContaining({ clientContactId: 99 })
  );
});

    it('returns success: false and shows error on updateContact failure', async () => {
      const errorMessage = 'API error during update.';
      mockUpdateContact.mockRejectedValue(new Error(errorMessage));
      const { result } = setupHook();

      const response = await act(() =>
        result.current.handleSaveContact(UPDATE_PAYLOAD, 'edit', MOCK_CLIENT)
      );

      expect(response.success).toBe(false);
      expect(mockShowError).toHaveBeenCalledWith(errorMessage);
      expect(result.current.refreshTrigger).toBe(0);
    });

    it('shows error if Contact ID is missing in EDIT mode', async () => {
      const { result } = setupHook();
      const invalidPayload = { designation: 'Tester' };

      const response = await act(() =>
        result.current.handleSaveContact(invalidPayload, 'edit', MOCK_CLIENT)
      );

      expect(response.success).toBe(false);
      expect(mockShowError).toHaveBeenCalledWith('Contact ID is required for update operation');
      expect(mockUpdateContact).not.toHaveBeenCalled();
    });
  });

  // --- 4. handleDeleteContact ---

  describe('handleDeleteContact', () => {
    it('successfully calls deleteContact, shows success, and refreshes', async () => {
  const { result } = setupHook();
  
  const response = await act(() =>
    result.current.handleDeleteContact(MOCK_EDIT_CONTACT)
  );

  expect(response.success).toBe(true);
  expect(mockDeleteContact).toHaveBeenCalledWith(
    'mock-token-123',  // ✅ Add token as first param
    MOCK_EDIT_CONTACT.clientContactId
  );
  expect(mockShowSuccess).toHaveBeenCalledWith('Contact deleted successfully');
  expect(result.current.refreshTrigger).toBe(1);
});

    it('returns success: false and shows error on deleteContact failure', async () => {
      const errorMessage = 'API error during delete.';
      mockDeleteContact.mockRejectedValue(new Error(errorMessage));
      const { result } = setupHook();

      const response = await act(() =>
        result.current.handleDeleteContact(MOCK_EDIT_CONTACT)
      );

      expect(response.success).toBe(false);
      expect(mockShowError).toHaveBeenCalledWith(errorMessage);
      expect(result.current.refreshTrigger).toBe(0);
    });

    it('shows error if Contact ID is missing in DELETE operation', async () => {
      const { result } = setupHook();
      const contactWithoutId = {
        clientId: 1,
        contactPersonName: 'Invalid',
      } as Contact;

      const response = await act(() =>
        result.current.handleDeleteContact(contactWithoutId)
      );

      expect(response.success).toBe(false);
      expect(mockShowError).toHaveBeenCalledWith('Contact ID is required for deletion operation');
      expect(mockDeleteContact).not.toHaveBeenCalled();
    });
  });

  // --- 5. validateContactSelection ---

  describe('validateContactSelection', () => {
    it('returns true for a valid selected contact', () => {
      const { result } = setupHook();
      const isValid = result.current.validateContactSelection(MOCK_EDIT_CONTACT, mockShowError);
      
      expect(isValid).toBe(true);
      expect(mockShowError).not.toHaveBeenCalled();
    });

    it('returns false and shows error when contact is null', () => {
      const { result } = setupHook();
      const isValid = result.current.validateContactSelection(null, mockShowError);
      
      expect(isValid).toBe(false);
      expect(mockShowError).toHaveBeenCalledWith('Please select a contact first');
    });

    it('returns false and shows error when clientContactId is missing', () => {
      const { result } = setupHook();
      const invalidContact = { clientId: 1, contactPersonName: 'Invalid' } as Contact;
      
      const isValid = result.current.validateContactSelection(invalidContact, mockShowError);
      
      expect(isValid).toBe(false);
      expect(mockShowError).toHaveBeenCalledWith('Contact ID is missing. Cannot perform this operation.');
    });
  });
});
