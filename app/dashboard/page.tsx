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
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card text-center animate-slide-in">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse-glow"></div>
            <div className="absolute inset-2 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-2">TravelMate</h2>
          <p className="text-white/80">Cargando tus viajes...</p>
        </div>
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
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          </div>
        );
      case 'mountain':
        return (
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.75 8.25a.75.75 0 00-1.5 0v2.25c0 .414.336.75.75.75h2.25a.75.75 0 000-1.5H8.25V8.25zM6 12.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5H9v1.5a.75.75 0 01-1.5 0v-2.25zM18.75 16.5a.75.75 0 00-1.5 0V18a.75.75 0 01-.75.75h-2.25a.75.75 0 000 1.5H18a.75.75 0 00.75-.75v-1.5zM17.25 7.5a.75.75 0 01-.75.75h-2.25a.75.75 0 000-1.5H16.5a.75.75 0 01.75.75z"/>
            </svg>
          </div>
        );
      case 'city':
        return (
          <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3zM9 9.75h1.5v4.5H9v-4.5zM13.5 9.75H15v4.5h-1.5v-4.5zM6 9.75h1.5v4.5H6v-4.5zM18 9.75h1.5v4.5H18v-4.5z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'planning':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'active':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="glass-card mb-8 animate-slide-in">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Mis Viajes</h1>
              <p className="text-white/70">Bienvenido, {user?.name || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/stats')}
              className="glass-button text-white/90 hover:text-white"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Estadísticas
            </button>
            <button
              onClick={logout}
              className="glass-button text-red-300 hover:text-red-200 border-red-400/30 hover:border-red-400/50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Create New Trip Button */}
        <div className="mb-8 animate-slide-in" style={{animationDelay: '0.2s'}}>
          <button className="w-full glass-card hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-center space-x-4 py-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-white mb-2">Crear Nuevo Viaje</h2>
                <p className="text-white/70">Planifica tu próxima aventura</p>
              </div>
            </div>
          </button>
        </div>

        {/* Trips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {trips.map((trip, index) => (
            <div 
              key={trip.id} 
              className="glass-card hover:scale-105 transition-all duration-300 animate-slide-in"
              style={{animationDelay: `${0.4 + index * 0.1}s`}}
            >
              <div className="flex items-start space-x-4 mb-4">
                {getIcon(trip.image || 'default')}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-2 truncate">{trip.name}</h3>
                  <p className="text-white/70 text-sm mb-2">{trip.destination}</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                    {trip.status === 'completed' ? 'Completado' : 
                     trip.status === 'planning' ? 'Planificando' : 
                     trip.status === 'active' ? 'En curso' : trip.status}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-white/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span>{trip.participants} personas</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => router.push(`/trip/${trip.id}/stats`)}
                    className="flex-1 glass-button text-white text-sm py-2 hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Ver Stats
                  </button>
                  <button className="flex-1 glass-button text-white/90 text-sm py-2 hover:scale-105 transition-all duration-300">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card text-center animate-slide-in" style={{animationDelay: '0.8s'}}>
            <div className="text-2xl font-bold text-white mb-1">{trips.length}</div>
            <div className="text-white/70 text-sm">Viajes Totales</div>
          </div>
          <div className="glass-card text-center animate-slide-in" style={{animationDelay: '0.9s'}}>
            <div className="text-2xl font-bold text-white mb-1">{trips.filter(t => t.status === 'completed').length}</div>
            <div className="text-white/70 text-sm">Completados</div>
          </div>
          <div className="glass-card text-center animate-slide-in" style={{animationDelay: '1.0s'}}>
            <div className="text-2xl font-bold text-white mb-1">{trips.filter(t => t.status === 'planning').length}</div>
            <div className="text-white/70 text-sm">Planificando</div>
          </div>
          <div className="glass-card text-center animate-slide-in" style={{animationDelay: '1.1s'}}>
            <div className="text-2xl font-bold text-white mb-1">{trips.reduce((acc, trip) => acc + trip.participants, 0)}</div>
            <div className="text-white/70 text-sm">Participantes</div>
          </div>
        </div>
      </main>
    </div>
  );
}
