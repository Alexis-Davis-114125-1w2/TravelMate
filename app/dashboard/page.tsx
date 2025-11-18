'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Trip } from '../../types/trip';
import { api, API_BASE_URL, getAuthHeaders } from '../../lib/api';
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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  MenuItem,
  Menu,
  Avatar,
  CircularProgress,
  Backdrop,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  TravelExplore,
  BarChart,
  Logout,
  Add,
  WbSunny,
  Landscape,
  LocationCity,
  Schedule,
  People,
  TrendingUp,
  Visibility,
  PersonAdd,
  Place,
  GroupAdd,
  ContentCopy,
  Delete,
  Menu as MenuIcon,
  Star,
  MoreVert,
  CheckCircle,
  RadioButtonUnchecked,
  ShoppingCart,
  ExpandMore,
  ExpandLess,
  FilterList,
  Cloud,
  CloudQueue,
  AcUnit,
  Thunderstorm,
  WaterDrop,
  Foggy,
  Person,
  HelpOutline,
  Gavel
} from '@mui/icons-material';

interface TripWithParticipants extends Trip {
  participantCount?: number;
  joinCode?: string;
}

// Función para obtener la hora actual (fuera del componente para evitar problemas de scope)
const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return {
    hours: displayHours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    ampm
  };
};

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<TripWithParticipants[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [tripCode, setTripCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<TripWithParticipants | null>(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarCenterDate, setCalendarCenterDate] = useState<Date | null>(null); // Día central del calendario
  
  // Estados para compras
  const [allPurchases, setAllPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [purchasesExpanded, setPurchasesExpanded] = useState(false);
  const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'general' | 'individual'>('all');
  
  // Estados para el clima
  const [weather, setWeather] = useState<{ temp: number; description: string; icon: string; code: number } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    // evita que se cierre con tab o shift
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setOpenDrawer(open);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setOpenDrawer(false);
  };

  const handleCopyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Función para verificar si el usuario es admin del viaje
  const isUserAdmin = (trip: TripWithParticipants): boolean => {
    if (!user?.id || !trip.adminIds) return false;
    
    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    return trip.adminIds.includes(userId);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar clima actual
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoadingWeather(true);
        // Obtener ubicación del usuario
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              try {
                // Usar Open-Meteo API (pública, gratuita, sin API key)
                const response = await fetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
                );
                
                if (response.ok) {
                  const data = await response.json();
                  const temp = Math.round(data.current.temperature_2m);
                  const weatherCode = data.current.weather_code;
                  
                  // Mapear códigos de clima a descripciones en español (según WMO Weather interpretation codes)
                  const weatherCodes: { [key: number]: string } = {
                    0: 'Despejado',
                    1: 'Mayormente despejado',
                    2: 'Parcialmente nublado',
                    3: 'Nublado',
                    45: 'Niebla',
                    48: 'Niebla con escarcha',
                    51: 'Llovizna ligera',
                    53: 'Llovizna moderada',
                    55: 'Llovizna densa',
                    56: 'Llovizna ligera congelante',
                    57: 'Llovizna densa congelante',
                    61: 'Lluvia ligera',
                    63: 'Lluvia moderada',
                    65: 'Lluvia fuerte',
                    66: 'Lluvia ligera congelante',
                    67: 'Lluvia fuerte congelante',
                    71: 'Nieve ligera',
                    73: 'Nieve moderada',
                    75: 'Nieve fuerte',
                    77: 'Granos de nieve',
                    80: 'Chubascos ligeros',
                    81: 'Chubascos moderados',
                    82: 'Chubascos fuertes',
                    85: 'Chubascos de nieve ligeros',
                    86: 'Chubascos de nieve fuertes',
                    95: 'Tormenta',
                    96: 'Tormenta con granizo',
                    99: 'Tormenta con granizo fuerte',
                  };
                  
                  const description = weatherCodes[weatherCode] || 'Despejado';
                  
                  console.log('Clima obtenido:', { temp, code: weatherCode, description, fullData: data.current });
                  
                  setWeather({
                    temp,
                    description,
                    icon: '',
                    code: weatherCode,
                  });
                } else {
                // Fallback: datos de ejemplo
                setWeather({
                  temp: 22,
                  description: 'Soleado',
                  icon: '',
                  code: 0,
                });
                }
              } catch (error) {
                console.error('Error al obtener clima:', error);
                // Si falla, usar datos de ejemplo
                setWeather({
                  temp: 22,
                  description: 'Soleado',
                  icon: '',
                  code: 0,
                });
              } finally {
                setLoadingWeather(false);
              }
            },
            (error) => {
              console.error('Error al obtener ubicación:', error);
              // Usar datos de ejemplo si no se puede obtener la ubicación
              setWeather({
                temp: 22,
                description: 'Soleado',
                icon: '',
                code: 0,
              });
              setLoadingWeather(false);
            }
          );
        } else {
          // Si no hay geolocalización, usar datos de ejemplo
          setWeather({
            temp: 22,
            description: 'Soleado',
            icon: '',
            code: 0,
          });
          setLoadingWeather(false);
        }
      } catch (error) {
        console.error('Error al cargar clima:', error);
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchTripsWithParticipants = async () => {
      if (!user?.id) {
        setLoadingTrips(false);
        return;
      }

      try {
        setLoadingTrips(true);
        setError(null);
        
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        
        if (isNaN(userId)) {
          setError('ID de usuario inválido');
          setLoadingTrips(false);
          return;
        }
        
        const response = await api.getUserTrips(userId);
        
        if (response.ok) {
          const tripsData = await response.json();
          
          // Obtener el número de participantes y el origen para cada viaje
          const tripsWithParticipants = await Promise.all(
            tripsData.map(async (trip: Trip) => {
              try {
                // Obtener participantes
                const participantsResponse = await fetch(
                  `${API_BASE_URL}/api/trips/${trip.id}/participants?userId=${userId}`,
                { headers: getAuthHeaders() }
                );
      
                let participantCount = trip.participants || 0;
                if (participantsResponse.ok) {
                  const participantsData = await participantsResponse.json();
                  // La respuesta tiene estructura: { success: true, data: [...], total: 2 }
                  participantCount = participantsData.total || participantsData.data?.length || 0;
                }

                // Obtener detalles del viaje para obtener el origen si no está presente
                let origin = trip.origin;
                if (!origin) {
                  try {
                    const detailsResponse = await api.getTripDetails(trip.id.toString(), userId);
                    if (detailsResponse.ok) {
                      const detailsData = await detailsResponse.json();
                      origin = detailsData.origin || null;
                    }
                  } catch (detailsErr) {
                    console.error(`Error al obtener detalles del viaje ${trip.id}:`, detailsErr);
                  }
                }

                return { ...trip, participantCount, origin: origin || trip.origin };
              } catch (err) {
                console.error(`Error al obtener datos del viaje ${trip.id}:`, err);
                return { ...trip, participantCount: trip.participants || 0 };
              }
            })
          );
          
          setTrips(tripsWithParticipants);
        } else {
          console.error('Error al cargar viajes - Status:', response.status);
          console.error('Error al cargar viajes - StatusText:', response.statusText);
          
          let errorMessage = 'No se pudieron cargar los viajes. Por favor, intenta de nuevo.';
          
          try {
            const errorText = await response.text();
            console.error('Error al cargar viajes:', errorText);
            
            if (response.status === 404) {
              errorMessage = 'El servidor backend no está disponible. Verifica que esté ejecutándose en el puerto 8080.';
            } else if (response.status === 401) {
              errorMessage = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
            }
          } catch (parseError) {
            console.error('Error al parsear respuesta del servidor:', parseError);
          }
          
          setError(errorMessage);
        }
      } catch (err) {
        console.error('Error al cargar viajes:', err);
        setError('Error de conexión. Verifica que el servidor esté funcionando.');
      } finally {
        setLoadingTrips(false);
      }
    };

    if (isAuthenticated && user) {
      fetchTripsWithParticipants();
    }
  }, [user, isAuthenticated]);

  // Cargar todas las compras de todos los viajes
  useEffect(() => {
    const loadAllPurchases = async () => {
      if (!user?.id || trips.length === 0) return;

      try {
        setLoadingPurchases(true);
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        const allPurchasesData: any[] = [];

        // Cargar compras de cada viaje
        for (const trip of trips) {
          try {
            // Cargar compras generales
            const generalResponse = await api.getGeneralPurchases(trip.id.toString());
            if (generalResponse.ok) {
              const generalData = await generalResponse.json();
              const purchases = (generalData.data || []).map((p: any) => ({
                ...p,
                tripName: trip.name,
                tripId: trip.id,
              }));
              allPurchasesData.push(...purchases);
            }

            // Cargar compras individuales del usuario
            const individualResponse = await api.getIndividualPurchases(trip.id.toString(), userId);
            if (individualResponse.ok) {
              const individualData = await individualResponse.json();
              const purchases = (individualData.data || []).map((p: any) => ({
                ...p,
                tripName: trip.name,
                tripId: trip.id,
              }));
              allPurchasesData.push(...purchases);
            }
          } catch (error) {
            console.error(`Error cargando compras del viaje ${trip.id}:`, error);
          }
        }

        // Ordenar por fecha de compra (más reciente primero)
        allPurchasesData.sort((a, b) => {
          const dateA = new Date(a.purchaseDate).getTime();
          const dateB = new Date(b.purchaseDate).getTime();
          return dateB - dateA;
        });

        setAllPurchases(allPurchasesData);
      } catch (error) {
        console.error('Error cargando compras:', error);
      } finally {
        setLoadingPurchases(false);
      }
    };

    if (isAuthenticated && user && trips.length > 0) {
      loadAllPurchases();
    }
  }, [user, isAuthenticated, trips]);

  const handleJoinTrip = async () => {
    if (!tripCode.trim()) {
      setError('Por favor ingresa un código de viaje');
      return;
    }
    
    if (!user?.id) {
      setError('Usuario no identificado');
      return;
    }
    
    try {
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      
      const response = await fetch(
        `${API_BASE_URL}/api/trips/join?code=${encodeURIComponent(tripCode.trim())}&userId=${userId}`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
      
      if (response.ok) {
        setOpenJoinDialog(false);
        setTripCode('');
        setError(null);
        
        // Recargar los viajes
        const tripsResponse = await api.getUserTrips(userId);
        if (tripsResponse.ok) {
          const tripsData = await tripsResponse.json();
          
          const tripsWithParticipants = await Promise.all(
            tripsData.map(async (trip: Trip) => {
              try {
                const participantsResponse = await fetch(
                  `${API_BASE_URL}/api/trips/${trip.id}/participants?userId=${userId}`,
                  { headers: getAuthHeaders() }
                );
                
                if (participantsResponse.ok) {
                  const participants = await participantsResponse.json();
                  return { ...trip, participantCount: participants.length };
                }
                return { ...trip, participantCount: trip.participants || 0 };
              } catch (err) {
                return { ...trip, participantCount: trip.participants || 0 };
              }
            })
          );
          
          setTrips(tripsWithParticipants);
        }
        
        //TODO mensaje de exito
      } else {
        const errorText = await response.text();
        console.error('Error al unirse al viaje:', errorText);
        setError('No se pudo unir al viaje. Verifica el código e intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error al unirse al viaje:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    }
  };

  if (isLoading || loadingTrips) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6">Cargando tus viajes...</Typography>
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
        return <WbSunny sx={{ fontSize: 40 }} />;
      case 'mountain':
        return <Landscape sx={{ fontSize: 40 }} />;
      case 'city':
        return <LocationCity sx={{ fontSize: 40 }} />;
      default:
        return <TravelExplore sx={{ fontSize: 40 }} />;
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

  // Función para obtener el día de la semana
  const getCurrentDay = () => {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    return days[new Date().getDay()];
  };

  // Función para obtener el icono del clima
  const getWeatherIcon = (code: number) => {
    // Códigos de clima de Open-Meteo
    if (code === 0) return <WbSunny sx={{ fontSize: 24, color: '#FFA726' }} />; // Despejado
    if (code === 1 || code === 2) return <CloudQueue sx={{ fontSize: 24, color: '#90A4AE' }} />; // Mayormente despejado / Parcialmente nublado
    if (code === 3) return <Cloud sx={{ fontSize: 24, color: '#78909C' }} />; // Nublado
    if (code === 45 || code === 48) return <Foggy sx={{ fontSize: 24, color: '#B0BEC5' }} />; // Niebla
    if (code >= 51 && code <= 55) return <WaterDrop sx={{ fontSize: 24, color: '#42A5F5' }} />; // Llovizna
    if (code >= 61 && code <= 65) return <WaterDrop sx={{ fontSize: 24, color: '#2196F3' }} />; // Lluvia
    if (code >= 71 && code <= 75) return <AcUnit sx={{ fontSize: 24, color: '#E3F2FD' }} />; // Nieve
    if (code >= 80 && code <= 82) return <Thunderstorm sx={{ fontSize: 24, color: '#1976D2' }} />; // Chubascos
    if (code >= 95 && code <= 96) return <Thunderstorm sx={{ fontSize: 24, color: '#0D47A1' }} />; // Tormenta
    return <WbSunny sx={{ fontSize: 24, color: '#FFA726' }} />; // Por defecto sol
  };

  // Calcular porcentajes para las barras de progreso
  const completedTrips = trips.filter(t => t.status?.toLowerCase() === 'completed').length;
  const planningTrips = trips.filter(t => t.status?.toLowerCase() === 'planning').length;
  const totalTrips = trips.length;
  
  const dayProgress = totalTrips > 0 ? Math.min(100, (completedTrips / totalTrips) * 100) : 0;
  const weekProgress = totalTrips > 0 ? Math.min(100, (planningTrips / totalTrips) * 100) : 0;
  const monthProgress = totalTrips > 0 ? Math.min(100, (completedTrips + planningTrips) / totalTrips * 100) : 0;
  const yearProgress = totalTrips > 0 ? Math.min(100, totalTrips * 10) : 0;

  // Función para obtener color pastel según el estado
  const getPastelColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: '#C8E6C9', text: '#2E7D32' }; // Verde pastel
      case 'planning':
        return { bg: '#BBDEFB', text: '#1565C0' }; // Azul pastel
      case 'active':
        return { bg: '#FFE0B2', text: '#E65100' }; // Naranja pastel
      default:
        return { bg: '#F5F5F5', text: '#616161' }; // Gris pastel
    }
  };

  // Función para encontrar el próximo viaje
  const getNextTrip = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingTrips = trips
      .filter(trip => {
        if (!trip.dateI) return false;
        const tripDate = new Date(trip.dateI);
        tripDate.setHours(0, 0, 0, 0);
        return tripDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.dateI || '').getTime();
        const dateB = new Date(b.dateI || '').getTime();
        return dateA - dateB;
      });
    
    return upcomingTrips.length > 0 ? upcomingTrips[0] : null;
  };

  // Función para calcular días restantes hasta un viaje
  const getDaysUntilTrip = (tripDate: string) => {
    if (!tripDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const trip = new Date(tripDate);
    trip.setHours(0, 0, 0, 0);
    const diffTime = trip.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para ir al próximo viaje
  const goToNextTrip = () => {
    const nextTrip = getNextTrip();
    if (nextTrip && nextTrip.dateI) {
      const tripDate = new Date(nextTrip.dateI);
      tripDate.setHours(0, 0, 0, 0);
      setCalendarMonth(tripDate.getMonth());
      setCalendarYear(tripDate.getFullYear());
      setCalendarCenterDate(tripDate); // Establecer el día central al día del viaje
    }
  };

  const nextTrip = getNextTrip();
  const daysUntilNextTrip = nextTrip ? getDaysUntilTrip(nextTrip.dateI || '') : null;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#FAFAFA',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    }}>
      {/* Minimal Header */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid #E0E0E0',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Botón del Drawer */}
          <IconButton size="small" sx={{ color: '#666' }} onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <TravelExplore sx={{ color: '#03a9f4', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#424242' }}>
            TravelMate Dashboard
            </Typography>
          </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => router.push('/stats')} sx={{ color: '#666' }}>
            <BarChart />
          </IconButton>
          <IconButton size="small" onClick={logout} sx={{ color: '#666' }}>
            <Logout />
          </IconButton>
        </Box>
      </Box>

      {/* Drawer lateral */}
      <Drawer anchor="left" open={openDrawer} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            bgcolor: '#fafafa',
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Menú
            </Typography>
          </Box>
          <Divider />

          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate('/profile')}>
                <ListItemIcon>
                  <Person sx={{ color: '#03a9f4' }} />
                </ListItemIcon>
                <ListItemText primary="Perfil" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate('/terms')}>
                <ListItemIcon>
                  <Gavel sx={{ color: '#03a9f4' }} />
                </ListItemIcon>
                <ListItemText primary="Términos y condiciones" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate('/faq')}>
                <ListItemIcon>
                  <HelpOutline sx={{ color: '#03a9f4' }} />
                </ListItemIcon>
                <ListItemText primary="Preguntas frecuentes" />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider sx={{ mt: 'auto' }} />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} TravelMate
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content - Two Column Layout */}
      <Box sx={{ display: 'flex', maxWidth: '1400px', mx: 'auto', gap: 4, p: 4, alignItems: 'flex-start' }}>
        {/* Left Column - Main Content (Wider) */}
        <Box sx={{ flex: '1 1 70%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Digital Clock & Calendar Section */}
          <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap', alignItems: 'flex-start', position: 'relative' }}>
            {/* Digital Clock */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper sx={{
                  bgcolor: '#E3F2FD',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  minWidth: 120,
                  boxShadow: 'none',
                  border: '1px solid #BBDEFB',
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 300, color: '#1976D2', mb: 0.5 }}>
                    {currentTime.hours}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64B5F6', fontWeight: 500 }}>
                    {currentTime.ampm}
                  </Typography>
                </Paper>
                <Paper sx={{
                  bgcolor: '#E3F2FD',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  minWidth: 120,
                  boxShadow: 'none',
                  border: '1px solid #BBDEFB',
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 300, color: '#1976D2', mb: 0.5 }}>
                    {currentTime.minutes}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64B5F6', fontWeight: 500 }}>
                    {getCurrentDay()}
                  </Typography>
                </Paper>
              </Box>
              
              {/* Clima - Alineado con el calendario */}
              {weather && (
                <Paper sx={{
                  bgcolor: '#E3F2FD',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  boxShadow: 'none',
                  border: '1px solid #BBDEFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  width: 280,
                  flex: 1,
                  minHeight: 0,
                }}>
                  {loadingWeather ? (
                    <CircularProgress size={16} sx={{ color: '#1976D2' }} />
                  ) : (
                    <>
                      {weather.code !== undefined && getWeatherIcon(weather.code)}
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2', fontSize: '1.1rem' }}>
                        {weather.temp}°C
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64B5F6', fontWeight: 500, textTransform: 'capitalize', fontSize: '0.7rem' }}>
                        {weather.description}
                      </Typography>
                    </>
                  )}
                </Paper>
              )}
            </Box>

            {/* Calendar with Title */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 320 }}>
              <Paper sx={{
                bgcolor: '#E8F5E9',
                borderRadius: 2,
                p: 2,
                boxShadow: 'none',
                border: '1px solid #C8E6C9',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                    {(() => {
                      const today = new Date();
                      const centerDate = calendarCenterDate || today;
                      return centerDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).toUpperCase();
                    })()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      sx={{ color: '#4CAF50' }}
                      onClick={() => {
                        const today = new Date();
                        const centerDate = calendarCenterDate || today;
                        const newDate = new Date(centerDate);
                        newDate.setDate(centerDate.getDate() - 7); // Retroceder 7 días
                        setCalendarCenterDate(newDate);
                        setCalendarMonth(newDate.getMonth());
                        setCalendarYear(newDate.getFullYear());
                      }}
                    >
                      <Typography variant="caption">‹</Typography>
                    </IconButton>
                    <IconButton 
                      size="small" 
                      sx={{ color: '#4CAF50' }}
                      onClick={() => {
                        const today = new Date();
                        const centerDate = calendarCenterDate || today;
                        const newDate = new Date(centerDate);
                        newDate.setDate(centerDate.getDate() + 7); // Avanzar 7 días
                        setCalendarCenterDate(newDate);
                        setCalendarMonth(newDate.getMonth());
                        setCalendarYear(newDate.getFullYear());
                      }}
                    >
                      <Typography variant="caption">›</Typography>
                    </IconButton>
                    <IconButton 
                      size="small" 
                      sx={{ color: '#4CAF50' }}
                      onClick={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        setCalendarCenterDate(null); // Resetear al día actual
                        setCalendarMonth(today.getMonth());
                        setCalendarYear(today.getFullYear());
                      }}
                      title="Ir a hoy"
                    >
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Hoy</Typography>
                    </IconButton>
                </Box>
              </Box>
                {nextTrip && (
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={goToNextTrip}
                      sx={{
                        bgcolor: '#4CAF50',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: '#388E3C',
                        },
                      }}
                    >
                      Ir al Próximo Viaje
                    </Button>
                    {(() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const centerDate = calendarCenterDate || today;
                      centerDate.setHours(0, 0, 0, 0);
                      
                      // Si hay un día central diferente a hoy, mostrar cuántos días faltan
                      if (calendarCenterDate && calendarCenterDate.getTime() !== today.getTime()) {
                        const diffTime = calendarCenterDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return (
                          <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 500, display: 'block', textAlign: 'center' }}>
                            {diffDays === 0 
                              ? '¡Hoy!' 
                              : diffDays === 1 
                              ? 'Falta 1 día' 
                              : diffDays > 0
                              ? `Faltan ${diffDays} días`
                              : `Hace ${Math.abs(diffDays)} días`}
                          </Typography>
                        );
                      }
                      
                      // Si no hay día central o es hoy, mostrar días hasta el próximo viaje
                      if (nextTrip && daysUntilNextTrip !== null) {
                        return (
                          <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 500, display: 'block', textAlign: 'center' }}>
                            {daysUntilNextTrip === 0 
                              ? '¡Hoy es el viaje!' 
                              : daysUntilNextTrip === 1 
                              ? 'Falta 1 día' 
                              : `Faltan ${daysUntilNextTrip} días`}
                          </Typography>
                        );
                      }
                      
                      return null;
                    })()}
                  </Box>
                )}
                <Box sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-around', mb: 1, flexWrap: 'wrap' }}>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, idx) => (
                      <Typography key={idx} variant="caption" sx={{ color: '#388E3C', fontWeight: 600, minWidth: 50, textAlign: 'center', fontSize: '0.7rem' }}>
                        {day}
                      </Typography>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-around' }}>
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Determinar el día central del calendario
                    const centerDate = calendarCenterDate || today;
                    const centerDateCopy = new Date(centerDate);
                    centerDateCopy.setHours(0, 0, 0, 0);
                    
                    // Calcular los 7 días (3 atrás, día central, 3 adelante)
                    const weekDates: Date[] = [];
                    for (let i = -3; i <= 3; i++) {
                      const date = new Date(centerDateCopy);
                      date.setDate(centerDateCopy.getDate() + i);
                      weekDates.push(date);
                    }
                    
                    // Obtener días con viajes para todos los meses posibles
                    const tripDays = trips
                      .filter(trip => trip.dateI)
                      .map(trip => {
                        const tripDate = new Date(trip.dateI || '');
                        tripDate.setHours(0, 0, 0, 0);
                        return tripDate;
                      });
                    
                    // Crear un array de 7 posiciones (una para cada día de la semana)
                    // Lunes = 0, Martes = 1, ..., Domingo = 6
                    const weekGrid: (Date | null)[] = new Array(7).fill(null);
                    
                    // Colocar cada fecha en su posición correcta según el día de la semana
                    weekDates.forEach(date => {
                      const weekday = date.getDay(); // 0 = domingo, 1 = lunes, etc.
                      const position = weekday === 0 ? 6 : weekday - 1; // Convertir: domingo (0) -> 6, lunes (1) -> 0, etc.
                      weekGrid[position] = date;
                    });
                    
                    // Mostrar los 7 días de la semana, alineados correctamente
                    return weekGrid.map((date, position) => {
                      if (!date) {
                        return (
                          <Box
                            key={position}
                            sx={{
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'transparent', fontSize: '0.7rem' }}>
                              {' '}
                            </Typography>
                          </Box>
                        );
                      }
                      
                      const dayNumber = date.getDate();
                      const isToday = date.getTime() === today.getTime();
                      const hasTrip = tripDays.some(tripDate => tripDate.getTime() === date.getTime());
                      
                      return (
                        <Box
                          key={position}
                          sx={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            bgcolor: isToday ? '#C8E6C9' : hasTrip ? '#FFE082' : 'transparent',
                            border: hasTrip ? '2px solid #FFA000' : 'none',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#388E3C', fontWeight: hasTrip ? 700 : isToday ? 600 : 400, fontSize: '0.7rem' }}>
                            {dayNumber}
                          </Typography>
                        </Box>
                      );
                    });
                  })()}
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Trips Grid */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setViewMode('gallery')}
                  sx={{ 
                    color: viewMode === 'gallery' ? '#666' : '#999',
                    textDecoration: viewMode === 'gallery' ? 'underline' : 'none',
                    textTransform: 'none',
                  }}
                >
                  Vista Galería
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setViewMode('list')}
                  sx={{ 
                    color: viewMode === 'list' ? '#666' : '#999',
                    textDecoration: viewMode === 'list' ? 'underline' : 'none',
                    textTransform: 'none',
                  }}
                >
                  Lista
                </Button>
              </Box>
            </Box>
          
          {trips.length === 0 ? (
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center', 
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: 'none',
                border: '1px solid #E0E0E0',
              }}>
                <TravelExplore sx={{ fontSize: 60, color: '#BDBDBD', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#666', mb: 2, fontWeight: 500 }}>
                No tienes viajes todavía
              </Typography>
                <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                ¡Comienza tu aventura creando tu primer viaje o únete a uno existente!
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => router.push('/travel')}
                    sx={{
                      bgcolor: '#03a9f4',
                      '&:hover': { bgcolor: '#0288D1' },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                >
                  Crear Mi Primer Viaje
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<GroupAdd />}
                  onClick={() => setOpenJoinDialog(true)}
                    sx={{
                      borderColor: '#66bb6a',
                      color: '#66bb6a',
                      '&:hover': { borderColor: '#4CAF50', bgcolor: 'rgba(102, 187, 106, 0.04)' },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                >
                  Unirme a un Viaje
                </Button>
              </Box>
              </Paper>
            ) : (
              <>
                {viewMode === 'gallery' ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {/* Action Cards */}
                    <Paper
                      sx={{
                        bgcolor: '#E3F2FD',
                        borderRadius: 2,
                        p: 3,
                        cursor: 'pointer',
                        minHeight: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'none',
                        border: '1px solid #BBDEFB',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(3, 169, 244, 0.2)',
                        },
                      }}
                      onClick={() => router.push('/travel')}
                    >
                      <Add sx={{ fontSize: 48, color: '#03a9f4', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: '#1976D2', fontWeight: 600 }}>
                        Nuevo Viaje
                      </Typography>
                    </Paper>
                    <Paper
                      sx={{
                        bgcolor: '#E8F5E9',
                        borderRadius: 2,
                        p: 3,
                        cursor: 'pointer',
                        minHeight: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'none',
                        border: '1px solid #C8E6C9',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 187, 106, 0.2)',
                        },
                      }}
                      onClick={() => setOpenJoinDialog(true)}
                    >
                      <GroupAdd sx={{ fontSize: 48, color: '#66bb6a', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                        Unirse A Viaje
                      </Typography>
                    </Paper>

                {/* Trip Cards */}
                {trips.map((trip) => {
                  const isPlanning = trip.status?.toLowerCase() === 'planning';
                  const isActive = trip.status?.toLowerCase() === 'active';
                  const isAdmin = isUserAdmin(trip);
                  const pastelColor = getPastelColor(trip.status || '');
                  const tripImage = trip.image;
                  const hasImage = tripImage && tripImage !== null && tripImage.trim() !== '';
                  const imageUrl = hasImage && tripImage ? (tripImage.startsWith('data:') ? tripImage : `data:image/jpeg;base64,${tripImage}`) : null;
                  
                  return (
                    <Paper
                      key={trip.id}
                      sx={{
                        bgcolor: pastelColor.bg,
                        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        borderRadius: 2,
                        p: 3,
                        minHeight: 180,
                        display: 'flex', 
                        flexDirection: 'column',
                        position: 'relative',
                        boxShadow: 'none',
                        border: imageUrl ? 'none' : '1px solid rgba(0,0,0,0.1)',
                        transition: 'all 0.2s',
                        overflow: 'hidden',
                        '&::before': imageUrl ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.5) 100%)',
                          backdropFilter: 'blur(6px)',
                          zIndex: 0,
                        } : {},
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <Box sx={{ position: 'relative', zIndex: 1, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ 
                          bgcolor: pastelColor.text,
                          width: 40,
                          height: 40,
                          }}>
                            {getIcon(typeof tripImage === 'string' && tripImage.length > 10 ? 'default' : tripImage || 'default')}
                          </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="subtitle1" 
                            noWrap
                            sx={{ fontWeight: 600, color: pastelColor.text, overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                              {trip.name}
                            </Typography>
                          {viewMode === 'gallery' && (
                            <Typography variant="caption" sx={{ color: pastelColor.text, opacity: 0.6, mt: 0.5 }}>
                              👥 {trip.participantCount || trip.participants || 0} {(trip.participantCount || trip.participants || 0) === 1 ? 'Participante' : 'Participantes'}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ flexGrow: 1, mb: 2 }}>
                              <Chip
                                label={getStatusLabel(trip.status)}
                                  size="small"
                          sx={{
                            bgcolor: pastelColor.text,
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="text"
                          //TODO cambiar por estadisticas
                          onClick={() => router.push(`/stats`)}
                          sx={{
                            color: pastelColor.text,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                          }}
                        >
                          Ver Estadisticas
                        </Button>
                        {isPlanning && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => router.push(`/trip/${trip.id}/details`)}
                            sx={{
                              color: pastelColor.text,
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            Ver Detalles
                          </Button>
                              )}
                              {isActive && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => router.push(`/trip/${trip.id}/details`)}
                            sx={{
                              color: pastelColor.text,
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            Ver Detalles
                          </Button>
                              )}
                            </Box>
                            </Box>
                    </Paper>
                  );
                })}
                          </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Action Cards in List View */}
                    <Paper
                      sx={{
                        bgcolor: '#E3F2FD',
                        borderRadius: 2,
                        p: 3,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        boxShadow: 'none',
                        border: '1px solid #BBDEFB',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: '0 4px 12px rgba(3, 169, 244, 0.2)',
                        },
                      }}
                      onClick={() => router.push('/travel')}
                    >
                      <Add sx={{ fontSize: 40, color: '#03a9f4' }} />
                      <Typography variant="h6" sx={{ color: '#1976D2', fontWeight: 600 }}>
                        Nuevo Viaje
                            </Typography>
                    </Paper>
                    <Paper
                      sx={{
                        bgcolor: '#E8F5E9',
                        borderRadius: 2,
                        p: 3,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        boxShadow: 'none',
                        border: '1px solid #C8E6C9',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: '0 4px 12px rgba(102, 187, 106, 0.2)',
                        },
                      }}
                      onClick={() => setOpenJoinDialog(true)}
                    >
                      <GroupAdd sx={{ fontSize: 40, color: '#66bb6a' }} />
                      <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                        Unirse A Viaje
                              </Typography>
                    </Paper>

                    {/* Trip Cards in List View */}
                    {trips.map((trip) => {
                      const isPlanning = trip.status?.toLowerCase() === 'planning';
                      const isAdmin = isUserAdmin(trip);
                      const pastelColor = getPastelColor(trip.status || '');
                      const tripImage = trip.image;
                      const hasImage = tripImage && tripImage !== null && tripImage.trim() !== '';
                      const imageUrl = hasImage && tripImage ? (tripImage.startsWith('data:') ? tripImage : `data:image/jpeg;base64,${tripImage}`) : null;
                      
                      return (
                        <Paper
                          key={trip.id}
                          sx={{
                            bgcolor: pastelColor.bg,
                            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            borderRadius: 2,
                            p: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            position: 'relative',
                            boxShadow: 'none',
                            border: imageUrl ? 'none' : '1px solid rgba(0,0,0,0.1)',
                            transition: 'all 0.2s',
                            overflow: 'hidden',
                            '&::before': imageUrl ? {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.5) 100%)',
                              backdropFilter: 'blur(6px)',
                              zIndex: 0,
                            } : {},
                            '&:hover': {
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            },
                          }}
                        >
                          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 3, width: '100%' }}>
                            <Avatar sx={{ 
                              bgcolor: pastelColor.text,
                              width: 56,
                              height: 56,
                            }}>
                              {getIcon(typeof trip.image === 'string' && trip.image.length > 10 ? 'default' : trip.image || 'default')}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="h6" 
                                noWrap
                                sx={{ fontWeight: 600, color: pastelColor.text, mb: 0.5 }}
                              >
                                {trip.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Chip
                                  label={getStatusLabel(trip.status)}
                                  size="small"
                                  sx={{
                                    bgcolor: pastelColor.text,
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                  }}
                                />
                                <Typography variant="caption" sx={{ color: pastelColor.text, opacity: 0.7 }}>
                                  {formatDate(trip.dateI)} - {formatDate(trip.dateF)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: pastelColor.text, opacity: 0.7 }}>
                                  {trip.participantCount || trip.participants || 0} {(trip.participantCount || trip.participants || 0) === 1 ? 'Persona' : 'Personas'}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => router.push(`/trip/${trip.id}/details`)}
                                sx={{
                                  borderColor: pastelColor.text,
                                  color: pastelColor.text,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                }}
                              >
                                Ver Detalles
                              </Button>
                              {isPlanning && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => router.push(`/trip/${trip.id}/destinations`)}
                                  sx={{
                                    borderColor: pastelColor.text,
                                    color: pastelColor.text,
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  Destinos
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      );
                    })}
            </Box>
                )}
              </>
          )}
          </Box>
        </Box>

        {/* Right Column - Sidebar (Narrower) */}
        <Box sx={{ flex: '0 0 280px', display: { xs: 'none', lg: 'block' }, alignSelf: 'flex-start' }}>
          {/* Quick Stats - Alineado con calendario */}
          {trips.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper sx={{
                  bgcolor: '#E3F2FD',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center', 
                  boxShadow: 'none',
                  border: '1px solid #BBDEFB',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976D2', mb: 0.5 }}>
                    {trips.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64B5F6', fontWeight: 500 }}>
                    Viajes Totales
                  </Typography>
                </Paper>
                <Paper sx={{
                  bgcolor: '#E8F5E9',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center', 
                  boxShadow: 'none',
                  border: '1px solid #C8E6C9',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32', mb: 0.5 }}>
                    {completedTrips}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 500 }}>
                    Completados
                  </Typography>
                </Paper>
                <Paper sx={{
                  bgcolor: '#FFF3E0',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center', 
                  boxShadow: 'none',
                  border: '1px solid #FFE0B2',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#E65100', mb: 0.5 }}>
                    {planningTrips}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#FF9800', fontWeight: 500 }}>
                    Planificando
                  </Typography>
                </Paper>
                <Paper sx={{
                  bgcolor: '#E1F5FE',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center', 
                  boxShadow: 'none',
                  border: '1px solid #B3E5FC',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0277BD', mb: 0.5 }}>
                    {trips.reduce((acc, trip) => acc + (trip.participantCount || trip.participants || 0), 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#03A9F4', fontWeight: 500 }}>
                    Participantes
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}

          {/* Quick Links */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#E91E63', mb: 2 }}>
              Enlaces Rápidos
            </Typography>
            <Paper sx={{
              bgcolor: '#FCE4EC',
              borderRadius: 2,
              p: 2,
              boxShadow: 'none',
              border: '1px solid #F8BBD0',
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="text"
                  startIcon={<TravelExplore />}
                  onClick={() => router.push('/travel')}
                  sx={{
                    color: '#E91E63',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Crear Viaje
                </Button>
                <Button
                  variant="text"
                  startIcon={<BarChart />}
                  onClick={() => router.push('/stats')}
                  sx={{
                    color: '#E91E63',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Estadísticas
                </Button>
                <Button
                  variant="text"
                  startIcon={<GroupAdd />}
                  onClick={() => setOpenJoinDialog(true)}
                  sx={{
                    color: '#E91E63',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Unirse A Viaje
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Join Trip Dialog */}
      <Dialog 
        open={openJoinDialog} 
        onClose={() => setOpenJoinDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Unirme a un Viaje</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa el código de invitación que te compartieron para unirte al viaje
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Código de Viaje"
            placeholder="Ej: ABC123XYZ"
            value={tripCode}
            onChange={(e) => setTripCode(e.target.value.toUpperCase())}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenJoinDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleJoinTrip}
            disabled={!tripCode.trim()}
          >
            Unirme
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}