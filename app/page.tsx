'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        setShowWelcome(true);
      }
    }
  }, [isAuthenticated, isLoading, router]);

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
          <p className="text-white/80">Preparando tu aventura...</p>
        </div>
      </div>
    );
  }

  if (!showWelcome) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-slide-in">
          <div className="glass-card max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse-glow"></div>
                <div className="absolute inset-2 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
                TravelMate
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Tu compañero perfecto para descubrir el mundo
              </p>
              <p className="text-lg text-white/70 mb-8">
                Planifica, organiza y disfruta de tus aventuras con nuestra aplicación inteligente de gestión de viajes
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="glass-button text-white font-semibold px-8 py-4 text-lg hover:scale-105 transition-all duration-300"
              >
                Comenzar Aventura
              </button>
              <button
                onClick={() => router.push('/login')}
                className="glass-button text-white/90 font-medium px-8 py-4 text-lg border-white/30 hover:border-white/50 transition-all duration-300"
              >
                Explorar Demo
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card text-center animate-slide-in" style={{animationDelay: '0.2s'}}>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Planificación Inteligente</h3>
            <p className="text-white/70">Organiza tus viajes con herramientas avanzadas de planificación</p>
          </div>

          <div className="glass-card text-center animate-slide-in" style={{animationDelay: '0.4s'}}>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Colaboración</h3>
            <p className="text-white/70">Comparte y colabora con tus compañeros de viaje</p>
          </div>

          <div className="glass-card text-center animate-slide-in" style={{animationDelay: '0.6s'}}>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Estadísticas</h3>
            <p className="text-white/70">Analiza tus gastos y experiencias de viaje</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center animate-slide-in" style={{animationDelay: '0.8s'}}>
          <div className="glass-card max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              ¿Listo para tu próxima aventura?
            </h2>
            <p className="text-white/80 mb-6">
              Únete a miles de viajeros que ya confían en TravelMate
            </p>
            <button
              onClick={() => router.push('/login')}
              className="glass-button text-white font-semibold px-8 py-4 text-lg hover:scale-105 transition-all duration-300 animate-pulse-glow"
            >
              Comenzar Ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}