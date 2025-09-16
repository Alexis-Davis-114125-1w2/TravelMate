'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Error de Autenticación</h1>
            <p className="text-gray-600">
              {error === 'oauth2_error' 
                ? 'Hubo un problema con la autenticación de Google. Por favor intenta de nuevo.'
                : 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/login"
              className="block w-full bg-blue-500 text-white py-3 rounded-2xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Volver al Login
            </Link>
            
            <Link 
              href="/test"
              className="block w-full bg-gray-500 text-white py-3 rounded-2xl font-semibold hover:bg-gray-600 transition-colors"
            >
              Ir a Pruebas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
