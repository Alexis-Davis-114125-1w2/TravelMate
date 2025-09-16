'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { API_BASE_URL } from '../../../lib/api';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // El token viene del backend, guardarlo en localStorage
      localStorage.setItem('authToken', token);
      
      // Obtener información del usuario desde el backend
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => response.json())
      .then(userData => {
        localStorage.setItem('userData', JSON.stringify(userData));
        router.push('/dashboard');
      })
      .catch(error => {
        console.error('Error obteniendo datos del usuario:', error);
        router.push('/login');
      });
    } else {
      // Si no hay token, redirigir al login
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
}
