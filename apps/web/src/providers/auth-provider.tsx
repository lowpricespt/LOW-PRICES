'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  registerRequest,
  loginRequest,
  logoutRequest,
  fetchCurrentUser,
  type AuthUser,
} from '@/features/auth/services/auth-api';
import { refreshAccessToken } from '@/services/api/auth-session';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (params: {
    name: string;
    email: string;
    password: string;
    role: 'CLIENT' | 'PROFESSIONAL';
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ao carregar a app, tenta renovar a sessão silenciosamente a partir
  // do cookie httpOnly (se existir) — assim um refresh da página não
  // desliga o utilizador, mesmo sem o access token sobreviver em memória.
  useEffect(() => {
    async function restoreSession() {
      try {
        await refreshAccessToken();
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await loginRequest({ email, password });
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(
    async (params: { name: string; email: string; password: string; role: 'CLIENT' | 'PROFESSIONAL' }) => {
      const registeredUser = await registerRequest(params);
      setUser(registeredUser);
      return registeredUser;
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth tem de ser usado dentro de <AuthProvider>');
  }
  return context;
}
