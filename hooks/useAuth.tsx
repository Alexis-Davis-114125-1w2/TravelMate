'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const userData = localStorage.getItem('userData');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify({
          id: data.id,
          email: data.email,
          name: data.name,
          profilePictureUrl: data.profilePictureUrl,
          provider: data.provider
        }));
        
        setUser({
          id: data.id.toString(),
          email: data.email,
          name: data.name,
          profilePictureUrl: data.profilePictureUrl
        });
        return true;
      } else {
        const errorData = await response.json();
        console.error('Error en login:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.register(name, email, password);

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify({
          id: data.id,
          email: data.email,
          name: data.name,
          profilePictureUrl: data.profilePictureUrl,
          provider: data.provider
        }));
        
        setUser({
          id: data.id.toString(),
          email: data.email,
          name: data.name,
          profilePictureUrl: data.profilePictureUrl
        });
        return true;
      } else {
        const errorData = await response.json();
        console.error('Error en registro:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
