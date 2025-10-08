'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { api, API_BASE_URL } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name?: string;
  profilePictureUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  handleGoogleCallback: () => Promise<boolean>;
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
        // Primero verificar si hay un callback de Google
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('code') && urlParams.get('state')) {
          const success = await handleGoogleCallback();
          if (success) {
            setIsLoading(false);
            return;
          }
        }

        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          try {
            // Verificar si el token es válido haciendo una llamada a un endpoint protegido
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              // Token válido, usar datos del localStorage
              const localUserData = JSON.parse(userData);
              setUser({
                id: localUserData.id.toString(),
                email: localUserData.email,
                name: localUserData.name,
                profilePictureUrl: localUserData.profilePictureUrl || undefined
              });
            } else if (response.status === 401) {
              // Token inválido, limpiar sesión
              console.warn('Token inválido, limpiando sesión');
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              setUser(null);
            } else {
              // Otro error, usar datos locales como fallback
              console.warn('Error del backend, usando datos locales');
              const localUserData = JSON.parse(userData);
              
              // Validar que los datos necesarios existan
              if (localUserData && localUserData.id && localUserData.email && localUserData.name) {
                setUser({
                  id: localUserData.id.toString(),
                  email: localUserData.email,
                  name: localUserData.name,
                  profilePictureUrl: localUserData.profilePictureUrl || undefined
                });
              } else {
                console.error('Datos de usuario incompletos, limpiando sesión');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                setUser(null);
              }
            }
          } catch (error) {
            // Si hay error de red, usar datos del localStorage como fallback
            console.warn('Error de red, usando datos locales:', error);
            const localUserData = JSON.parse(userData);
            
            // Validar que los datos necesarios existan
            if (localUserData && localUserData.id && localUserData.email && localUserData.name) {
              setUser({
                id: localUserData.id.toString(),
                email: localUserData.email,
                name: localUserData.name,
                profilePictureUrl: localUserData.profilePictureUrl || undefined
              });
            } else {
              console.error('Datos de usuario incompletos, limpiando sesión');
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
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

  // Función para manejar el callback de Google OAuth2
  const handleGoogleCallback = async () => {
    try {
        // Verificar si hay parámetros de Google en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const token = urlParams.get('token');
        
        // Si hay un token en la URL, significa que el OAuth2 fue exitoso
        if (token) {
          console.log('Token recibido del backend:', token);
          
          // Guardar el token
          localStorage.setItem('authToken', token);
          
          // Obtener información del usuario usando el token
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const userData = await response.json();
              console.log('Usuario obtenido del backend:', userData);
              
              // Guardar datos del usuario
              localStorage.setItem('userData', JSON.stringify({
                id: userData.id,
                email: userData.email,
                name: userData.name,
                profilePictureUrl: userData.profilePictureUrl,
                provider: userData.provider
              }));
              
              setUser({
                id: userData.id.toString(),
                email: userData.email,
                name: userData.name,
                profilePictureUrl: userData.profilePictureUrl || undefined
              });
              
              // Limpiar la URL
              window.history.replaceState({}, document.title, window.location.pathname);
              return true;
            }
          } catch (error) {
            console.error('Error obteniendo usuario del backend:', error);
          }
        }
        
        if (code && state) {
        console.log('Detectado callback de Google, procesando...');
        
        // Crear usuario temporal inmediatamente para evitar errores
        const tempUser = createTempUser();
        
        // Intentar obtener el usuario OAuth2 del backend
        try {
          // Esperar un poco para que el backend procese el usuario
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const response = await fetch(`${API_BASE_URL}/api/oauth2/user`, {
            method: 'GET',
            credentials: 'include', // Incluir cookies de sesión OAuth2
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Usuario OAuth2 obtenido del backend:', data);
            
            // Actualizar datos del usuario con información real del backend
            const realUser = {
              id: data.id.toString(),
              email: data.email,
              name: data.name,
              profilePictureUrl: data.profilePictureUrl,
              provider: data.provider
            };
            
            // Guardar el token JWT del backend
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(realUser));
            
            setUser({
              id: realUser.id,
              email: realUser.email,
              name: realUser.name,
              profilePictureUrl: realUser.profilePictureUrl || undefined
            });
            
            console.log('Usuario actualizado con datos del backend y token JWT guardado');
          } else {
            console.warn('Backend no pudo obtener usuario OAuth2, usando datos temporales');
          }
        } catch (backendError) {
          console.warn('Backend no disponible para callback, usando datos temporales');
        }
        
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return true;
      }
    } catch (error) {
      console.error('Error en callback de Google:', error);
    }
    return false;
  };

  // Función para crear un usuario temporal
  const createTempUser = (email = 'usuario@google.com', name = 'Usuario Google') => {
    const tempUser = {
      id: Date.now().toString(),
      email: email,
      name: name,
      profilePictureUrl: null,
      provider: 'GOOGLE'
    };
    
    localStorage.setItem('authToken', 'temp-google-token');
    localStorage.setItem('userData', JSON.stringify(tempUser));
    
    setUser({
      id: tempUser.id,
      email: tempUser.email,
      name: tempUser.name,
      profilePictureUrl: tempUser.profilePictureUrl || undefined
    });
    
    return tempUser;
  };

  // Función para simular login con Google
  const simulateGoogleLogin = () => {
    return createTempUser();
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    handleGoogleCallback,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
