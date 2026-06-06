import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/auth.service';
import type { AuthUser } from '@shared/contracts/auth.api';

const AUTH_TOKEN_KEY = 'auth_token';

function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function persistToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    else sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}

interface AuthContextType {
  user: AuthUser | null;
  authToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: any) => Promise<AuthUser>;
  registerAdvisor: (data: any) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => readStoredToken());
  const [loading, setLoading] = useState(true);

  const applyAuth = useCallback((nextUser: AuthUser | null, token?: string | null) => {
    setUser(nextUser);
    if (token) {
      setAuthToken(token);
      persistToken(token);
    } else if (!nextUser) {
      setAuthToken(null);
      persistToken(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.me();
      applyAuth(data.user, data.token ?? readStoredToken());
    } catch {
      applyAuth(null, null);
    } finally {
      setLoading(false);
    }
  }, [applyAuth]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    applyAuth(data.user, data.token);
    return data.user;
  };

  const register = async (regData: any) => {
    const data = await authService.register(regData);
    applyAuth(data.user, data.token);
    return data.user;
  };

  const registerAdvisor = async (regData: any) => {
    const data = await authService.registerAdvisor(regData);
    applyAuth(data.user, data.token);
    return data.user;
  };

  const logout = async () => {
    await authService.logout();
    applyAuth(null, null);
  };

  const contextValue: AuthContextType = {
    user,
    authToken,
    loading,
    login,
    register,
    registerAdvisor,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
