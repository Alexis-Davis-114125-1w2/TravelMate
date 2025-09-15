'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Trip } from '../../types/trip';

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const mockTrips: Trip[] = [
      {
        id: '1',
        name: 'Viaje a Cancún',
        destination: 'Cancún, México',
        startDate: '2023-12-15',
        endDate: '2023-12-22',
        participants: 4,
        status: 'completed',
        image: 'sun'
      },
      {
        id: '2',
        name: 'Escapada a Bariloche',
        destination: 'Bariloche, Argentina',
        startDate: '2024-07-03',
        endDate: '2024-07-10',
        participants: 2,
        status: 'planning',
        image: 'mountain'
      },
      {
        id: '3',
        name: 'Aventura en París',
        destination: 'París, Francia',
        startDate: '2024-09-15',
        endDate: '2024-09-22',
        participants: 3,
        status: 'planning',
        image: 'city'
      }
    ];
    setTrips(mockTrips);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getIcon = (image: string) => {
    switch (image) {
      case 'sun':
        return (
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          </div>
        );
      case 'mountain':
        return (
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.75 8.25a.75.75 0 00-1.5 0v2.25c0 .414.336.75.75.75h2.25a.75.75 0 000-1.5H8.25V8.25zM6 12.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5H9v1.5a.75.75 0 01-1.5 0v-2.25zM18.75 16.5a.75.75 0 00-1.5 0V18a.75.75 0 01-.75.75h-2.25a.75.75 0 000 1.5H18a.75.75 0 00.75-.75v-1.5zM17.25 7.5a.75.75 0 01-.75.75h-2.25a.75.75 0 000-1.5H16.5a.75.75 0 01.75.75z"/>
            </svg>
          </div>
        );
      case 'city':
        return (
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3zM9 9.75h1.5v4.5H9v-4.5zM13.5 9.75H15v4.5h-1.5v-4.5zM6 9.75h1.5v4.5H6v-4.5zM18 9.75h1.5v4.5H18v-4.5z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-black text-gray-800 tracking-wide">TUS VIAJES</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Hola, {user?.name || user?.email}</span>
              <button
                onClick={logout}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>ORGANIZAR NUEVO VIAJE</span>
          </button>
        </div>

        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4">
                {getIcon(trip.image || 'default')}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{trip.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{trip.participants}</span>
                      </div>
                      <span>{trip.participants} participantes</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => router.push(`/trip/${trip.id}/stats`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Estadísticas
                  </button>
                  <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-6 right-6">
          <button 
            onClick={() => router.push('/stats')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-16 h-16 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-110 flex items-center justify-center"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
