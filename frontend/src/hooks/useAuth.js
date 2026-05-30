import { useEffect, useState } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../api';

const authStorageKey = 'carebridge_auth';

function decodeTokenPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
}

export function useAuth() {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem(authStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.access_token || isTokenExpired(parsed.access_token)) {
          localStorage.removeItem(authStorageKey);
          setAuthToken(null);
          return null;
        }
        setAuthToken(parsed.access_token);
        return parsed;
      }
    } catch {
      // Ignore
    }
    return null;
  });

  const login = (authData) => {
    if (authData) {
      if (!authData.access_token || isTokenExpired(authData.access_token)) {
        localStorage.removeItem(authStorageKey);
        setAuthToken(null);
        setAuth(null);
        return;
      }
      localStorage.setItem(authStorageKey, JSON.stringify(authData));
      setAuthToken(authData.access_token);
      setAuth(authData);
    }
  };

  const logout = () => {
    localStorage.removeItem(authStorageKey);
    setAuthToken(null);
    setAuth(null);
  };

  const updateUserLanguage = (langCode) => {
    if (auth && auth.user) {
      const updatedAuth = {
        ...auth,
        user: {
          ...auth.user,
          preferred_language: langCode,
        },
      };
      localStorage.setItem(authStorageKey, JSON.stringify(updatedAuth));
      setAuth(updatedAuth);
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!auth?.access_token) return undefined;

    const payload = decodeTokenPayload(auth.access_token);
    if (!payload?.exp) {
      logout();
      return undefined;
    }

    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      logout();
      return undefined;
    }

    const timer = window.setTimeout(logout, msUntilExpiry);
    return () => window.clearTimeout(timer);
  }, [auth?.access_token]);

  return {
    auth,
    user: auth?.user || null,
    token: auth?.access_token || null,
    isLoggedIn: !!auth,
    isAdmin: auth?.user?.role === 'admin',
    isPatient: auth?.user?.role === 'patient',
    login,
    logout,
    updateUserLanguage,
  };
}
