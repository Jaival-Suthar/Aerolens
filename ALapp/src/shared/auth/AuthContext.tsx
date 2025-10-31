import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        console.log('🔐 Found access token in localStorage on mount');
        return token;
      }
      localStorage.removeItem(TOKEN_KEY);
      return null;
    } catch {
      return null;
    }
  });

  const { setProfile, clearProfile } = useProfileStore();

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      console.log('💾 Access token saved to localStorage');
    } else {
      localStorage.removeItem(TOKEN_KEY);
      console.log('🗑️ Access token removed from localStorage');
    }
  }, [accessToken]);

  const fetchProfile = async (token: string) => {
    console.log('👤 Fetching profile...');
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (res.status === 401) throw new Error('401');
    if (!res.ok) throw new Error('Failed to fetch profile');
    const { data } = await res.json();
    setProfile(data.member);
    console.log('✅ Profile fetched successfully');
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    console.log('🔄 Attempting to refresh access token...');
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      console.log('❌ Token refresh failed - clearing auth state');
      setAccessToken(null);
      clearProfile();
      throw new Error('Token refresh failed');
    }
    const { data } = await res.json();
    const newToken = data.token;
    if (newToken) {
      console.log('✅ New access token received');
      setAccessToken(newToken);
      return newToken;
    } else {
      console.log('❌ No token in refresh response');
      setAccessToken(null);
      throw new Error('Invalid token received');
    }
  };

  // 🚀 Global 401 handler – auto-refresh + retry logic
  useEffect(() => {
  const originalFetch = window.fetch.bind(window);

  const patchedFetch: typeof window.fetch = async (input, init) => {
    let res = await originalFetch(input, init);

    if (res.status === 401 && !String(input).includes('/auth/refresh')) {
      console.warn('⚠️ Global 401 detected — attempting token refresh...');
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log('🔄 Retrying request with refreshed token...');
          const updatedHeaders = {
            ...(init?.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          res = await originalFetch(input, { ...init, headers: updatedHeaders });
        }
      } catch (err) {
        console.error('❌ Token refresh failed globally:', err);
        await logout();
      }
    }

    return res;
  };

  // ✅ Assign properly with full type safety
  window.fetch = patchedFetch;

  return () => {
    window.fetch = originalFetch;
  };
}, [accessToken]);


  // 🧩 Existing initAuth, silent refresh, login, logout, etc. stay unchanged...
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      console.log('🚀 Initializing auth...');
      const hasRefreshToken = document.cookie.includes('refreshToken');
      if (!accessToken) {
        clearProfile();
        return;
      }

      try {
        await fetchProfile(accessToken);
      } catch (err: any) {
        if (err.message?.includes('401')) {
          try {
            const newToken = await refreshAccessToken();
            if (newToken && mounted) await fetchProfile(newToken);
          } catch {
            if (mounted) {
              setAccessToken(null);
              clearProfile();
            }
          }
        } else {
          if (mounted) {
            setAccessToken(null);
            clearProfile();
          }
        }
      }
    };

    initAuth();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const refreshInterval = setInterval(async () => {
      try {
        await refreshAccessToken();
        console.log('✅ Silent token refresh successful');
      } catch (err) {
        console.log('❌ Silent token refresh failed:', err);
        setAccessToken(null);
        clearProfile();
      }
    }, 120 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    console.log('🔐 Logging in...');
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
    setProfile(json.data.member);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    setAccessToken(null);
    clearProfile();
  };

  const logoutAll = async () => {
    if (!accessToken) return;
    try {
      await fetch(`${API_BASE}/auth/logout-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      });
    } catch {}
    setAccessToken(null);
    clearProfile();
  };

  useEffect(() => {
    (window as any).testRefresh = async () => {
      try {
        const newToken = await refreshAccessToken();
        console.log('✅ Test refresh successful:', newToken?.slice(0, 20) + '...');
      } catch (err) {
        console.log('❌ Test refresh failed:', err);
      }
    };
  }, []);

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
