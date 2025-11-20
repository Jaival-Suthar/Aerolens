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


  let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const currentToken = accessToken || localStorage.getItem(TOKEN_KEY);

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken || ''}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });


      if (!res.ok) {
        setAccessToken(null);
        clearProfile();
        throw new Error('Token refresh failed');
      }

      const { data } = await res.json();
      const newToken = data.token;

      if (newToken) {
        setAccessToken(newToken);
        return newToken;
      } else {
        setAccessToken(null);
        throw new Error('Invalid token received');
      }
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

  useEffect(() => {
  const originalFetch = window.fetch.bind(window);

  const patchedFetch: typeof window.fetch = async (input, init) => {
    let res = await originalFetch(input, init);

    if (res.status === 401 && !String(input).includes('/auth/refresh')) {
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const updatedHeaders = {
            ...(init?.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          res = await originalFetch(input, { ...init, headers: updatedHeaders });
        }
      } catch (err) {
        await logout();
      }
    }

    return res;
  };

  window.fetch = patchedFetch;

  return () => {
    window.fetch = originalFetch;
  };
}, []);


  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const storedToken = accessToken || localStorage.getItem(TOKEN_KEY);
        if (!storedToken) {
          clearProfile();
          return;
        }

      try {
        await fetchProfile(storedToken);
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
    } catch (err) {
      //console.log('❌ Test refresh failed:', err);
    }
  };
  
  return () => {
    delete (window as any).testRefresh;
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

export { AuthContext };

