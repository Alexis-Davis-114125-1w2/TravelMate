'use client';

import { useAuth } from '../../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, use } from 'react';
import { api, API_BASE_URL, getAuthHeaders } from '../../../../lib/api';
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
  Card,
  CardContent,
  CardActions,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Backdrop,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Badge,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  ArrowBack,
  TravelExplore,
  WbSunny,
  Landscape,
  LocationCity,
  BeachAccess,
  Schedule,
  People,
  DirectionsCar,
  Flight,
  DirectionsWalk,
  Edit,
  Share,
  Add,
  PersonAdd,
  Place,
  Route,
  MyLocation,
  ContentCopy,
  CheckCircle,
} from '@mui/icons-material';

interface TripDetails {
  id: number;
  name: string;
  description?: string;
  origin?: string;
  destination: string;
  dateI: string;
  dateF: string;
  cost: number;
  vehicle: string;
  image?: string;
  status: string;
  joinCode?: string;
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  originAddress?: string;
  destinationAddress?: string;
  transportMode?: string;
  participants?: Participant[];
}

interface Participant {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
}

export default function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;
  
  // Estados principales
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  
  // Estados para mapas
  const [map, setMap] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  const [distanceFromCurrent, setDistanceFromCurrent] = useState<string>('');
  
  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openShareDialog, setOpenShareDialog] = useState(false);

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

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAqcm8Rfw8eKvrI9u_1e7zNGzXt1rSeHlw&libraries=places,directions&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('Error cargando Google Maps');
        console.log('Posibles causas:');
        console.log('1. Bloqueador de anuncios está bloqueando Google Maps');
        console.log('2. Problema de conexión a internet');
        console.log('3. API key inválida');
        toast.error('Error al cargar Google Maps. Verifica que no tengas un bloqueador de anuncios activo y tu conexión a internet.');
      };
      
      window.initGoogleMaps = () => {
        console.log('Google Maps cargado exitosamente');
        setIsGoogleMapsLoaded(true);
      };
      
      // Timeout para Google Maps
      const timeout = setTimeout(() => {
        if (!isGoogleMapsLoaded) {
          console.error('Timeout cargando Google Maps');
          toast.error('Timeout cargando Google Maps. Verifica tu conexión.');
        }
      }, 10000); // 10 segundos timeout
      
      window.initGoogleMaps = () => {
        clearTimeout(timeout);
        console.log('Google Maps cargado exitosamente');
        setIsGoogleMapsLoaded(true);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Cargar datos del viaje
  useEffect(() => {
    const fetchTripData = async () => {
      if (!user?.id || !tripId) return;

      try {
        setLoading(true);
        setError(null);
        
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        
        console.log('Fetching trip details for tripId:', tripId, 'userId:', userId);
        console.log('API URL:', `${API_BASE_URL}/api/trips/${tripId}?userId=${userId}`);
        console.log('Auth headers:', getAuthHeaders());
        console.log('API_BASE_URL:', API_BASE_URL);
        
        console.log('Iniciando carga de datos del viaje...');
        
        // Obtener detalles del viaje
        const tripResponse = await fetch(`${API_BASE_URL}/api/trips/${tripId}?userId=${userId}`, {
          headers: getAuthHeaders()
        });
        
        if (!tripResponse.ok) {
          if (tripResponse.status === 302) {
            throw new Error('Error de autenticación. Por favor, inicia sesión nuevamente.');
          }
          
          // Intentar obtener más información del error
          let errorMessage = `Error del servidor: ${tripResponse.status} ${tripResponse.statusText}`;
          try {
            const errorData = await tripResponse.json();
            console.log('Error response data:', errorData);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            console.log('No se pudo parsear el error del servidor');
            console.log('Response status:', tripResponse.status);
            console.log('Response statusText:', tripResponse.statusText);
          }
          
          console.error('Full error details:', {
            status: tripResponse.status,
            statusText: tripResponse.statusText,
            url: `${API_BASE_URL}/api/trips/${tripId}?userId=${userId}`,
            headers: getAuthHeaders()
          });
          
          throw new Error(errorMessage);
        }
        
        const tripData = await tripResponse.json();
        setTrip(tripData);
        
        // Los participantes ya vienen en la respuesta del viaje
        if (tripData.participants) {
          setParticipants(tripData.participants);
        } else {
          // Fallback: obtener participantes por separado si no vienen en la respuesta
          const participantsResponse = await fetch(
            `${API_BASE_URL}/api/trips/${tripId}/participants?userId=${userId}`,
            { headers: getAuthHeaders() }
          );
          
          if (participantsResponse.ok) {
            const participantsData = await participantsResponse.json();
            setParticipants(participantsData.data || []);
          }
        }
        
      } catch (err) {
        console.error('Error al cargar datos del viaje:', err);
        setError('Error al cargar los datos del viaje');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchTripData();
    }
  }, [user, isAuthenticated, tripId]);

  // Inicializar mapa cuando se carguen los datos
  useEffect(() => {
    if (isGoogleMapsLoaded && trip && mapRef.current) {
      initializeMap();
      calculateDistanceMetrics();
    }
  }, [isGoogleMapsLoaded, trip]);

  // Calcular métricas cuando cambie la ubicación actual
  useEffect(() => {
    if (trip && currentLocation) {
      calculateDistanceMetrics();
    }
  }, [currentLocation, trip]);

  const initializeMap = () => {
    if (!mapRef.current || !trip || !window.google) return;

    // Determinar el centro del mapa
    let center = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires por defecto
    if (trip.originLatitude && trip.originLongitude) {
      center = { lat: trip.originLatitude, lng: trip.originLongitude };
    } else if (trip.destinationLatitude && trip.destinationLongitude) {
      center = { lat: trip.destinationLatitude, lng: trip.destinationLongitude };
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 8,
      center: center,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);

    // Inicializar servicios de direcciones
    const directionsServiceInstance = new window.google.maps.DirectionsService();
    const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
      draggable: false,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#03a9f4',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    setDirectionsService(directionsServiceInstance);
    setDirectionsRenderer(directionsRendererInstance);
    directionsRendererInstance.setMap(mapInstance);

    // Calcular y mostrar ruta si tenemos origen y destino
    if (trip.originLatitude && trip.originLongitude && trip.destinationLatitude && trip.destinationLongitude) {
      calculateRoute();
    }

    // Obtener ubicación actual
    getCurrentLocation();
  };

  const calculateRoute = () => {
    if (!directionsService || !directionsRenderer || !trip) return;

    // Verificar que tenemos coordenadas válidas
    if (!trip.originLatitude || !trip.originLongitude || 
        !trip.destinationLatitude || !trip.destinationLongitude) {
      console.log('No hay coordenadas suficientes para calcular la ruta');
      return;
    }

    const origin = { lat: trip.originLatitude, lng: trip.originLongitude };
    const destination = { lat: trip.destinationLatitude, lng: trip.destinationLongitude };

    // Determinar modo de transporte
    let travelMode = window.google.maps.TravelMode.DRIVING;
    let vehicleIcon = '🚗';
    switch (trip.vehicle) {
      case 'avion':
        travelMode = window.google.maps.TravelMode.TRANSIT;
        vehicleIcon = '✈️';
        break;
      case 'caminando':
        travelMode = window.google.maps.TravelMode.WALKING;
        vehicleIcon = '🚶';
        break;
      default:
        travelMode = window.google.maps.TravelMode.DRIVING;
        vehicleIcon = '🚗';
    }

    directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: travelMode,
      optimizeWaypoints: true,
      provideRouteAlternatives: false
    }, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        
        // Calcular distancia y duración total
        let totalDistance = 0;
        let totalDuration = 0;
        
        result.routes[0].legs.forEach((leg: any) => {
          totalDistance += leg.distance.value; // en metros
          totalDuration += leg.duration.value; // en segundos
        });
        
        // Convertir a unidades más legibles
        const distanceKm = (totalDistance / 1000).toFixed(1);
        const durationHours = Math.floor(totalDuration / 3600);
        const durationMinutes = Math.floor((totalDuration % 3600) / 60);
        
        let durationText = '';
        if (durationHours > 0) {
          durationText = `${durationHours}h ${durationMinutes}m`;
        } else {
          durationText = `${durationMinutes}m`;
        }
        
        setRouteDistance(`${distanceKm} km`);
        setRouteDuration(durationText);
        
        console.log(`Ruta calculada: ${distanceKm} km, ${durationText} (${vehicleIcon})`);
        
        // Ajustar el zoom para mostrar toda la ruta
        const bounds = new window.google.maps.LatLngBounds();
        result.routes[0].legs.forEach((leg: any) => {
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
        });
        map.fitBounds(bounds);
      } else {
        console.error('Error calculando ruta:', status);
        setRouteDistance('Error al calcular ruta');
        setRouteDuration('');
      }
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // Agregar marcador de ubicación actual
          if (map) {
            new window.google.maps.Marker({
              position: location,
              map: map,
              title: 'Tu ubicación actual',
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new window.google.maps.Size(32, 32)
              }
            });
          }
          
          // Calcular distancia desde ubicación actual al destino
          if (trip && trip.destinationLatitude && trip.destinationLongitude) {
            const distance = calculateDistance(
              location.lat,
              location.lng,
              trip.destinationLatitude,
              trip.destinationLongitude
            );
            setDistanceFromCurrent(`${distance.toFixed(1)} km`);
            console.log(`Distancia desde tu ubicación actual: ${distance.toFixed(2)} km`);
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        }
      );
    }
  };

  // Función para calcular distancia entre dos puntos usando la fórmula de Haversine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distancia en kilómetros
    return distance;
  };

  // Función para calcular y mostrar métricas de distancia
  const calculateDistanceMetrics = () => {
    if (!trip || !trip.originLatitude || !trip.originLongitude || 
        !trip.destinationLatitude || !trip.destinationLongitude) {
      return;
    }

    const distance = calculateDistance(
      trip.originLatitude,
      trip.originLongitude,
      trip.destinationLatitude,
      trip.destinationLongitude
    );

    console.log(`Distancia en línea recta: ${distance.toFixed(2)} km`);
    
    // Si tenemos ubicación actual, calcular distancia desde ahí
    if (currentLocation) {
      const distanceFromCurrent = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        trip.destinationLatitude,
        trip.destinationLongitude
      );
      console.log(`Distancia desde tu ubicación actual: ${distanceFromCurrent.toFixed(2)} km`);
    }
  };

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
        return <DirectionsCar sx={{ fontSize: 24 }} />;
      case 'avion':
        return <Flight sx={{ fontSize: 24 }} />;
      case 'caminando':
        return <DirectionsWalk sx={{ fontSize: 24 }} />;
      default:
        return <DirectionsCar sx={{ fontSize: 24 }} />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-AR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error, dateString);
      return 'Fecha inválida';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'planning':
        return 'primary';
      case 'active':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Completado';
      case 'planning':
        return 'Planificando';
      case 'active':
        return 'En curso';
      default:
        return status || 'Desconocido';
    }
  };

  const handleCopyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const actions = [
    { icon: <Edit />, name: 'Editar Viaje', action: () => router.push(`/trip/${tripId}/edit`) },
    { icon: <PersonAdd />, name: 'Agregar Miembros', action: () => router.push(`/trip/${tripId}/add-users`) },
    { icon: <Share />, name: 'Compartir', action: () => setOpenShareDialog(true) },
  ];

  if (isLoading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6">Cargando detalles del viaje...</Typography>
        </Box>
      </Backdrop>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!trip) {
    return (
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
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
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
              Viaje no encontrado
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
          <Alert severity="error">
            No se pudo cargar la información del viaje. Verifica que tengas acceso a este viaje.
          </Alert>
        </Container>
      </Box>
    );
  }

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
            {getIcon(trip.image || 'default')}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
              {trip.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {trip.destination}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(trip.status)}
            color={getStatusColor(trip.status) as any}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* Información del Viaje */}
          <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={3} mb={3}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    width: 80, 
                    height: 80 
                  }}>
                    {getIcon(trip.image || 'default')}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                      {trip.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      {trip.destination}
                    </Typography>
                    <Chip
                      label={getStatusLabel(trip.status)}
                      color={getStatusColor(trip.status) as any}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                {trip.description && (
                  <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    {trip.description}
                  </Typography>
                )}

                {/* Detalles del viaje */}
                <Box sx={{ mb: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Schedule sx={{ color: 'primary.main' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDate(trip.dateI)} - {formatDate(trip.dateF)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {getVehicleIcon(trip.vehicle)}
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {trip.vehicle === 'auto' ? 'En auto' : 
                       trip.vehicle === 'avion' ? 'En avión' : 
                       trip.vehicle === 'caminando' ? 'Caminando' : 'En auto'}
                    </Typography>
                  </Box>

                  {trip.cost > 0 && (
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Presupuesto: ${trip.cost.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Código de invitación */}
                {trip.joinCode && (
                  <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                      Código de Invitación
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1 }}>
                        {trip.joinCode}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyJoinCode(trip.joinCode!)}
                        sx={{ 
                          bgcolor: copiedCode === trip.joinCode ? 'success.main' : 'transparent',
                          color: copiedCode === trip.joinCode ? 'white' : 'inherit',
                          '&:hover': {
                            bgcolor: copiedCode === trip.joinCode ? 'success.dark' : 'action.hover',
                          }
                        }}
                      >
                        {copiedCode === trip.joinCode ? <CheckCircle sx={{ fontSize: 18 }} /> : <ContentCopy sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Box>
                    {copiedCode === trip.joinCode && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                        ¡Código copiado!
                      </Typography>
                    )}
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Mapa */}
          <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Ruta del Viaje
                    </Typography>
                    {routeDistance && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                          {routeDistance}
                        </Typography>
                        {routeDuration && (
                          <Typography variant="body2" color="text.secondary">
                            • {routeDuration}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {trip.origin ? `${trip.origin} → ${trip.destination}` : trip.destination}
                  </Typography>
                  {trip.vehicle && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      {getVehicleIcon(trip.vehicle)}
                      <Typography variant="body2" color="text.secondary">
                        {trip.vehicle === 'auto' ? 'En auto' : 
                         trip.vehicle === 'avion' ? 'En avión' : 
                         trip.vehicle === 'caminando' ? 'Caminando' : 'En auto'}
                      </Typography>
                    </Box>
                  )}
                  {distanceFromCurrent && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <MyLocation sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                        Te quedan {distanceFromCurrent} para llegar
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box
                  ref={mapRef}
                  sx={{
                    width: '100%',
                    height: 400,
                    borderRadius: 0,
                    overflow: 'hidden'
                  }}
                />
                {!isGoogleMapsLoaded && (
                  <Box sx={{ 
                    height: 400, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                      Cargando mapa...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Lista de Participantes */}
          <Box sx={{ width: '100%' }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <People sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Miembros del Viaje ({participants.length})
                  </Typography>
                </Box>

                {participants.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <People sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      No hay miembros en este viaje
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => router.push(`/trip/${tripId}/add-users`)}
                    >
                      Agregar Miembros
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {participants.map((participant, index) => (
                      <div key={participant.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {participant.name.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={participant.name}
                            secondary={participant.email}
                          />
                          {participant.id === (typeof user?.id === 'string' ? parseInt(user.id, 10) : user?.id) && (
                            <Chip
                              label="Tú"
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </ListItem>
                        {index < participants.length - 1 && <Divider />}
                      </div>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>

      {/* Dialog para compartir */}
      <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Compartir Viaje</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comparte este viaje con otros usuarios usando el código de invitación
          </Typography>
          {trip.joinCode && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider'
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                Código de Invitación
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1 }}>
                  {trip.joinCode}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyJoinCode(trip.joinCode!)}
                  sx={{ 
                    bgcolor: copiedCode === trip.joinCode ? 'success.main' : 'transparent',
                    color: copiedCode === trip.joinCode ? 'white' : 'inherit',
                    '&:hover': {
                      bgcolor: copiedCode === trip.joinCode ? 'success.dark' : 'action.hover',
                    }
                  }}
                >
                  {copiedCode === trip.joinCode ? <CheckCircle sx={{ fontSize: 18 }} /> : <ContentCopy sx={{ fontSize: 18 }} />}
                </IconButton>
              </Box>
              {copiedCode === trip.joinCode && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                  ¡Código copiado!
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenShareDialog(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
