'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { canEditAnything, canEditPath, type SessionUser } from '@/utils/permissions';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SessionUser | null;
  isSuperAdmin: boolean;
  /** True when the signed-in account may edit at least one area. */
  canEditAny: boolean;
  /** UI hint only; the server re-checks every write. */
  canEdit: (path: string) => boolean;
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
  const [state, setState] = useState<{ isAuthenticated: boolean; isLoading: boolean; user: SessionUser | null }>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await response.json();
      setState({ isAuthenticated: data.authenticated === true, isLoading: false, user: data.user ?? null });
    } catch (error) {
      console.error('Auth check failed:', error);
      setState({ isAuthenticated: false, isLoading: false, user: null });
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (active) setState({ isAuthenticated: data.authenticated === true, isLoading: false, user: data.user ?? null });
      })
      .catch((error) => {
        console.error('Auth check failed:', error);
        if (active) setState({ isAuthenticated: false, isLoading: false, user: null });
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
      return;
    }
    setState({ isAuthenticated: false, isLoading: false, user: null });
    router.replace('/');
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({
      ...state,
      isSuperAdmin: state.user?.role === 'super',
      canEditAny: canEditAnything(state.user),
      canEdit: (path: string) => canEditPath(state.user, path),
      checkAuth,
      logout,
    }),
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
