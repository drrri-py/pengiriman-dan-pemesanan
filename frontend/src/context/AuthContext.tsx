import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (token: string, role: string, name?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on initial load
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('user_username');

    // Map backend roles to frontend types if needed, or convert casing
    // Backend roles are ['admin', 'finance', 'driver']
    // Frontend types might be ['Admin', 'Finance', 'Driver']
    if (token && role) {
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
      setUser({
        id: userId || '0',
        name: name || formattedRole,
        email: username || `${role}@pt-yusufaldi.com`,
        role: formattedRole as UserRole
      });
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, role: string, name?: string) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_role', role);
    if (name) localStorage.setItem('user_name', name);

    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
    const userId = localStorage.getItem('user_id') || '0';
    const username = localStorage.getItem('user_username') || `${role}@pt-yusufaldi.com`;

    setUser({
      id: userId,
      name: name || formattedRole,
      email: username,
      role: formattedRole as UserRole
    });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
