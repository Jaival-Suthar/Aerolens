import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Import both functions for full coverage
import { useContactsByClient, useContactsByClientFlexible } from './useContactsByClient'; 
import type { Contact, ClientDetailsApiResponse, ApiResponse } from '../types/contactTypes'; 

// --- Mocks Setup ---

const mockGetClientDetails = vi.fn();
const mockClearError = vi.fn();
let mockLoading = false;
let mockError: string | null = null;

// Mock the useContact hook dependency
vi.mock('../services/useContact', () => ({
  default: () => ({
    getClientDetails: mockGetClientDetails,
    loading: mockLoading,
    error: mockError,
    clearError: mockClearError,
  }),
}));

// --- Test Data ---

const MOCK_CLIENT_ID = 42;
const MOCK_CONTACTS: Contact[] = [
  { clientContactId: 101, clientId: MOCK_CLIENT_ID, contactPersonName: 'Jane Doe', designation: 'CEO' },
  { contactId: 102, clientId: MOCK_CLIENT_ID, contactPersonName: 'John Smith', designation: 'CFO' },
];

const MOCK_SINGLE_CONTACT: Contact = { 
  clientContactId: 103, 
  clientId: MOCK_CLIENT_ID, 
  contactPersonName: 'Adam Bell', 
  designation: 'Manager' 
};

const MOCK_API_RESPONSE: ApiResponse<ClientDetailsApiResponse> = {
  success: true,
  data: {
    clientId: MOCK_CLIENT_ID,
    clientName: 'Test Corp',
    clientContact: MOCK_CONTACTS, // Matches the expected API structure
  },
};

const MOCK_API_RESPONSE_WITH_INVALID = {
  success: true,
  data: {
    clientId: MOCK_CLIENT_ID,
    clientName: 'Test Corp',
    clientContact: [
      MOCK_CONTACTS[0],
      { clientId: MOCK_CLIENT_ID, contactPersonName: 'No ID Contact' }, // Missing both IDs
      MOCK_CONTACTS[1],
    ],
  },
} as ApiResponse<ClientDetailsApiResponse>;


// --- Main Hook Tests: useContactsByClient ---

