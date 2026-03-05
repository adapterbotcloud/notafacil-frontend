import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  nome: string;
  role: string;
  cnpj: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGestor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.REACT_APP_API_URL || 'https://notafacil-api.adapterbot.cloud';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('notafacil_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('notafacil_user'); }
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Erro ao fazer login');
    }
    const data = await res.json();
    const userData: User = {
      username: data.username,
      nome: data.nome,
      role: data.role,
      cnpj: data.cnpj,
      token: data.token,
    };
    setUser(userData);
    localStorage.setItem('notafacil_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('notafacil_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isAdmin: user?.role === 'ADMIN', isGestor: user?.role === 'GESTOR' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
