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

  // Persist accessToken in localStorage
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      console.log('💾 Access token saved to localStorage');
    } else {
      localStorage.removeItem(TOKEN_KEY);
      console.log('🗑️ Access token removed from localStorage');
    }
  }, [accessToken]);

  // Helper function to fetch profile with a specific token
  const fetchProfile = async (token: string) => {
    console.log('👤 Fetching profile...');
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (res.status === 401) {
      console.log('❌ Profile fetch returned 401');
      throw new Error('401');
    }
    if (!res.ok) {
      console.log('❌ Profile fetch failed:', res.status);
      throw new Error('Failed to fetch profile');
    }
    const { data } = await res.json();
    setProfile(data.member);
    console.log('✅ Profile fetched successfully');
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    console.log('🔄 Attempting to refresh access token...');
    console.log('🍪 Cookies will be sent with this request (credentials: include)');
    
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    
    console.log('🔄 Refresh response status:', res.status);
    
    if (!res.ok) {
      console.log('❌ Token refresh failed - clearing auth state');
      setAccessToken(null);
      clearProfile();
      throw new Error('Token refresh failed');
    }
    
    const { data } = await res.json();
    const newToken = data.accessToken;
    
    if (newToken) {
      console.log('✅ New access token received from refresh');
      setAccessToken(newToken);
      return newToken;
    } else {
      console.log('❌ No access token in refresh response');
      setAccessToken(null);
      throw new Error('Invalid token received from refresh');
    }
  };

  // Initialize authentication on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      console.log('🚀 Initializing auth...');
      
      // Log all cookies for debugging
      console.log('🍪 Current cookies:', document.cookie);
      const hasRefreshToken = document.cookie.includes('refreshToken');
      console.log('🍪 Refresh token cookie present:', hasRefreshToken);
      
      if (!accessToken) {
        console.log('ℹ️ No access token found - user not authenticated');
        clearProfile();
        return;
      }
      
      console.log('🔍 Access token found, validating...');
      
      try {
        await fetchProfile(accessToken);
        console.log('✅ Auth initialization complete - user authenticated');
      } catch (err: any) {
        if (err.message?.includes('401')) {
          console.log('⚠️ Access token expired, attempting refresh...');
          try {
            const newToken = await refreshAccessToken();
            if (newToken && mounted) {
              console.log('🔄 Fetching profile with new token...');
              await fetchProfile(newToken);
              console.log('✅ Auth recovered via token refresh');
            }
          } catch (refreshErr) {
            console.log('❌ Token refresh failed - logging out');
            if (mounted) {
              setAccessToken(null);
              clearProfile();
            }
          }
        } else {
          console.log('❌ Profile fetch error (non-401):', err.message);
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
  }, []); // Only run on mount
  // Automatically refresh access token every 14 minutes (before it expires)
useEffect(() => {
  if (!accessToken) return;

  console.log('⏰ Starting silent refresh interval...');

  const refreshInterval = setInterval(async () => {
    try {
      console.log('🔄 Silent refresh triggered...');
      const newToken = await refreshAccessToken();
      if (newToken) console.log('✅ Silent token refresh successful');
    } catch (err) {
      console.log('❌ Silent token refresh failed:', err);
      setAccessToken(null);
      clearProfile();
    }
  }, 14 * 60 * 1000); // 14 minutes in ms

  return () => {
    console.log('🛑 Clearing silent refresh interval');
    clearInterval(refreshInterval);
  };
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
      console.log('❌ Login failed:', err.message);
      throw new Error(err.message || 'Login failed');
    }
    
    const json = await res.json();
    console.log('📥 Login response received');
    
    if (!json.data || !json.data.accessToken) {
      console.log('❌ Invalid response: missing accessToken');
      throw new Error('Invalid response: missing accessToken');
    }
    
    const newToken = json.data.accessToken;
    console.log('✅ Login successful - setting tokens');
    
    setAccessToken(newToken);
    setProfile(json.data.member);
  };

  const logout = async () => {
    console.log('👋 Logging out...');
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      console.log('✅ Logout API called');
    } catch (err) {
      console.log('⚠️ Logout API call failed:', err);
    }
    setAccessToken(null);
    clearProfile();
  };

  const logoutAll = async () => {
    if (!accessToken) return;
    console.log('👋 Logging out from all devices...');
    try {
      await fetch(`${API_BASE}/auth/logout-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      });
      console.log('✅ Logout all API called');
    } catch (err) {
      console.log('⚠️ Logout all API call failed:', err);
    }
    setAccessToken(null);
    clearProfile();
  };

  // Add this to window for manual testing in console
  useEffect(() => {
    (window as any).testRefresh = async () => {
      console.log('🧪 Manual refresh test triggered');
      console.log('🍪 Cookies before refresh:', document.cookie);
      try {
        const newToken = await refreshAccessToken();
        console.log('✅ Test refresh successful, new token:', newToken?.substring(0, 20) + '...');
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