'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreateTripPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Estados para el formulario - alineados con la base de datos
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dateI, setDateI] = useState('');
  const [dateF, setDateF] = useState('');
  const [cost, setCost] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('sun');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirección si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading con el mismo estilo del dashboard
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
          <p className="text-white/80">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada
  if (!isAuthenticated) {
    return null;
  }

  // Función para obtener iconos con el estilo del dashboard
  const getIcon = (image: string, size = 'w-12 h-12') => {
    const iconClass = `${size} rounded-2xl flex items-center justify-center shadow-lg`;
    
    switch (image) {
      case 'sun':
        return (
          <div className={`${iconClass} bg-gradient-to-r from-yellow-400 to-orange-500`}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          </div>
        );
      case 'mountain':
        return (
          <div className={`${iconClass} bg-gradient-to-r from-blue-500 to-cyan-500`}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0z"/>
            </svg>
          </div>
        );
      case 'city':
        return (
          <div className={`${iconClass} bg-gradient-to-r from-gray-600 to-gray-800`}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3zM9 9.75h1.5v4.5H9v-4.5zM13.5 9.75H15v4.5h-1.5v-4.5z"/>
            </svg>
          </div>
        );
      case 'beach':
        return (
          <div className={`${iconClass} bg-gradient-to-r from-cyan-400 to-blue-500`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${iconClass} bg-gradient-to-r from-gray-400 to-gray-600`}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z"/>
            </svg>
          </div>
        );
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validaciones básicas
    if (!name || !dateI || !dateF) {
      alert('Por favor, completa todos los campos obligatorios');
      setIsSubmitting(false);
      return;
    }

    if (new Date(dateI) >= new Date(dateF)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      setIsSubmitting(false);
      return;
    }

    try {
      // Crear el objeto del viaje según la estructura de la base de datos
      const newTrip = {
        name: name,
        date_i: dateI,
        date_f: dateF,
        description: description || null,
        cost: cost ? parseFloat(cost) : 0,
        // Datos adicionales para la UI
        image: selectedIcon,
        status: 'planning'
      };

      console.log('Nuevo viaje a guardar en BD:', newTrip);
      
      // Aquí harías la llamada a tu API para guardar en la base de datos
      // const response = await fetch('/api/trips', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTrip)
      // });
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigir al dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error al crear el viaje:', error);
      alert('Hubo un error al crear el viaje. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular duración en días
  const calculateDuration = () => {
    if (dateI && dateF) {
      const start = new Date(dateI);
      const end = new Date(dateF);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const iconOptions = [
    { value: 'sun', label: 'Sol/Playa' },
    { value: 'mountain', label: 'Montaña' },
    { value: 'city', label: 'Ciudad' },
    { value: 'beach', label: 'Playa' }
  ];

  return (
    <div className="min-h-screen p-4">
      {/* Header con estilo del dashboard */}
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
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Crear Nuevo Viaje</h1>
            <p className="text-white/70">Planifica tu próxima aventura</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="glass-card animate-slide-in" style={{animationDelay: '0.2s'}}>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nombre del viaje */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-white mb-3">
                Nombre del viaje *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Aventura en París"
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                required
                maxLength={150}
              />
            </div>
            
            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-white mb-3">
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu viaje..."
                rows={3}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm resize-none"
              />
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dateI" className="block text-sm font-bold text-white mb-3">
                  Fecha de inicio *
                </label>
                <input
                  id="dateI"
                  type="date"
                  value={dateI}
                  onChange={(e) => setDateI(e.target.value)}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white backdrop-blur-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="dateF" className="block text-sm font-bold text-white mb-3">
                  Fecha de fin *
                </label>
                <input
                  id="dateF"
                  type="date"
                  value={dateF}
                  onChange={(e) => setDateF(e.target.value)}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            {/* Mostrar duración calculada */}
            {calculateDuration() > 0 && (
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm animate-slide-in">
                <p className="text-blue-300 font-medium flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Duración: {calculateDuration()} día{calculateDuration() !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Costo */}
            <div>
              <label htmlFor="cost" className="block text-sm font-bold text-white mb-3">
                Presupuesto aproximado
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-white/50">$</span>
                <input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Selector de icono */}
            <div>
              <label className="block text-sm font-bold text-white mb-3">
                Tipo de viaje
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {iconOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedIcon(option.value)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${
                      selectedIcon === option.value
                        ? 'border-blue-400/50 bg-blue-500/20 scale-105'
                        : 'border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/20'
                    }`}
                  >
                    {getIcon(option.value, 'w-10 h-10')}
                    <span className="text-sm font-medium mt-2 text-white/90">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview del viaje */}
            {name && (
              <div className="glass-card bg-white/5 border-white/10 animate-slide-in">
                <h3 className="text-sm font-bold text-white/90 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Vista previa:
                </h3>
                <div className="flex items-center space-x-4">
                  {getIcon(selectedIcon, 'w-16 h-16')}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-1">{name}</h4>
                    {description && (
                      <p className="text-white/70 text-sm mb-2">{description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      {dateI && dateF && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(dateI).toLocaleDateString('es-ES')} - {new Date(dateF).toLocaleDateString('es-ES')}
                        </span>
                      )}
                      {cost && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          ${parseFloat(cost).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 glass-button text-white/70 hover:text-white border-white/20 hover:border-white/30 py-4 font-bold flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancelar</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed border-0 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Crear Viaje</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}