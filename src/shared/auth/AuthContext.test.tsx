import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as profileStore from '../store/profile';

// Mock the profile store
vi.mock('../store/profile', () => ({
  useProfileStore: vi.fn(() => ({
    setProfile: vi.fn(),
    clearProfile: vi.fn(),
  })),
}));

// Get the actual API_BASE from environment
const API_BASE = import.meta.env.VITE_PREPROD_URL || 'http://localhost:3000';

describe('AuthProvider', () => {
  let mockSetProfile: ReturnType<typeof vi.fn>;
  let mockClearProfile: ReturnType<typeof vi.fn>;
  let originalFetch: typeof global.fetch;
  let originalLocalStorage: Storage;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup mocks
    mockSetProfile = vi.fn();
    mockClearProfile = vi.fn();
    (profileStore.useProfileStore as any).mockReturnValue({
      setProfile: mockSetProfile,
      clearProfile: mockClearProfile,
    });

    // Mock localStorage
    const localStorageMock: Storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    originalLocalStorage = global.localStorage;
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock fetch - store original and create a spy
    originalFetch = global.fetch;
    fetchMock = vi.fn();
    global.fetch = fetchMock as any;

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Initialization', () => {
    it('loads access token from localStorage on mount', () => {
      const mockToken = 'stored-token-123';
      vi.spyOn(localStorage, 'getItem').mockReturnValue(mockToken);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
      expect(result.current.accessToken).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('initializes with null token when localStorage is empty', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('fetches profile on mount when token exists', async () => {
      const mockToken = 'valid-token';
      const mockProfile = { id: '1', email: 'test@example.com' };
      
      vi.spyOn(localStorage, 'getItem').mockReturnValue(mockToken);
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { member: mockProfile } }),
      });

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `${API_BASE}/auth/profile`,
          expect.objectContaining({
            headers: { Authorization: `Bearer ${mockToken}` },
            credentials: 'include',
          })
        );
      });

      await waitFor(() => {
        expect(mockSetProfile).toHaveBeenCalledWith(mockProfile);
      });
    });

    it('refreshes token when profile fetch returns 401', async () => {
      const oldToken = 'expired-token';
      const newToken = 'refreshed-token';
      const mockProfile = { id: '1', email: 'test@example.com' };

      vi.spyOn(localStorage, 'getItem').mockReturnValue(oldToken);
      
      fetchMock
        // First call: profile fetch returns 401
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // Second call: refresh token succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { token: newToken } }),
        })
        // Third call: profile fetch with new token succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { member: mockProfile } }),
        });

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `${API_BASE}/auth/refresh`,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: `Bearer ${oldToken}`,
            }),
            credentials: 'include',
          })
        );
      });

      await waitFor(() => {
        expect(mockSetProfile).toHaveBeenCalledWith(mockProfile);
      });
    });

    it('clears auth state when refresh fails during initialization', async () => {
      const oldToken = 'expired-token';

      vi.spyOn(localStorage, 'getItem').mockReturnValue(oldToken);
      
      fetchMock
        // Profile fetch returns 401
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        // Refresh fails
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        });

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockClearProfile).toHaveBeenCalled();
      });
    });
  });

  describe('login', () => {
    it('successfully logs in and sets token and profile', async () => {
      const mockToken = 'new-access-token';
      const mockProfile = { id: '1', email: 'user@example.com' };
      
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            token: mockToken,
            member: mockProfile,
          },
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: 'user@example.com', password: 'password123' }),
        })
      );

      expect(result.current.accessToken).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockSetProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('throws error when login fails', async () => {
      const errorMessage = 'Invalid credentials';
      
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
      
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.login('user@example.com', 'wrong-password')
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('logout', () => {
    it('clears token and profile on logout', async () => {
      const mockToken = 'token-to-clear';
      vi.spyOn(localStorage, 'getItem').mockReturnValue(mockToken);
      
      fetchMock
        // Profile fetch on mount
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { member: { id: '1' } } }),
        })
        // Logout request
        .mockResolvedValueOnce({ ok: true });
      
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/auth/logout`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );

      expect(result.current.accessToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockClearProfile).toHaveBeenCalled();
    });

    it('clears local state even if logout request fails', async () => {
      const mockToken = 'token-to-clear';
      vi.spyOn(localStorage, 'getItem').mockReturnValue(mockToken);
      
      fetchMock
        // Profile fetch on mount
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { member: { id: '1' } } }),
        })
        // Logout request fails
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.accessToken).toBeNull();
      expect(mockClearProfile).toHaveBeenCalled();
    });
  });

  describe('logoutAll', () => {
    it('logs out from all devices when authenticated', async () => {
      const mockToken = 'current-token';
      vi.spyOn(localStorage, 'getItem').mockReturnValue(mockToken);
      
      fetchMock
        // Profile fetch on mount
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { member: { id: '1' } } }),
        })
        // Logout all request
        .mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logoutAll();
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/auth/logout-all`,
        expect.objectContaining({
          method: 'POST',
          headers: { Authorization: `Bearer ${mockToken}` },
          credentials: 'include',
        })
      );

      expect(result.current.accessToken).toBeNull();
      expect(mockClearProfile).toHaveBeenCalled();
    });

    it('does nothing when not authenticated', async () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logoutAll();
      });

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('successfully refreshes token with current token in header', async () => {
      const currentToken = 'current-token';
      const newToken = 'refreshed-token-456';
      
      vi.spyOn(localStorage, 'getItem').mockReturnValue(currentToken);

      fetchMock
        // Profile fetch on mount
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { member: { id: '1' } } }),
        })
        // Refresh token request
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { token: newToken } }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      let refreshedToken: string | null = null;
      await act(async () => {
        refreshedToken = await result.current.refreshAccessToken();
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/auth/refresh`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${currentToken}`,
          }),
          credentials: 'include',
        })
      );

      expect(refreshedToken).toBe(newToken);
      expect(result.current.accessToken).toBe(newToken);
    });

    it('throws error when no token is available', async () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.refreshAccessToken();
        })
      ).rejects.toThrow('No token available to refresh');
    });

  //   it('clears auth state when refresh fails', async () => {
  //     const currentToken = 'expired-token';
      
  //     vi.spyOn(localStorage, 'getItem').mockReturnValue(currentToken);

  //     fetchMock
  //       // Profile fetch on mount
  //       .mockResolvedValueOnce({
  //         ok: true,
  //         status: 200,
  //         json: async () => ({ data: { member: { id: '1' } } }),
  //       })
  //       // Refresh fails
  //       .mockResolvedValueOnce({
  //         ok: false,
  //         status: 401,
  //       });

  //     const { result } = renderHook(() => useAuth(), { wrapper });

  //     await waitFor(() => {
  //       expect(result.current.isAuthenticated).toBe(true);
  //     });

  //     await expect(
  //       act(async () => {
  //         await result.current.refreshAccessToken();
  //       })
  //     ).rejects.toThrow('Token refresh failed');

  //     // Wait for state to update after the error
  //     await waitFor(() => {
  //       expect(result.current.accessToken).toBeNull();
  //     });
      
  //     expect(mockClearProfile).toHaveBeenCalled();
  //   });
     });

  describe('localStorage synchronization', () => {
    it('saves token to localStorage when set', async () => {
      const mockToken = 'token-to-save';
      const mockProfile = { id: '1', email: 'test@example.com' };
      
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
      
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { token: mockToken, member: mockProfile },
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('user@example.com', 'password');
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', mockToken);
      });
    });

    it('removes token from localStorage when cleared', async () => {
      const mockToken = 'token-to-remove';
      vi.spyOn(localStorage, 'getItem').mockReturnValue(mockToken);
      
      fetchMock
        // Profile fetch on mount
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { member: { id: '1' } } }),
        })
        // Logout request
        .mockResolvedValueOnce({ ok: true });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      });
    });
  });

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');

      consoleError.mockRestore();
    });

    it('returns auth context when used within AuthProvider', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
      
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty('accessToken');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('logoutAll');
      expect(result.current).toHaveProperty('refreshAccessToken');
    });
  });

  describe('Global 401 handler', () => {
    it('intercepts and automatically refreshes token on 401', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';

      vi.spyOn(localStorage, 'getItem').mockReturnValue(oldToken);

      let callCount = 0;
      fetchMock.mockImplementation(async (url: any, init?: any) => {
        callCount++;
        
        // First call: profile fetch on mount - succeeds
        if (callCount === 1) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ data: { member: { id: '1' } } }),
          };
        }
        
        // Second call: some API call returns 401
        if (callCount === 2) {
          return {
            ok: false,
            status: 401,
            json: async () => ({}),
          };
        }
        
        // Third call: refresh token succeeds
        if (callCount === 3 && String(url).includes('/auth/refresh')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ data: { token: newToken } }),
          };
        }
        
        // Fourth call: retry the original request with new token
        if (callCount === 4) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ data: { result: 'success' } }),
          };
        }
        
        return { ok: false, status: 500 };
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Make a request that will get a 401
      await act(async () => {
        await window.fetch(`${API_BASE}/some-protected-endpoint`, {
          headers: { Authorization: `Bearer ${oldToken}` },
        });
      });

      // Wait for the token refresh to complete
      await waitFor(() => {
        expect(callCount).toBeGreaterThanOrEqual(3);
      });
    });

    it('logs out when token refresh fails on 401', async () => {
      const oldToken = 'expired-token';

      vi.spyOn(localStorage, 'getItem').mockReturnValue(oldToken);

      let callCount = 0;
      fetchMock.mockImplementation(async (url: any) => {
        callCount++;
        
        // First call: profile fetch on mount
        if (callCount === 1) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ data: { member: { id: '1' } } }),
          };
        }
        
        // Second call: API returns 401
        if (callCount === 2) {
          return {
            ok: false,
            status: 401,
          };
        }
        
        // Third call: refresh token also fails
        if (callCount === 3 && String(url).includes('/auth/refresh')) {
          return {
            ok: false,
            status: 401,
          };
        }

        // Fourth call: logout
        if (callCount === 4 && String(url).includes('/auth/logout')) {
          return { ok: true };
        }
        
        return { ok: false, status: 500 };
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Trigger a 401 error
      await act(async () => {
        try {
          await window.fetch(`${API_BASE}/some-protected-endpoint`);
        } catch (e) {
          // Expected to fail
        }
      });

      // Should eventually log out
      await waitFor(() => {
        expect(result.current.accessToken).toBeNull();
      }, { timeout: 3000 });
    });
  });
});