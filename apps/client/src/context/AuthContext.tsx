import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL as ENV_API_URL } from '@/lib/api-url';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  isSuperAdmin: false,
  logout: async () => {},
});

const API_URL = (ENV_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        setUser(data?.user ?? data ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Local logout cleanup fallback
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isSuperAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}