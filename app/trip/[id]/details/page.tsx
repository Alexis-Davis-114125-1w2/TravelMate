'use client';

import { useAuth } from '../../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { api, API_BASE_URL, getAuthHeaders } from '../../../../lib/api';
import { toast } from 'react-toastify';

// Declaraciones de tipos para Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
    currentLocationMarker?: any;
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
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Navigation,
  Stop,
  PlayArrow,
  TurnRight,
  TurnLeft,
  Straight,
  NavigationOutlined,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  KeyboardArrowUp,
  KeyboardArrowDown,
  NearMe,
  Directions,
  LocationOn,
  Flag,
  AccessTime,
  Speed,
  ExpandMore,
  ExpandLess,
  Clear,
  Delete,
  AccountBalanceWallet,
  Wallet,
  Save,
  ShoppingCart,
  FilterList,
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
  adminIds: number[];
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
  const [tripId, setTripId] = useState<string>('');
  
  // Resolver params
  useEffect(() => {
    params.then(resolvedParams => {
      setTripId(resolvedParams.id);
    });
  }, [params]);
  
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
  
  // Estados para navegación en tiempo real
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationSteps, setNavigationSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [nextInstruction, setNextInstruction] = useState<string>('');
  const [watchId, setWatchId] = useState<number | null>(null);
  
  // Estados para IA y recomendaciones
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [lastRecommendationKm, setLastRecommendationKm] = useState<number>(0);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Estados para chatbox con Gemini
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estados para zoom y seguimiento del mapa
  const [mapZoom, setMapZoom] = useState(8);
  const [isFollowingVehicle, setIsFollowingVehicle] = useState(false);
  
  // Estados para lugares recomendados
  const [recommendedPlaces, setRecommendedPlaces] = useState<any[]>([]);
  const [mapPins, setMapPins] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  
  // Estados para tips
  const [tips, setTips] = useState<any[]>([]);
  const [showTipsList, setShowTipsList] = useState(false);
  const [tipPins, setTipPins] = useState<any[]>([]);
  
  // Estados para navegación temporal a tips
  const [isNavigatingToTip, setIsNavigatingToTip] = useState(false);
  const [currentTipDestination, setCurrentTipDestination] = useState<any>(null);
  const [originalDestination, setOriginalDestination] = useState<any>(null);

  // Estados para billeteras
  const [generalWallet, setGeneralWallet] = useState<any>(null);
  const [individualWallet, setIndividualWallet] = useState<any>(null);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [openEditGeneralWallet, setOpenEditGeneralWallet] = useState(false);
  const [openEditIndividualWallet, setOpenEditIndividualWallet] = useState(false);
  const [editWalletAmount, setEditWalletAmount] = useState('');
  const [editWalletCurrency, setEditWalletCurrency] = useState<'PESOS' | 'DOLARES' | 'EUROS'>('PESOS');

  // Estados para compras
  const [generalPurchases, setGeneralPurchases] = useState<any[]>([]);
  const [individualPurchases, setIndividualPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [openAddPurchase, setOpenAddPurchase] = useState(false);
  const [purchaseDescription, setPurchaseDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseCurrency, setPurchaseCurrency] = useState<'PESOS' | 'DOLARES' | 'EUROS'>('PESOS');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseIsGeneral, setPurchaseIsGeneral] = useState(true);
  
  // Estados para cotizaciones
  const [dollarRate, setDollarRate] = useState<number | null>(null);
  const [euroRate, setEuroRate] = useState<number | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  
  // Estados para lista de compras
  const [purchasesExpanded, setPurchasesExpanded] = useState(false);
  const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'general' | 'individual'>('all');

  // Debug: Log cuando cambien los tips
  useEffect(() => {
    console.log('🔍 Tips cambiaron:', tips.length, tips);
  }, [tips]);
  
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAqcm8Rfw8eKvrI9u_1e7zNGzXt1rSeHlw&libraries=places,geometry&callback=initGoogleMaps`;
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
        
        // Cargar billeteras, compras y cotizaciones
        loadWallets(tripId, userId);
        loadPurchases(tripId, userId);
        loadExchangeRates();
        
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

  // Cargar tips desde la base de datos cuando se carga el viaje
  useEffect(() => {
    if (trip?.id) {
      loadTipsFromDatabase().then(tipsFromDB => {
        if (tipsFromDB && tipsFromDB.length > 0) {
          console.log('📥 Cargando tips desde base de datos:', tipsFromDB);
          setTips(tipsFromDB);
          // Agregar pins al mapa cuando el mapa esté disponible
          const addPinsWhenMapReady = () => {
            if (map) {
              console.log('🗺️ Mapa disponible, agregando pins de tips');
              addTipPinsToMap(tipsFromDB);
            } else {
              console.log('🗺️ Mapa no disponible, reintentando en 500ms');
              setTimeout(addPinsWhenMapReady, 500);
            }
          };
          addPinsWhenMapReady();
        }
      });
    }
  }, [trip?.id, map]);

  // Inicializar mapa cuando se carguen los datos
  useEffect(() => {
    if (isGoogleMapsLoaded && trip && mapRef.current) {
      initializeMap();
      calculateDistanceMetrics();
      
      // Calcular ruta automáticamente si tenemos origen y destino
      if (trip.originLatitude && trip.originLongitude && 
          trip.destinationLatitude && trip.destinationLongitude) {
        setTimeout(() => {
          calculateRoute();
        }, 1000); // Pequeño delay para asegurar que el mapa esté listo
      }
    }
  }, [isGoogleMapsLoaded, trip]);

  // Calcular métricas cuando cambie la ubicación actual
  useEffect(() => {
    if (trip && currentLocation) {
      calculateDistanceMetrics();
    }
  }, [currentLocation, trip]);

  // Limpiar seguimiento de ubicación al desmontar
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // 🧠 Determinar si el usuario actual es admin o creador
const isUserAdmin = trip &&
  (trip.adminIds && trip.adminIds.includes(Number(user?.id)));

  // ✅ Agregar Admin
  const handleAddAdmin = async (adminId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/trips/${trip?.id}/${user?.id}/admins/add/${adminId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        toast.success('Administrador agregado correctamente');
        const updated = await response.json();
        setTrip(updated);
      } else {
        toast.error('Error al agregar administrador');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    }
  };

  // ❌ Eliminar Admin
  const handleRemoveAdmin = async (adminId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/trips/${trip?.id}/${user?.id}/admins/remove/${adminId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        toast.info('Administrador eliminado');
        const updated = await response.json();
        setTrip(updated);
      } else {
        toast.error('Error al eliminar administrador');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    }
  };

  // ✅ Agregar Participante
  const handleAddParticipant = async (participantId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/trips/${trip?.id}/${user?.id}/participants/add/${participantId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
        toast.success('Participante agregado');
        const updated = await response.json();
        setTrip(updated);
        setParticipants(updated.participants);
      } else {
        toast.error('Error al agregar participante');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    }
  };

  // 💰 Cargar billeteras
  const loadWallets = async (tripId: string, userId: number) => {
    try {
      setLoadingWallets(true);
      
      // Cargar billetera general
      const generalResponse = await api.getGeneralWallet(tripId);
      if (generalResponse.ok) {
        const generalData = await generalResponse.json();
        setGeneralWallet(generalData.data);
      }
      
      // Cargar billetera individual del usuario
      const individualResponse = await api.getIndividualWallet(tripId, userId);
      if (individualResponse.ok) {
        const individualData = await individualResponse.json();
        setIndividualWallet(individualData.data);
      }
    } catch (error) {
      console.error('Error cargando billeteras:', error);
    } finally {
      setLoadingWallets(false);
    }
  };

  // 💰 Actualizar billetera general
  const handleUpdateGeneralWallet = async () => {
    if (!trip?.id || !editWalletAmount) {
      toast.error('Por favor, ingresa un monto válido');
      return;
    }

    try {
      const response = await api.updateGeneralWallet(trip.id.toString(), {
        amount: parseFloat(editWalletAmount),
        currency: editWalletCurrency
      });

      if (response.ok) {
        const result = await response.json();
        setGeneralWallet(result.data);
        setOpenEditGeneralWallet(false);
        setEditWalletAmount('');
        toast.success('Billetera general actualizada exitosamente');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al actualizar billetera general');
      }
    } catch (error) {
      console.error('Error actualizando billetera general:', error);
      toast.error('Error de conexión');
    }
  };

  // 💰 Actualizar billetera individual
  const handleUpdateIndividualWallet = async () => {
    if (!trip?.id || !user?.id || !editWalletAmount) {
      toast.error('Por favor, ingresa un monto válido');
      return;
    }

    try {
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      const response = await api.updateIndividualWallet(trip.id.toString(), userId, {
        amount: parseFloat(editWalletAmount),
        currency: editWalletCurrency
      });

      if (response.ok) {
        const result = await response.json();
        setIndividualWallet(result.data);
        setOpenEditIndividualWallet(false);
        setEditWalletAmount('');
        toast.success('Billetera individual actualizada exitosamente');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al actualizar billetera individual');
      }
    } catch (error) {
      console.error('Error actualizando billetera individual:', error);
      toast.error('Error de conexión');
    }
  };

  // 💰 Abrir diálogo de edición de billetera general
  const handleOpenEditGeneralWallet = () => {
    if (generalWallet) {
      setEditWalletAmount(generalWallet.amount.toString());
      setEditWalletCurrency(generalWallet.currency);
      setOpenEditGeneralWallet(true);
    }
  };

  // 💰 Abrir diálogo de edición de billetera individual
  const handleOpenEditIndividualWallet = () => {
    if (individualWallet) {
      setEditWalletAmount(individualWallet.amount.toString());
      setEditWalletCurrency(individualWallet.currency);
      setOpenEditIndividualWallet(true);
    }
  };

  // 🛒 Cargar compras
  const loadPurchases = async (tripId: string, userId: number) => {
    try {
      setLoadingPurchases(true);
      
      // Cargar compras generales
      const generalResponse = await api.getGeneralPurchases(tripId);
      if (generalResponse.ok) {
        const generalData = await generalResponse.json();
        setGeneralPurchases(generalData.data || []);
      }
      
      // Cargar compras individuales del usuario
      const individualResponse = await api.getIndividualPurchases(tripId, userId);
      if (individualResponse.ok) {
        const individualData = await individualResponse.json();
        setIndividualPurchases(individualData.data || []);
      }
    } catch (error) {
      console.error('Error cargando compras:', error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  // 🛒 Crear compra
  const handleCreatePurchase = async () => {
    if (!trip?.id || !user?.id || !purchaseDescription || !purchasePrice) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    try {
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      const purchaseData = {
        description: purchaseDescription,
        price: parseFloat(purchasePrice),
        currency: purchaseCurrency,
        purchaseDate: purchaseDate
      };

      let response;
      if (purchaseIsGeneral) {
        response = await api.createGeneralPurchase(trip.id.toString(), userId, purchaseData);
      } else {
        response = await api.createIndividualPurchase(trip.id.toString(), userId, userId, purchaseData);
      }

      if (response.ok) {
        const result = await response.json();
        toast.success('Compra agregada exitosamente');
        setOpenAddPurchase(false);
        setPurchaseDescription('');
        setPurchasePrice('');
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        // Recargar compras
        loadPurchases(trip.id.toString(), userId);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al crear compra');
      }
    } catch (error) {
      console.error('Error creando compra:', error);
      toast.error('Error de conexión');
    }
  };

  // 🛒 Calcular gastos totales
  const calculateTotalExpenses = (purchases: any[], currency: string) => {
    return purchases
      .filter(p => p.currency === currency)
      .reduce((sum, p) => sum + parseFloat(p.price || 0), 0);
  };

  // 🛒 Calcular gastos generales restantes
  const getGeneralExpensesRemaining = () => {
    if (!generalWallet) return 0;
    const totalExpenses = calculateTotalExpenses(generalPurchases, generalWallet.currency);
    const walletAmount = parseFloat(generalWallet.amount || 0);
    return walletAmount - totalExpenses;
  };

  // 🛒 Calcular mis gastos restantes
  const getIndividualExpensesRemaining = () => {
    if (!individualWallet) return 0;
    const totalExpenses = calculateTotalExpenses(individualPurchases, individualWallet.currency);
    const walletAmount = parseFloat(individualWallet.amount || 0);
    return walletAmount - totalExpenses;
  };

  // 💱 Obtener cotizaciones de monedas
  const loadExchangeRates = async () => {
    try {
      setLoadingRates(true);
      
      // Obtener cotización del dólar
      const dollarResponse = await fetch('https://dolarapi.com/v1/dolares/oficial');
      if (dollarResponse.ok) {
        const dollarData = await dollarResponse.json();
        setDollarRate(dollarData.compra);
      }
      
      // Obtener cotización del euro
      const euroResponse = await fetch('https://dolarapi.com/v1/cotizaciones/eur');
      if (euroResponse.ok) {
        const euroData = await euroResponse.json();
        setEuroRate(euroData.compra);
      }
    } catch (error) {
      console.error('Error cargando cotizaciones:', error);
    } finally {
      setLoadingRates(false);
    }
  };

  // 💱 Convertir precio a la moneda de la billetera
  const convertToWalletCurrency = (price: number, fromCurrency: string, toCurrency: string): number => {
    // Si las monedas son iguales, no hay conversión
    if (fromCurrency === toCurrency) {
      return price;
    }

    // Si la moneda destino es pesos, convertir desde la moneda origen
    if (toCurrency === 'PESOS') {
      if (fromCurrency === 'DOLARES' && dollarRate) {
        return price * dollarRate;
      }
      if (fromCurrency === 'EUROS' && euroRate) {
        return price * euroRate;
      }
    }

    // Si la moneda origen es pesos, convertir a la moneda destino
    if (fromCurrency === 'PESOS') {
      if (toCurrency === 'DOLARES' && dollarRate) {
        return price / dollarRate;
      }
      if (toCurrency === 'EUROS' && euroRate) {
        return price / euroRate;
      }
    }

    // Conversión entre dólares y euros (a través de pesos)
    if (fromCurrency === 'DOLARES' && toCurrency === 'EUROS' && dollarRate && euroRate) {
      const priceInPesos = price * dollarRate;
      return priceInPesos / euroRate;
    }
    if (fromCurrency === 'EUROS' && toCurrency === 'DOLARES' && dollarRate && euroRate) {
      const priceInPesos = price * euroRate;
      return priceInPesos / dollarRate;
    }

    // Si no hay cotizaciones disponibles, retornar el precio original
    return price;
  };

  // 💱 Calcular gastos totales convertidos a la moneda de la billetera
  const calculateTotalExpensesConverted = (purchases: any[], walletCurrency: string) => {
    return purchases.reduce((sum, purchase) => {
      const purchasePrice = parseFloat(purchase.price || 0);
      const purchaseCurrency = purchase.currency;
      const convertedPrice = convertToWalletCurrency(purchasePrice, purchaseCurrency, walletCurrency);
      return sum + convertedPrice;
    }, 0);
  };

  // 💱 Calcular gastos generales restantes (con conversión)
  const getGeneralExpensesRemainingConverted = () => {
    if (!generalWallet) return 0;
    const totalExpenses = calculateTotalExpensesConverted(generalPurchases, generalWallet.currency);
    const walletAmount = parseFloat(generalWallet.amount || 0);
    return walletAmount - totalExpenses;
  };

  // 💱 Calcular mis gastos restantes (con conversión)
  const getIndividualExpensesRemainingConverted = () => {
    if (!individualWallet) return 0;
    const totalExpenses = calculateTotalExpensesConverted(individualPurchases, individualWallet.currency);
    const walletAmount = parseFloat(individualWallet.amount || 0);
    return walletAmount - totalExpenses;
  };

  // ❌ Eliminar Participante
  const handleRemoveParticipant = async (participantId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/trips/${trip?.id}/users/${user?.id}/${participantId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      if (response.ok) {
      const result = await response.json();
      toast.info(result.message || 'Participante eliminado');
      // refrescar trip
      const tripResp = await fetch(`${API_BASE_URL}/api/trips/${trip?.id}?userId=${user?.id}`, { headers: getAuthHeaders() });
      if (tripResp.ok) {
        const updatedTrip = await tripResp.json();
        setTrip(updatedTrip);
        setParticipants(updatedTrip.participants || []);
      }
    } else {
      const text = await response.text();
      console.error('Server error:', response.status, text);
      toast.error('Error al eliminar participante');
    }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    }
  };


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
    if (!directionsService || !directionsRenderer || !trip) {
      console.log('Directions API no disponible');
      return;
    }

    // Verificar que tenemos coordenadas válidas
    if (!trip.originLatitude || !trip.originLongitude || 
        !trip.destinationLatitude || !trip.destinationLongitude) {
      console.log('No hay coordenadas suficientes para calcular la ruta');
      return;
    }

    const origin = { lat: trip.originLatitude, lng: trip.originLongitude };
    const destination = { lat: trip.destinationLatitude, lng: trip.destinationLongitude };

    console.log('Calculando ruta completa desde:', origin, 'hasta:', destination);

    // Determinar modo de transporte
    let travelMode = window.google.maps.TravelMode.DRIVING;
    switch (trip.vehicle) {
      case 'avion':
        travelMode = window.google.maps.TravelMode.TRANSIT;
        break;
      case 'caminando':
        travelMode = window.google.maps.TravelMode.WALKING;
        break;
      default:
        travelMode = window.google.maps.TravelMode.DRIVING;
    }

    // Configurar opciones de la ruta
    const request: any = {
      origin: origin,
      destination: destination,
      travelMode: travelMode,
      provideRouteAlternatives: false,
      avoidHighways: false,
      avoidTolls: false,
      optimizeWaypoints: true
    };

    // Agregar opciones específicas para automóvil
    if (travelMode === window.google.maps.TravelMode.DRIVING) {
      request.drivingOptions = {
        departureTime: new Date(),
        trafficModel: window.google.maps.TrafficModel.OPTIMISTIC
      };
    }

    directionsService.route(request, (result: any, status: any) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        console.log('Ruta calculada exitosamente:', result);
        
        // Configurar el renderer de direcciones
        directionsRenderer.setDirections(result);
        directionsRenderer.setOptions({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#1976d2',
            strokeWeight: 6,
            strokeOpacity: 0.8
          },
          markerOptions: {
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(32, 32)
            }
          }
        });

        // Calcular métricas de la ruta
        let totalDistance = 0;
        let totalDuration = 0;
        
        result.routes[0].legs.forEach((leg: any) => {
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        });
        
        // Convertir a unidades legibles
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
        
        console.log(`Ruta completa: ${distanceKm} km, ${durationText}`);
        
        // Ajustar vista del mapa para mostrar toda la ruta
        const bounds = new window.google.maps.LatLngBounds();
        result.routes[0].legs.forEach((leg: any) => {
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
        });
        map.fitBounds(bounds);
        
        // Agregar marcadores personalizados
        new window.google.maps.Marker({
          position: origin,
          map: map,
          title: 'Origen del viaje',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
        
        new window.google.maps.Marker({
          position: destination,
          map: map,
          title: 'Destino del viaje',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
        
      } else {
        console.error('Error calculando ruta:', status);
        setRouteDistance('Error al calcular ruta');
        setRouteDuration('');
        toast.error('Error al calcular la ruta. Verifica las coordenadas del viaje.');
      }
    });
  };

  // Función fallback para mostrar ruta sin Directions API
  const showRouteFallback = (origin: {lat: number, lng: number}, destination: {lat: number, lng: number}) => {
    if (!map) return;

    // Agregar marcadores de origen y destino
    const originMarker = new window.google.maps.Marker({
      position: origin,
      map: map,
      title: 'Origen del viaje',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });
    
    const destinationMarker = new window.google.maps.Marker({
      position: destination,
      map: map,
      title: 'Destino del viaje',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });

    // Dibujar línea recta entre origen y destino
    const routeLine = new window.google.maps.Polyline({
      path: [origin, destination],
      geodesic: true,
      strokeColor: '#1976d2',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map
    });

    // Calcular distancia en línea recta
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    setRouteDistance(`${distance.toFixed(1)} km`);
    
    // Estimar tiempo basado en el vehículo
    let estimatedTime = 0;
    switch (trip?.vehicle) {
      case 'avion':
        estimatedTime = Math.ceil(distance / 800); // 800 km/h promedio
        break;
      case 'caminando':
        estimatedTime = Math.ceil(distance / 5); // 5 km/h promedio
        break;
      default: // auto
        estimatedTime = Math.ceil(distance / 60); // 60 km/h promedio
        break;
    }
    
    const hours = Math.floor(estimatedTime);
    const minutes = Math.round((estimatedTime - hours) * 60);
    let durationText = '';
    if (hours > 0) {
      durationText = `${hours}h ${minutes}m`;
    } else {
      durationText = `${minutes}m`;
    }
    
    setRouteDuration(durationText);
    
    // Ajustar el zoom para mostrar ambos puntos
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    map.fitBounds(bounds);
    
    console.log(`Ruta fallback: ${distance.toFixed(1)} km, ${durationText}`);
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

  // Función auxiliar para aplicar zoom de manera robusta
  const applyZoomToLocation = (location: { lat: number; lng: number }, context: string) => {
    if (!map || !location) {
      console.warn(`⚠️ No se puede aplicar zoom en ${context}: mapa o ubicación no disponible`);
      return;
    }

    console.log(`🔍 Aplicando zoom en ${context}:`, location);
    
    const zoom = trip?.vehicle === 'auto' ? 16 : 18;
    
    // Aplicar zoom inmediatamente
    map.setCenter(location);
    map.setZoom(zoom);
    setMapZoom(zoom);
    console.log(`🔍 Zoom aplicado en ${context}: ${zoom}x`);
    
    // Múltiples intentos para asegurar el zoom
    const applyZoomAttempt = (attempt: number) => {
      setTimeout(() => {
        if (map && location) {
          map.setCenter(location);
          map.setZoom(zoom);
          console.log(`🔍 Intento ${attempt} de zoom en ${context}: ${zoom}x`);
        }
      }, attempt * 300);
    };
    
    // Aplicar zoom en múltiples momentos
    applyZoomAttempt(1); // 300ms
    applyZoomAttempt(2); // 600ms
    applyZoomAttempt(3); // 900ms
  };

  // Función para iniciar navegación en tiempo real
  const startNavigation = () => {
    if (!trip || !currentLocation || !directionsService || !directionsRenderer) {
      toast.error('No se puede iniciar la navegación. Verifica tu ubicación y la conexión.');
      return;
    }

    setIsNavigating(true);
    setCurrentStep(0);
    
    // Para navegación, usar ubicación actual como origen
    const origin = currentLocation;
    const destination = { 
      lat: trip.destinationLatitude!, 
      lng: trip.destinationLongitude! 
    };

    console.log('🚗 Iniciando navegación desde:', origin, 'hasta:', destination);

    // Configurar opciones de navegación
    const navigationRequest = {
      origin: origin,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
      avoidHighways: false,
      avoidTolls: false,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: window.google.maps.TrafficModel.OPTIMISTIC
      }
    };

    directionsService.route(navigationRequest, (result: any, status: any) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        console.log('✅ Ruta de navegación calculada:', result);
        
        const route = result.routes[0];
        const steps = route.legs[0].steps;
        setNavigationSteps(steps);
        
        // Configurar renderer para navegación con estilo Google Maps
        directionsRenderer.setDirections(result);
        directionsRenderer.setOptions({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#1976d2',
            strokeWeight: 8,
            strokeOpacity: 0.9
          },
          markerOptions: {
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(24, 24)
            }
          }
        });

        // Calcular métricas de navegación
        let totalDistance = 0;
        let totalDuration = 0;
        
        route.legs.forEach((leg: any) => {
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        });
        
        const distanceKm = (totalDistance / 1000).toFixed(1);
        const durationHours = Math.floor(totalDuration / 3600);
        const durationMinutes = Math.floor((totalDuration % 3600) / 60);
        
        let durationText = '';
        if (durationHours > 0) {
          durationText = `${durationHours}h ${durationMinutes}m`;
        } else {
          durationText = `${durationMinutes}m`;
        }
        
        setRemainingDistance(`${distanceKm} km`);
        setRemainingTime(durationText);
        
        // Iniciar seguimiento de ubicación
        startLocationTracking();
        
        // Activar seguimiento automático del vehículo
        setIsFollowingVehicle(true);
        
        // Configurar primera instrucción
        if (steps.length > 0) {
          setNextInstruction(steps[0].instructions.replace(/<[^>]*>/g, ''));
          updateNavigationMetrics(steps, 0);
        }
        
        // Inicializar chat con mensaje de bienvenida
        initializeChat();
        
        // Ajustar vista para navegación con zoom cercano a la ubicación actual
        if (currentLocation) {
          applyZoomToLocation(currentLocation, 'inicio de navegación');
        } else {
          console.log('⚠️ No hay ubicación actual, usando fallback');
          // Fallback: ajustar vista a la ruta completa
          const bounds = new window.google.maps.LatLngBounds();
          route.legs.forEach((leg: any) => {
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
          });
          map.fitBounds(bounds);
        }
        
        toast.success('🚗 Navegación iniciada. ¡Buen viaje!');
        
      } else {
        console.error('❌ Error calculando ruta de navegación:', status);
        toast.error('Error al calcular la ruta de navegación');
        setIsNavigating(false);
      }
    });
  };

  // Función para navegación simple (fallback)
  const startSimpleNavigation = (origin: {lat: number, lng: number}, destination: {lat: number, lng: number}) => {
    // Crear instrucciones simples
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const estimatedTime = Math.ceil(distance / 60); // 60 km/h promedio
    
    const simpleSteps = [{
      instructions: `Dirígete hacia ${trip?.destination}`,
      distance: { text: `${distance.toFixed(1)} km`, value: distance * 1000 },
      duration: { text: `${estimatedTime} min`, value: estimatedTime * 60 }
    }];
    
    setNavigationSteps(simpleSteps);
    setNextInstruction(simpleSteps[0].instructions);
    setRemainingDistance(`${distance.toFixed(1)} km`);
    setRemainingTime(`${estimatedTime} min`);
    
    // Iniciar seguimiento de ubicación
    startLocationTracking();
    
    toast.success('Navegación simple iniciada. ¡Buen viaje!');
  };

  // Función para detener navegación
  const stopNavigation = () => {
    setIsNavigating(false);
    setNavigationSteps([]);
    setCurrentStep(0);
    setRemainingDistance('');
    setRemainingTime('');
    setNextInstruction('');
    setIsFollowingVehicle(false);
    setMapZoom(8);
    
    // Limpiar chat
    setChatMessages([]);
    setIsChatOpen(false);
    
    // Limpiar lugares recomendados
    setRecommendedPlaces([]);
    mapPins.forEach(pin => pin.setMap(null));
    setMapPins([]);
    setSelectedPlace(null);
    
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    toast.info('Navegación detenida');
  };

  // Función para iniciar seguimiento de ubicación
  const startLocationTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }

    console.log('📍 Iniciando seguimiento GPS de alta precisión...');

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('📍 Nueva ubicación GPS:', newLocation);
        setCurrentLocation(newLocation);
        
        if (isNavigating && navigationSteps.length > 0) {
          updateNavigationProgress(newLocation);
        }
        
        // Actualizar marcador de ubicación actual en el mapa
        if (map) {
          // Remover marcador anterior si existe
          if ((window as any).currentLocationMarker) {
            (window as any).currentLocationMarker.setMap(null);
          }
          
          // Determinar icono según el vehículo
          let vehicleIcon = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
          let iconSize = 32;
          
          if (trip?.vehicle === 'auto') {
            vehicleIcon = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'; // Usar blue-dot como fallback
            iconSize = 40;
          } else if (trip?.vehicle === 'caminando') {
            vehicleIcon = 'https://maps.google.com/mapfiles/ms/icons/walking.png';
            iconSize = 28;
          }
          
          // Crear nuevo marcador de ubicación actual
          (window as any).currentLocationMarker = new window.google.maps.Marker({
            position: newLocation,
            map: map,
            title: `Tu ubicación actual (${trip?.vehicle === 'auto' ? 'En auto' : trip?.vehicle === 'caminando' ? 'Caminando' : 'En auto'})`,
            icon: {
              url: vehicleIcon,
              scaledSize: new window.google.maps.Size(iconSize, iconSize),
              anchor: new window.google.maps.Point(iconSize/2, iconSize/2)
            },
            animation: window.google.maps.Animation.BOUNCE
          });
          
          // Si está navegando, hacer zoom y seguir al vehículo
          if (isNavigating && isFollowingVehicle) {
            // Centrar el mapa en la ubicación actual
            map.setCenter(newLocation);
            
            // Ajustar zoom para mostrar calles cercanas
            const newZoom = trip?.vehicle === 'auto' ? 16 : 18; // Zoom más cercano para caminando
            map.setZoom(newZoom);
            setMapZoom(newZoom);
            
            console.log(`📍 Mapa centrado en vehículo - Zoom: ${newZoom}`);
          }
        }
      },
      (error) => {
        console.error('❌ Error en seguimiento de ubicación:', error);
        let errorMessage = 'Error en el seguimiento de ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permisos de ubicación denegados. Activa la ubicación en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible. Verifica tu conexión GPS.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout obteniendo ubicación. Intenta nuevamente.';
            break;
        }
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
    
    setWatchId(id);
    console.log('✅ Seguimiento GPS iniciado con ID:', id);
  };

  // Función para actualizar progreso de navegación
  const updateNavigationProgress = (userLocation: {lat: number, lng: number}) => {
    if (!navigationSteps.length) return;

    console.log('🔄 Actualizando progreso de navegación...');

    // Encontrar el paso más cercano a la ubicación actual
    let closestStepIndex = 0;
    let minDistance = Infinity;

    navigationSteps.forEach((step, index) => {
      const stepLocation = step.start_location;
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        stepLocation.lat(),
        stepLocation.lng()
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestStepIndex = index;
      }
    });

    // Solo actualizar si el paso cambió
    if (closestStepIndex !== currentStep) {
      console.log(`📍 Paso actualizado: ${currentStep} → ${closestStepIndex}`);
      setCurrentStep(closestStepIndex);
      
      // Actualizar métricas
      updateNavigationMetrics(navigationSteps, closestStepIndex);
      
      // Actualizar siguiente instrucción
      if (closestStepIndex < navigationSteps.length - 1) {
        const nextStep = navigationSteps[closestStepIndex + 1];
        setNextInstruction(nextStep.instructions.replace(/<[^>]*>/g, ''));
        console.log('📋 Nueva instrucción:', nextStep.instructions);
      } else {
        setNextInstruction('🎉 ¡Has llegado a tu destino!');
        console.log('🎉 Navegación completada');
        
        // Detener navegación automáticamente al llegar
        setTimeout(() => {
          stopNavigation();
          toast.success('¡Has llegado a tu destino!');
        }, 3000);
      }
    }
  };

  // Función para actualizar métricas de navegación
  const updateNavigationMetrics = (steps: any[], currentStepIndex: number) => {
    let totalDistance = 0;
    let totalDuration = 0;

    // Calcular distancia y tiempo restante desde el paso actual
    for (let i = currentStepIndex; i < steps.length; i++) {
      totalDistance += steps[i].distance.value;
      totalDuration += steps[i].duration.value;
    }

    // Convertir a unidades legibles
    const distanceKm = (totalDistance / 1000).toFixed(1);
    const durationHours = Math.floor(totalDuration / 3600);
    const durationMinutes = Math.floor((totalDuration % 3600) / 60);
    
    let durationText = '';
    if (durationHours > 0) {
      durationText = `${durationHours}h ${durationMinutes}m`;
    } else {
      durationText = `${durationMinutes}m`;
    }

    setRemainingDistance(`${distanceKm} km`);
    setRemainingTime(durationText);
    
    // Verificar si necesitamos obtener recomendaciones de IA cada 100km
    const currentDistanceKm = parseFloat(distanceKm);
    if (currentDistanceKm > 0 && currentDistanceKm % 100 < 10 && currentDistanceKm > lastRecommendationKm + 90) {
      getAIRecommendations(currentLocation, currentDistanceKm);
    }
  };

  // Función para obtener recomendaciones de Gemini AI
  const getAIRecommendations = async (location: {lat: number, lng: number} | null, distanceTraveled: number) => {
    if (!location || isLoadingRecommendations) return;
    
    setIsLoadingRecommendations(true);
    setLastRecommendationKm(distanceTraveled);
    
    try {
      console.log('🤖 Obteniendo recomendaciones de Gemini AI...');
      
      // Usar Google Places API para encontrar lugares cercanos
      const placesService = new window.google.maps.places.PlacesService(map);
      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: 50000, // 50km de radio
        type: ['tourist_attraction', 'restaurant', 'gas_station', 'lodging', 'shopping_mall']
      };
      
      placesService.nearbySearch(request, async (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
          // Preparar contexto para Gemini
          const nearbyPlaces = results.slice(0, 10).map(place => ({
            name: place.name,
            rating: place.rating,
            types: place.types,
            vicinity: place.vicinity
          }));
          
          // Llamar a Gemini AI
          const geminiResponse = await callGeminiAI(nearbyPlaces, distanceTraveled, trip);
          
          if (geminiResponse && geminiResponse.recommendations) {
            setAiRecommendations(geminiResponse.recommendations);
            setShowRecommendations(true);
            toast.info('🤖 Nuevas recomendaciones de IA disponibles');
          }
        } else {
          console.log('No se encontraron lugares cercanos');
        }
        setIsLoadingRecommendations(false);
      });
      
    } catch (error) {
      console.error('Error obteniendo recomendaciones de IA:', error);
      setIsLoadingRecommendations(false);
    }
  };

  // Función para llamar a Gemini AI
  const callGeminiAI = async (nearbyPlaces: any[], distanceTraveled: number, tripData: any) => {
    try {
      const prompt = `
        Eres un asistente de viajes inteligente. El usuario está viajando de ${tripData?.origin || 'origen'} a ${tripData?.destination || 'destino'} 
        y ha recorrido ${distanceTraveled.toFixed(1)} km. 
        
        Lugares cercanos disponibles:
        ${nearbyPlaces.map(place => `- ${place.name} (${place.rating}/5 estrellas) - ${place.types.join(', ')}`).join('\n')}
        
        Proporciona 3-5 recomendaciones específicas y útiles para el viajero en este punto del viaje. 
        Considera:
        - Si necesita descansar (restaurantes, gasolineras)
        - Atracciones turísticas interesantes
        - Lugares para alojarse si es un viaje largo
        - Actividades según el tipo de viaje
        
        Responde en formato JSON con:
        {
          "recommendations": [
            {
              "title": "Título de la recomendación",
              "description": "Descripción detallada",
              "type": "restaurant|attraction|gas_station|lodging|activity",
              "priority": "high|medium|low",
              "estimated_time": "tiempo estimado en minutos"
            }
          ]
        }
      `;
      
      // Aquí integrarías con la API de Gemini
      // Por ahora, simularemos una respuesta
      const mockResponse = {
        recommendations: [
          {
            title: "Parada para descansar",
            description: "Te recomendamos hacer una parada en el próximo pueblo para estirar las piernas y tomar algo.",
            type: "activity",
            priority: "high",
            estimated_time: "30"
          },
          {
            title: "Gasolinera cercana",
            description: "Hay una gasolinera a 5km con buenos precios y servicios.",
            type: "gas_station",
            priority: "medium",
            estimated_time: "15"
          }
        ]
      };
      
      return mockResponse;
      
    } catch (error) {
      console.error('Error llamando a Gemini AI:', error);
      return null;
    }
  };

  // Función para inicializar el chat
  const initializeChat = () => {
    const locationContext = currentLocation 
      ? `Estás ubicado en las coordenadas ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
      : 'No tengo acceso a tu ubicación actual';
    
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      message: `¡Hola! Soy tu asistente de viajes. Estoy aquí para ayudarte durante tu viaje a ${trip?.destination}. ${locationContext}. ¿En qué puedo ayudarte?`,
      timestamp: new Date()
    };
    
    setChatMessages([welcomeMessage]);
    setIsChatOpen(true);
  };

  // Función para enviar mensaje al chat
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);
    
    try {
      // Simular respuesta de Gemini AI
      const aiResponse = await generateAIResponse(chatInput);
      
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          message: aiResponse,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 500); // Reducido de 1500ms a 500ms
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setIsTyping(false);
    }
  };

  // Función para generar respuesta de IA
  const generateAIResponse = async (userInput: string): Promise<string> => {
    const lowerInput = userInput.toLowerCase();
    
    try {
      // Detectar tipo de consulta y generar respuesta contextual
      // Consultas específicas para el mejor lugar
      if (lowerInput.includes('mejor lugar para comer') || lowerInput.includes('mejor restaurante')) {
        return await handleBestRestaurantQuery();
      } else if (lowerInput.includes('mejor lugar para dormir') || lowerInput.includes('mejor hotel') || lowerInput.includes('mejores departamentos')) {
        return await handleBestAccommodationQuery();
      } else if (lowerInput.includes('mejores lugares para visitar') || lowerInput.includes('mejores atracciones')) {
        return await handleBestAttractionsQuery();
      }
      // Consultas generales
      else if (lowerInput.includes('comer') || lowerInput.includes('restaurante') || lowerInput.includes('comida')) {
        return await handleRestaurantQuery();
      } else if (lowerInput.includes('dormir') || lowerInput.includes('hotel') || lowerInput.includes('alojamiento') || lowerInput.includes('departamento') || lowerInput.includes('departamentos')) {
        return await handleAccommodationQuery();
      } else if (lowerInput.includes('atracción') || lowerInput.includes('turístico') || lowerInput.includes('visitar')) {
        return await handleAttractionQuery();
    } else if (lowerInput.includes('gasolinera') || lowerInput.includes('combustible') || lowerInput.includes('gas') || lowerInput.includes('nafta') || lowerInput.includes('cargar')) {
      return await handleGasStationQuery();
      } else if (lowerInput.includes('tráfico') || lowerInput.includes('ruta') || lowerInput.includes('dirección')) {
        return await handleTrafficQuery();
      } else {
        return await handleGeneralQuery();
      }
    } catch (error) {
      console.error('Error generando respuesta de IA:', error);
      return 'Lo siento, hubo un problema procesando tu consulta. Intenta de nuevo.';
    }
  };

  // Función para manejar consultas de restaurantes
  const handleRestaurantQuery = async () => {
    if (!currentLocation) return "No puedo obtener tu ubicación actual para recomendarte restaurantes.";
    
    try {
      // Buscar lugares de forma asíncrona sin bloquear la respuesta
      findNearbyPlaces('restaurant', {
        maxResults: 5,
        maxRadius: 20,
        sortBy: 'rating',
        minRating: 4.0,
        includePrice: true
      }).then(places => {
        console.log('🍽️ Resultados de búsqueda de restaurantes:', places);
        if (places.length > 0) {
          setRecommendedPlaces(places);
          addPinsToMap(places);
          
          // Agregar a tips
          const newTips = places.map(place => ({
            ...place,
            tipType: 'restaurant',
            tipIcon: '🍽️'
          }));
          console.log('🍽️ Agregando tips de restaurantes:', newTips);
          setTips(prev => {
            const updated = [...prev, ...newTips];
            console.log('📝 Tips actualizados:', updated);
            return updated;
          });
          
          // Agregar pins al mapa con delay para asegurar que el mapa esté listo
          setTimeout(() => {
            addTipPinsToMap(newTips);
          }, 500);
        } else {
          console.log('❌ No se encontraron restaurantes');
        }
      }).catch(error => {
        console.error('❌ Error buscando restaurantes:', error);
        // Mostrar mensaje de error al usuario
        toast.error('Error buscando restaurantes. Intenta de nuevo.');
      });
      
      return `🍽️ **Buscando restaurantes cerca de ti...**\n\nEstoy buscando los mejores restaurantes en tu zona. Te mostraré opciones con calificaciones y precios para que puedas elegir dónde comer.\n\n💡 **Tip:** Puedes preguntarme por otros tipos de lugares como hoteles, atracciones o gasolineras.`;
    } catch (error) {
      return "Hubo un problema buscando restaurantes. Intenta de nuevo en un momento.";
    }
  };

  // Función para manejar consultas de alojamiento
  const handleAccommodationQuery = async () => {
    if (!currentLocation) return "No puedo obtener tu ubicación actual para recomendarte alojamiento.";
    
    try {
      // Buscar lugares de forma asíncrona sin bloquear la respuesta
      findNearbyPlaces('lodging', {
        maxResults: 5,
        maxRadius: 20,
        sortBy: 'rating',
        minRating: 3.0,
        includePrice: true
      }).then(places => {
        if (places.length > 0) {
          setRecommendedPlaces(places);
          addPinsToMap(places);
          
          // Agregar a tips
          const newTips = places.map(place => ({
            ...place,
            tipType: 'lodging',
            tipIcon: '🏨'
          }));
          setTips(prev => [...prev, ...newTips]);
          addTipPinsToMap(newTips);
        }
      }).catch(error => {
        console.error('Error buscando alojamiento:', error);
      });
      
      return `🏨 **Buscando departamentos y alojamientos cerca de ti...**\n\nEstoy buscando los mejores departamentos y hoteles en tu zona. Te mostraré opciones con precios y calificaciones para que puedas elegir el que más te convenga.\n\n💡 **Tip:** Perfecto para viajes largos o si necesitas descansar.`;
    } catch (error) {
      return "Hubo un problema buscando alojamiento. Intenta de nuevo en un momento.";
    }
  };

  // Función para manejar consultas de atracciones
  const handleAttractionQuery = async () => {
    if (!currentLocation) return "No puedo obtener tu ubicación actual para recomendarte atracciones.";
    
    try {
      // Buscar lugares de forma asíncrona sin bloquear la respuesta
      findNearbyPlaces('tourist_attraction').then(places => {
        if (places.length > 0) {
          const topPlaces = places.slice(0, 3);
          setRecommendedPlaces(topPlaces);
          addPinsToMap(topPlaces);
          
          // Agregar a tips
          const newTips = topPlaces.map(place => ({
            ...place,
            tipType: 'tourist_attraction',
            tipIcon: '🎯'
          }));
          setTips(prev => [...prev, ...newTips]);
          addTipPinsToMap(newTips);
        }
      }).catch(error => {
        console.error('Error buscando atracciones:', error);
      });
      
      return `🎯 **Buscando atracciones cerca de ti...**\n\nEstoy buscando las mejores atracciones turísticas en tu zona. Te mostraré lugares interesantes para visitar durante tu viaje.\n\n💡 **Tip:** Perfecto para turismo y descubrir nuevos lugares.`;
    } catch (error) {
      return "Hubo un problema buscando atracciones. Intenta de nuevo en un momento.";
    }
  };

  // Función para manejar consultas de gasolineras
  const handleGasStationQuery = async () => {
    if (!currentLocation) return "No puedo obtener tu ubicación actual para recomendarte gasolineras.";
    
    try {
      // Buscar lugares de forma asíncrona sin bloquear la respuesta
      findNearbyPlaces('gas_station').then(places => {
        if (places.length > 0) {
          const topPlaces = places.slice(0, 3);
          setRecommendedPlaces(topPlaces);
          addPinsToMap(topPlaces);
          
          // Agregar a tips
          const newTips = topPlaces.map(place => ({
            ...place,
            tipType: 'gas_station',
            tipIcon: '⛽'
          }));
          setTips(prev => [...prev, ...newTips]);
          addTipPinsToMap(newTips);
        }
      }).catch(error => {
        console.error('Error buscando gasolineras:', error);
      });
      
      return `⛽ **Buscando gasolineras cerca de ti...**\n\nEstoy buscando las gasolineras más cercanas en tu zona. Te mostraré opciones para que puedas cargar combustible durante tu viaje.\n\n💡 **Tip:** Esencial para viajes largos en auto.`;
    } catch (error) {
      return "Hubo un problema buscando gasolineras. Intenta de nuevo en un momento.";
    }
  };

  // Función para manejar consultas de tráfico
  const handleTrafficQuery = async () => {
    return `🚦 **Estado del tráfico:**\n\nEl tráfico se ve fluido en tu ruta actual. Deberías llegar a tiempo a tu destino. Si encuentras congestión, te sugeriré rutas alternativas.\n\n💡 **Consejo:** Mantén la navegación activa para recibir actualizaciones en tiempo real del tráfico.`;
  };

  // Función para manejar consultas generales
  const handleGeneralQuery = async () => {
    const responses = [
      `¿En qué puedo ayudarte? Puedo recomendarte restaurantes, departamentos, atracciones turísticas o gasolineras.`,
      `Estoy aquí para ayudarte durante tu viaje. ¿Te gustaría que te recomiende lugares para comer, dormir o visitar?`,
      `Puedo ayudarte a encontrar los mejores lugares cerca de ti. ¿Qué tipo de lugar te interesa?`,
      `¿Hay algo específico que necesites durante tu viaje? Puedo buscar restaurantes, hoteles, atracciones o gasolineras.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Función para manejar consultas del mejor restaurante (solo 1 resultado)
  const handleBestRestaurantQuery = async () => {
    if (!currentLocation) return "No puedo obtener tu ubicación actual para recomendarte el mejor restaurante.";
    
    try {
      findNearbyPlaces('restaurant', {
        maxResults: 1,
        maxRadius: 20,
        sortBy: 'rating',
        minRating: 4.5,
        includePrice: true
      }).then(places => {
        if (places.length > 0) {
          setRecommendedPlaces(places);
          addPinsToMap(places);
          
          const newTips = places.map(place => ({
            ...place,
            tipType: 'restaurant',
            tipIcon: '🍽️'
          }));
          setTips(prev => [...prev, ...newTips]);
          addTipPinsToMap(newTips);
        }
      }).catch(error => {
        console.error('Error buscando el mejor restaurante:', error);
      });
      
      return `🍽️ **Buscando el MEJOR restaurante para ti...**\n\nEstoy buscando el restaurante con mayor calificación (4.5+ estrellas) en tu zona. Solo te mostraré la mejor opción disponible.\n\n💡 **Tip:** El lugar con la mejor reputación según Google Maps.`;
    } catch (error) {
      return "Hubo un problema buscando el mejor restaurante. Intenta de nuevo en un momento.";
    }
  };

  // Función para manejar consultas del mejor alojamiento (solo 1 resultado)
  const handleBestAccommodationQuery = async () => {
    if (!currentLocation) return "No puedo obtener tu ubicación actual para recomendarte el mejor alojamiento.";
    
    try {
      findNearbyPlaces('lodging', {
        maxResults: 1,
        maxRadius: 20,
        sortBy: 'rating',
        minRating: 4.5,
        includePrice: true
      }).then(places => {
        if (places.length > 0) {
          setRecommendedPlaces(places);
          addPinsToMap(places);
          
          const newTips = places.map(place => ({
            ...place,
            tipType: 'lodging',
            tipIcon: '🏨'
          }));
          setTips(prev => [...prev, ...newTips]);
          addTipPinsToMap(newTips);
        }
      }).catch(error => {
        console.error('Error buscando el mejor alojamiento:', error);
      });
      
      return `🏨 **Buscando el MEJOR departamento para ti...**\n\nEstoy buscando el departamento o hotel con mayor calificación (4.5+ estrellas) en tu zona. Solo te mostraré la mejor opción disponible.\n\n💡 **Tip:** El lugar con la mejor reputación según Google Maps.`;
    } catch (error) {
      return "Hubo un problema buscando el mejor alojamiento. Intenta de nuevo en un momento.";
    }
  };

  // Función para manejar consultas de las mejores atracciones (5 resultados)
  const handleBestAttractionsQuery = async () => {
    if (!currentLocation) return "No puedo obtener tu ubicación actual para recomendarte las mejores atracciones.";
    
    try {
      findNearbyPlaces('tourist_attraction', {
        maxResults: 5,
        maxRadius: 20,
        sortBy: 'rating',
        minRating: 4.0,
        includePrice: false
      }).then(places => {
        if (places.length > 0) {
          setRecommendedPlaces(places);
          addPinsToMap(places);
          
          const newTips = places.map(place => ({
            ...place,
            tipType: 'tourist_attraction',
            tipIcon: '🎯'
          }));
          setTips(prev => [...prev, ...newTips]);
          addTipPinsToMap(newTips);
        }
      }).catch(error => {
        console.error('Error buscando las mejores atracciones:', error);
      });
      
      return `🎯 **Buscando las MEJORES atracciones para ti...**\n\nEstoy buscando las 5 atracciones turísticas con mayor calificación (4.0+ estrellas) en tu zona. Te mostraré los lugares más populares y mejor valorados.\n\n💡 **Tip:** Los lugares más populares y mejor valorados por los visitantes.`;
    } catch (error) {
      return "Hubo un problema buscando las mejores atracciones. Intenta de nuevo en un momento.";
    }
  };

  // Función para buscar lugares cercanos usando Google Places API real
  const findNearbyPlaces = async (
    placeType: string, 
    options: {
      maxResults?: number;
      maxRadius?: number;
      sortBy?: 'distance' | 'rating';
      minRating?: number;
      includePrice?: boolean;
    } = {}
  ): Promise<any[]> => {
    if (!map || !currentLocation) {
      console.error('❌ Mapa o ubicación no disponible');
      return [];
    }

    const {
      maxResults = 5,
      maxRadius = 20, // 20km por defecto
      sortBy = 'distance',
      minRating = 0,
      includePrice = false
    } = options;

    try {
      console.log('🔍 Búsqueda inteligente iniciada...', {
        placeType,
        location: currentLocation,
        maxResults,
        maxRadius,
        sortBy,
        minRating,
        includePrice
      });
      
      const placesService = new window.google.maps.places.PlacesService(map);
      
      // Intentar búsqueda con radio progresivo si no encuentra resultados
      const searchRadii = [5, 10, 15, 20]; // km
      let allResults: any[] = [];
      
      for (const radius of searchRadii) {
        if (allResults.length >= maxResults) break;
        
        console.log(`🔍 Buscando en radio de ${radius}km...`);
        
        const request = {
          location: new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng),
          type: placeType,
          rankBy: window.google.maps.places.RankBy.DISTANCE
        };
        
        const results = await new Promise<any[]>((resolve) => {
          placesService.nearbySearch(request, (results: any[], status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              resolve([]);
            }
          });
        });
        
        if (results.length > 0) {
          console.log(`✅ Encontrados ${results.length} lugares en ${radius}km`);
          allResults = [...allResults, ...results];
          break; // Si encontramos resultados, no necesitamos expandir más
        }
      }
      
      if (allResults.length === 0) {
        console.log('❌ No se encontraron lugares en ningún radio');
        return [];
      }
      
      console.log(`🎯 Procesando ${allResults.length} lugares encontrados...`);
      
      const processedPlaces = allResults.map((place: any) => {
        const placeLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          placeLocation.lat,
          placeLocation.lng
        );
        
        const processedPlace = {
          id: place.place_id,
          name: place.name,
          rating: place.rating || 0,
          types: place.types || [],
          vicinity: place.vicinity || 'Dirección no disponible',
          address: place.vicinity || 'Dirección no disponible',
          location: placeLocation,
          distance: distance,
          distanceKm: distance,
          distanceText: distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`,
          type: placeType,
          priceLevel: place.price_level || null,
          priceText: place.price_level ? 
            ['Gratis', '$', '$$', '$$$', '$$$$'][place.price_level] : 'Precio no disponible'
        };
        
        return processedPlace;
      });
      
      // Filtrar por rating mínimo si se especifica
      let filteredPlaces = processedPlaces;
      if (minRating > 0) {
        filteredPlaces = processedPlaces.filter(place => place.rating >= minRating);
      }
      
      // Ordenar según criterio especificado
      if (sortBy === 'rating') {
        filteredPlaces.sort((a, b) => b.rating - a.rating);
      } else {
        filteredPlaces.sort((a, b) => a.distance - b.distance);
      }
      
      // Limitar resultados
      const finalResults = filteredPlaces.slice(0, maxResults);
      
      console.log(`🎯 ${finalResults.length} lugares finales seleccionados:`, 
        finalResults.map(p => `${p.name} (${p.distanceText}, ⭐${p.rating})`));
      
      return finalResults;
      
    } catch (error) {
      console.error('❌ Error en findNearbyPlaces:', error);
      return [];
    }
  };

  // Función para agregar pins al mapa
  const addPinsToMap = (places: any[]) => {
    if (!map) return;
    
    // Limpiar pins anteriores
    mapPins.forEach(pin => pin.setMap(null));
    const newPins: any[] = [];
    
    places.forEach((place, index) => {
      const icon = getPlaceIcon(place.type);
      
      const marker = new window.google.maps.Marker({
        position: place.location,
        map: map,
        title: place.name,
        icon: {
          url: icon,
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        },
        animation: window.google.maps.Animation.DROP
      });
      
      // Agregar info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0; color: #1976d2;">${place.name}</h3>
            <p style="margin: 0; color: #666;">${place.vicinity}</p>
            <p style="margin: 5px 0 0 0; color: #666;">⭐ ${place.rating}/5</p>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedPlace(place);
      });
      
      newPins.push(marker);
    });
    
    setMapPins(newPins);
  };

  // Función para obtener icono según el tipo de lugar
  const getPlaceIcon = (placeType: string) => {
    switch (placeType) {
      case 'restaurant':
        return 'https://maps.google.com/mapfiles/ms/icons/restaurant.png';
      case 'lodging':
        return 'https://maps.google.com/mapfiles/ms/icons/lodging.png';
      case 'tourist_attraction':
        return 'https://maps.google.com/mapfiles/ms/icons/tourist.png';
      case 'gas_station':
        return 'https://maps.google.com/mapfiles/ms/icons/gas.png';
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
  };

  // Función para agregar pins de tips al mapa
  const addTipPinsToMap = async (tips: any[]) => {
    console.log('🗺️ addTipPinsToMap llamada con:', tips);
    console.log('🗺️ Mapa disponible:', !!map);
    
    if (!map) {
      console.error('❌ Mapa no disponible para agregar pins de tips');
      return;
    }
    
    // Limpiar pins de tips anteriores
    tipPins.forEach(pin => pin.setMap(null));
    const newTipPins: any[] = [];
    
    console.log('🗺️ Agregando pins de tips al mapa...');
    for (const [index, tip] of tips.entries()) {
      // Guardar tip en la base de datos
      const savedTip = await saveTipToDatabase(tip);
      if (savedTip) {
        // Usar el ID de la base de datos
        tip.id = savedTip.id;
        console.log('✅ Tip guardado con ID:', savedTip.id);
      }
      const marker = new window.google.maps.Marker({
        position: tip.location,
        map: map,
        title: `${tip.tipIcon} ${tip.name}`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/info.png', // Icono de exclamación
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        },
        animation: window.google.maps.Animation.DROP
      });
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">
              ${tip.tipIcon} ${tip.name}
            </h3>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">
              📍 ${tip.vicinity}
            </p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">
              ⭐ ${tip.rating}/5 • ${tip.distanceText}
            </p>
            <p style="margin: 4px 0; color: #666; font-size: 12px;">
              🏷️ ${tip.types.join(', ')}
            </p>
            <button onclick="startTripToTip('${tip.id}')" 
                    style="background: #1976d2; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
              🚗 Iniciar viaje
            </button>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      newTipPins.push(marker);
      console.log(`🗺️ Pin ${index + 1} agregado:`, tip.name);
    }
    
    console.log('🗺️ Total pins de tips creados:', newTipPins.length);
    setTipPins(newTipPins);
    console.log('🗺️ Estado de tipPins actualizado');
  };

  // Función para iniciar viaje a un tip
  const startTripToTip = (tipId: string) => {
    console.log('🚗 Iniciando viaje a tip:', tipId);
    const tip = tips.find(t => t.id === tipId);
    if (!tip || !currentLocation) {
      console.error('❌ Tip no encontrado o ubicación no disponible');
      return;
    }
    
    console.log('📍 Tip encontrado:', tip);
    
    // Guardar destino original si no estamos ya navegando a un tip
    if (!isNavigatingToTip && trip) {
      setOriginalDestination({
        name: trip.destination,
        location: {
          lat: trip.destinationLatitude,
          lng: trip.destinationLongitude
        }
      });
    }
    
    // Configurar navegación temporal al tip
    setIsNavigatingToTip(true);
    setCurrentTipDestination(tip);
    
    // Iniciar navegación al tip
    if (directionsService && directionsRenderer) {
      const request = {
        origin: currentLocation,
        destination: {
          lat: tip.latitude,
          lng: tip.longitude
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
        avoidHighways: false,
        avoidTolls: false
      };
      
      console.log('🗺️ Calculando ruta al tip:', request);
      
      directionsService.route(request, (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          
          // Zoom automático al tip
          if (currentLocation) {
            applyZoomToLocation(currentLocation, 'navegación a tip');
          }
          
          toast.success(`🚗 Navegando a ${tip.name}. Usa "Continuar viaje" para volver al destino principal.`);
          console.log('✅ Ruta al tip calculada exitosamente');
        } else {
          console.error('❌ Error calculando ruta al tip:', status);
          toast.error('Error calculando ruta al tip');
          setIsNavigatingToTip(false);
          setCurrentTipDestination(null);
        }
      });
    } else {
      console.error('❌ DirectionsService no disponible');
      toast.error('Servicio de direcciones no disponible');
      setIsNavigatingToTip(false);
      setCurrentTipDestination(null);
    }
  };

  // Función para continuar el viaje principal
  const continueMainTrip = () => {
    if (!originalDestination || !currentLocation || !directionsService || !directionsRenderer) {
      console.error('❌ No se puede continuar el viaje principal');
      toast.error('No se puede continuar el viaje principal');
      return;
    }
    
    console.log('🔄 Continuando viaje principal a:', originalDestination);
    
    const request = {
      origin: currentLocation,
      destination: originalDestination.location,
      travelMode: window.google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
      avoidHighways: false,
      avoidTolls: false
    };
    
    directionsService.route(request, (result: any, status: any) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        
        // Zoom automático al continuar viaje principal
        if (currentLocation) {
          applyZoomToLocation(currentLocation, 'continuar viaje principal');
        }
        
        setIsNavigatingToTip(false);
        setCurrentTipDestination(null);
        toast.success(`🔄 Continuando viaje principal a ${originalDestination.name}`);
        console.log('✅ Viaje principal restaurado');
      } else {
        console.error('❌ Error calculando ruta principal:', status);
        toast.error('Error calculando ruta principal');
      }
    });
  };

  // Hacer las funciones disponibles globalmente para los botones del mapa
  useEffect(() => {
    (window as any).startTripToTip = startTripToTip;
    (window as any).continueMainTrip = continueMainTrip;
    return () => {
      delete (window as any).startTripToTip;
      delete (window as any).continueMainTrip;
    };
  }, [startTripToTip, continueMainTrip]);

  // Función para limpiar tips
  const clearTips = () => {
    setTips([]);
    tipPins.forEach(pin => pin.setMap(null));
    setTipPins([]);
    setShowTipsList(false);
  };

  // Función para guardar tip en la base de datos
  const saveTipToDatabase = async (tip: any) => {
    try {
      const tipData = {
        name: tip.name,
        description: tip.description || '',
        address: tip.address || tip.vicinity || 'Dirección no disponible',
        latitude: tip.latitude || tip.location?.lat || 0,
        longitude: tip.longitude || tip.location?.lng || 0,
        rating: tip.rating || 0,
        distanceKm: tip.distanceKm || tip.distance || 0,
        tipType: tip.tipType,
        tipIcon: tip.tipIcon,
        types: tip.types || []
      };

      console.log('💾 Intentando guardar tip:', tipData);
      const response = await api.createTip(trip?.id?.toString() || '', tipData, user?.email || 'usuario@ejemplo.com');
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Tip guardado en base de datos:', result.data);
        return result.data;
      } else {
        const errorText = await response.text();
        console.error('❌ Error guardando tip:', response.status, response.statusText, errorText);
        toast.error(`Error guardando tip: ${response.statusText}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error guardando tip:', error);
      toast.error(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return null;
    }
  };

  // Función para cargar tips desde la base de datos
  const loadTipsFromDatabase = async () => {
    try {
      const response = await api.getTipsByTrip(trip?.id?.toString() || '');
      if (response.ok) {
        const result = await response.json();
        console.log('📥 Tips cargados desde base de datos:', result.data);
        return result.data || [];
      } else {
        console.error('❌ Error cargando tips:', response.statusText);
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando tips:', error);
      return [];
    }
  };

  // Función para eliminar tip de la base de datos
  const deleteTipFromDatabase = async (tipId: string) => {
    try {
      const response = await api.deleteTip(tipId, user?.email || 'usuario@ejemplo.com');

      if (response.ok) {
        console.log('✅ Tip eliminado de base de datos');
        return true;
      } else {
        console.error('❌ Error eliminando tip:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error eliminando tip:', error);
      return false;
    }
  };

  // Función para eliminar un tip específico
  const removeTip = async (tipId: string) => {
    // Eliminar de la base de datos
    const deleted = await deleteTipFromDatabase(tipId);
    if (deleted) {
      console.log('✅ Tip eliminado de la base de datos');
    }
    
    // Eliminar del estado local
    setTips(prev => prev.filter(tip => tip.id !== tipId));
    setTipPins(prev => {
      const pinToRemove = prev.find(pin => pin.title.includes(tipId));
      if (pinToRemove) {
        pinToRemove.setMap(null);
        return prev.filter(pin => pin !== pinToRemove);
      }
      return prev;
    });
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

  // Función para obtener icono de dirección basado en la instrucción
  const getDirectionIcon = (instruction: string) => {
    const lowerInstruction = instruction.toLowerCase();
    
    if (lowerInstruction.includes('derecha') || lowerInstruction.includes('right')) {
      return <TurnRight sx={{ fontSize: 20, color: 'primary.main' }} />;
    } else if (lowerInstruction.includes('izquierda') || lowerInstruction.includes('left')) {
      return <TurnLeft sx={{ fontSize: 20, color: 'primary.main' }} />;
    } else if (lowerInstruction.includes('recto') || lowerInstruction.includes('straight')) {
      return <Straight sx={{ fontSize: 20, color: 'primary.main' }} />;
    } else if (lowerInstruction.includes('norte') || lowerInstruction.includes('north')) {
      return <KeyboardArrowUp sx={{ fontSize: 20, color: 'primary.main' }} />;
    } else if (lowerInstruction.includes('sur') || lowerInstruction.includes('south')) {
      return <KeyboardArrowDown sx={{ fontSize: 20, color: 'primary.main' }} />;
    } else if (lowerInstruction.includes('este') || lowerInstruction.includes('east')) {
      return <KeyboardArrowRight sx={{ fontSize: 20, color: 'primary.main' }} />;
    } else if (lowerInstruction.includes('oeste') || lowerInstruction.includes('west')) {
      return <KeyboardArrowLeft sx={{ fontSize: 20, color: 'primary.main' }} />;
    } else if (lowerInstruction.includes('llegada') || lowerInstruction.includes('arrival')) {
      return <Flag sx={{ fontSize: 20, color: 'success.main' }} />;
    } else {
      return <Navigation sx={{ fontSize: 20, color: 'primary.main' }} />;
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

                {/* Sección de Billeteras y Gastos */}
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Billeteras y Gastos
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setOpenAddPurchase(true)}
                      sx={{
                        bgcolor: '#4caf50',
                        '&:hover': { bgcolor: '#45a049' },
                        textTransform: 'none',
                      }}
                    >
                      Agregar Compra
                    </Button>
                  </Box>

                  {/* Billetera General */}
                  {loadingWallets ? (
                    <Box display="flex" justifyContent="center" py={2}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <>
                      {generalWallet && (
                        <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <AccountBalanceWallet sx={{ fontSize: 24 }} />
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                                    Billetera General
                                  </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                                  {generalWallet.currencySymbol || '$'} {generalWallet.amount?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                  {generalWallet.currency === 'PESOS' ? 'Pesos Argentinos' : 
                                   generalWallet.currency === 'DOLARES' ? 'Dólares Estadounidenses' : 
                                   'Euros'}
                                </Typography>
                              </Box>
                              {isUserAdmin && (
                                <IconButton
                                  onClick={handleOpenEditGeneralWallet}
                                  sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                                    }
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      )}

                      {/* Billetera Individual */}
                      {individualWallet && (
                        <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)', color: 'white' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <Wallet sx={{ fontSize: 24 }} />
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                                    Mi Billetera
                                  </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                                  {individualWallet.currencySymbol || '$'} {individualWallet.amount?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                  {individualWallet.currency === 'PESOS' ? 'Pesos Argentinos' : 
                                   individualWallet.currency === 'DOLARES' ? 'Dólares Estadounidenses' : 
                                   'Euros'}
                                </Typography>
                              </Box>
                              <IconButton
                                onClick={handleOpenEditIndividualWallet}
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                                  color: 'white',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                                  }
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {/* Sección de Gastos */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                      Gastos
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      {/* Gastos Generales */}
                      <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <AccountBalanceWallet sx={{ fontSize: 24 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                              Gastos Generales
                            </Typography>
                          </Box>
                          {loadingPurchases ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                          ) : (
                            <>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                                {generalWallet?.currencySymbol || '$'} {getGeneralExpensesRemainingConverted().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                                Total gastos: {generalWallet?.currencySymbol || '$'} {calculateTotalExpensesConverted(generalPurchases, generalWallet?.currency || 'PESOS').toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {generalPurchases.length} {generalPurchases.length === 1 ? 'compra' : 'compras'} registradas
                              </Typography>
                            </>
                          )}
                        </CardContent>
                      </Card>

                      {/* Mis Gastos */}
                      <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Wallet sx={{ fontSize: 24 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                              Mis Gastos
                            </Typography>
                          </Box>
                          {loadingPurchases ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                          ) : (
                            <>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                                {individualWallet?.currencySymbol || '$'} {getIndividualExpensesRemainingConverted().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                                Total gastos: {individualWallet?.currencySymbol || '$'} {calculateTotalExpensesConverted(individualPurchases, individualWallet?.currency || 'PESOS').toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {individualPurchases.length} {individualPurchases.length === 1 ? 'compra' : 'compras'} registradas
                              </Typography>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>

                  {/* Lista de Compras */}
                  <Box sx={{ mt: 4 }}>
                    <Accordion 
                      expanded={purchasesExpanded} 
                      onChange={() => setPurchasesExpanded(!purchasesExpanded)}
                      sx={{
                        boxShadow: 'none',
                        border: '1px solid #E0E0E0',
                        borderRadius: 2,
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                          bgcolor: '#F5F5F5',
                          borderRadius: 2,
                          '&:hover': { bgcolor: '#EEEEEE' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <ShoppingCart sx={{ color: '#4CAF50' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                            Lista de Compras ({(generalPurchases.length + individualPurchases.length)})
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 3 }}>
                        {/* Filtros */}
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FilterList sx={{ color: '#666' }} />
                          <FormControl>
                            <ToggleButtonGroup
                              value={purchaseFilter}
                              exclusive
                              onChange={(e, newValue) => {
                                if (newValue !== null) {
                                  setPurchaseFilter(newValue);
                                }
                              }}
                              size="small"
                            >
                              <ToggleButton value="all">Todas</ToggleButton>
                              <ToggleButton value="general">Generales</ToggleButton>
                              <ToggleButton value="individual">Individuales</ToggleButton>
                            </ToggleButtonGroup>
                          </FormControl>
                        </Box>

                        {/* Lista de compras */}
                        {loadingPurchases ? (
                          <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                          </Box>
                        ) : (
                          <>
                            {(() => {
                              const allPurchases = [
                                ...generalPurchases.map((p: any) => ({ ...p, isGeneral: true })),
                                ...individualPurchases.map((p: any) => ({ ...p, isGeneral: false }))
                              ].filter((purchase) => {
                                if (purchaseFilter === 'all') return true;
                                if (purchaseFilter === 'general') return purchase.isGeneral === true;
                                if (purchaseFilter === 'individual') return purchase.isGeneral === false;
                                return true;
                              }).sort((a, b) => {
                                const dateA = new Date(a.purchaseDate).getTime();
                                const dateB = new Date(b.purchaseDate).getTime();
                                return dateB - dateA; // Más reciente primero
                              });

                              if (allPurchases.length === 0) {
                                return (
                                  <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <ShoppingCart sx={{ fontSize: 60, color: '#BDBDBD', mb: 2 }} />
                                    <Typography variant="body1" color="text.secondary">
                                      No hay compras registradas
                                    </Typography>
                                  </Box>
                                );
                              }

                              return (
                                <TableContainer component={Paper} sx={{ maxHeight: 500, boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                                  <Table stickyHeader>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Precio</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Creado por</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {allPurchases.map((purchase: any) => (
                                        <TableRow
                                          key={purchase.id}
                                          sx={{
                                            '&:hover': { bgcolor: '#F5F5F5' },
                                          }}
                                        >
                                          <TableCell>{purchase.description}</TableCell>
                                          <TableCell>
                                            {purchase.currencySymbol || '$'} {parseFloat(purchase.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                              {purchase.currency === 'PESOS' ? 'Pesos' : purchase.currency === 'DOLARES' ? 'Dólares' : 'Euros'}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            {new Date(purchase.purchaseDate).toLocaleDateString('es-AR', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric'
                                            })}
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              label={purchase.isGeneral ? 'General' : 'Individual'}
                                              size="small"
                                              sx={{
                                                bgcolor: purchase.isGeneral ? '#FF9800' : '#9C27B0',
                                                color: 'white',
                                                fontWeight: 500,
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell>
                                            {purchase.createdByName || 'N/A'}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              );
                            })()}
                          </>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </Box>
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
                      {isNavigating ? 'Navegación Activa' : 'Ruta del Viaje'}
                    </Typography>
                    {isNavigating ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          {remainingDistance}
                        </Typography>
                        {remainingTime && (
                          <Typography variant="body2" color="text.secondary">
                            • {remainingTime}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      routeDistance && (
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
                      )
                    )}
                  </Box>
                  
                  {isNavigating ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {trip.origin ? `${trip.origin} → ${trip.destination}` : trip.destination}
                      </Typography>
                      {nextInstruction && (
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Navigation sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            {nextInstruction}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box>
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
                  )}
                  
                  {/* Botones de navegación para viajes en auto */}
                  {trip.vehicle === 'auto' && currentLocation && (
                    <Box display="flex" gap={1} mt={2}>
                      {!isNavigating ? (
                        <Button
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={startNavigation}
                          size="small"
                          sx={{ 
                            bgcolor: 'success.main',
                            '&:hover': { bgcolor: 'success.dark' }
                          }}
                        >
                          Iniciar Viaje
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            startIcon={<Stop />}
                            onClick={stopNavigation}
                            size="small"
                            color="error"
                          >
                            Detener Navegación
                          </Button>
                          {isNavigatingToTip && (
                            <Button
                              variant="contained"
                              startIcon={<Navigation />}
                              onClick={continueMainTrip}
                              size="small"
                              sx={{ 
                                bgcolor: 'green',
                                '&:hover': { bgcolor: 'darkgreen' }
                              }}
                            >
                              Continuar viaje
                            </Button>
                          )}
                        </>
                      )}
                    </Box>
                  )}
                </Box>
                <Box
                  ref={mapRef}
                  sx={{
                    width: '100%',
                    height: isNavigating ? 300 : 400,
                    borderRadius: 0,
                    overflow: 'hidden',
                    transition: 'height 0.3s ease-in-out'
                  }}
                />
                

                {/* Lista de Tips Mejorada */}
                {tips.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: 'primary.main',
                          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          💡 Tips Recomendados
                        </Typography>
                        <Chip
                          label={`${tips.length} lugares`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setShowTipsList(!showTipsList)}
                          startIcon={showTipsList ? <ExpandLess /> : <ExpandMore />}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          {showTipsList ? 'Ocultar' : 'Ver todos'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={clearTips}
                          startIcon={<Clear />}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          Limpiar
                        </Button>
                      </Box>
                    </Box>
                    
                    {showTipsList && (
                      <Box sx={{ 
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0) 90%, rgba(255,255,255,1) 100%)',
                          pointerEvents: 'none',
                          zIndex: 1
                        }
                      }}>
                        <Box sx={{ 
                          display: 'flex',
                          gap: 2,
                          overflowX: 'auto',
                          pb: 2,
                          scrollbarWidth: 'thin',
                          '&::-webkit-scrollbar': {
                            height: 8
                          },
                          '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: 4
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#1976d2',
                            borderRadius: 4,
                            '&:hover': {
                              background: '#1565c0'
                            }
                          }
                        }}>
                          {tips.map((tip, index) => (
                            <Card 
                              key={tip.id}
                              id={`tip-card-${tip.id}`}
                              sx={{ 
                                minWidth: 280,
                                maxWidth: 280,
                                border: '2px solid transparent',
                                borderRadius: 3,
                                background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                  transform: 'translateY(-8px) scale(1.02)',
                                  boxShadow: '0 12px 40px rgba(25, 118, 210, 0.3)',
                                  border: '2px solid #1976d2',
                                  '& .tip-icon': {
                                    transform: 'scale(1.2) rotate(5deg)'
                                  },
                                  '& .tip-name': {
                                    color: '#1976d2'
                                  },
                                  '& .shine-effect': {
                                    left: '100%'
                                  }
                                },
                                '&:active': {
                                  transform: 'translateY(-4px) scale(0.98)',
                                  transition: 'all 0.1s ease'
                                }
                              }}
                              onClick={() => {
                                // Animación de selección
                                const card = document.getElementById(`tip-card-${tip.id}`);
                                if (card) {
                                  card.style.transform = 'scale(0.95)';
                                  setTimeout(() => {
                                    card.style.transform = '';
                                  }, 150);
                                }
                              }}
                            >
                              <CardContent sx={{ p: 3, position: 'relative' }}>
                                {/* Header con icono y nombre */}
                                <Box display="flex" alignItems="center" gap={2} mb={2}>
                                  <Box 
                                    className="tip-icon"
                                    sx={{ 
                                      fontSize: 32,
                                      transition: 'all 0.3s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 48,
                                      height: 48,
                                      borderRadius: '50%',
                                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                      color: 'white',
                                      boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)'
                                    }}
                                  >
                                    {tip.tipIcon}
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography 
                                      className="tip-name"
                                      variant="h6" 
                                      sx={{ 
                                        fontWeight: 700,
                                        color: '#333',
                                        transition: 'color 0.3s ease',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {tip.name}
                                    </Typography>
                                    <Chip
                                      label={tip.distanceKm ? `${tip.distanceKm.toFixed(1)} km` : 'Distancia no disponible'}
                                      size="small"
                                      color="primary"
                                      variant="filled"
                                      sx={{ 
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        height: 20
                                      }}
                                    />
                                  </Box>
                                </Box>
                                
                                {/* Información del lugar */}
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  📍 {tip.address || 'Dirección no disponible'}
                                </Typography>
                                
                                {/* Rating, precio y tipos */}
                                <Box display="flex" alignItems="center" gap={2} mb={3}>
                                  <Box display="flex" alignItems="center" gap={0.5}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                                      ⭐
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {tip.rating ? tip.rating.toFixed(1) : '0.0'}/5
                                    </Typography>
                                  </Box>
                                  {tip.priceText && tip.priceText !== 'Precio no disponible' && (
                                    <Chip
                                      label={tip.priceText}
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                      sx={{ 
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: 18
                                      }}
                                    />
                                  )}
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      flex: 1
                                    }}
                                  >
                                    {tip.types ? tip.types.slice(0, 2).join(', ') : 'Sin categoría'}
                                  </Typography>
                                </Box>
                                
                                {/* Botones de acción */}
                                <Box display="flex" gap={1}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Directions />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startTripToTip(tip.id);
                                    }}
                                    sx={{ 
                                      flex: 1,
                                      borderRadius: 2,
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                      '&:hover': {
                                        background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)'
                                      }
                                    }}
                                  >
                                    🚗 Ir
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeTip(tip.id);
                                    }}
                                    sx={{ 
                                      borderRadius: 2,
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      minWidth: 'auto',
                                      px: 1
                                    }}
                                  >
                                    <Delete fontSize="small" />
                                  </Button>
                                </Box>
                                
                                {/* Efecto de brillo en hover */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                    transition: 'left 0.5s ease',
                                    pointerEvents: 'none'
                                  }}
                                  className="shine-effect"
                                />
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
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

          {/* Recomendaciones de IA */}
          {showRecommendations && aiRecommendations.length > 0 && (
            <Box sx={{ width: '100%', mb: 4 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      borderRadius: '50%', 
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography sx={{ fontSize: 24 }}>🤖</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                        Recomendaciones de IA
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Basadas en tu ubicación y progreso del viaje
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <IconButton 
                        onClick={() => setShowRecommendations(false)}
                        sx={{ color: 'white' }}
                      >
                        <ArrowBack />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {aiRecommendations.map((recommendation, index) => (
                      <Box key={index} sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.1)', 
                        borderRadius: 2, 
                        p: 2, 
                        mb: 2,
                        border: recommendation.priority === 'high' ? '2px solid rgba(255, 255, 255, 0.5)' : 'none'
                      }}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                            {recommendation.title}
                          </Typography>
                          <Chip
                            label={recommendation.priority === 'high' ? 'ALTA' : recommendation.priority === 'medium' ? 'MEDIA' : 'BAJA'}
                            size="small"
                            sx={{ 
                              bgcolor: recommendation.priority === 'high' ? 'error.main' : 
                                     recommendation.priority === 'medium' ? 'warning.main' : 'success.main',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                          {recommendation.description}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <AccessTime sx={{ fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                              {recommendation.estimated_time} min
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Place sx={{ fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                              {recommendation.type === 'restaurant' ? 'Restaurante' :
                               recommendation.type === 'attraction' ? 'Atracción' :
                               recommendation.type === 'gas_station' ? 'Gasolinera' :
                               recommendation.type === 'lodging' ? 'Alojamiento' : 'Actividad'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  
                  {isLoadingRecommendations && (
                    <Box display="flex" alignItems="center" justifyContent="center" gap={2} py={2}>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Obteniendo nuevas recomendaciones...
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Instrucciones de Navegación (solo cuando está navegando) */}
          {isNavigating && navigationSteps.length > 0 && (
            <Box sx={{ display: 'flex', gap: 3, width: '100%', mb: 4 }}>
              {/* Navegación */}
              <Box sx={{ flex: '1 1 60%' }}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Navigation sx={{ color: 'white', fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                        Navegación Activa
                      </Typography>
                    </Box>
                  
                  {/* Instrucción actual destacada */}
                  {nextInstruction && (
                    <Box sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.15)', 
                      borderRadius: 2, 
                      p: 3, 
                      mb: 3,
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        {getDirectionIcon(nextInstruction)}
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                          {nextInstruction}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={4} mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Speed sx={{ fontSize: 18 }} />
                          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                            {remainingDistance}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTime sx={{ fontSize: 18 }} />
                          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                            {remainingTime}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip
                          label="ACTUAL"
                          size="medium"
                          sx={{ 
                            bgcolor: 'white',
                            color: 'primary.main',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        />
                        {isNavigatingToTip && (
                          <Chip
                            label={`📍 ${currentTipDestination?.name || 'Tip'}`}
                            size="medium"
                            sx={{ 
                              bgcolor: 'orange',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.8rem'
                            }}
                          />
                        )}
                        <Box sx={{ ml: 'auto' }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Typography sx={{ fontSize: 16 }}>🤖</Typography>}
                            onClick={() => setShowRecommendations(!showRecommendations)}
                            sx={{ 
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                            }}
                          >
                            {showRecommendations ? 'Ocultar IA' : 'Ver IA'}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Próximas 2 instrucciones */}
                  {navigationSteps.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                        Próximas instrucciones:
                      </Typography>
                      {navigationSteps.slice(currentStep + 1, currentStep + 3).map((step, index) => (
                        <Box key={currentStep + 1 + index} sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.1)', 
                          borderRadius: 2, 
                          p: 2, 
                          mb: 1,
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            {getDirectionIcon(step.instructions)}
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                              {step.instructions.replace(/<[^>]*>/g, '')}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2} mt={1}>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                              {step.distance.text}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                              • {step.duration.text}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                  </CardContent>
                </Card>
              </Box>

              {/* Chatbox con Gemini */}
              <Box sx={{ flex: '1 1 40%' }}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)',
                  height: 400
                }}>
                  <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header del chat */}
                    <Box sx={{ 
                      p: 2, 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <Box sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)', 
                        borderRadius: '50%', 
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ fontSize: 20 }}>🤖</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                          Gemini Assistant
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Tu asistente de viajes
                        </Typography>
                      </Box>
                    </Box>

                    {/* Mensajes del chat */}
                    <Box sx={{ 
                      flex: 1, 
                      p: 2, 
                      overflow: 'auto',
                      maxHeight: 280
                    }}>
                      {chatMessages.map((msg) => (
                        <Box key={msg.id} sx={{ mb: 2 }}>
                          <Box sx={{
                            display: 'flex',
                            justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                            mb: 1
                          }}>
                            <Box sx={{
                              maxWidth: '80%',
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: msg.type === 'user' 
                                ? 'rgba(255, 255, 255, 0.2)' 
                                : 'rgba(255, 255, 255, 0.1)',
                              border: msg.type === 'user' 
                                ? '1px solid rgba(255, 255, 255, 0.3)' 
                                : 'none'
                            }}>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                {msg.message}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: 'rgba(255, 255, 255, 0.6)', 
                                display: 'block',
                                mt: 0.5,
                                fontSize: '0.7rem'
                              }}>
                                {msg.timestamp.toLocaleTimeString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                      
                      {isTyping && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            Gemini está escribiendo...
                          </Typography>
                          <CircularProgress size={16} sx={{ color: 'white' }} />
                        </Box>
                      )}
                    </Box>

                    {/* Input del chat */}
                    <Box sx={{ 
                      p: 2, 
                      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      gap: 1
                    }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Pregúntame algo sobre tu viaje..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'white',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: 'white',
                            '&::placeholder': {
                              color: 'rgba(255, 255, 255, 0.7)',
                            },
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim()}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          minWidth: 'auto',
                          px: 2,
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                          },
                          '&:disabled': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.5)',
                          }
                        }}
                      >
                        <ArrowBack sx={{ transform: 'rotate(90deg)' }} />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}

          {/* Lista de Lugares Recomendados */}
          {recommendedPlaces.length > 0 && (
            <Box sx={{ width: '100%', mb: 4 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      borderRadius: '50%', 
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Place sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                        Lugares Recomendados
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Basados en tu consulta a Gemini
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {recommendedPlaces.map((place, index) => (
                      <Card key={place.id} sx={{ 
                        flex: '1 1 300px',
                        minWidth: 300,
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        border: selectedPlace?.id === place.id ? '2px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => setSelectedPlace(place)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Box sx={{ 
                              bgcolor: 'rgba(255, 255, 255, 0.2)', 
                              borderRadius: 1, 
                              p: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {place.type === 'restaurant' && <Typography sx={{ fontSize: 20 }}>🍽️</Typography>}
                              {place.type === 'lodging' && <Typography sx={{ fontSize: 20 }}>🏨</Typography>}
                              {place.type === 'tourist_attraction' && <Typography sx={{ fontSize: 20 }}>🎯</Typography>}
                              {place.type === 'gas_station' && <Typography sx={{ fontSize: 20 }}>⛽</Typography>}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 0.5 }}>
                                {place.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                {place.vicinity}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={2} mt={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography sx={{ fontSize: 16 }}>⭐</Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                {place.rating}/5
                              </Typography>
                            </Box>
                            <Chip
                              label={place.type === 'restaurant' ? 'Restaurante' :
                                     place.type === 'lodging' ? 'Alojamiento' :
                                     place.type === 'tourist_attraction' ? 'Atracción' : 'Gasolinera'}
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                          
                          {selectedPlace?.id === place.id && (
                            <Box sx={{ 
                              mt: 2, 
                              p: 1, 
                              bgcolor: 'rgba(255, 255, 255, 0.1)', 
                              borderRadius: 1,
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                📍 Haz clic en el pin del mapa para más información
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setRecommendedPlaces([]);
                        mapPins.forEach(pin => pin.setMap(null));
                        setMapPins([]);
                        setSelectedPlace(null);
                      }}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Limpiar Recomendaciones
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

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
                    {participants.map((p) => (
                      <ListItem key={p.id}>
                      <ListItemAvatar>
                      <Avatar src={p.profilePicture || undefined}>
                        {p.name?.[0] || 'U'}
                      </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={p.name}
                        secondary={p.email}
                      />
                      {isUserAdmin && (
                      <>
                      {/* Botón eliminar participante */}
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveParticipant(p.id)}
                      >
                    <Delete />
                      </IconButton>
                    {/* Botón agregar como admin */}
                    {!trip?.adminIds?.includes(p.id) && (
                    <IconButton
                      color="primary"
                      onClick={() => handleAddAdmin(p.id)}
                    >
                        <PersonAdd />
                        </IconButton>
                        )}
                        {/* Botón quitar admin */}
                        {trip?.adminIds?.includes(p.id) && (
                          <IconButton
                          color="warning"
                          onClick={() => handleRemoveAdmin(p.id)}
                          >
                            <Clear />
                          </IconButton>
                        )}
                      </>
                      )}
                    </ListItem>
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

      {/* Dialog para editar billetera general */}
      <Dialog open={openEditGeneralWallet} onClose={() => setOpenEditGeneralWallet(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Billetera General</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Monto"
              type="number"
              value={editWalletAmount}
              onChange={(e) => setEditWalletAmount(e.target.value)}
              placeholder="0.00"
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 3 }}
            />
            <FormControl fullWidth>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                Moneda
              </Typography>
              <RadioGroup
                value={editWalletCurrency}
                onChange={(e) => setEditWalletCurrency(e.target.value as 'PESOS' | 'DOLARES' | 'EUROS')}
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
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenEditGeneralWallet(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleUpdateGeneralWallet}
            disabled={!editWalletAmount || parseFloat(editWalletAmount) < 0}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar billetera individual */}
      <Dialog open={openEditIndividualWallet} onClose={() => setOpenEditIndividualWallet(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Mi Billetera</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Monto"
              type="number"
              value={editWalletAmount}
              onChange={(e) => setEditWalletAmount(e.target.value)}
              placeholder="0.00"
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 3 }}
            />
            <FormControl fullWidth>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                Moneda
              </Typography>
              <RadioGroup
                value={editWalletCurrency}
                onChange={(e) => setEditWalletCurrency(e.target.value as 'PESOS' | 'DOLARES' | 'EUROS')}
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
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenEditIndividualWallet(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleUpdateIndividualWallet}
            disabled={!editWalletAmount || parseFloat(editWalletAmount) < 0}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para agregar compra */}
      <Dialog open={openAddPurchase} onClose={() => setOpenAddPurchase(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Compra</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Descripción"
              value={purchaseDescription}
              onChange={(e) => setPurchaseDescription(e.target.value)}
              placeholder="Ej: Almuerzo en restaurante"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Precio"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Fecha de Compra"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 3 }}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                Moneda
              </Typography>
              <RadioGroup
                value={purchaseCurrency}
                onChange={(e) => setPurchaseCurrency(e.target.value as 'PESOS' | 'DOLARES' | 'EUROS')}
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
            <FormControl fullWidth>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                Tipo de Compra
              </Typography>
              <RadioGroup
                value={purchaseIsGeneral ? 'general' : 'individual'}
                onChange={(e) => setPurchaseIsGeneral(e.target.value === 'general')}
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
                  value="general"
                  control={<Radio size="small" />}
                  label="General"
                />
                <FormControlLabel
                  value="individual"
                  control={<Radio size="small" />}
                  label="Privada"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAddPurchase(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleCreatePurchase}
            disabled={!purchaseDescription || !purchasePrice || parseFloat(purchasePrice) <= 0}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
