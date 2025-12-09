import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useContact } from '../services/useContact';
import type { ContactAddEditPayload, Contact } from '../types/contactTypes';

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

// Helper to force global fetch to type any
global.fetch = vi.fn();

describe('useContact', () => {
  const mockApiUrl = import.meta.env.VITE_PREPROD_URL;
  const mockAccessToken = 'mock-token-123';

  describe('getClientDetails', () => {
    const mockClientId = 1;
    const mockClientDetailsResponse = {
      success: true,
      data: {
        clientContact: [
          {
            clientContactId: 1,
            contactPersonName: 'John Doe',
            email: 'john@example.com',
            designation: 'Manager',
            phone: '1234567890',
            clientId: 1
          }
        ],
        clientId: 1,
        clientName: 'Test Client',
        address: '123 Main St'
      },
      message: 'Success'
    };

    it('fetches client details successfully with access token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue(mockClientDetailsResponse)
      });

      const { result } = renderHook(() => useContact());

      let response;
      await act(async () => {
        response = await result.current.getClientDetails(mockAccessToken, mockClientId);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/client/${mockClientId}`,
        {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockAccessToken}`
          },
          credentials: 'include'
        }
      );
      expect(response).toEqual(mockClientDetailsResponse);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('fetches client details successfully without access token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue(mockClientDetailsResponse)
      });

      const { result } = renderHook(() => useContact());

      let response;
      await act(async () => {
        response = await result.current.getClientDetails(null, mockClientId);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/client/${mockClientId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );
      expect(response).toEqual(mockClientDetailsResponse);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('throws error when clientId is missing', async () => {
      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.getClientDetails(mockAccessToken, 0)).rejects.toThrow(
          /Client ID is required/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Client ID is required');
    });

    it('throws error when response is not JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' }),
        json: vi.fn().mockResolvedValue({})
      });

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.getClientDetails(mockAccessToken, mockClientId)).rejects.toThrow(
          /Expected JSON but got text\/html/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Expected JSON but got');
    });

    it('throws error when content-type header is missing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({}),
        json: vi.fn().mockResolvedValue({})
      });

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.getClientDetails(mockAccessToken, mockClientId)).rejects.toThrow(
          /Expected JSON but got unknown content type/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('unknown content type');
    });

    it('handles API error response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({
          success: false,
          message: 'Client not found'
        })
      });

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.getClientDetails(mockAccessToken, mockClientId)).rejects.toThrow(
          /Client not found/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Client not found');
    });

    it('handles network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.getClientDetails(mockAccessToken, mockClientId)).rejects.toThrow(
          /Network error/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Network error');
    });

    it('handles HTTP error without custom message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: vi.fn().mockResolvedValue({
          success: false
        })
      });

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.getClientDetails(mockAccessToken, mockClientId)).rejects.toThrow(
          /HTTP error! status: 500/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('HTTP error! status: 500');
    });
  });

  describe('createContact', () => {
    const mockContactData: ContactAddEditPayload = {
      clientId: 1,
      contactPersonName: 'Jane Smith',
      designation: 'Director',
      phone: '0987654321',
      email: 'jane@example.com'
    };

    const mockCreateResponse = {
      success: true,
      data: {
        clientContactId: 2,
        ...mockContactData
      } as Contact,
      message: 'Contact created successfully'
    };

    it('creates contact successfully with access token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue(mockCreateResponse)
      });

      const { result } = renderHook(() => useContact());

      let response;
      await act(async () => {
        response = await result.current.createContact(mockAccessToken, mockContactData);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/contact`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockAccessToken}`
          },
          credentials: 'include',
          body: JSON.stringify(mockContactData)
        }
      );
      expect(response).toEqual(mockCreateResponse);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('creates contact successfully without access token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue(mockCreateResponse)
      });

      const { result } = renderHook(() => useContact());

      let response;
      await act(async () => {
        response = await result.current.createContact(null, mockContactData);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/contact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(mockContactData)
        }
      );
      expect(response).toEqual(mockCreateResponse);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('handles create contact API error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          success: false,
          message: 'Invalid contact data'
        })
      });

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.createContact(mockAccessToken, mockContactData)).rejects.toThrow(
          /Invalid contact data/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Invalid contact data');
    });

    it('handles unknown error during contact creation', async () => {
      global.fetch = vi.fn().mockRejectedValue('Unknown error object');

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.createContact(mockAccessToken, mockContactData)).rejects.toBe(
          'Unknown error object'
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Unknown error');
    });
  });

  describe('updateContact', () => {
    const mockUpdateData: ContactAddEditPayload = {
      clientContactId: 1,
      contactPersonName: 'John Updated',
      designation: 'Senior Manager',
      phone: '1111111111',
      email: 'john.updated@example.com'
    };

    const mockUpdateResponse = {
      success: true,
      data: mockUpdateData as Contact,
      message: 'Contact updated successfully'
    };

    it('updates contact successfully with all fields and access token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockUpdateResponse)
      });

      const { result } = renderHook(() => useContact());

      let response;
      await act(async () => {
        response = await result.current.updateContact(mockAccessToken, mockUpdateData);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/contact/1`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockAccessToken}`
          },
          credentials: 'include',
          body: JSON.stringify({
            contactPersonName: 'John Updated',
            designation: 'Senior Manager',
            phone: '1111111111',
            email: 'john.updated@example.com'
          })
        })
      );
      expect(response).toEqual(mockUpdateResponse);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('updates contact with partial data', async () => {
      const partialUpdateData: ContactAddEditPayload = {
        clientContactId: 1,
        contactPersonName: 'John Partial'
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ 
          success: true, 
          data: partialUpdateData 
        })
      });

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await result.current.updateContact(mockAccessToken, partialUpdateData);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/contact/1`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockAccessToken}`
          },
          credentials: 'include',
          body: JSON.stringify({
            contactPersonName: 'John Partial'
          })
        })
      );
    });

    it('updates contact without access token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockUpdateResponse)
      });

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await result.current.updateContact(null, mockUpdateData);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/contact/1`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            contactPersonName: 'John Updated',
            designation: 'Senior Manager',
            phone: '1111111111',
            email: 'john.updated@example.com'
          })
        })
      );
    });

    it('throws error when contactId is missing', async () => {
      const dataWithoutId: ContactAddEditPayload = {
        contactPersonName: 'Test'
      };

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.updateContact(mockAccessToken, dataWithoutId)).rejects.toThrow(
          /Contact ID is required for update operation/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Contact ID is required');
    });

    it('handles update contact API error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({
          success: false,
          message: 'Contact not found'
        })
      });

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.updateContact(mockAccessToken, mockUpdateData)).rejects.toThrow(
          /Contact not found/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Contact not found');
    });
  });

  describe('deleteContact', () => {
    const mockContactId = 1;
    const mockDeleteResponse = {
      success: true,
      message: 'Contact deleted successfully'
    };

    it('deletes contact successfully with access token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockDeleteResponse)
      });

      const { result } = renderHook(() => useContact());

      let response;
      await act(async () => {
        response = await result.current.deleteContact(mockAccessToken, mockContactId);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/contact/${mockContactId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockAccessToken}`
          },
          credentials: 'include'
        })
      );
      expect(response).toEqual(mockDeleteResponse);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('deletes contact successfully without access token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockDeleteResponse)
      });

      const { result } = renderHook(() => useContact());

      let response;
      await act(async () => {
        response = await result.current.deleteContact(null, mockContactId);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/contact/${mockContactId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
      );
      expect(response).toEqual(mockDeleteResponse);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('throws error when contactId is invalid', async () => {
      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.deleteContact(mockAccessToken, 0)).rejects.toThrow(
          /Contact ID is required for delete operation/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Contact ID is required');
    });

    it('handles delete contact API error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          success: false,
          message: 'Internal server error'
        })
      });

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.deleteContact(mockAccessToken, mockContactId)).rejects.toThrow(
          /Internal server error/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Internal server error');
    });

    it('handles HTTP error without message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          success: false
        })
      });

      const { result } = renderHook(() => useContact());

      await act(async () => {
        await expect(result.current.deleteContact(mockAccessToken, mockContactId)).rejects.toThrow(
          /HTTP error! status: 500/
        );
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('HTTP error! status: 500');
    });
  });

  describe('clearError', () => {
    it('clears error state', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useContact());

      await act(async () => {
        try {
          await result.current.deleteContact(mockAccessToken, 1);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toContain('Test error');

      act(() => {
        result.current.clearError();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
    });
  });

  describe('loading state', () => {
    it('sets loading to true during API call', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      global.fetch = vi.fn().mockReturnValue(promise);

      const { result } = renderHook(() => useContact());

      act(() => {
        result.current.getClientDetails(mockAccessToken, 1).catch(() => {});
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise!({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: vi.fn().mockResolvedValue({ success: true, data: {} })
        });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});