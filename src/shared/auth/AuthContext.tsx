import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/profile';

interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const API_BASE = import.meta.env.VITE_BASE_URL;
const TOKEN_KEY = 'accessToken';
const REFRESH_COOLDOWN = 1000; // 1 second cooldown between refresh attempts

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        return token;
      }
      localStorage.removeItem(TOKEN_KEY);
      return null;
    } catch {
      return null;
    }
  });

  const { setProfile, clearProfile } = useProfileStore();
  
  // ✅ Fix: Use refs to track refresh state and prevent race conditions
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const lastRefreshAttemptRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [accessToken]);

  const fetchProfile = async (token: string) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (res.status === 401) throw new Error('401');
    if (!res.ok) throw new Error('Failed to fetch profile');
    const { data } = await res.json();
    setProfile(data.member);
  };

  // ✅ Fix: Wrap in useCallback with proper dependencies
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // ✅ Fix: Return existing promise if already refreshing
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    // ✅ Fix: Implement cooldown to prevent rapid-fire refreshes
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshAttemptRef.current;
    
    if (timeSinceLastRefresh < REFRESH_COOLDOWN && isRefreshingRef.current) {
      // Wait for cooldown period before attempting again
      await new Promise(resolve => setTimeout(resolve, REFRESH_COOLDOWN - timeSinceLastRefresh));
    }

    lastRefreshAttemptRef.current = now;
    isRefreshingRef.current = true;

    refreshPromiseRef.current = (async () => {
      try {
        const currentToken = localStorage.getItem(TOKEN_KEY);
        
        // ✅ Fix: Validate token exists before attempting refresh
        if (!currentToken) {
          throw new Error('No token available to refresh');
        }

        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!res.ok) {
          // ✅ Fix: Only clear on actual failure, not network errors
          if (res.status === 401 || res.status === 403) {
            setAccessToken(null);
            clearProfile();
          }
          throw new Error(`Token refresh failed: ${res.status}`);
        }

        const { data } = await res.json();
        const newToken = data.token;

        if (newToken) {
          setAccessToken(newToken);
          localStorage.setItem(TOKEN_KEY, newToken);
          return newToken;
        } else {
          setAccessToken(null);
          clearProfile();
          throw new Error('Invalid token received from server');
        }
      } catch (error) {
        // ✅ Fix: Re-throw to let caller handle
        throw error;
      } finally {
        refreshPromiseRef.current = null;
        isRefreshingRef.current = false;
      }
    })();

    return refreshPromiseRef.current;
  }, [setProfile, clearProfile]); // ✅ Fix: Add dependencies

  // ✅ Fix: Wrap logout in useCallback to prevent stale closures
  const logout = useCallback(async () => {
    const token = accessToken || localStorage.getItem(TOKEN_KEY);
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    setAccessToken(null);
    clearProfile();
  }, [accessToken, clearProfile]);

  // ✅ Fix: Setup fetch interceptor with proper dependencies
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    
    // ✅ Fix: Track in-flight requests to prevent duplicate retries
    const retryingRequests = new Set<string>();

    const patchedFetch: typeof window.fetch = async (input, init) => {
      const requestKey = `${input}-${JSON.stringify(init?.headers)}`;
      
      let res = await originalFetch(input, init);

      // ✅ Fix: Only retry 401s that aren't auth endpoints and haven't been retried yet
      if (
        res.status === 401 && 
        !String(input).includes('/auth/refresh') && 
        !String(input).includes('/auth/login') &&
        !retryingRequests.has(requestKey)
      ) {
        retryingRequests.add(requestKey);
        
        try {
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            // ✅ Fix: Properly clone and update headers
            const updatedHeaders = new Headers(init?.headers || {});
            updatedHeaders.set('Authorization', `Bearer ${newToken}`);
            
            const updatedInit = {
              ...init,
              headers: updatedHeaders,
            };
            
            // Retry the original request with new token
            res = await originalFetch(input, updatedInit);
          }
        } catch (err) {
          console.error('Token refresh failed during fetch retry:', err);
          // ✅ Fix: Don't call logout here - let the error propagate
          // The user might still have a valid session
        } finally {
          retryingRequests.delete(requestKey);
        }
      }

      return res;
    };

    window.fetch = patchedFetch;

    return () => {
      window.fetch = originalFetch;
      retryingRequests.clear();
    };
  }, [refreshAccessToken]); // ✅ Fix: Add refreshAccessToken dependency

  // ✅ Fix: Initialize auth on mount with proper dependency tracking
  useEffect(() => {
    let mounted = true;
    let initInProgress = false;

    const initAuth = async () => {
      if (initInProgress) return;
      initInProgress = true;

      const storedToken = localStorage.getItem(TOKEN_KEY);
      
      if (!storedToken) {
        clearProfile();
        initInProgress = false;
        return;
      }

      try {
        await fetchProfile(storedToken);
      } catch (err: any) {
        if (err.message?.includes('401')) {
          try {
            const newToken = await refreshAccessToken();
            if (newToken && mounted) {
              await fetchProfile(newToken);
            }
          } catch (refreshErr) {
            console.error('Failed to refresh token during init:', refreshErr);
            if (mounted) {
              setAccessToken(null);
              clearProfile();
            }
          }
        } else {
          console.error('Profile fetch failed:', err);
          if (mounted) {
            setAccessToken(null);
            clearProfile();
          }
        }
      } finally {
        initInProgress = false;
      }
    };

    initAuth();
    
    return () => {
      mounted = false;
    };
  }, [refreshAccessToken, clearProfile]); // ✅ Fix: Add dependencies

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    
    const json = await res.json();
    const newToken = json.data.token;
    
    setAccessToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    setProfile(json.data.member);
  };

  const logoutAll = async () => {
    const token = accessToken || localStorage.getItem(TOKEN_KEY);
    
    if (!token) return;
    
    try {
      await fetch(`${API_BASE}/auth/logout-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout all failed:', error);
    }
    
    setAccessToken(null);
    clearProfile();
    window.location.replace("/login");
  };

  // ✅ Optional: Keep test function if needed
  useEffect(() => {
    (window as any).testRefresh = async () => {
      try {
        const newToken = await refreshAccessToken();
      } catch (err) {
        console.log('❌ Test refresh failed:', err);
      }
    };
    
    return () => {
      delete (window as any).testRefresh;
    };
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: !!accessToken,
        login,
        logout,
        logoutAll,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };