'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api';
import { toast } from 'react-toastify';

// Declaraciones de tipos para Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Backdrop,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  TravelExplore,
  WbSunny,
  Landscape,
  LocationCity,
  BeachAccess,
  Save,
  Cancel,
  DirectionsCar,
  Flight,
  DirectionsWalk,
} from '@mui/icons-material';

export default function CreateTripPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  
  // Estados para el formulario - alineados con TripCreate DTO
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [dateI, setDateI] = useState('');
  const [dateF, setDateF] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState<'PESOS' | 'DOLARES' | 'EUROS'>('PESOS');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('sun');
  const [selectedVehicle, setSelectedVehicle] = useState('auto');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [originCoords, setOriginCoords] = useState<{lat: number, lng: number} | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  
  // Estados para autocompletado
  const [originAutocomplete, setOriginAutocomplete] = useState<any>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<any>(null);
  
  // Referencias para los mapas
  const originMapRef = useRef<HTMLDivElement>(null);
  const destinationMapRef = useRef<HTMLDivElement>(null);
  
  // Referencias para autocompletado
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirección si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Cargar Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      // Verificar si ya existe el script
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAqcm8Rfw8eKvrI9u_1e7zNGzXt1rSeHlw&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        toast.error('Error al cargar Google Maps. Verifica tu conexión a internet.');
      };
      
      window.initGoogleMaps = () => {
        setIsGoogleMapsLoaded(true);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Función para inicializar un mapa pequeño
  const initializeMap = (mapRef: React.RefObject<HTMLDivElement | null>, coords: {lat: number, lng: number} | null, title: string, isOrigin: boolean = false) => {
    if (!mapRef.current || !coords || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: coords,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    const marker = new window.google.maps.Marker({
      position: coords,
      map: map,
      title: title,
      animation: window.google.maps.Animation.DROP
    });

    // Agregar listener de click en el mapa
    map.addListener('click', (event: any) => {
      const clickedCoords = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };

      // Actualizar coordenadas
      if (isOrigin) {
        setOriginCoords(clickedCoords);
      } else {
        setDestinationCoords(clickedCoords);
      }

      // Mover el marcador a la nueva posición
      marker.setPosition(clickedCoords);

      // Geocodificar la nueva ubicación para obtener la dirección
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: clickedCoords }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          if (isOrigin) {
            setOriginAddress(address);
            setOrigin(address);
          } else {
            setDestinationAddress(address);
            setDestination(address);
          }
        }
      });
    });
  };

  // Efecto para inicializar mapas cuando cambien las coordenadas
  useEffect(() => {
    if (isGoogleMapsLoaded && originCoords && originMapRef.current) {
      initializeMap(originMapRef, originCoords, 'Origen', true);
    }
  }, [originCoords, isGoogleMapsLoaded]);

  useEffect(() => {
    if (isGoogleMapsLoaded && destinationCoords && destinationMapRef.current) {
      initializeMap(destinationMapRef, destinationCoords, 'Destino', false);
    }
  }, [destinationCoords, isGoogleMapsLoaded]);

  // Inicializar autocompletado cuando Google Maps se cargue
  useEffect(() => {
    if (isGoogleMapsLoaded && window.google && window.google.maps) {
      // Autocompletado para origen
      if (originInputRef.current && !originAutocomplete) {
        // Obtener el elemento input real dentro del TextField de Material-UI
        const inputElement = originInputRef.current.querySelector('input');
        if (inputElement) {
          const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
            types: ['geocode'],
            componentRestrictions: { country: 'ar' } // Restringir a Argentina
          });
          
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const coords = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };
              setOriginCoords(coords);
              setOriginAddress(place.formatted_address || place.name);
              setOrigin(place.formatted_address || place.name);
            }
          });
          
          setOriginAutocomplete(autocomplete);
        }
      }

      // Autocompletado para destino
      if (destinationInputRef.current && !destinationAutocomplete) {
        // Obtener el elemento input real dentro del TextField de Material-UI
        const inputElement = destinationInputRef.current.querySelector('input');
        if (inputElement) {
          const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
            types: ['geocode'],
            componentRestrictions: { country: 'ar' } // Restringir a Argentina
          });
          
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const coords = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };
              setDestinationCoords(coords);
              setDestinationAddress(place.formatted_address || place.name);
              setDestination(place.formatted_address || place.name);
            }
          });
          
          setDestinationAutocomplete(autocomplete);
        }
      }
    }
  }, [isGoogleMapsLoaded, originAutocomplete, destinationAutocomplete]);

  if (isLoading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6">Cargando...</Typography>
        </Box>
      </Backdrop>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getIcon = (image: string) => {
    switch (image) {
      case 'sun':
        return <WbSunny sx={{ fontSize: 30 }} />;
      case 'mountain':
        return <Landscape sx={{ fontSize: 30 }} />;
      case 'city':
        return <LocationCity sx={{ fontSize: 30 }} />;
      case 'beach':
        return <BeachAccess sx={{ fontSize: 30 }} />;
      default:
        return <TravelExplore sx={{ fontSize: 30 }} />;
    }
  };

  const getVehicleIcon = (vehicle: string) => {
    switch (vehicle) {
      case 'auto':
        return <DirectionsCar sx={{ fontSize: 30 }} />;
      case 'avion':
        return <Flight sx={{ fontSize: 30 }} />;
      case 'caminando':
        return <DirectionsWalk sx={{ fontSize: 30 }} />;
      default:
        return <DirectionsCar sx={{ fontSize: 30 }} />;
    }
  };

  // Función para limpiar coordenadas cuando se borra el texto
  const clearCoordinates = (isOrigin: boolean) => {
    if (isOrigin) {
      setOriginCoords(null);
      setOriginAddress('');
    } else {
      setDestinationCoords(null);
      setDestinationAddress('');
    }
  };

  // Función para manejar la selección de imagen
  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Por favor, selecciona un archivo de imagen válido');
    }
  };

  // Manejar drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validaciones básicas
    if (!name || !destination || !dateI || !dateF) {
      toast.error('Por favor, completa todos los campos obligatorios (nombre, destino, fecha de inicio y fecha de fin)');
      setIsSubmitting(false);
      return;
    }
    
    // Validar que las fechas no estén vacías
    if (!dateI.trim() || !dateF.trim()) {
      toast.error('Las fechas son obligatorias');
      setIsSubmitting(false);
      return;
    }

    // Comparar fechas usando componentes para evitar problemas de zona horaria
    const [yearI, monthI, dayI] = dateI.split('-').map(Number);
    const [yearF, monthF, dayF] = dateF.split('-').map(Number);
    const startDate = new Date(yearI, monthI - 1, dayI);
    const endDate = new Date(yearF, monthF - 1, dayF);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (startDate >= endDate) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      setIsSubmitting(false);
      return;
    }

    // Validar que la fecha de inicio no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      toast.error('La fecha de inicio no puede ser anterior a la fecha actual');
      setIsSubmitting(false);
      return;
    }

    // Validar longitud del nombre
    if (name.length < 3) {
      toast.error('El nombre del viaje debe tener al menos 3 caracteres');
      setIsSubmitting(false);
      return;
    }

    if (name.length > 150) {
      toast.error('El nombre del viaje no puede exceder 150 caracteres');
      setIsSubmitting(false);
      return;
    }

    // Validar costo si se proporciona
    if (cost && parseFloat(cost) < 0) {
      toast.error('El costo no puede ser negativo');
      setIsSubmitting(false);
      return;
    }

    try {
      // Obtener el ID del usuario desde el contexto de autenticación
      const userData = localStorage.getItem('userData');
      if (!userData) {
        toast.error('Error: No se encontró información del usuario');
        setIsSubmitting(false);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id;
      
      // Verificar que el userId sea válido
      if (!userId || userId === 'null' || userId === null) {
        toast.error('Error: ID de usuario inválido. Por favor, inicia sesión nuevamente.');
        setIsSubmitting(false);
        return;
      }

      // Crear el objeto del viaje según la estructura del backend
      const tripData = {
        name: name,
        destination: destination,
        origin: origin || null,
        dateI: dateI,  // Cambiado de date_i a dateI
        dateF: dateF,  // Cambiado de date_f a dateF
        description: description || null,
        cost: cost ? parseFloat(cost) : 0,
        currency: currency,  // Agregar moneda
        vehicle: selectedVehicle,
        image: selectedIcon,
        status: 'planning',
        // Datos para Google Maps según TripDestination
        originCoords: originCoords,
        destinationCoords: destinationCoords,
        originAddress: originAddress,
        destinationAddress: destinationAddress,
        transportMode: selectedVehicle
      };

      // Llamada al backend usando la función de API
      const response = await api.createTrip(tripData, parseInt(userId),imageFile);

      if (response.ok) {
        await response.json();
        toast.success('¡Viaje creado exitosamente!');
        router.push('/dashboard');
      } else {
        // Manejar diferentes tipos de errores
        if (response.status === 302 || response.status === 303) {
          toast.error('Error: El servidor está redirigiendo. Verifica que estés autenticado correctamente.');
        } else if (response.status === 401) {
          toast.error('Error: No estás autenticado. Por favor, inicia sesión nuevamente.');
          router.push('/login');
        } else {
          try {
            const errorData = await response.json();
            toast.error(`Error al crear el viaje: ${errorData.message || 'Error desconocido'}`);
          } catch {
            toast.error(`Error del servidor (${response.status}): ${response.statusText}`);
          }
        }
      }
      
    } catch {
      toast.error('Hubo un error al crear el viaje. Inténtalo de nuevo.');
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

  const vehicleOptions = [
    { value: 'auto', label: 'Auto' },
    { value: 'avion', label: 'Avión' },
    { value: 'caminando', label: 'Caminando' }
  ];

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh', 
      bgcolor: '#FAFAFA',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      position: 'relative',
      backgroundImage: imagePreview ? `url(${imagePreview})` : 'linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 25%, #FFF3E0 50%, #F3E5F5 75%, #E1F5FE 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      {/* Fondo degradado colorido por defecto (cuando no hay imagen) */}
      {!imagePreview && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 25%, #FFF3E0 50%, #F3E5F5 75%, #E1F5FE 100%)',
          zIndex: 0,
          opacity: 0.6,
        }} />
      )}
      
      {/* Overlay blurreado para la imagen de fondo */}
      {imagePreview && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${imagePreview})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
          opacity: 0.3,
          zIndex: 0,
          transform: 'scale(1.1)', // Escalar para evitar bordes blancos
        }} />
      )}
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Minimal Header */}
        <Box sx={{ 
          bgcolor: '#E3F2FD',
          borderBottom: '1px solid #BBDEFB',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
              size="small"
            onClick={() => router.back()}
              sx={{ color: '#666' }}
          >
            <ArrowBack />
          </IconButton>
            <TravelExplore sx={{ color: '#03a9f4', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#424242' }}>
              Crear Nuevo Viaje
            </Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 4 }}>

        {/* Mostrar errores */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card sx={{ 
            bgcolor: imagePreview ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: imagePreview ? 'blur(10px)' : 'none',
            border: imagePreview ? '1px solid #E0E0E0' : '1px solid rgba(187, 222, 251, 0.5)',
            boxShadow: imagePreview ? 'none' : '0 4px 20px rgba(25, 118, 210, 0.1)',
            borderRadius: 2,
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit} sx={{ '& > *': { mb: 3 } }}>
            
              {/* Nombre del viaje y Descripción en la misma fila */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  label="Nombre del viaje"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Aventura en París"
                  required
                  inputProps={{ maxLength: 150 }}
                  sx={{
                    flex: '1 1 300px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white',
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Descripción"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu viaje..."
                  multiline
                  rows={3}
                  sx={{
                    flex: '1 1 300px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white',
                    }
                  }}
                />
              </Box>

              {/* Origen y Destino en la misma fila */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                  {/* Origen */}
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      ref={originInputRef}
                      fullWidth
                      label="Origen (opcional)"
                      value={origin}
                      onChange={(e) => {
                        setOrigin(e.target.value);
                        if (!e.target.value.trim()) {
                          clearCoordinates(true);
                        }
                      }}
                      placeholder="Ej: Buenos Aires, Argentina"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                    {origin && !isGoogleMapsLoaded && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" color="text.secondary">
                          Cargando Google Maps...
                        </Typography>
                      </Box>
                    )}
                    {originCoords && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                          Ubicación: {originAddress}
                        </Typography>
                        <Typography variant="caption" sx={{ mb: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                          💡 Haz click en el mapa para seleccionar una ubicación más específica
                        </Typography>
                        <Box
                          ref={originMapRef}
                          sx={{
                            width: '100%',
                            height: 200,
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                            overflow: 'hidden',
                            cursor: 'crosshair'
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Destino */}
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      ref={destinationInputRef}
                      fullWidth
                      label="Destino"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        if (!e.target.value.trim()) {
                          clearCoordinates(false);
                        }
                      }}
                      placeholder="Ej: París, Francia"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white',
                        }
                      }}
                    />
                    {destination && !isGoogleMapsLoaded && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" color="text.secondary">
                          Cargando Google Maps...
                        </Typography>
                      </Box>
                    )}
                    {destinationCoords && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                          Ubicación: {destinationAddress}
                        </Typography>
                        <Typography variant="caption" sx={{ mb: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                          💡 Haz click en el mapa para seleccionar una ubicación más específica
                        </Typography>
                        <Box
                          ref={destinationMapRef}
                          sx={{
                            width: '100%',
                            height: 200,
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                            overflow: 'hidden',
                            cursor: 'crosshair'
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

              {/* Imagen del viaje y Fechas en la misma fila */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                {/* Imagen del viaje - Drag and Drop */}
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                    Imagen del Viaje (Opcional)
                  </Typography>
                  <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                      border: `3px dashed ${isDragging ? '#81c784' : '#81c784'}`,
                      borderRadius: '20px',
                      p: { xs: 3, md: 6.25 },
                      textAlign: 'center',
                      background: isDragging 
                        ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
                        : 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%)',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease',
                      position: 'relative',
                      minHeight: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'linear-gradient(45deg, transparent, rgba(129, 199, 132, 0.1), transparent)',
                        transform: 'rotate(45deg)',
                        transition: 'all 0.6s',
                      },
                      '&:hover': {
                        borderColor: '#66bb6a',
                        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                        transform: 'scale(1.02)',
                        boxShadow: '0 10px 40px rgba(129, 199, 132, 0.3)',
                        '&::before': {
                          left: '100%',
                        },
                      },
                    }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageChange(file);
                      }
                    };
                    input.click();
                  }}
                >
                  {imagePreview ? (
                    <>
                      <Box
                        component="img"
                        src={imagePreview}
                        alt="Preview"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: 300,
                          borderRadius: 2,
                          objectFit: 'contain',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        {imageFile?.name}
                </Typography>
                <Button
                  variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Eliminar Imagen
                </Button>
                    </>
                  ) : (
                    <>
                      <Add sx={{ 
                        fontSize: 64, 
                        color: '#81c784',
                        mb: 2,
                        animation: 'bounce 2s ease-in-out infinite',
                        '@keyframes bounce': {
                          '0%, 100%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-15px)' },
                        },
                        position: 'relative',
                        zIndex: 1,
                      }} />
                      <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 500, position: 'relative', zIndex: 1 }}>
                        <strong>Arrastra y suelta una imagen aquí</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2c3e50', position: 'relative', zIndex: 1 }}>
                        o haz clic para seleccionar
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#757575', mt: 1, position: 'relative', zIndex: 1 }}>
                        PNG, JPG, GIF hasta 10MB
                      </Typography>
                    </>
                  )}
                </Box>
                </Box>
                
                {/* Fechas - en columna al lado de la imagen */}
                <Box sx={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Fecha de inicio"
                    type="date"
                    value={dateI}
                    onChange={(e) => setDateI(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0]
                    }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'white',
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Fecha de fin"
                    type="date"
                    value={dateF}
                    onChange={(e) => {
                      const newDateF = e.target.value;
                      setDateF(newDateF);
                      if (dateI && newDateF && new Date(newDateF) < new Date(dateI)) {
                        toast.warning('La fecha de fin no puede ser anterior a la fecha de inicio');
                      }
                    }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: dateI || new Date().toISOString().split('T')[0]
                    }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'white',
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Mostrar duración calculada */}
              {calculateDuration() > 0 && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: '#E3F2FD',
                    color: '#1976D2',
                    border: '1px solid #BBDEFB',
                    '& .MuiAlert-icon': {
                      color: '#1976D2'
                    }
                  }}
                >
                  Duración: {calculateDuration()} día{calculateDuration() !== 1 ? 's' : ''}
                </Alert>
              )}

              {/* Costo */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <TextField
                      fullWidth
                      label="Presupuesto aproximado"
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0.00"
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        startAdornment: (
                          <Typography sx={{ mr: 1, color: 'primary.main', fontWeight: 600 }}>
                            {currency === 'PESOS' ? '$' : currency === 'DOLARES' ? 'US$' : '€'}
                          </Typography>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white',
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <FormControl fullWidth>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                        Moneda
                      </Typography>
                      <RadioGroup
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'PESOS' | 'DOLARES' | 'EUROS')}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: 1,
                          '& .MuiFormControlLabel-root': {
                            margin: 0,
                            padding: 1.5,
                            borderRadius: 2,
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(3, 169, 244, 0.05)',
                              borderColor: 'primary.light',
                            },
                            '&.Mui-checked': {
                              backgroundColor: 'rgba(3, 169, 244, 0.1)',
                              borderColor: 'primary.main',
                            }
                          }
                        }}
                      >
                        <FormControlLabel
                          value="PESOS"
                          control={<Radio size="small" />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>$</Typography>
                              <Typography variant="body2">Pesos</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="DOLARES"
                          control={<Radio size="small" />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>US$</Typography>
                              <Typography variant="body2">Dólares</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="EUROS"
                          control={<Radio size="small" />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>€</Typography>
                              <Typography variant="body2">Euros</Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                </Box>
              </Box>

              {/* Selector de vehículo */}
              <Box>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 2,
                      '& .MuiFormControlLabel-root': {
                        flex: '1 1 0',
                        margin: 0,
                        padding: 3,
                        borderRadius: 3,
                        border: '2px solid transparent',
                        transition: 'all 0.3s ease',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: 'rgba(3, 169, 244, 0.05)',
                          borderColor: 'primary.light',
                          transform: 'translateY(-2px)',
                        },
                        '&.Mui-checked': {
                          backgroundColor: 'rgba(3, 169, 244, 0.1)',
                          borderColor: 'primary.main',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 16px rgba(3, 169, 244, 0.2)',
                        }
                      }
                    }}
                  >
                    {vehicleOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio sx={{ color: 'primary.main' }} />}
                        label={
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            gap: 2, 
                            width: '100%',
                            textAlign: 'center'
                          }}>
                            <Avatar sx={{ 
                              bgcolor: selectedVehicle === option.value ? 'primary.main' : 'grey.300',
                              width: 50, 
                              height: 50,
                              transition: 'all 0.3s ease',
                              mb: 1
                            }}>
                              {getVehicleIcon(option.value)}
                            </Avatar>
                            <Typography sx={{ 
                              fontWeight: 600, 
                              color: 'text.primary',
                              fontSize: '0.9rem'
                            }}>
                              {option.label}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>

              {/* Selector de icono */}
              <Box>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value)}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 2,
                      '& .MuiFormControlLabel-root': {
                        flex: '1 1 0',
                        margin: 0,
                        padding: 3,
                        borderRadius: 3,
                        border: '2px solid transparent',
                        transition: 'all 0.3s ease',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: 'rgba(3, 169, 244, 0.05)',
                          borderColor: 'primary.light',
                          transform: 'translateY(-2px)',
                        },
                        '&.Mui-checked': {
                          backgroundColor: 'rgba(3, 169, 244, 0.1)',
                          borderColor: 'primary.main',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 16px rgba(3, 169, 244, 0.2)',
                        }
                      }
                    }}
                  >
                    {iconOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio sx={{ color: 'primary.main' }} />}
                        label={
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            gap: 2, 
                            width: '100%',
                            textAlign: 'center'
                          }}>
                            <Avatar sx={{ 
                              bgcolor: selectedIcon === option.value ? 'primary.main' : 'grey.300',
                              width: 50, 
                              height: 50,
                              transition: 'all 0.3s ease',
                              mb: 1
                            }}>
                              {getIcon(option.value)}
                            </Avatar>
                            <Typography sx={{ 
                              fontWeight: 600, 
                              color: 'text.primary',
                              fontSize: '0.9rem'
                            }}>
                              {option.label}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>

              {/* Preview del viaje */}
              {name && (
                  <Card sx={{ 
                  bgcolor: '#E3F2FD',
                  borderRadius: 2,
                  border: '1px solid #BBDEFB',
                  boxShadow: 'none',
                }}>
                  <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ 
                        bgcolor: '#03a9f4', 
                        width: 60, 
                        height: 60,
                        }}>
                          {getIcon(selectedIcon)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h4" sx={{ fontWeight: 600, mb: 0.5, color: '#1976D2' }}>
                            {name}
                          </Typography>
                          {destination && (
                          <Typography variant="body2" sx={{ color: '#64B5F6', mb: 1 }}>
                            {destination}
                            </Typography>
                          )}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            {dateI && dateF && (
                              <Chip
                              label={`${new Date(dateI).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} - ${new Date(dateF).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}`}
                                size="small"
                                sx={{ 
                                bgcolor: '#1976D2',
                                  color: 'white',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                }}
                              />
                            )}
                            <Chip
                              label={vehicleOptions.find(v => v.value === selectedVehicle)?.label || 'Auto'}
                              size="small"
                              icon={getVehicleIcon(selectedVehicle)}
                              sx={{ 
                              bgcolor: '#1976D2',
                                color: 'white',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              }}
                            />
                            {cost && (
                              <Chip
                              label={`${currency === 'PESOS' ? '$' : currency === 'DOLARES' ? 'US$' : '€'}${parseFloat(cost).toLocaleString()}`}
                                size="small"
                                sx={{ 
                                bgcolor: '#1976D2',
                                  color: 'white',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
              )}

              {/* Botones */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 2, 
                pt: 3,
                borderTop: '1px solid #E0E0E0',
                mt: 3
              }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  startIcon={<Cancel />}
                  disabled={isSubmitting}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    borderColor: '#BDBDBD',
                    color: '#666',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#999',
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #66bb6a 0%, #4fc3f7 50%, #ff9800 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientMove 8s ease-in-out infinite',
                    '@keyframes gradientMove': {
                      '0%, 100%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' },
                    },
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '15px',
                    textTransform: 'none',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 15px rgba(79, 195, 247, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 0,
                      height: 0,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translate(-50%, -50%)',
                      transition: 'width 0.8s ease, height 0.8s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(79, 195, 247, 0.4)',
                      '&::before': {
                        width: '200px',
                        height: '200px',
                      },
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&:disabled': {
                      background: '#bdbdbd',
                      color: '#666',
                      animation: 'none',
                    }
                  }}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Viaje'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
        </Box>
      </Box>
    </Box>
  );
}