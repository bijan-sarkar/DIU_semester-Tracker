import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  register: (data: { email: string; full_name: string; student_id?: string; password: string; current_semester?: string }) => Promise<void>;
  logout: () => void;
  updateSemester: (semester: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('diu_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<User>('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user', err);
        localStorage.removeItem('diu_auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const handleAuthSuccess = (data: AuthResponse) => {
    localStorage.setItem('diu_auth_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    handleAuthSuccess(res.data);
  };

  const demoLogin = async () => {
    const res = await api.post<AuthResponse>('/auth/demo-login');
    handleAuthSuccess(res.data);
  };

  const register = async (data: { email: string; full_name: string; student_id?: string; password: string; current_semester?: string }) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    handleAuthSuccess(res.data);
  };

  const logout = () => {
    localStorage.removeItem('diu_auth_token');
    setToken(null);
    setUser(null);
  };

  const updateSemester = async (semester: string) => {
    if (!user) return;
    try {
      const res = await api.patch<User>('/auth/profile', { current_semester: semester });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to update semester', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, register, logout, updateSemester }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
