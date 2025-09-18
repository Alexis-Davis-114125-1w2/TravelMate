'use client';

import { useAuth } from '../../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Trip } from '../../../../types/trip';

export default function TripStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripId, setTripId] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Resolve the params promise
    params.then((resolvedParams) => {
      setTripId(resolvedParams.id);
    });
  }, [params]);

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
      },
        {
      id: '4',
      name: 'Safari en Kenia',
      destination: 'Nairobi, Kenia',
      startDate: '2025-02-10',
      endDate: '2025-02-20',
      participants: 5,
      status: 'completed',
      image: 'sun'
    },
    {
      id: '5',
      name: 'Tour por Japón',
      destination: 'Tokio, Japón',
      startDate: '2025-04-01',
      endDate: '2025-04-15',
      participants: 6,
      status: 'planning',
      image: 'city'
    },
    {
      id: '6',
      name: 'Relax en Bali',
      destination: 'Bali, Indonesia',
      startDate: '2025-08-05',
      endDate: '2025-08-19',
      participants: 2,
      status: 'planning',
      image: 'sun'
    },
    {
      id: '7',
      name: 'Ruta por los Alpes',
      destination: 'Zermatt, Suiza',
      startDate: '2025-01-12',
      endDate: '2025-01-19',
      participants: 4,
      status: 'completed',
      image: 'mountain'
    }
    ];

    const foundTrip = mockTrips.find(t => t.id === tripId);
    setTrip(foundTrip || null);
  }, [tripId]);

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
          <p className="text-white/80">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !trip) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getIcon = (image: string) => {
    switch (image) {
      case 'sun':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          </div>
        );
      case 'mountain':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.75 8.25a.75.75 0 00-1.5 0v2.25c0 .414.336.75.75.75h2.25a.75.75 0 000-1.5H8.25V8.25zM6 12.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5H9v1.5a.75.75 0 01-1.5 0v-2.25zM18.75 16.5a.75.75 0 00-1.5 0V18a.75.75 0 01-.75.75h-2.25a.75.75 0 000 1.5H18a.75.75 0 00.75-.75v-1.5zM17.25 7.5a.75.75 0 01-.75.75h-2.25a.75.75 0 000-1.5H16.5a.75.75 0 01.75.75z"/>
            </svg>
          </div>
        );
      case 'city':
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3zM9 9.75h1.5v4.5H9v-4.5zM13.5 9.75H15v4.5h-1.5v-4.5zM6 9.75h1.5v4.5H6v-4.5zM18 9.75h1.5v4.5H18v-4.5z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="glass-card mb-8 animate-slide-in">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="glass-button p-3 hover:scale-105 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Estadísticas del Viaje</h1>
            <p className="text-white/70">Análisis detallado de tu aventura</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Trip Info */}
        <div className="glass-card mb-8 animate-slide-in" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center space-x-6">
            {getIcon(trip.image || 'default')}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{trip.name}</h2>
              <p className="text-white/80 text-lg mb-2">{trip.destination}</p>
              <div className="flex items-center space-x-4 text-white/70">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>{trip.participants} participantes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card animate-slide-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium mb-2">Participantes</p>
                <p className="text-4xl font-bold text-white">{trip.participants}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card animate-slide-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium mb-2">Duración</p>
                <p className="text-4xl font-bold text-white">7 días</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card animate-slide-in" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium mb-2">Estado</p>
                <p className="text-2xl font-bold text-white capitalize">{trip.status === 'completed' ? 'Completado' : trip.status === 'planning' ? 'Planificando' : trip.status}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card animate-slide-in" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium mb-2">Gasto Total</p>
                <p className="text-4xl font-bold text-white">$4,200</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card animate-slide-in" style={{animationDelay: '0.7s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium mb-2">Gasto por Persona</p>
                <p className="text-4xl font-bold text-white">$1,050</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card animate-slide-in" style={{animationDelay: '0.8s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium mb-2">Actividades</p>
                <p className="text-4xl font-bold text-white">12</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Activities */}
        <div className="glass-card animate-slide-in" style={{animationDelay: '0.9s'}}>
          <h3 className="text-2xl font-bold text-white mb-6">Actividades del Viaje</h3>
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-lg">Visita a la Torre Eiffel</p>
                  <p className="text-white/70">Día 1 - $45 por persona</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-lg">Museo del Louvre</p>
                  <p className="text-white/70">Día 2 - $30 por persona</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-lg">Crucero por el Sena</p>
                  <p className="text-white/70">Día 3 - $25 por persona</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}