describe('useContactsByClient (Primary Implementation)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockError = null;
    // Set default success mock response
    mockGetClientDetails.mockResolvedValue(MOCK_API_RESPONSE);
  });

  it('initializes with empty contacts and does not call API when clientId is undefined', () => {
    const { result } = renderHook(() => useContactsByClient(undefined, 0));

    expect(result.current.contacts).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(mockGetClientDetails).not.toHaveBeenCalled();
  });
  
  it('fetches and sets contacts correctly for a valid client ID', async () => {
    const { result } = renderHook(() => useContactsByClient(MOCK_CLIENT_ID, 0));

    expect(mockGetClientDetails).toHaveBeenCalledWith(MOCK_CLIENT_ID);
    
    await waitFor(() => {
      expect(result.current.contacts).toEqual(MOCK_CONTACTS);
      expect(result.current.loading).toBe(false);
    });
  });

  it('filters out contacts missing both clientContactId and contactId', async () => {
    mockGetClientDetails.mockResolvedValue(MOCK_API_RESPONSE_WITH_INVALID);
    
    const { result } = renderHook(() => useContactsByClient(MOCK_CLIENT_ID, 0));

    await waitFor(() => {
      // Expect only the two valid contacts
      expect(result.current.contacts.length).toBe(2);
      expect(result.current.contacts).toEqual(MOCK_CONTACTS);
    });
  });
  
  it('sets contacts to empty array if API returns success but no contacts', async () => {
    const emptyResponse = { success: true, data: { clientContact: [] } };
    mockGetClientDetails.mockResolvedValue(emptyResponse);
    
    const { result } = renderHook(() => useContactsByClient(MOCK_CLIENT_ID, 0));

    await waitFor(() => {
      expect(result.current.contacts).toEqual([]);
    });
  });

  it('handles unsuccessful API response (success: false) gracefully', async () => {
    const unsuccessfulResponse = { success: false, data: { clientContact: MOCK_CONTACTS }, message: 'Failed call' };
    mockGetClientDetails.mockResolvedValue(unsuccessfulResponse);
    
    const { result } = renderHook(() => useContactsByClient(MOCK_CLIENT_ID, 0));

    await waitFor(() => {
      expect(result.current.contacts).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });
  
  it('handles successful response with missing or invalid clientContact data', async () => {
    // FIX: Cast the literal to unknown first to allow setting clientContact: null
    const missingDataResponse = { 
      success: true, 
      data: { clientId: MOCK_CLIENT_ID, clientName: 'Test Corp', clientContact: null } 
    } as unknown as ApiResponse<ClientDetailsApiResponse>;
    
    mockGetClientDetails.mockResolvedValue(missingDataResponse);
    
    const { result } = renderHook(() => useContactsByClient(MOCK_CLIENT_ID, 0));

    await waitFor(() => {
      expect(result.current.contacts).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles API rejection gracefully by setting contacts to empty array', async () => {
    // Suppress console.error output for this test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetClientDetails.mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useContactsByClient(MOCK_CLIENT_ID, 0));
    
    await waitFor(() => {
      expect(result.current.contacts).toEqual([]);
    });
    consoleErrorSpy.mockRestore();
  });

  it('calls clearError on unmount (cleanup)', () => {
    const { unmount } = renderHook(() => useContactsByClient(MOCK_CLIENT_ID, 0));
    
    expect(mockClearError).not.toHaveBeenCalled();
    unmount();
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });
});

// --- Alternative Hook Tests: useContactsByClientFlexible ---

describe('useContactsByClientFlexible (Alternative Implementation)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockError = null;
  });

  // Test 1: Initializes with empty contacts and no API call for undefined clientId
  it('initializes with empty contacts and does not call API when clientId is undefined', () => {
    const { result } = renderHook(() => useContactsByClientFlexible(undefined, 0));
    expect(result.current.contacts).toEqual([]);
    expect(mockGetClientDetails).not.toHaveBeenCalled();
  });
  
  // Test 2: Handles successful response with an array of contacts
  it('fetches and sets contacts correctly for an array response', async () => {
    mockGetClientDetails.mockResolvedValue(MOCK_API_RESPONSE);
    const { result } = renderHook(() => useContactsByClientFlexible(MOCK_CLIENT_ID, 0));
    
    await waitFor(() => {
      expect(result.current.contacts).toEqual(MOCK_CONTACTS);
    });
  });
  
  // Test 3: Handles successful response where clientContact is a single object (flexibility test)
  it('handles successful response where clientContact is a single object', async () => {
    const singleContactResponse = { 
        success: true, 
        data: { clientContact: MOCK_SINGLE_CONTACT } 
    };
    mockGetClientDetails.mockResolvedValue(singleContactResponse);
    
    const { result } = renderHook(() => useContactsByClientFlexible(MOCK_CLIENT_ID, 0));

    await waitFor(() => {
      expect(result.current.contacts).toEqual([MOCK_SINGLE_CONTACT]);
    });
  });

  // Test 4: Handles unsuccessful API response
  it('sets contacts to empty array for unsuccessful API response', async () => {
    const unsuccessfulResponse = { success: false, data: { clientContact: MOCK_CONTACTS } };
    mockGetClientDetails.mockResolvedValue(unsuccessfulResponse);
    
    const { result } = renderHook(() => useContactsByClientFlexible(MOCK_CLIENT_ID, 0));

    await waitFor(() => {
      expect(result.current.contacts).toEqual([]);
    });
  });

  // Test 5: Handles API rejection (try/catch block)
  it('handles API rejection gracefully by setting contacts to empty array', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetClientDetails.mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useContactsByClientFlexible(MOCK_CLIENT_ID, 0));
    
    await waitFor(() => {
      expect(result.current.contacts).toEqual([]);
    });
    consoleErrorSpy.mockRestore();
  });
  
  // Test 6: Cleanup calls clearError
  it('calls clearError on unmount (cleanup)', () => {
    const { unmount } = renderHook(() => useContactsByClientFlexible(MOCK_CLIENT_ID, 0));
    unmount();
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });
});
