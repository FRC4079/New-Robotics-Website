'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Checks the admin session once for the whole app, instead of every
 * component that needs it asking the server separately.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState({ isAuthenticated: false, isLoading: true });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await response.json();
      setState({ isAuthenticated: data.authenticated === true, isLoading: false });
    } catch (error) {
      console.error('Auth check failed:', error);
      setState({ isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
      return;
    }
    setState({ isAuthenticated: false, isLoading: false });
    router.replace('/');
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ ...state, checkAuth, logout }),
    [state, checkAuth, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
