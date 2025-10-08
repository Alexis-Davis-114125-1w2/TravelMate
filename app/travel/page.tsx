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
  const [imageFile, setImageFile] = useState<File | null>(null);
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
        console.error('Error cargando Google Maps');
        toast.error('Error al cargar Google Maps. Verifica tu conexión a internet.');
      };
      
      window.initGoogleMaps = () => {
        console.log('Google Maps cargado exitosamente');
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
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
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

    if (new Date(dateI) >= new Date(dateF)) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      setIsSubmitting(false);
      return;
    }

    // Validar que la fecha de inicio no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(dateI) < today) {
      toast.error('La fecha de inicio no puede ser en el pasado');
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

      console.log('Nuevo viaje a guardar en BD:', tripData);
      console.log('User ID:', userId, 'Type:', typeof userId);
      console.log('Fechas - dateI:', dateI, 'dateF:', dateF);
      console.log('Fechas válidas:', dateI && dateF);
      
      // Llamada al backend usando la función de API
      const response = await api.createTrip(tripData, parseInt(userId));

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Viaje creado exitosamente:', result);
        toast.success('¡Viaje creado exitosamente!');
        router.push('/dashboard');
      } else {
        // Manejar diferentes tipos de errores
        if (response.status === 302 || response.status === 303) {
          console.error('Error de redirección del servidor');
          toast.error('Error: El servidor está redirigiendo. Verifica que estés autenticado correctamente.');
        } else if (response.status === 401) {
          console.error('Error de autenticación');
          toast.error('Error: No estás autenticado. Por favor, inicia sesión nuevamente.');
          router.push('/login');
        } else {
          try {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);
            toast.error(`Error al crear el viaje: ${errorData.message || 'Error desconocido'}`);
          } catch (parseError) {
            console.error('Error al parsear respuesta:', parseError);
            toast.error(`Error del servidor (${response.status}): ${response.statusText}`);
          }
        }
      }
      
    } catch (error) {
      console.error('Error al crear el viaje:', error);
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
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.back()}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <Add />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
              Crear Nuevo Viaje
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Planifica tu próxima aventura
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Header Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Crear Nuevo Viaje
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Planifica tu próxima aventura con todos los detalles importantes
          </Typography>
        </Box>

        {/* Mostrar errores */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card sx={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          <CardContent sx={{ p: 6 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ '& > *': { mb: 4 } }}>
            
              {/* Nombre del viaje */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Información Básica
                </Typography>
                <TextField
                  fullWidth
                  label="Nombre del viaje"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Aventura en París"
                  required
                  inputProps={{ maxLength: 150 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>

              {/* Origen y Destino */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Ubicaciones
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Origen */}
                  <Box>
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
                  <Box>
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
              </Box>
              
              {/* Descripción */}
              <TextField
                fullWidth
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu viaje..."
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              {/* Imagen del viaje */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Imagen del Viaje (Opcional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ borderRadius: 2 }}
                >
                  {imageFile ? 'Cambiar Imagen' : 'Subir Imagen'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {imageFile && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Archivo seleccionado: {imageFile.name}
                  </Typography>
                )}
              </Box>

              {/* Fechas */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Fechas del Viaje
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <TextField
                      fullWidth
                      label="Fecha de inicio"
                      type="date"
                      value={dateI}
                      onChange={(e) => setDateI(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <TextField
                      fullWidth
                      label="Fecha de fin"
                      type="date"
                      value={dateF}
                      onChange={(e) => setDateF(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Mostrar duración calculada */}
              {calculateDuration() > 0 && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
                    color: 'white',
                    '& .MuiAlert-icon': {
                      color: 'white'
                    }
                  }}
                >
                  Duración: {calculateDuration()} día{calculateDuration() !== 1 ? 's' : ''}
                </Alert>
              )}

              {/* Costo */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Presupuesto
                </Typography>
                <TextField
                  fullWidth
                  label="Presupuesto aproximado"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: 'primary.main', fontWeight: 600 }}>$</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>

              {/* Selector de vehículo */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                  Medio de Transporte
                </Typography>
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                  Tipo de Viaje
                </Typography>
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
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                    Vista Previa
                  </Typography>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
                    color: 'white',
                    borderRadius: 3,
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(3, 169, 244, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          width: 80, 
                          height: 80,
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255,255,255,0.3)'
                        }}>
                          {getIcon(selectedIcon)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h5" component="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {name}
                          </Typography>
                          {destination && (
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                              Destino: {destination}
                            </Typography>
                          )}
                          {description && (
                            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                              {description}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {dateI && dateF && (
                              <Chip
                                label={`${new Date(dateI).toLocaleDateString('es-ES')} - ${new Date(dateF).toLocaleDateString('es-ES')}`}
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(255,255,255,0.2)',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            )}
                            <Chip
                              label={vehicleOptions.find(v => v.value === selectedVehicle)?.label || 'Auto'}
                              size="small"
                              icon={getVehicleIcon(selectedVehicle)}
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                            {cost && (
                              <Chip
                                label={`$${parseFloat(cost).toLocaleString()}`}
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(255,255,255,0.2)',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* Botones */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 3, 
                pt: 4,
                borderTop: '1px solid rgba(0,0,0,0.1)',
                mt: 4
              }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  startIcon={<Cancel />}
                  disabled={isSubmitting}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'rgba(3, 169, 244, 0.05)',
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0288d1 0%, #29b6f6 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(3, 169, 244, 0.3)',
                    },
                    '&:disabled': {
                      background: 'grey.300',
                      color: 'grey.500',
                    }
                  }}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Viaje'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}