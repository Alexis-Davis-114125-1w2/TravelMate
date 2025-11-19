'use client';

import { useAuth } from '../../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { api, API_BASE_URL, getAuthHeaders } from '../../../../lib/api';
import { toast } from 'react-toastify';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Estados para mapas
  const [map, setMap] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
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

  // Estados para edición de fechas y ubicaciones
  const [openEditDates, setOpenEditDates] = useState(false);
  const [openEditLocations, setOpenEditLocations] = useState(false);
  const [editDateI, setEditDateI] = useState('');
  const [editDateF, setEditDateF] = useState('');
  const [editOrigin, setEditOrigin] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editOriginCoords, setEditOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [editDestinationCoords, setEditDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Referencias para los autocompletados
  const originAutocompleteRef = useRef<HTMLInputElement>(null);
  const destinationAutocompleteRef = useRef<HTMLInputElement>(null);
  const originMapModalRef = useRef<HTMLDivElement>(null);
  const destinationMapModalRef = useRef<HTMLDivElement>(null);
  const [originModalMap, setOriginModalMap] = useState<any>(null);
  const [destinationModalMap, setDestinationModalMap] = useState<any>(null);
  const [originModalMarker, setOriginModalMarker] = useState<any>(null);
  const [destinationModalMarker, setDestinationModalMarker] = useState<any>(null);
  const [originAutocomplete, setOriginAutocomplete] = useState<any>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<any>(null);
  const [navigationMode, setNavigationMode] = useState<'to-origin' | 'to-destination' | null>(null);
  const [editVehicle, setEditVehicle] = useState<'auto' | 'avion' | 'caminando'>('auto');

  // Eliminar viaje
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingTrip, setDeletingTrip] = useState(false);

  // Debug: Log cuando cambien los tips
  useEffect(() => {
    console.log('🔍 Tips cambiaron:', tips.length, tips);
  }, [tips]);

  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openShareDialog, setOpenShareDialog] = useState(false);

  // Función para inicializar un mapa pequeño en el modal
  const initializeModalMap = (
    mapRef: React.RefObject<HTMLDivElement | null>,
    coords: { lat: number, lng: number } | null,
    title: string,
    isOrigin: boolean = false
  ) => {
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
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: isOrigin ? '#4CAF50' : '#F44336',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      label: isOrigin ? 'O' : 'D'
    });

    // Guardar referencia del mapa y marcador
    if (isOrigin) {
      setOriginModalMap(map);
      setOriginModalMarker(marker);
    } else {
      setDestinationModalMap(map);
      setDestinationModalMarker(marker);
    }

    // Agregar listener de click en el mapa
    map.addListener('click', (event: any) => {
      const clickedCoords = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };

      // Actualizar coordenadas
      if (isOrigin) {
        setEditOriginCoords(clickedCoords);
      } else {
        setEditDestinationCoords(clickedCoords);
      }

      // Mover el marcador a la nueva posición
      marker.setPosition(clickedCoords);

      // Geocodificar la nueva ubicación para obtener la dirección
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: clickedCoords }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          if (isOrigin) {
            setEditOrigin(address);
          } else {
            setEditDestination(address);
          }
        }
      });
    });
  };

  // Limpiar autocompletados cuando se cierre el modal
  useEffect(() => {
    if (!openEditLocations) {
      if (originAutocomplete) {
        window.google.maps?.event?.clearInstanceListeners(originAutocomplete);
        setOriginAutocomplete(null);
      }
      if (destinationAutocomplete) {
        window.google.maps?.event?.clearInstanceListeners(destinationAutocomplete);
        setDestinationAutocomplete(null);
      }
    }
  }, [openEditLocations]);

  // Inicializar mapas cuando se abra el modal y haya coordenadas
  const initializeMapsInModal = () => {
    if (!isGoogleMapsLoaded || !window.google || !openEditLocations) return;

    // Inicializar mapa de origen
    if (editOriginCoords && originMapModalRef.current && !originModalMap) {
      setTimeout(() => {
        if (originMapModalRef.current && editOriginCoords) {
          initializeModalMap(originMapModalRef, editOriginCoords, 'Origen', true);
        }
      }, 200);
    }

    // Inicializar mapa de destino
    if (editDestinationCoords && destinationMapModalRef.current && !destinationModalMap) {
      setTimeout(() => {
        if (destinationMapModalRef.current && editDestinationCoords) {
          initializeModalMap(destinationMapModalRef, editDestinationCoords, 'Destino', false);
        }
      }, 200);
    }
  };

  //Eliminar viaje
  const handleDeleteTrip = async () => {
    if (!trip?.id || !user?.id) return;

    try {
      setDeletingTrip(true);
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;

      const response = await fetch(
        `${API_BASE_URL}/api/trips/${trip.id}/${userId}?userId=${userId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        toast.success('Viaje eliminado exitosamente');
        router.push('/dashboard'); // Redirigir al dashboard
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al eliminar el viaje');
      }
    } catch (error) {
      console.error('Error eliminando viaje:', error);
      toast.error('Error de conexión al eliminar el viaje');
    } finally {
      setDeletingTrip(false);
      setOpenDeleteDialog(false);
    }
  };

  // Inicializar mapas cuando cambien las coordenadas o se abra el modal
  useEffect(() => {
    if (openEditLocations) {
      initializeMapsInModal();
    }
  }, [openEditLocations, editOriginCoords, editDestinationCoords, isGoogleMapsLoaded, originModalMap, destinationModalMap]);

  // Actualizar marcadores cuando cambien las coordenadas (sin recrear el mapa)
  useEffect(() => {
    if (editOriginCoords && originModalMarker && originModalMap) {
      originModalMarker.setPosition(editOriginCoords);
      originModalMap.setCenter(editOriginCoords);
    }
  }, [editOriginCoords, originModalMarker, originModalMap]);

  useEffect(() => {
    if (editDestinationCoords && destinationModalMarker && destinationModalMap) {
      destinationModalMarker.setPosition(editDestinationCoords);
      destinationModalMap.setCenter(editDestinationCoords);
    }
  }, [editDestinationCoords, destinationModalMarker, destinationModalMap]);

  // Limpiar cuando se cierre el modal
  useEffect(() => {
    if (!openEditLocations) {
      setOriginModalMap(null);
      setDestinationModalMap(null);
      setOriginModalMarker(null);
      setDestinationModalMarker(null);
    }
  }, [openEditLocations]);


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
        setHasAttemptedLoad(true);

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
        setError(err instanceof Error ? err.message : 'Error al cargar los datos del viaje');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && tripId) {
      fetchTripData();
    }
  }, [user, isAuthenticated, tripId]);

  // Cargar fotos de perfil de participantes de forma asíncrona (después de cargar el trip)
  useEffect(() => {
    const loadParticipantPhotos = async () => {
      if (!participants || participants.length === 0) return;

      try {
        const participantsWithPhotos = await Promise.all(
          participants.map(async (participant) => {
            // Si ya tiene foto, no hacer nada
            if (participant.profilePicture) {
              return participant;
            }

            try {
              const photoResponse = await fetch(
                `${API_BASE_URL}/api/profile/${participant.id}/photo`,
                { headers: getAuthHeaders() }
              );

              if (photoResponse.ok) {
                const photoUrl = await photoResponse.text();
                return { ...participant, profilePicture: photoUrl };
              }
            } catch (photoErr) {
              console.error(`Error cargando foto de ${participant.name}:`, photoErr);
            }

            return participant;
          })
        );

        setParticipants(participantsWithPhotos);
      } catch (error) {
        console.error('Error cargando fotos de participantes:', error);
      }
    };

    // Esperar un poco para que el mapa se cargue primero
    const timer = setTimeout(() => {
      loadParticipantPhotos();
    }, 1000);

    return () => clearTimeout(timer);
  }, [participants.length]); // Solo cuando cambie el número de participantes

  // Cargar tips desde la base de datos cuando se carga el viaje
  useEffect(() => {
    if (trip?.id) {
      loadTipsFromDatabase().then(tipsFromDB => {
        if (tipsFromDB && tipsFromDB.length > 0) {
          console.log('📥 Cargando tips desde base de datos:', tipsFromDB);
          // Normalizar tips cargados: agregar place_id si existe en placeId
          const normalizedTips = tipsFromDB.map((tip: any) => ({
            ...tip,
            place_id: tip.placeId || tip.place_id, // Asegurar que place_id esté disponible
            location: tip.location || (tip.latitude && tip.longitude ? {
              lat: tip.latitude,
              lng: tip.longitude
            } : null)
          }));

          // Reemplazar todos los tips con los de la base de datos (evitar duplicados)
          setTips(prev => {
            // Si ya hay tips locales, solo agregar los que no existen
            const uniqueTips = filterDuplicateTips(prev, normalizedTips);
            if (uniqueTips.length > 0) {
              return [...prev, ...uniqueTips];
            }
            // Si no hay tips locales, usar los de la BD
            if (prev.length === 0) {
              return normalizedTips;
            }
            return prev;
          });

          // Agregar pins al mapa cuando el mapa esté disponible
          const addPinsWhenMapReady = () => {
            if (map) {
              console.log('🗺️ Mapa disponible, agregando pins de tips');
              setTips(prev => {
                const uniqueTips = filterDuplicateTips(prev, normalizedTips);
                if (uniqueTips.length > 0) {
                  addTipPinsToMap(uniqueTips);
                }
                return prev;
              });
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
  }, [isGoogleMapsLoaded, trip?.originLatitude, trip?.originLongitude, trip?.destinationLatitude, trip?.destinationLongitude]);

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

  // 🛒 Eliminar compra
  const handleDeletePurchase = async (purchaseId: string) => {
    if (!trip?.id) return;

    try {
      const response = await api.deletePurchase(trip.id.toString(), purchaseId);

      if (response.ok) {
        toast.success('Compra eliminada exitosamente');
        // Recargar compras
        const userId = typeof user?.id === 'string' ? parseInt(user.id, 10) : user?.id || 0;
        loadPurchases(trip.id.toString(), userId);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al eliminar compra');
      }
    } catch (error) {
      console.error('Error eliminando compra:', error);
      toast.error('Error de conexión');
    }
  };

  // 📅 Actualizar fechas del viaje
  const handleUpdateTripDates = async () => {
    if (!trip?.id || !user?.id || !editDateI || !editDateF) {
      toast.error('Por favor, completa ambas fechas');
      return;
    }

    // Validar que las fechas no sean anteriores a hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateI = new Date(editDateI);
    const dateF = new Date(editDateF);

    if (dateI < today) {
      toast.error('La fecha de inicio no puede ser anterior a hoy');
      return;
    }

    if (dateF < dateI) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      const response = await api.updateTripDates(trip.id.toString(), userId, {
        dateI: editDateI,
        dateF: editDateF
      });

      if (response.ok) {
        const result = await response.json();
        // Actualizar el estado local del trip
        setTrip(prev => prev ? {
          ...prev,
          dateI: editDateI,
          dateF: editDateF,
          status: result.data?.status || prev.status
        } : null);
        setOpenEditDates(false);
        toast.success('Fechas actualizadas exitosamente');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al actualizar fechas');
      }
    } catch (error) {
      console.error('Error actualizando fechas:', error);
      toast.error('Error de conexión');
    }
  };

  // 📍 Actualizar origen y destino del viaje
  const handleUpdateTripLocations = async () => {
    if (!trip?.id || !user?.id || !editOrigin || !editDestination) {
      toast.error('Por favor, completa origen y destino');
      return;
    }

    // Validar que se hayan seleccionado ubicaciones con coordenadas
    if (!editOriginCoords || !editDestinationCoords) {
      toast.error('Por favor, selecciona ubicaciones válidas de la lista de sugerencias');
      return;
    }

    try {
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;

      // Preparar datos de ubicación usando las coordenadas ya obtenidas del autocompletado
      const locationsData: any = {
        origin: editOrigin,
        destination: editDestination,
        vehicle: editVehicle,
        originCoords: editOriginCoords,
        destinationCoords: editDestinationCoords,
        originAddress: editOrigin,
        destinationAddress: editDestination
      };

      const response = await api.updateTripLocations(trip.id.toString(), userId, locationsData);

      if (response.ok) {
        const result = await response.json();
        // Recargar los detalles del viaje para obtener los datos actualizados
        const tripResponse = await api.getTripDetails(trip.id.toString(), userId);
        if (tripResponse.ok) {
          const updatedTrip = await tripResponse.json();
          setTrip(updatedTrip);

          // Actualizar el mapa si hay coordenadas del destino
          // El useEffect que escucha cambios en las coordenadas del trip se encargará de recalcular la ruta
          if (editDestinationCoords && map) {
            // Centrar el mapa en el nuevo destino
            map.setCenter(editDestinationCoords);
            map.setZoom(10);
          }

          // Recalcular la ruta después de actualizar el trip
          if (updatedTrip.originLatitude && updatedTrip.originLongitude &&
            updatedTrip.destinationLatitude && updatedTrip.destinationLongitude) {
            setTimeout(() => {
              calculateRoute();
            }, 500);
          }

          // Limpiar estados del modal
          setEditOriginCoords(null);
          setEditDestinationCoords(null);
        }
        setOpenEditLocations(false);
        toast.success('Origen y destino actualizados exitosamente');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al actualizar ubicaciones');
      }
    } catch (error) {
      console.error('Error actualizando ubicaciones:', error);
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
        `${API_BASE_URL}/api/trips/${trip?.id}/users/${participantId}/${user?.id}`,
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

  const calculateRoute = async () => {
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

    if (trip.vehicle === 'avion') {
      await calculateFlightRoute(origin, destination);
      return;
    }
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

  // Calcular ruta de vuelo con aeropuertos
  const calculateFlightRoute = async (origin: { lat: number, lng: number }, destination: { lat: number, lng: number }) => {
    if (!map) return;

    console.log('🛫 Calculando ruta de vuelo con aeropuertos...');

    try {
      // Buscar aeropuerto más cercano al origen
      const originAirport = await findNearestAirport(origin);
      // Buscar aeropuerto más cercano al destino
      const destinationAirport = await findNearestAirport(destination);

      if (!originAirport || !destinationAirport) {
        console.error('No se encontraron aeropuertos cercanos');
        toast.error('No se encontraron aeropuertos cercanos. Mostrando ruta directa.');
        showRouteFallback(origin, destination);
        return;
      }

      console.log('🛫 Aeropuerto origen:', originAirport.name);
      console.log('🛬 Aeropuerto destino:', destinationAirport.name);

      // 1. Ruta en auto desde ubicación actual hasta aeropuerto origen
      const toAirportRequest = {
        origin: origin,
        destination: originAirport.location,
        travelMode: window.google.maps.TravelMode.DRIVING
      };

      directionsService.route(toAirportRequest, (result1: any, status1: any) => {
        if (status1 === window.google.maps.DirectionsStatus.OK) {
          // Dibujar ruta al aeropuerto origen (verde)
          const toAirportRenderer = new window.google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#4CAF50',
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          });
          toAirportRenderer.setDirections(result1);

          // 2. Vuelo (línea curva geodésica) entre aeropuertos
          const flightPath = new window.google.maps.Polyline({
            path: [originAirport.location, destinationAirport.location],
            geodesic: true, // Curvatura de la Tierra
            strokeColor: '#2196F3',
            strokeOpacity: 0.8,
            strokeWeight: 5,
            icons: [{
              icon: {
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 4,
                strokeColor: '#2196F3',
                strokeWeight: 2,
                fillColor: '#2196F3',
                fillOpacity: 1
              },
              offset: '50%'
            }, {
              icon: {
                path: 'M 0,-2 L -2,2 L 0,1 L 2,2 Z', // Forma de avión simplificada
                scale: 3,
                strokeColor: '#1976D2',
                strokeWeight: 1,
                fillColor: '#FFFFFF',
                fillOpacity: 1,
                rotation: 0
              },
              offset: '25%',
              repeat: '25%'
            }
            ],
            map: map
          });
          // Agregar efecto de sombra con una segunda línea
          const flightPathShadow = new window.google.maps.Polyline({
            path: [originAirport.location, destinationAirport.location],
            geodesic: true,
            strokeColor: '#000000',
            strokeOpacity: 0.3,
            strokeWeight: 7,
            map: map,
            zIndex: 1
          });

          // Línea principal encima de la sombra
          flightPath.setOptions({ zIndex: 2 });

          // 3. Ruta desde aeropuerto destino hasta destino final
          const fromAirportRequest = {
            origin: destinationAirport.location,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING
          };

          directionsService.route(fromAirportRequest, (result2: any, status2: any) => {
            if (status2 === window.google.maps.DirectionsStatus.OK) {
              // Dibujar ruta desde aeropuerto destino (naranja)
              const fromAirportRenderer = new window.google.maps.DirectionsRenderer({
                map: map,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#FF9800',
                  strokeWeight: 4,
                  strokeOpacity: 0.8
                }
              });
              fromAirportRenderer.setDirections(result2);

              // Calcular distancias y tiempos totales
              const distance1 = result1.routes[0].legs[0].distance.value;
              const duration1 = result1.routes[0].legs[0].duration.value;
              const flightDistance = calculateDistance(
                originAirport.location.lat,
                originAirport.location.lng,
                destinationAirport.location.lat,
                destinationAirport.location.lng
              ) * 1000; // convertir a metros
              const flightDuration = (flightDistance / 1000) / 800 * 3600; // 800 km/h promedio
              const distance2 = result2.routes[0].legs[0].distance.value;
              const duration2 = result2.routes[0].legs[0].duration.value;

              const totalDistance = distance1 + flightDistance + distance2;
              const totalDuration = duration1 + flightDuration + duration2;

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

              // Marcadores personalizados
              new window.google.maps.Marker({
                position: origin,
                map: map,
                title: 'Punto de partida',
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }
              });

              new window.google.maps.Marker({
                position: originAirport.location,
                map: map,
                title: `✈️ ${originAirport.name}`,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new window.google.maps.Size(35, 35)
                },
                label: {
                  text: '✈️',
                  fontSize: '20px'
                }
              });

              new window.google.maps.Marker({
                position: destinationAirport.location,
                map: map,
                title: `✈️ ${destinationAirport.name}`,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new window.google.maps.Size(35, 35)
                },
                label: {
                  text: '✈️',
                  fontSize: '20px'
                }
              });

              new window.google.maps.Marker({
                position: destination,
                map: map,
                title: 'Destino final',
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }
              });

              if (currentLocation) {
                map.setCenter(currentLocation);
                map.setZoom(10); // Zoom medio para ver la ruta al aeropuerto

                console.log('📍 Mapa centrado en ubicación actual:', currentLocation);
              } else {
                // Fallback: si no hay ubicación actual, ajustar a toda la ruta
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(origin);
                bounds.extend(originAirport.location);
                bounds.extend(destinationAirport.location);
                bounds.extend(destination);
                map.fitBounds(bounds);
              }

              console.log(`🛫 Ruta de vuelo: ${distanceKm} km, ${durationText}`);
              toast.success(`🛫 Ruta calculada: ${originAirport.name} → ${destinationAirport.name}`);
            }
          });
        }
      });

    } catch (error) {
      console.error('Error calculando ruta de vuelo:', error);
      toast.error('Error al calcular ruta de vuelo');
      showRouteFallback(origin, destination);
    }
  };

  // Buscar aeropuerto más cercano (solo aeropuertos reales, no aeroclubs)
  const findNearestAirport = async (
    location: { lat: number, lng: number }
  ): Promise<{ name: string, location: { lat: number, lng: number } } | null> => {
    return new Promise((resolve) => {
      if (!map) {
        resolve(null);
        return;
      }

      const placesService = new window.google.maps.places.PlacesService(map);

      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: 100000, // 100km
        keyword: 'aeropuerto airport international intl terminal aeropuertos',
        type: 'airport'
      };

      placesService.nearbySearch(request, (results: any[], status: any) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results.length) {
          console.log('❌ No se encontraron aeropuertos cercanos');
          resolve(null);
          return;
        }

        console.log(`🛫 Encontrados ${results.length} posibles aeropuertos`);

        // ❌ Palabras a excluir (aeroclubs, escuelas, etc.)
        const bannedWords = [
          "aeroclub",
          "club",
          "hangar",
          "escuela",
          "flight",
          "vuelo",
          "private",
          "helicopter",
          "heli",
          "ultraliviano",
          "airfield",
          "airstrip"
        ];

        // ✔️ Palabras válidas para aeropuertos reales
        const requiredWords = [
          "aeropuerto",
          "airport",
          "aeroporto",
          "international",
          "internacional",
          "terminal"
        ];

        const filterAirports = results.filter((place) => {
          const name = place.name?.toLowerCase() || "";

          // ❌ Excluir aeroclubs por nombre
          if (bannedWords.some(b => name.includes(b))) return false;

          // ✔️ Debe contener palabras válidas
          if (!requiredWords.some(w => name.includes(w))) return false;

          // ✔️ Asegurar que sea realmente un aeropuerto
          if (!place.types?.includes("airport")) return false;

          // ✔️ Evitar aeródromos pequeños sin geometría válida
          if (!place.geometry?.location) return false;

          return true;
        });

        const airports = filterAirports.length ? filterAirports : results;

        if (!airports.length) {
          console.log("❌ Todos eran aeroclubs u otros lugares no válidos");
          resolve(null);
          return;
        }

        // Ordenar por distancia
        const sorted = airports.sort((a, b) => {
          const distA = calculateDistance(
            location.lat, location.lng,
            a.geometry.location.lat(), a.geometry.location.lng()
          );
          const distB = calculateDistance(
            location.lat, location.lng,
            b.geometry.location.lat(), b.geometry.location.lng()
          );
          return distA - distB;
        });

        const nearestAirport = sorted[0];

        resolve({
          name: nearestAirport.name,
          location: {
            lat: nearestAirport.geometry.location.lat(),
            lng: nearestAirport.geometry.location.lng()
          }
        });
      });
    });
  };


  // Función fallback para mostrar ruta sin Directions API
  const showRouteFallback = (origin: { lat: number, lng: number }, destination: { lat: number, lng: number }) => {
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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  const startNavigation = (mode?: 'to-origin' | 'to-destination') => {
    if (!trip || !directionsService || !directionsRenderer) {
      toast.error('No se puede iniciar la navegación. Verifica tu conexión.');
      return;
    }

    if (mode) {
      setNavigationMode(mode);
    }

    // Si no hay ubicación actual, obtenerla primero
    if (!currentLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(location);
            // Iniciar navegación después de obtener la ubicación
            startNavigationWithLocation(location, mode);
          },
          (error) => {
            console.error('Error obteniendo ubicación:', error);
            toast.error('No se pudo obtener tu ubicación. Verifica los permisos de geolocalización.');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        toast.error('Tu navegador no soporta geolocalización.');
      }
      return;
    }

    // Si ya tenemos ubicación, iniciar navegación directamente
    startNavigationWithLocation(currentLocation, mode);
  };

  // Función auxiliar para iniciar navegación con ubicación
  const startNavigationWithLocation = (location: { lat: number, lng: number }, mode?: 'to-origin' | 'to-destination') => {
    if (!trip || !location || !directionsService || !directionsRenderer || !map) {
      return;
    }

    setIsNavigating(true);
    setCurrentStep(0);

    const currentMode = mode || navigationMode;

    // Para navegación, usar ubicación actual como origen
    const origin = location;
    let destination: { lat: number, lng: number };
    let destinationName: string;

    if (currentMode === 'to-origin' && trip.originLatitude && trip.originLongitude) {
      // Navegación hacia el origen
      destination = {
        lat: trip.originLatitude,
        lng: trip.originLongitude
      };
      destinationName = trip.origin || 'Origen del viaje';
      console.log('🚗 Iniciando navegación al ORIGEN:', destination);
    } else {
      // Navegación hacia el destino final
      destination = {
        lat: trip.destinationLatitude!,
        lng: trip.destinationLongitude!
      };
      destinationName = trip.destination;
      console.log('🚗 Iniciando navegación al DESTINO:', destination);
    }

    // Si es avión, usar ruta de vuelo
    if (trip.vehicle === 'avion') {
      startFlightNavigation(origin, destination);
      return;
    }

    directionsRenderer.setDirections({ routes: [] });
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
            strokeColor: navigationMode === 'to-origin' ? '#4CAF50' : '#1976d2',
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
          const firstInstruction = navigationMode === 'to-origin'
            ? `Dirigiéndote al origen: ${destinationName}`
            : steps[0].instructions.replace(/<[^>]*>/g, '');
          setNextInstruction(firstInstruction);
          updateNavigationMetrics(steps, 0);
        }

        // Inicializar chat con mensaje de bienvenida
        initializeChat();

        // Ajustar vista para navegación con zoom cercano a la ubicación actual
        if (location && map) {
          // Hacer zoom inmediato a la ubicación actual
          const zoomLevel = trip?.vehicle === 'auto' ? 16 : 18;

          // Aplicar zoom inmediatamente
          map.setCenter(location);
          map.setZoom(zoomLevel);
          setMapZoom(zoomLevel);

          // Asegurar que el zoom se mantenga con múltiples intentos
          setTimeout(() => {
            if (map && location) {
              map.setCenter(location);
              map.setZoom(zoomLevel);
              console.log('📍 Zoom aplicado (intento 1):', location, 'zoom:', zoomLevel);
            }
          }, 100);

          setTimeout(() => {
            if (map && location) {
              map.setCenter(location);
              map.setZoom(zoomLevel);
              console.log('📍 Zoom aplicado (intento 2):', location, 'zoom:', zoomLevel);
            }
          }, 500);

          setTimeout(() => {
            if (map && location) {
              map.setCenter(location);
              map.setZoom(zoomLevel);
              console.log('📍 Zoom aplicado (intento 3):', location, 'zoom:', zoomLevel);
            }
          }, 1000);

          console.log('📍 Zoom inicial aplicado a ubicación actual:', location, 'zoom:', zoomLevel);
        } else {
          console.log('⚠️ No hay ubicación actual o mapa, usando fallback');
          // Fallback: ajustar vista a la ruta completa
          if (map) {
            const bounds = new window.google.maps.LatLngBounds();
            route.legs.forEach((leg: any) => {
              bounds.extend(leg.start_location);
              bounds.extend(leg.end_location);
            });
            map.fitBounds(bounds);
          }
        }

        toast.success('🚗 Navegación iniciada. ¡Buen viaje!');

      } else {
        console.error('❌ Error calculando ruta de navegación:', status);
        toast.error('Error al calcular la ruta de navegación');
        setIsNavigating(false);
      }
    });
  };

  // Iniciar navegación en modo vuelo
  const startFlightNavigation = async (location: { lat: number, lng: number }, destination: { lat: number, lng: number }) => {
    if (!map) return;

    console.log('🛫 Iniciando navegación en modo vuelo...');
    console.log('📍 Ubicación recibida:', location);

    try {
      // Buscar aeropuertos
      const originAirport = await findNearestAirport(location);
      const destinationAirport = await findNearestAirport(destination);

      if (!originAirport || !destinationAirport) {
        console.error('No se encontraron aeropuertos cercanos');
        toast.error('No se encontraron aeropuertos cercanos.');
        setIsNavigating(false);
        return;
      }

      // Calcular ruta visual con aeropuertos
      await calculateFlightRoute(location, destination);

      // Para navegación GPS, solo usamos la primera etapa (al aeropuerto origen)
      const toAirportRequest = {
        origin: location, // Usar la ubicación pasada como parámetro
        destination: originAirport.location,
        travelMode: window.google.maps.TravelMode.DRIVING
      };

      directionsService.route(toAirportRequest, (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const route = result.routes[0];
          const steps = route.legs[0].steps;
          setNavigationSteps(steps);

          // Calcular métricas
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

          // Iniciar seguimiento
          startLocationTracking();
          setIsFollowingVehicle(true);

          // Configurar primera instrucción
          if (steps.length > 0) {
            setNextInstruction(`🚗 Dirigiéndote al aeropuerto: ${originAirport.name}`);
            updateNavigationMetrics(steps, 0);
          }

          // Inicializar chat
          initializeChat();

          // CENTRAR EN LA UBICACIÓN ACTUAL CON MÚLTIPLES INTENTOS
          const zoomLevel = 14;

          // Aplicar zoom inmediatamente
          map.setCenter(location);
          map.setZoom(zoomLevel);
          setMapZoom(zoomLevel);

          // Múltiples intentos para asegurar el centrado
          setTimeout(() => {
            if (map && location) {
              map.setCenter(location);
              map.setZoom(zoomLevel);
              console.log('📍 Zoom aplicado (intento 1) en ubicación actual:', location, 'zoom:', zoomLevel);
            }
          }, 100);

          setTimeout(() => {
            if (map && location) {
              map.setCenter(location);
              map.setZoom(zoomLevel);
              console.log('📍 Zoom aplicado (intento 2) en ubicación actual:', location, 'zoom:', zoomLevel);
            }
          }, 500);

          setTimeout(() => {
            if (map && location) {
              map.setCenter(location);
              map.setZoom(zoomLevel);
              console.log('📍 Zoom aplicado (intento 3) en ubicación actual:', location, 'zoom:', zoomLevel);
            }
          }, 1000);

          console.log('📍 Mapa centrado en tu ubicación actual:', location);

          toast.success(`🛫 Navegación iniciada hacia ${originAirport.name}`);
          console.log('✅ Navegación en modo vuelo iniciada');

        } else {
          console.error('❌ Error calculando ruta al aeropuerto:', status);
          toast.error('Error al calcular la ruta al aeropuerto');
          setIsNavigating(false);
        }
      });

    } catch (error) {
      console.error('Error en navegación de vuelo:', error);
      toast.error('Error al iniciar navegación de vuelo');
      setIsNavigating(false);
    }
  };

  // Función para navegación simple (fallback)
  const startSimpleNavigation = (origin: { lat: number, lng: number }, destination: { lat: number, lng: number }) => {
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
    setNavigationMode(null);

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
              anchor: new window.google.maps.Point(iconSize / 2, iconSize / 2)
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
  const updateNavigationProgress = (userLocation: { lat: number, lng: number }) => {
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
  const getAIRecommendations = async (location: { lat: number, lng: number } | null, distanceTraveled: number) => {
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

  // Función para llamar a Gemini AI (para recomendaciones inteligentes)
  const callGeminiAI = async (nearbyPlaces: any[], distanceTraveled: number, tripData: any) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('⚠️ Gemini API key no configurada, usando recomendaciones por defecto');
        // Fallback a recomendaciones básicas
        return {
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
              description: "Hay una gasolinera cercana con buenos precios y servicios.",
              type: "gas_station",
              priority: "medium",
              estimated_time: "15"
            }
          ]
        };
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
        
IMPORTANTE: Responde ÚNICAMENTE con un JSON válido, sin texto adicional antes o después. El formato debe ser:
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Intentar parsear la respuesta JSON (puede venir con markdown code blocks)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').trim();
      }

      try {
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse;
      } catch (parseError) {
        console.error('Error parseando respuesta de Gemini:', parseError, 'Respuesta:', text);
        // Fallback a recomendaciones por defecto
        return {
          recommendations: [
            {
              title: "Parada para descansar",
              description: "Te recomendamos hacer una parada para estirar las piernas y tomar algo.",
              type: "activity",
              priority: "high",
              estimated_time: "30"
            }
          ]
        };
      }

    } catch (error) {
      console.error('Error llamando a Gemini AI:', error);
      // Fallback a recomendaciones básicas
      return {
        recommendations: [
          {
            title: "Parada para descansar",
            description: "Te recomendamos hacer una parada para estirar las piernas.",
            type: "activity",
            priority: "medium",
            estimated_time: "20"
          }
        ]
      };
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

  // Función para generar respuesta de IA usando Gemini como cerebro principal
  const generateAIResponse = async (userInput: string): Promise<string> => {
    const lowerInput = userInput.toLowerCase();

    try {
      // Primero, usar Gemini para entender la intención del usuario
      const geminiResponse = await generateGeminiResponse(userInput);

      // Detectar si el usuario quiere buscar lugares en el DESTINO (no en ubicación actual)
      const wantsDestinationLocation: boolean = !!(
        lowerInput.includes('en mi destino') ||
        lowerInput.includes('en el destino') ||
        lowerInput.includes('destino') ||
        lowerInput.includes('buenos aires') ||
        (lowerInput.includes('en') && lowerInput.includes('destino')) ||
        (trip?.destination && lowerInput.includes(trip.destination.toLowerCase()))
      );

      // Detectar si el usuario quiere buscar lugares (después de que Gemini responda)
      // Esto permite que Gemini responda primero, y luego buscamos lugares si es necesario
      const isPlaceSearchQuery =
        lowerInput.includes('mejor lugar para comer') ||
        lowerInput.includes('mejor restaurante') ||
        lowerInput.includes('mejor lugar para dormir') ||
        lowerInput.includes('mejor hotel') ||
        lowerInput.includes('mejores departamentos') ||
        lowerInput.includes('mejores lugares para visitar') ||
        lowerInput.includes('mejores atracciones') ||
        lowerInput.includes('comer') ||
        lowerInput.includes('restaurante') ||
        lowerInput.includes('comida') ||
        lowerInput.includes('dormir') ||
        lowerInput.includes('hotel') ||
        lowerInput.includes('alojamiento') ||
        lowerInput.includes('departamento') ||
        lowerInput.includes('departamentos') ||
        lowerInput.includes('atracción') ||
        lowerInput.includes('turístico') ||
        lowerInput.includes('visitar') ||
        lowerInput.includes('gasolinera') ||
        lowerInput.includes('combustible') ||
        lowerInput.includes('gas') ||
        lowerInput.includes('nafta') ||
        lowerInput.includes('cargar') ||
        lowerInput.includes('lugares') ||
        lowerInput.includes('nuevos lugares') ||
        lowerInput.includes('otros lugares');

      // Si es una consulta de búsqueda de lugares, buscar lugares en paralelo
      if (isPlaceSearchQuery) {
        let searchResponse = '';
        const useDestination: boolean = !!(wantsDestinationLocation && trip?.destinationLatitude && trip?.destinationLongitude);

        // Buscar lugares según el tipo de consulta, pasando si debe usar destino o ubicación actual
        if (lowerInput.includes('mejor lugar para comer') || lowerInput.includes('mejor restaurante')) {
          searchResponse = await handleBestRestaurantQuery(useDestination);
        } else if (lowerInput.includes('mejor lugar para dormir') || lowerInput.includes('mejor hotel') || lowerInput.includes('mejores departamentos')) {
          searchResponse = await handleBestAccommodationQuery(useDestination);
        } else if (lowerInput.includes('mejores lugares para visitar') || lowerInput.includes('mejores atracciones')) {
          searchResponse = await handleBestAttractionsQuery(useDestination);
        } else if (lowerInput.includes('comer') || lowerInput.includes('restaurante') || lowerInput.includes('comida')) {
          searchResponse = await handleRestaurantQuery(useDestination);
        } else if (lowerInput.includes('dormir') || lowerInput.includes('hotel') || lowerInput.includes('alojamiento') || lowerInput.includes('departamento') || lowerInput.includes('departamentos')) {
          searchResponse = await handleAccommodationQuery(useDestination);
        } else if (lowerInput.includes('atracción') || lowerInput.includes('turístico') || lowerInput.includes('visitar')) {
          searchResponse = await handleAttractionQuery(useDestination);
        } else if (lowerInput.includes('gasolinera') || lowerInput.includes('combustible') || lowerInput.includes('gas') || lowerInput.includes('nafta') || lowerInput.includes('cargar')) {
          searchResponse = await handleGasStationQuery(useDestination);
        } else if (lowerInput.includes('tráfico') || lowerInput.includes('ruta') || lowerInput.includes('dirección')) {
          searchResponse = await handleTrafficQuery();
        }

        // Combinar respuesta de Gemini con la búsqueda de lugares
        if (searchResponse) {
          return `${geminiResponse}\n\n${searchResponse}`;
        }
      }

      // Retornar respuesta de Gemini (puede ser conversacional o incluir búsqueda de lugares)
      return geminiResponse;
    } catch (error) {
      console.error('Error generando respuesta de IA:', error);
      // Fallback: intentar búsqueda directa si Gemini falla
      const lowerInput = userInput.toLowerCase();
      if (lowerInput.includes('comer') || lowerInput.includes('restaurante')) {
        return await handleRestaurantQuery();
      } else if (lowerInput.includes('dormir') || lowerInput.includes('hotel')) {
        return await handleAccommodationQuery();
      }
      return await handleGeneralQuery();
    }
  };

  // Función para generar respuesta usando Gemini AI real
  const generateGeminiResponse = async (userInput: string): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('⚠️ Gemini API key no configurada, usando respuesta genérica');
        toast.warning('Gemini API key no configurada. Configura NEXT_PUBLIC_GEMINI_API_KEY en .env.local');
        return await handleGeneralQuery();
      }

      console.log('🤖 Llamando a Gemini AI real...');
      const genAI = new GoogleGenerativeAI(apiKey);
      // Usar gemini-2.5-flash según la documentación oficial de Google
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Construir contexto del viaje para Gemini
      const tripContext = trip ? `
        Información del viaje:
        - Destino: ${trip.destination}
        - Origen: ${trip.origin || 'No especificado'}
        - Fechas: ${trip.dateI ? new Date(trip.dateI).toLocaleDateString() : 'No especificadas'} - ${trip.dateF ? new Date(trip.dateF).toLocaleDateString() : 'No especificadas'}
        - Vehículo: ${trip.vehicle === 'auto' ? 'En auto' : trip.vehicle === 'avion' ? 'En avión' : trip.vehicle === 'caminando' ? 'Caminando' : 'En auto'}
        - Presupuesto: ${trip.cost ? `$${trip.cost.toLocaleString()}` : 'No especificado'}
      ` : '';

      const locationContext = currentLocation
        ? `El usuario está ubicado en: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
        : 'No tengo acceso a la ubicación actual del usuario';

      const tipsContext = tips.length > 0
        ? `Lugares ya guardados en el viaje:\n${tips.slice(0, 10).map(t => `- ${t.name} (${t.tipType})`).join('\n')}`
        : 'Aún no hay lugares guardados en este viaje';

      const prompt = `Eres un asistente de viajes inteligente y amigable llamado Gemini. Estás ayudando a un usuario durante su viaje.

${tripContext}

${locationContext}

${tipsContext}

Instrucciones importantes:
- Responde de manera natural, conversacional y útil
- Si el usuario pregunta sobre lugares para comer, restaurantes, dormir, hoteles, atracciones o gasolineras, sé breve y amigable. El sistema buscará automáticamente lugares cercanos después de tu respuesta
- Para otras consultas (clima, recomendaciones generales, información sobre el destino, etc.), proporciona respuestas completas y útiles
- Usa emojis cuando sea apropiado para hacer la conversación más amigable
- Sé específico sobre el viaje del usuario cuando sea relevante
- Si no tienes información precisa, sé honesto pero ofrece ayuda en otras áreas
- Mantén un tono profesional pero amigable

Pregunta del usuario: "${userInput}"

Responde de manera natural, útil y conversacional (2-5 frases):`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text) {
        console.log('✅ Gemini AI respondió exitosamente:', text.substring(0, 100) + '...');
        return text;
      } else {
        console.warn('⚠️ Gemini no devolvió texto, usando fallback');
        return await handleGeneralQuery();
      }
    } catch (error) {
      console.error('❌ Error llamando a Gemini:', error);
      toast.error('Error al conectar con Gemini. Verifica tu API key y conexión.');
      // Fallback a respuesta genérica si hay error
      return await handleGeneralQuery();
    }
  };

  // Función para manejar consultas de restaurantes
  const handleRestaurantQuery = async (useDestination: boolean = false) => {
    // Determinar qué ubicación usar: destino del viaje o ubicación actual
    let searchLocation: { lat: number, lng: number } | null = null;

    if (useDestination && trip?.destinationLatitude && trip?.destinationLongitude) {
      searchLocation = {
        lat: trip.destinationLatitude,
        lng: trip.destinationLongitude
      };
      console.log('🍽️ Buscando restaurantes en el DESTINO:', trip.destination, searchLocation);
    } else if (currentLocation) {
      searchLocation = currentLocation;
      console.log('🍽️ Buscando restaurantes en ubicación ACTUAL:', searchLocation);
    } else {
      return "No puedo obtener tu ubicación para recomendarte restaurantes. Activa la ubicación o especifica el destino del viaje.";
    }

    try {
      // Obtener TODOS los place_ids de restaurantes existentes (de estado local Y base de datos)
      const loadAllExistingRestaurantIds = async () => {
        // Primero obtener de la BD para asegurarnos de tener todos
        const tipsFromDB = await loadTipsFromDatabase();
        const allRestaurantTips = [
          ...tips.filter(tip => tip.tipType === 'restaurant'),
          ...(tipsFromDB || []).filter((tip: any) => tip.tipType === 'restaurant')
        ];

        // Obtener place_ids únicos
        const placeIds = new Set<string>();
        const nameLocationKeys = new Set<string>();

        allRestaurantTips.forEach(tip => {
          const placeId = tip.place_id || tip.placeId;
          if (placeId) {
            placeIds.add(String(placeId).trim());
          }

          // También crear clave nombre+ubicación como respaldo
          const lat = tip.latitude || tip.location?.lat;
          const lng = tip.longitude || tip.location?.lng;
          if (tip.name && lat != null && lng != null) {
            nameLocationKeys.add(`${tip.name.toLowerCase().trim()}_${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}`);
          }
        });

        console.log(`🍽️ Encontrados ${placeIds.size} place_ids únicos y ${nameLocationKeys.size} nombres+ubicaciones únicos de restaurantes existentes`);

        return { placeIds: Array.from(placeIds), nameLocationKeys: Array.from(nameLocationKeys) };
      };

      const { placeIds, nameLocationKeys } = await loadAllExistingRestaurantIds();

      console.log(`🍽️ Buscando restaurantes, excluyendo ${placeIds.length} ya existentes`);

      // Buscar lugares de forma asíncrona sin bloquear la respuesta
      findNearbyPlaces('restaurant', {
        maxResults: 5, // Limitar a 5 resultados finales
        maxRadius: 20,
        sortBy: 'rating',
        minRating: 4.0,
        includePrice: true,
        excludePlaceIds: placeIds, // Excluir los que ya están
        excludeNameLocations: nameLocationKeys, // También excluir por nombre+ubicación
        location: searchLocation // Pasar la ubicación (destino o actual)
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

          // Primero filtrar duplicados
          setTips(prev => {
            const uniqueNewTips = filterDuplicateTips(prev, newTips);
            if (uniqueNewTips.length === 0) {
              console.log('⚠️ Todos los restaurantes ya están en tips');
              return prev;
            }

            // Agregar tips al estado primero (sin IDs de BD aún)
            const updated = [...prev, ...uniqueNewTips];

            // Guardar tips en BD de forma asíncrona (sin bloquear la actualización del estado)
            const tipsToSave = uniqueNewTips.filter(tip => !tip.id || typeof tip.id !== 'number');
            if (tipsToSave.length > 0) {
              Promise.all(tipsToSave.map(tip => saveTipToDatabase(tip))).then(savedTips => {
                // Actualizar el estado con los IDs de BD
                setTips(prevState => {
                  const updatedState = prevState.map(tip => {
                    const savedTip = savedTips.find(st =>
                      st && (st.placeId || st.place_id) === (tip.place_id || tip.placeId)
                    );
                    if (savedTip && savedTip.id && (!tip.id || typeof tip.id !== 'number')) {
                      return { ...tip, id: savedTip.id };
                    }
                    return tip;
                  });
                  return updatedState;
                });
              });
            }

            console.log('📝 Tips actualizados:', updated);

            // Agregar pins al mapa con delay para asegurar que el mapa esté listo
            if (uniqueNewTips.length > 0) {
              setTimeout(() => {
                addTipPinsToMap(uniqueNewTips);
              }, 500);
            }

            return updated;
          });
        } else {
          console.log('❌ No se encontraron restaurantes');
        }
      }).catch(error => {
        console.error('❌ Error buscando restaurantes:', error);
        // Mostrar mensaje de error al usuario
        toast.error('Error buscando restaurantes. Intenta de nuevo.');
      });

      const existingCount = placeIds.length;
      if (existingCount > 0) {
        return `🍽️ **Buscando otros restaurantes cerca de ti...**\n\nYa tienes ${existingCount} ${existingCount === 1 ? 'restaurante' : 'restaurantes'} en tu lista. Estoy buscando nuevos lugares diferentes para darte más opciones.\n\n💡 **Tip:** Te mostraré restaurantes que aún no están en tu lista.`;
      }
      return `🍽️ **Buscando restaurantes cerca de ti...**\n\nEstoy buscando los mejores restaurantes en tu zona. Te mostraré opciones con calificaciones y precios para que puedas elegir dónde comer.\n\n💡 **Tip:** Puedes preguntarme por otros tipos de lugares como hoteles, atracciones o gasolineras.`;
    } catch (error) {
      return "Hubo un problema buscando restaurantes. Intenta de nuevo en un momento.";
    }
  };

  // Función para manejar consultas de alojamiento
  const handleAccommodationQuery = async (useDestination: boolean = false) => {
    // Determinar qué ubicación usar: destino del viaje o ubicación actual
    let searchLocation: { lat: number, lng: number } | null = null;

    if (useDestination && trip?.destinationLatitude && trip?.destinationLongitude) {
      searchLocation = {
        lat: trip.destinationLatitude,
        lng: trip.destinationLongitude
      };
    } else if (currentLocation) {
      searchLocation = currentLocation;
    } else {
      return "No puedo obtener tu ubicación para recomendarte alojamiento. Activa la ubicación o especifica el destino del viaje.";
    }

    try {
      // Buscar lugares de forma asíncrona sin bloquear la respuesta
      findNearbyPlaces('lodging', {
        maxResults: 5,
        maxRadius: 20,
        sortBy: 'rating',
        minRating: 3.0,
        includePrice: true,
        location: searchLocation
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
          setTips(prev => {
            const uniqueNewTips = filterDuplicateTips(prev, newTips);
            if (uniqueNewTips.length === 0) {
              console.log('⚠️ Todos los alojamientos ya están en tips');
              return prev;
            }
            if (uniqueNewTips.length > 0) {
              addTipPinsToMap(uniqueNewTips);
            }
            return [...prev, ...uniqueNewTips];
          });
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
  const handleAttractionQuery = async (useDestination: boolean = false) => {
    // Determinar qué ubicación usar: destino del viaje o ubicación actual
    let searchLocation: { lat: number, lng: number } | null = null;

    if (useDestination && trip?.destinationLatitude && trip?.destinationLongitude) {
      searchLocation = {
        lat: trip.destinationLatitude,
        lng: trip.destinationLongitude
      };
    } else if (currentLocation) {
      searchLocation = currentLocation;
    } else {
      return "No puedo obtener tu ubicación para recomendarte atracciones. Activa la ubicación o especifica el destino del viaje.";
    }

    try {
      // Buscar lugares de forma asíncrona sin bloquear la respuesta
      findNearbyPlaces('tourist_attraction', {
        location: searchLocation
      }).then(places => {
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
          setTips(prev => {
            const uniqueNewTips = filterDuplicateTips(prev, newTips);
            if (uniqueNewTips.length === 0) {
              console.log('⚠️ Todas las atracciones ya están en tips');
              return prev;
            }
            if (uniqueNewTips.length > 0) {
              addTipPinsToMap(uniqueNewTips);
            }
            return [...prev, ...uniqueNewTips];
          });
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
  const handleGasStationQuery = async (useDestination: boolean = false) => {
    // Determinar qué ubicación usar: destino del viaje o ubicación actual
    let searchLocation: { lat: number, lng: number } | null = null;

    if (useDestination && trip?.destinationLatitude && trip?.destinationLongitude) {
      searchLocation = {
        lat: trip.destinationLatitude,
        lng: trip.destinationLongitude
      };
    } else if (currentLocation) {
      searchLocation = currentLocation;
    } else {
      return "No puedo obtener tu ubicación para recomendarte gasolineras. Activa la ubicación o especifica el destino del viaje.";
    }

    try {
      // Buscar lugares de forma asíncrona sin bloquear la respuesta
      findNearbyPlaces('gas_station', {
        location: searchLocation
      }).then(places => {
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
          setTips(prev => {
            const uniqueNewTips = filterDuplicateTips(prev, newTips);
            if (uniqueNewTips.length === 0) {
              console.log('⚠️ Todas las gasolineras ya están en tips');
              return prev;
            }
            if (uniqueNewTips.length > 0) {
              addTipPinsToMap(uniqueNewTips);
            }
            return [...prev, ...uniqueNewTips];
          });
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
  const handleBestRestaurantQuery = async (useDestination: boolean = false) => {
    // Determinar qué ubicación usar: destino del viaje o ubicación actual
    let searchLocation: { lat: number, lng: number } | null = null;

    if (useDestination && trip?.destinationLatitude && trip?.destinationLongitude) {
      searchLocation = {
        lat: trip.destinationLatitude,
        lng: trip.destinationLongitude
      };
    } else if (currentLocation) {
      searchLocation = currentLocation;
    } else {
      return "No puedo obtener tu ubicación para recomendarte el mejor restaurante. Activa la ubicación o especifica el destino del viaje.";
    }

    try {
      findNearbyPlaces('restaurant', {
        maxResults: 1,
        maxRadius: 20,
        sortBy: 'rating',
        minRating: 4.5,
        includePrice: true,
        location: searchLocation
      }).then(places => {
        if (places.length > 0) {
          setRecommendedPlaces(places);
          addPinsToMap(places);

          const newTips = places.map(place => ({
            ...place,
            tipType: 'restaurant',
            tipIcon: '🍽️'
          }));
          setTips(prev => {
            const uniqueNewTips = filterDuplicateTips(prev, newTips);
            if (uniqueNewTips.length === 0) {
              console.log('⚠️ El restaurante ya está en tips');
              return prev;
            }
            if (uniqueNewTips.length > 0) {
              addTipPinsToMap(uniqueNewTips);
            }
            return [...prev, ...uniqueNewTips];
          });
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
  const handleBestAccommodationQuery = async (useDestination: boolean = false) => {
    // Determinar qué ubicación usar: destino del viaje o ubicación actual
    let searchLocation: { lat: number, lng: number } | null = null;

    if (useDestination && trip?.destinationLatitude && trip?.destinationLongitude) {
      searchLocation = {
        lat: trip.destinationLatitude,
        lng: trip.destinationLongitude
      };
    } else if (currentLocation) {
      searchLocation = currentLocation;
    } else {
      return "No puedo obtener tu ubicación para recomendarte el mejor alojamiento. Activa la ubicación o especifica el destino del viaje.";
    }

    try {
      findNearbyPlaces('lodging', {
        maxResults: 1,
        maxRadius: 20,
        sortBy: 'rating',
        minRating: 4.5,
        includePrice: true,
        location: searchLocation
      }).then(places => {
        if (places.length > 0) {
          setRecommendedPlaces(places);
          addPinsToMap(places);

          const newTips = places.map(place => ({
            ...place,
            tipType: 'lodging',
            tipIcon: '🏨'
          }));
          setTips(prev => {
            const uniqueNewTips = filterDuplicateTips(prev, newTips);
            if (uniqueNewTips.length === 0) {
              console.log('⚠️ El alojamiento ya está en tips');
              return prev;
            }
            if (uniqueNewTips.length > 0) {
              addTipPinsToMap(uniqueNewTips);
            }
            return [...prev, ...uniqueNewTips];
          });
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
  const handleBestAttractionsQuery = async (useDestination: boolean = false) => {
    // Determinar qué ubicación usar: destino del viaje o ubicación actual
    let searchLocation: { lat: number, lng: number } | null = null;

    if (useDestination && trip?.destinationLatitude && trip?.destinationLongitude) {
      searchLocation = {
        lat: trip.destinationLatitude,
        lng: trip.destinationLongitude
      };
    } else if (currentLocation) {
      searchLocation = currentLocation;
    } else {
      return "No puedo obtener tu ubicación para recomendarte las mejores atracciones. Activa la ubicación o especifica el destino del viaje.";
    }

    try {
      findNearbyPlaces('tourist_attraction', {
        maxResults: 5,
        maxRadius: 20,
        sortBy: 'rating',
        minRating: 4.0,
        includePrice: false,
        location: searchLocation
      }).then(places => {
        if (places.length > 0) {
          setRecommendedPlaces(places);
          addPinsToMap(places);

          const newTips = places.map(place => ({
            ...place,
            tipType: 'tourist_attraction',
            tipIcon: '🎯'
          }));
          setTips(prev => {
            const uniqueNewTips = filterDuplicateTips(prev, newTips);
            if (uniqueNewTips.length === 0) {
              console.log('⚠️ Todas las atracciones ya están en tips');
              return prev;
            }
            if (uniqueNewTips.length > 0) {
              addTipPinsToMap(uniqueNewTips);
            }
            return [...prev, ...uniqueNewTips];
          });
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
      excludePlaceIds?: string[]; // IDs de lugares a excluir
      excludeNameLocations?: string[]; // Claves nombre+ubicación a excluir
      location?: { lat: number, lng: number }; // Ubicación opcional (destino o ubicación actual)
    } = {}
  ): Promise<any[]> => {
    // Usar la ubicación proporcionada, o la ubicación actual por defecto
    const searchLocation = options.location || currentLocation;

    if (!map || !searchLocation) {
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
        location: searchLocation,
        maxResults,
        maxRadius,
        sortBy,
        minRating,
        includePrice
      });

      const placesService = new window.google.maps.places.PlacesService(map);

      // Si hay lugares a excluir, buscar más resultados para tener opciones
      const searchLimit = options.excludePlaceIds && options.excludePlaceIds.length > 0
        ? Math.max(maxResults * 2, 20) // Buscar el doble o mínimo 20 si hay exclusiones
        : maxResults;

      // Intentar búsqueda con radio progresivo si no encuentra resultados
      const searchRadii = [5, 10, 15, 20]; // km
      let allResults: any[] = [];

      for (const radius of searchRadii) {
        if (allResults.length >= searchLimit) break;

        console.log(`🔍 Buscando en radio de ${radius}km...`);

        const request: any = {
          location: new window.google.maps.LatLng(searchLocation.lat, searchLocation.lng),
          type: placeType,
          rankBy: window.google.maps.places.RankBy.DISTANCE
        };

        // Buscar resultados con paginación para obtener más opciones
        const results = await new Promise<any[]>((resolve) => {
          const allPageResults: any[] = [];
          let paginationObj: any = null;

          const performSearch = (nextPage?: any) => {
            const searchRequest = nextPage ? { ...request, pagination: nextPage } : request;

            placesService.nearbySearch(searchRequest, (pageResults: any[], status: any, pagination?: any) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && pageResults) {
                allPageResults.push(...pageResults);
                console.log(`📄 Página: ${allPageResults.length} resultados acumulados de ${pageResults.length} en esta página`);

                // Si hay más páginas y aún necesitamos resultados, continuar
                if (pagination && pagination.hasNextPage && allPageResults.length < searchLimit) {
                  paginationObj = pagination;
                  setTimeout(() => {
                    pagination.nextPage();
                  }, 100);
                } else {
                  resolve(allPageResults);
                }
              } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.log(`⚠️ No se encontraron resultados en radio de ${radius}km`);
                resolve(allPageResults);
              } else {
                console.log(`⚠️ Estado de búsqueda: ${status}`);
                resolve(allPageResults);
              }
            });
          };

          performSearch();
        });

        if (results.length > 0) {
          console.log(`✅ Encontrados ${results.length} lugares en ${radius}km`);
          allResults = [...allResults, ...results];
          if (allResults.length >= searchLimit) {
            break; // Si ya tenemos suficientes resultados, no necesitamos expandir más
          }
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
          searchLocation.lat,
          searchLocation.lng,
          placeLocation.lat,
          placeLocation.lng
        );

        const processedPlace = {
          id: place.place_id,
          place_id: place.place_id, // Mantener place_id explícitamente
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

      // Excluir lugares que ya están en tips (por place_id y/o nombre+ubicación)
      const beforeExclude = filteredPlaces.length;
      if ((options.excludePlaceIds && options.excludePlaceIds.length > 0) ||
        (options.excludeNameLocations && options.excludeNameLocations.length > 0)) {
        const excludePlaceIdSet = options.excludePlaceIds ? new Set(options.excludePlaceIds.map(id => String(id).trim())) : new Set<string>();
        const excludeNameLocationSet = options.excludeNameLocations ? new Set(options.excludeNameLocations) : new Set<string>();

        filteredPlaces = filteredPlaces.filter(place => {
          // Primero verificar por place_id
          const placeId = String(place.place_id || place.id || '').trim();
          if (placeId && excludePlaceIdSet.has(placeId)) {
            console.log(`🚫 Excluyendo lugar ya existente por place_id: ${place.name} (place_id: ${placeId})`);
            return false;
          }

          // Si no hay place_id o no coincide, verificar por nombre+ubicación
          const lat = place.location?.lat;
          const lng = place.location?.lng;
          if (place.name && lat != null && lng != null) {
            const nameLocationKey = `${place.name.toLowerCase().trim()}_${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}`;
            if (excludeNameLocationSet.has(nameLocationKey)) {
              console.log(`🚫 Excluyendo lugar ya existente por nombre+ubicación: ${place.name} (${nameLocationKey})`);
              return false;
            }
          }

          return true;
        });
        console.log(`🚫 Excluidos ${beforeExclude - filteredPlaces.length} lugares ya existentes en tips (de ${beforeExclude} totales)`);

        // Si después de excluir no tenemos suficientes resultados, buscar más
        if (filteredPlaces.length < maxResults && allResults.length > 0) {
          console.log(`⚠️ Solo quedan ${filteredPlaces.length} lugares después de excluir, necesitamos más resultados`);
          // Ya estamos buscando más resultados con searchLimit, así que esto está cubierto
        }
      }

      // Ordenar según criterio especificado
      if (sortBy === 'rating') {
        filteredPlaces.sort((a, b) => b.rating - a.rating);
      } else {
        filteredPlaces.sort((a, b) => a.distance - b.distance);
      }

      // Limitar resultados (si se excluyeron lugares, mantener el límite original)
      const limit = options.excludePlaceIds && options.excludePlaceIds.length > 0
        ? Math.min(maxResults, filteredPlaces.length)
        : maxResults;
      const finalResults = filteredPlaces.slice(0, limit);

      console.log(`🎯 ${finalResults.length} lugares finales seleccionados (de ${filteredPlaces.length} disponibles):`,
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

  // Función para agregar pins de tips al mapa (solo crea pins, no guarda en BD)
  const addTipPinsToMap = (tipsToAdd: any[]) => {
    console.log('🗺️ addTipPinsToMap llamada con:', tipsToAdd);
    console.log('🗺️ Mapa disponible:', !!map);

    if (!map) {
      console.error('❌ Mapa no disponible para agregar pins de tips');
      return;
    }

    // Verificar qué tips ya tienen pins para evitar duplicados
    setTipPins(prevPins => {
      const existingPinTitles = new Set(
        prevPins.map(pin => pin.title).filter(title => title != null)
      );

      // Filtrar tips que ya tienen pins
      const uniqueTipsToAdd = tipsToAdd.filter(tip => {
        const pinTitle = `${tip.tipIcon} ${tip.name}`;
        if (existingPinTitles.has(pinTitle)) {
          console.log(`⚠️ Pin ya existe para: ${tip.name}`);
          return false;
        }
        return true;
      });

      if (uniqueTipsToAdd.length === 0) {
        console.log('⚠️ Todos los tips ya tienen pins en el mapa');
        return prevPins;
      }

      // Crear pins solo para los tips únicos
      const newTipPins: any[] = [];

      uniqueTipsToAdd.forEach((tip, index) => {
        // Crear el pin en el mapa
        const marker = new window.google.maps.Marker({
          position: tip.location,
          map: map,
          title: `${tip.tipIcon} ${tip.name}`,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/info.png',
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          },
          animation: window.google.maps.Animation.DROP
        });

        const tipId = tip.id || tip.place_id || '';
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">
              ${tip.tipIcon} ${tip.name}
            </h3>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">
                📍 ${tip.vicinity || tip.address || 'Dirección no disponible'}
            </p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">
                ⭐ ${tip.rating || 0}/5 • ${tip.distanceText || 'Distancia no disponible'}
            </p>
            <p style="margin: 4px 0; color: #666; font-size: 12px;">
                🏷️ ${(tip.types || []).join(', ') || 'Sin categoría'}
            </p>
              <button onclick="startTripToTip('${tipId}')" 
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
      });

      console.log('🗺️ Total pins de tips creados:', newTipPins.length);
      return [...prevPins, ...newTipPins];
    });
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
      // Obtener coordenadas del tip (pueden estar en location o directamente)
      const tipLat = tip.location?.lat || tip.latitude;
      const tipLng = tip.location?.lng || tip.longitude;

      if (!tipLat || !tipLng) {
        console.error('❌ Tip no tiene coordenadas válidas:', tip);
        toast.error('El tip no tiene coordenadas válidas');
        return;
      }

      const request = {
        origin: currentLocation,
        destination: {
          lat: Number(tipLat),
          lng: Number(tipLng)
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

  // Función para filtrar tips duplicados basándose en el ID del lugar
  const filterDuplicateTips = (existingTips: any[], newTips: any[]): any[] => {
    if (newTips.length === 0) return [];
    if (existingTips.length === 0) return newTips;

    // Crear un set con los place_ids de los tips existentes (más confiable)
    const existingPlaceIds = new Set(
      existingTips
        .map(tip => {
          const placeId = tip.place_id || tip.placeId;
          return placeId ? String(placeId) : null;
        })
        .filter(id => id != null)
    );

    // Crear un set con los IDs de base de datos de los tips existentes
    const existingDbIds = new Set(
      existingTips
        .map(tip => tip.id && typeof tip.id === 'number' ? String(tip.id) : null)
        .filter(id => id != null)
    );

    // También crear un set con nombres y ubicaciones para comparación adicional
    const existingNameLocation = new Set(
      existingTips
        .map(tip => {
          const lat = tip.location?.lat || tip.latitude;
          const lng = tip.location?.lng || tip.longitude;
          if (tip.name && lat != null && lng != null) {
            return `${tip.name.toLowerCase().trim()}_${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}`;
          }
          return null;
        })
        .filter(key => key != null)
    );

    // Filtrar los nuevos tips para evitar duplicados
    const seenPlaceIds = new Set<string>();
    const seenNames = new Set<string>();

    const uniqueNewTips = newTips.filter(tip => {
      // Verificar por ID de base de datos primero (si el tip ya fue guardado)
      if (tip.id && typeof tip.id === 'number') {
        const tipIdStr = String(tip.id);
        if (existingDbIds.has(tipIdStr)) {
          console.log(`⚠️ Tip duplicado filtrado por ID de BD: ${tip.name} (ID: ${tip.id})`);
          return false;
        }
        if (seenPlaceIds.has(tipIdStr)) {
          console.log(`⚠️ Tip duplicado dentro de nuevos tips (por ID BD): ${tip.name}`);
          return false;
        }
        seenPlaceIds.add(tipIdStr);
      }

      // Verificar por place_id (más confiable para Google Places)
      const tipPlaceId = tip.place_id || tip.placeId;
      if (tipPlaceId) {
        const tipPlaceIdStr = String(tipPlaceId);
        if (existingPlaceIds.has(tipPlaceIdStr)) {
          console.log(`⚠️ Tip duplicado filtrado por place_id: ${tip.name} (place_id: ${tipPlaceId})`);
          return false;
        }
        if (seenPlaceIds.has(tipPlaceIdStr)) {
          console.log(`⚠️ Tip duplicado dentro de nuevos tips (por place_id): ${tip.name}`);
          return false;
        }
        seenPlaceIds.add(tipPlaceIdStr);
      }

      // Si no hay place_id, verificar por nombre y ubicación
      const lat = tip.location?.lat || tip.latitude;
      const lng = tip.location?.lng || tip.longitude;
      if (!tipPlaceId && tip.name && lat != null && lng != null) {
        const nameLocationKey = `${tip.name.toLowerCase().trim()}_${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}`;
        if (existingNameLocation.has(nameLocationKey)) {
          console.log(`⚠️ Tip duplicado filtrado por nombre/ubicación: ${tip.name}`);
          return false;
        }
        if (seenNames.has(nameLocationKey)) {
          console.log(`⚠️ Tip duplicado dentro de nuevos tips (por nombre/ubicación): ${tip.name}`);
          return false;
        }
        seenNames.add(nameLocationKey);
      }

      return true;
    });

    console.log(`✅ Filtrados ${newTips.length - uniqueNewTips.length} tips duplicados de ${newTips.length} totales`);
    return uniqueNewTips;
  };

  // Función para limpiar tips
  const clearTips = async () => {
    if (!trip?.id) {
      // Si no hay trip, solo limpiar estado local
      setTips([]);
      tipPins.forEach(pin => pin.setMap(null));
      setTipPins([]);
      setShowTipsList(false);
      return;
    }

    try {
      console.log(`🗑️ Eliminando todos los tips del viaje ${trip.id} de la base de datos...`);

      // Usar el endpoint que elimina todos los tips del viaje de una vez
      const response = await api.deleteAllTipsByTrip(trip.id.toString());

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Todos los tips eliminados de la base de datos:', data);

        // Limpiar del estado local
        setTips([]);
        tipPins.forEach(pin => pin.setMap(null));
        setTipPins([]);
        setShowTipsList(false);

        toast.success('Se eliminaron todos los tips');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        console.error('❌ Error eliminando tips:', errorData);
        toast.error(`Error al eliminar tips: ${errorData.message || 'Error desconocido'}`);

        // Limpiar del estado local de todos modos
        setTips([]);
        tipPins.forEach(pin => pin.setMap(null));
        setTipPins([]);
        setShowTipsList(false);
      }
    } catch (error) {
      console.error('❌ Error eliminando tips:', error);
      toast.error('Error al eliminar tips. Intenta de nuevo.');

      // Limpiar del estado local de todos modos
      setTips([]);
      tipPins.forEach(pin => pin.setMap(null));
      setTipPins([]);
      setShowTipsList(false);
    }
  };

  // Función para guardar tip en la base de datos
  const saveTipToDatabase = async (tip: any) => {
    try {
      // Verificar si ya existe un tip con el mismo place_id en el estado local
      const existingTip = tips.find(t => {
        const tPlaceId = t.place_id || t.placeId;
        const tipPlaceId = tip.place_id || tip.placeId;
        return tPlaceId && tipPlaceId && tPlaceId === tipPlaceId;
      });

      if (existingTip && existingTip.id && typeof existingTip.id === 'number') {
        console.log('⚠️ Tip ya existe en estado local, no se guardará duplicado:', existingTip.id);
        return existingTip; // Retornar el tip existente con su ID de la base de datos
      }

      // Verificar también en la base de datos antes de crear
      const tipsFromDB = await loadTipsFromDatabase();
      const existingTipInDB = tipsFromDB.find((dbTip: any) => {
        const dbPlaceId = dbTip.placeId || dbTip.place_id;
        const tipPlaceId = tip.place_id || tip.placeId;
        return dbPlaceId && tipPlaceId && dbPlaceId === tipPlaceId;
      });

      if (existingTipInDB) {
        console.log('⚠️ Tip ya existe en base de datos, no se guardará duplicado:', existingTipInDB.id);
        // Actualizar el estado local con el tip de la BD
        setTips(prev => {
          const alreadyExists = prev.some(t => t.id === existingTipInDB.id);
          if (!alreadyExists) {
            return [...prev, existingTipInDB];
          }
          return prev;
        });
        return existingTipInDB;
      }

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
        types: tip.types || [],
        placeId: tip.place_id || tip.id // Guardar place_id para poder detectar duplicados
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
    { icon: <Share />, name: 'Compartir', action: () => setOpenShareDialog(true), show: true },
    { icon: <Delete />, name: 'Eliminar Viaje', action: () => setOpenDeleteDialog(true), show: isUserAdmin },
  ];

  if (isLoading || loading || (!trip && !hasAttemptedLoad)) {
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
    if (hasAttemptedLoad && !loading) {
      return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#FAFAFA' }}>
          <AppBar position="static" elevation={0} sx={{ bgcolor: '#E3F2FD', color: '#424242', borderBottom: '1px solid #BBDEFB' }}>
            <Toolbar sx={{ px: 3, py: 1.5 }}>
              <IconButton
                edge="start"
                onClick={() => router.back()}
                sx={{ mr: 2, color: '#666' }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 600, color: '#424242' }}>
                Viaje no encontrado
              </Typography>
            </Toolbar>
          </AppBar>
          <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              No se pudo cargar la información del viaje. Verifica que tengas acceso a este viaje.
            </Alert>
          </Container>
        </Box>
      );
    }
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#E3F2FD', color: '#424242', borderBottom: '1px solid #BBDEFB' }}>
        <Toolbar sx={{ px: 3, py: 1.5 }}>
          <IconButton
            edge="start"
            onClick={() => router.back()}
            sx={{ mr: 2, color: '#666' }}
          >
            <ArrowBack />
          </IconButton>
          <Avatar sx={{ bgcolor: '#1976D2', mr: 2, width: 40, height: 40 }}>
            {getIcon(trip.image || 'default')}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600, color: '#424242' }}>
              {trip.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {trip.destination}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(trip.status)}
            size="small"
            sx={{
              fontWeight: 500,
              bgcolor: trip.status?.toLowerCase() === 'completed' ? '#C8E6C9' :
                trip.status?.toLowerCase() === 'planning' ? '#BBDEFB' :
                  trip.status?.toLowerCase() === 'active' ? '#FFE0B2' : '#F5F5F5',
              color: trip.status?.toLowerCase() === 'completed' ? '#2E7D32' :
                trip.status?.toLowerCase() === 'planning' ? '#1565C0' :
                  trip.status?.toLowerCase() === 'active' ? '#E65100' : '#616161',
            }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 3, px: 3 }}>
          {/* Información del Viaje y Billeteras */}
          <Box sx={{ flex: '0 0 33.33%', maxWidth: '33.33%' }}>
            <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{
                    bgcolor: '#E3F2FD',
                    width: 60,
                    height: 60,
                    color: '#1976D2'
                  }}>
                    {getIcon(trip.image || 'default')}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 0.5, color: '#424242' }}>
                      {trip.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
                      {trip.destination}
                    </Typography>
                    <Chip
                      label={getStatusLabel(trip.status)}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        bgcolor: trip.status?.toLowerCase() === 'completed' ? '#C8E6C9' :
                          trip.status?.toLowerCase() === 'planning' ? '#BBDEFB' :
                            trip.status?.toLowerCase() === 'active' ? '#FFE0B2' : '#F5F5F5',
                        color: trip.status?.toLowerCase() === 'completed' ? '#2E7D32' :
                          trip.status?.toLowerCase() === 'planning' ? '#1565C0' :
                            trip.status?.toLowerCase() === 'active' ? '#E65100' : '#616161',
                      }}
                    />
                  </Box>
                </Box>

                {trip.description && (
                  <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                    {trip.description}
                  </Typography>
                )}

                {/* Detalles del viaje */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule sx={{ color: '#666', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#424242' }}>
                        {formatDate(trip.dateI)} - {formatDate(trip.dateF)}
                      </Typography>
                      {isUserAdmin && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditDateI(trip.dateI);
                            setEditDateF(trip.dateF);
                            setOpenEditDates(true);
                          }}
                          sx={{
                            color: '#1976D2',
                            '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' }
                          }}
                        >
                          <Edit sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      {getVehicleIcon(trip.vehicle)}
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#424242' }}>
                        {trip.vehicle === 'auto' ? 'En auto' :
                          trip.vehicle === 'avion' ? 'En avión' :
                            trip.vehicle === 'caminando' ? 'Caminando' : 'En auto'}
                      </Typography>
                    </Box>

                    {trip.cost > 0 && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#424242' }}>
                          Presupuesto: ${trip.cost.toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Origen y Destino con botones de edición */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                    {trip.origin && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Place sx={{ color: '#4CAF50', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#424242' }}>
                          Origen: {trip.origin}
                        </Typography>
                        {isUserAdmin && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              const allowed: Array<"auto" | "avion" | "caminando"> = ["auto", "avion", "caminando"];
                              setEditOrigin(trip.origin || '');
                              setEditDestination(trip.destination);
                              setEditVehicle(allowed.includes(trip.vehicle as any)
                                ? (trip.vehicle as any)
                                : "auto"
                              );
                              // Si hay coordenadas, establecerlas también
                              if (trip.originLatitude && trip.originLongitude) {
                                setEditOriginCoords({
                                  lat: trip.originLatitude,
                                  lng: trip.originLongitude
                                });
                              }
                              if (trip.destinationLatitude && trip.destinationLongitude) {
                                setEditDestinationCoords({
                                  lat: trip.destinationLatitude,
                                  lng: trip.destinationLongitude
                                });
                              }
                              setOpenEditLocations(true);
                            }}
                            sx={{
                              color: '#1976D2',
                              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' }
                            }}
                          >
                            <Edit sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                    )}
                    <Box display="flex" alignItems="center" gap={1}>
                      <Place sx={{ color: '#F44336', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#424242' }}>
                        Destino: {trip.destination}
                      </Typography>
                      {isUserAdmin && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            const allowed: Array<"auto" | "avion" | "caminando"> = ["auto", "avion", "caminando"];
                            setEditOrigin(trip.origin || '');
                            setEditDestination(trip.destination);
                            setEditVehicle(allowed.includes(trip.vehicle as any)
                              ? (trip.vehicle as any)
                              : "auto"
                            );
                            // Si hay coordenadas, establecerlas también
                            if (trip.originLatitude && trip.originLongitude) {
                              setEditOriginCoords({
                                lat: trip.originLatitude,
                                lng: trip.originLongitude
                              });
                            }
                            if (trip.destinationLatitude && trip.destinationLongitude) {
                              setEditDestinationCoords({
                                lat: trip.destinationLatitude,
                                lng: trip.destinationLongitude
                              });
                            }
                            setOpenEditLocations(true);
                          }}
                          sx={{
                            color: '#1976D2',
                            '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' }
                          }}
                        >
                          <Edit sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Código de invitación */}
                {trip.joinCode && (
                  <Paper sx={{ p: 1.5, bgcolor: '#E8F5E9', borderRadius: 2, border: '1px solid #C8E6C9', mb: 2 }}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: '#2E7D32' }}>
                      Código de Invitación
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1, color: '#424242' }}>
                        {trip.joinCode}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyJoinCode(trip.joinCode!)}
                        sx={{
                          bgcolor: copiedCode === trip.joinCode ? '#4CAF50' : 'transparent',
                          color: copiedCode === trip.joinCode ? 'white' : '#666',
                          '&:hover': {
                            bgcolor: copiedCode === trip.joinCode ? '#388E3C' : '#F5F5F5',
                          }
                        }}
                      >
                        {copiedCode === trip.joinCode ? <CheckCircle sx={{ fontSize: 16 }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Box>
                    {copiedCode === trip.joinCode && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#4CAF50' }}>
                        ¡Código copiado!
                      </Typography>
                    )}
                  </Paper>
                )}

                {/* Sección de Billeteras y Gastos */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                      Billeteras y Gastos
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => setOpenAddPurchase(true)}
                      sx={{
                        bgcolor: '#4CAF50',
                        '&:hover': { bgcolor: '#388E3C' },
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
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
                        <Paper sx={{ mb: 2, bgcolor: '#E3F2FD', borderRadius: 2, border: '1px solid #BBDEFB', boxShadow: 'none' }}>
                          <Box sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                  <AccountBalanceWallet sx={{ fontSize: 20, color: '#1976D2' }} />
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976D2' }}>
                                    Billetera General
                                  </Typography>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976D2', mb: 0.5 }}>
                                  {generalWallet.currencySymbol || '$'} {generalWallet.amount?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64B5F6' }}>
                                  {generalWallet.currency === 'PESOS' ? 'Pesos Argentinos' :
                                    generalWallet.currency === 'DOLARES' ? 'Dólares Estadounidenses' :
                                      'Euros'}
                                </Typography>
                              </Box>
                              {isUserAdmin && (
                                <IconButton
                                  size="small"
                                  onClick={handleOpenEditGeneralWallet}
                                  sx={{
                                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                                    color: '#1976D2',
                                    '&:hover': {
                                      bgcolor: 'rgba(25, 118, 210, 0.2)',
                                    }
                                  }}
                                >
                                  <Edit sx={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      )}

                      {/* Billetera Individual */}
                      {individualWallet && (
                        <Paper sx={{ bgcolor: '#E8F5E9', borderRadius: 2, border: '1px solid #C8E6C9', boxShadow: 'none' }}>
                          <Box sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                  <Wallet sx={{ fontSize: 20, color: '#2E7D32' }} />
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                                    Mi Billetera
                                  </Typography>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2E7D32', mb: 0.5 }}>
                                  {individualWallet.currencySymbol || '$'} {individualWallet.amount?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                                  {individualWallet.currency === 'PESOS' ? 'Pesos Argentinos' :
                                    individualWallet.currency === 'DOLARES' ? 'Dólares Estadounidenses' :
                                      'Euros'}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={handleOpenEditIndividualWallet}
                                sx={{
                                  bgcolor: 'rgba(46, 125, 50, 0.1)',
                                  color: '#2E7D32',
                                  '&:hover': {
                                    bgcolor: 'rgba(46, 125, 50, 0.2)',
                                  }
                                }}
                              >
                                <Edit sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      )}
                    </>
                  )}

                  {/* Sección de Gastos */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
                      Gastos
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      {/* Gastos Generales */}
                      <Paper sx={{ bgcolor: '#FFF3E0', borderRadius: 2, border: '1px solid #FFE0B2', boxShadow: 'none' }}>
                        <Box sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                            <AccountBalanceWallet sx={{ fontSize: 20, color: '#E65100' }} />
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#E65100' }}>
                              Gastos Generales
                            </Typography>
                          </Box>
                          {loadingPurchases ? (
                            <CircularProgress size={20} sx={{ color: '#E65100' }} />
                          ) : (
                            <>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: '#E65100', mb: 0.5 }}>
                                {generalWallet?.currencySymbol || '$'} {getGeneralExpensesRemainingConverted().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#FF9800', mb: 0.5, display: 'block' }}>
                                Total gastos: {generalWallet?.currencySymbol || '$'} {calculateTotalExpensesConverted(generalPurchases, generalWallet?.currency || 'PESOS').toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {generalPurchases.length} {generalPurchases.length === 1 ? 'compra' : 'compras'} registradas
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Paper>

                      {/* Mis Gastos */}
                      <Paper sx={{ bgcolor: '#F3E5F5', borderRadius: 2, border: '1px solid #E1BEE7', boxShadow: 'none' }}>
                        <Box sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                            <Wallet sx={{ fontSize: 20, color: '#7B1FA2' }} />
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#7B1FA2' }}>
                              Mis Gastos
                            </Typography>
                          </Box>
                          {loadingPurchases ? (
                            <CircularProgress size={20} sx={{ color: '#7B1FA2' }} />
                          ) : (
                            <>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: '#7B1FA2', mb: 0.5 }}>
                                {individualWallet?.currencySymbol || '$'} {getIndividualExpensesRemainingConverted().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#9C27B0', mb: 0.5, display: 'block' }}>
                                Total gastos: {individualWallet?.currencySymbol || '$'} {calculateTotalExpensesConverted(individualPurchases, individualWallet?.currency || 'PESOS').toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {individualPurchases.length} {individualPurchases.length === 1 ? 'compra' : 'compras'} registradas
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Paper>
                    </Box>
                  </Box>

                  {/* Lista de Compras */}
                  <Box sx={{ mt: 3 }}>
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
                          minHeight: 48,
                          '& .MuiAccordionSummary-content': {
                            my: 1,
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <ShoppingCart sx={{ color: '#4CAF50' }} />
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                            Lista de Compras ({(generalPurchases.length + individualPurchases.length)})
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
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
                                        <TableCell sx={{ fontWeight: 600, width: 80 }}>Acciones</TableCell>
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
                                          <TableCell>
                                            <IconButton
                                              size="small"
                                              color="error"
                                              onClick={() => handleDeletePurchase(purchase.id)}
                                              sx={{
                                                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                                              }}
                                            >
                                              <Delete sx={{ fontSize: 18 }} />
                                            </IconButton>
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

            {/* Lista de Participantes */}
            <Box sx={{ width: '100%' }}>
              <Paper sx={{ boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: 2 }}>
                <Box sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <People sx={{ color: '#1976D2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                      Miembros del Viaje ({participants.length})
                    </Typography>
                  </Box>

                  {participants.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <People sx={{ fontSize: 48, color: '#BDBDBD', mb: 1.5 }} />
                      <Typography variant="h6" sx={{ mb: 1.5, color: '#666' }}>
                        No hay miembros en este viaje
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PersonAdd />}
                        onClick={() => router.push(`/trip/${tripId}/add-users`)}
                        sx={{
                          bgcolor: '#4CAF50',
                          '&:hover': { bgcolor: '#388E3C' },
                          textTransform: 'none',
                          borderRadius: 2,
                        }}
                      >
                        Agregar Miembros
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {participants.map((p) => (
                        <ListItem key={p.id} sx={{ py: 1 }}>
                          <ListItemAvatar>
                            <Avatar src={p.profilePicture || undefined} sx={{ width: 40, height: 40 }}>
                              {p.name?.[0] || 'U'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={p.name}
                            secondary={p.email}
                            primaryTypographyProps={{ sx: { fontWeight: 500, color: '#424242' } }}
                            secondaryTypographyProps={{ sx: { color: '#666', fontSize: '0.875rem' } }}
                          />
                          {isUserAdmin && (
                            <>
                              {/* Botón eliminar participante */}
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveParticipant(p.id)}
                                sx={{ color: '#F44336' }}
                              >
                                <Delete sx={{ fontSize: 18 }} />
                              </IconButton>
                              {/* Botón agregar como admin */}
                              {!trip?.adminIds?.includes(p.id) && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleAddAdmin(p.id)}
                                  sx={{ color: '#1976D2' }}
                                >
                                  <PersonAdd sx={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                              {/* Botón quitar admin */}
                              {trip?.adminIds?.includes(p.id) && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveAdmin(p.id)}
                                  sx={{ color: '#FF9800' }}
                                >
                                  <Clear sx={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                            </>
                          )}
                        </ListItem>
                      ))}
                    </List>

                  )}
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Mapa */}
          <Box sx={{ flex: '0 0 66.67%', maxWidth: '66.67%', width: '100%' }}>
            <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                      {isNavigating ? 'Navegación Activa' : 'Ruta del Viaje'}
                    </Typography>
                    {isNavigating ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                          {remainingDistance}
                        </Typography>
                        {remainingTime && (
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            • {remainingTime}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      routeDistance && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                            {routeDistance}
                          </Typography>
                          {routeDuration && (
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              • {routeDuration}
                            </Typography>
                          )}
                        </Box>
                      )
                    )}
                  </Box>

                  {isNavigating ? (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                        {trip.origin ? `${trip.origin} → ${trip.destination}` : trip.destination}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {trip.origin ? `${trip.origin} → ${trip.destination}` : trip.destination}
                      </Typography>
                      {trip.vehicle && (
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          {getVehicleIcon(trip.vehicle)}
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {trip.vehicle === 'auto' ? 'En auto' :
                              trip.vehicle === 'avion' ? 'En avión' :
                                trip.vehicle === 'caminando' ? 'Caminando' : 'En auto'}
                          </Typography>
                        </Box>
                      )}
                      {distanceFromCurrent && (
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <MyLocation sx={{ fontSize: 16, color: '#1976D2' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                            Te quedan {distanceFromCurrent} para llegar
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Botones de navegación para viajes en auto */}
                  {(trip.vehicle === 'auto' || trip.vehicle === 'avion' || trip.vehicle === 'caminando') && currentLocation && (
                    <Box display="flex" gap={1} mt={2}>
                      {!isNavigating ? (
                        <>
                          {/* Botón para ir al origen */}
                          {trip.originLatitude && trip.originLongitude && (
                            <Button
                              variant="outlined"
                              startIcon={<Place />}
                              onClick={() => {
                                startNavigation('to-origin');
                              }}
                              size="small"
                              sx={{
                                borderColor: '#4CAF50',
                                color: '#4CAF50',
                                '&:hover': {
                                  borderColor: '#388E3C',
                                  bgcolor: 'rgba(76, 175, 80, 0.1)'
                                },
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 2,
                              }}
                            >
                              Ir al Origen
                            </Button>
                          )}

                          {/* Botón para iniciar viaje (al destino) */}
                          <Button
                            variant="contained"
                            startIcon={<PlayArrow />}
                            onClick={() => {
                              startNavigation('to-destination');
                            }}
                            size="small"
                            sx={{
                              bgcolor: '#1976D2',
                              '&:hover': { bgcolor: '#1565C0' },
                              textTransform: 'none',
                              borderRadius: 2,
                              px: 2,
                            }}
                          >
                            Iniciar Viaje
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            startIcon={<Stop />}
                            onClick={() => {
                              stopNavigation();
                              setNavigationMode(null);
                            }}
                            size="small"
                            sx={{
                              bgcolor: '#F44336',
                              '&:hover': { bgcolor: '#D32F2F' },
                              textTransform: 'none',
                              borderRadius: 2,
                              px: 2,
                            }}
                          >
                            Detener
                          </Button>

                          {/* Si está navegando al origen, mostrar botón para continuar al destino */}
                          {navigationMode === 'to-origin' && (
                            <Button
                              variant="contained"
                              startIcon={<Navigation />}
                              onClick={() => {
                                setNavigationMode('to-destination');
                                if (currentLocation) {
                                  startNavigationWithLocation(currentLocation, 'to-destination');
                                }
                              }}
                              size="small"
                              sx={{
                                bgcolor: '#4CAF50',
                                '&:hover': { bgcolor: '#388E3C' },
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 2,
                              }}
                            >
                              Continuar al Destino
                            </Button>
                          )}

                          {isNavigatingToTip && (
                            <Button
                              variant="contained"
                              startIcon={<Navigation />}
                              onClick={continueMainTrip}
                              size="small"
                              sx={{
                                bgcolor: '#4CAF50',
                                '&:hover': { bgcolor: '#388E3C' },
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 2,
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

                {/* Lista de Lugares Recomendados */}
                {recommendedPlaces.length > 0 && (
                  <Box sx={{ width: '100%', mt: 3 }}>
                    <Paper sx={{
                      bgcolor: '#E8F5E9',
                      border: '1px solid #C8E6C9',
                      borderRadius: 2,
                      boxShadow: 'none',
                      p: 2
                    }}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <Box sx={{
                          bgcolor: 'rgba(46, 125, 50, 0.1)',
                          borderRadius: '50%',
                          p: 0.75,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Place sx={{ fontSize: 20, color: '#2E7D32' }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                            Lugares Recomendados
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                            Basados en tu consulta a Gemini
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {recommendedPlaces.map((place, index) => (
                          <Paper key={place.id} sx={{
                            width: '100%',
                            bgcolor: 'white',
                            border: selectedPlace?.id === place.id ? '2px solid #4CAF50' : '1px solid #E0E0E0',
                            borderRadius: 2,
                            boxShadow: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                          }}
                            onClick={() => setSelectedPlace(place)}
                          >
                            <Box sx={{ p: 1.5 }}>
                              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                <Box sx={{
                                  bgcolor: '#E8F5E9',
                                  borderRadius: 1,
                                  p: 0.75,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {place.type === 'restaurant' && <Typography sx={{ fontSize: 18 }}>🍽️</Typography>}
                                  {place.type === 'lodging' && <Typography sx={{ fontSize: 18 }}>🏨</Typography>}
                                  {place.type === 'tourist_attraction' && <Typography sx={{ fontSize: 18 }}>🎯</Typography>}
                                  {place.type === 'gas_station' && <Typography sx={{ fontSize: 18 }}>⛽</Typography>}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {place.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                    {place.vicinity}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box display="flex" alignItems="center" gap={1.5} mt={1}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <Typography sx={{ fontSize: 14 }}>⭐</Typography>
                                  <Typography variant="caption" sx={{ color: '#424242', fontWeight: 500 }}>
                                    {place.rating}/5
                                  </Typography>
                                </Box>
                                <Chip
                                  label={place.type === 'restaurant' ? 'Restaurante' :
                                    place.type === 'lodging' ? 'Alojamiento' :
                                      place.type === 'tourist_attraction' ? 'Atracción' : 'Gasolinera'}
                                  size="small"
                                  sx={{
                                    bgcolor: '#E8F5E9',
                                    color: '#2E7D32',
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    height: 18
                                  }}
                                />
                              </Box>

                              {selectedPlace?.id === place.id && (
                                <Box sx={{
                                  mt: 1.5,
                                  p: 1,
                                  bgcolor: '#E8F5E9',
                                  borderRadius: 1,
                                  border: '1px solid #C8E6C9'
                                }}>
                                  <Typography variant="caption" sx={{ color: '#2E7D32' }}>
                                    📍 Haz clic en el pin del mapa para más información
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Paper>
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
                            color: '#2E7D32',
                            borderColor: '#4CAF50',
                            '&:hover': {
                              borderColor: '#388E3C',
                              bgcolor: '#E8F5E9'
                            },
                            textTransform: 'none',
                            borderRadius: 2,
                          }}
                        >
                          Limpiar Recomendaciones
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                )}

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
                          pb: 2,
                          overflowX: 'auto',
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

            {/* Navegación y Gemini - Debajo del Mapa */}
            {isNavigating && navigationSteps.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                {/* Navegación */}
                <Paper sx={{
                  flex: '1 1 400px',
                  bgcolor: '#E3F2FD',
                  borderRadius: 2,
                  border: '1px solid #BBDEFB',
                  boxShadow: 'none',
                  p: 2
                }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Navigation sx={{ color: '#1976D2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                      Navegación Activa
                    </Typography>
                  </Box>

                  {/* Instrucción actual destacada */}
                  {nextInstruction && (
                    <Box sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      p: 2,
                      mb: 2,
                      border: '1px solid #BBDEFB'
                    }}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                        {getDirectionIcon(nextInstruction)}
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                          {nextInstruction}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={3} mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Speed sx={{ fontSize: 16, color: '#1976D2' }} />
                          <Typography variant="body2" sx={{ color: '#424242', fontWeight: 600 }}>
                            {remainingDistance}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTime sx={{ fontSize: 16, color: '#1976D2' }} />
                          <Typography variant="body2" sx={{ color: '#424242', fontWeight: 600 }}>
                            {remainingTime}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label="ACTUAL"
                          size="small"
                          sx={{
                            bgcolor: '#1976D2',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                        {isNavigatingToTip && (
                          <Chip
                            label={`📍 ${currentTipDestination?.name || 'Tip'}`}
                            size="small"
                            sx={{
                              bgcolor: '#FF9800',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 20
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Próximas 2 instrucciones */}
                  {navigationSteps.length > 0 && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1.5, fontWeight: 600 }}>
                        Próximas instrucciones:
                      </Typography>
                      {navigationSteps.slice(currentStep + 1, currentStep + 3).map((step, index) => (
                        <Box key={currentStep + 1 + index} sx={{
                          bgcolor: 'white',
                          borderRadius: 1.5,
                          p: 1.5,
                          mb: 1,
                          border: '1px solid #E0E0E0'
                        }}>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            {getDirectionIcon(step.instructions)}
                            <Typography variant="body2" sx={{ color: '#424242', fontWeight: 500 }}>
                              {step.instructions.replace(/<[^>]*>/g, '')}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {step.distance.text}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              • {step.duration.text}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>

                {/* Chatbox con Gemini */}
                <Paper sx={{
                  flex: '1 1 400px',
                  bgcolor: '#F3E5F5',
                  borderRadius: 2,
                  border: '1px solid #E1BEE7',
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 400
                }}>
                  <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header del chat */}
                    <Box sx={{
                      p: 1.5,
                      borderBottom: '1px solid #E1BEE7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}>
                      <Box sx={{
                        bgcolor: 'rgba(156, 39, 176, 0.1)',
                        borderRadius: '50%',
                        p: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#7B1FA2' }}>
                          Assistant
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9C27B0' }}>
                          Tu asistente de viajes
                        </Typography>
                      </Box>
                    </Box>

                    {/* Mensajes del chat */}
                    <Box sx={{
                      flex: 1,
                      p: 1.5,
                      overflow: 'auto',
                      maxHeight: 280
                    }}>
                      {chatMessages.map((msg) => (
                        <Box key={msg.id} sx={{ mb: 1.5 }}>
                          <Box sx={{
                            display: 'flex',
                            justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                            mb: 0.5
                          }}>
                            <Box sx={{
                              maxWidth: '80%',
                              p: 1,
                              borderRadius: 2,
                              bgcolor: msg.type === 'user'
                                ? '#E1BEE7'
                                : '#F5F5F5',
                              border: msg.type === 'user'
                                ? '1px solid #CE93D8'
                                : 'none'
                            }}>
                              <Typography variant="body2" sx={{ color: '#424242' }}>
                                {msg.message}
                              </Typography>
                              <Typography variant="caption" sx={{
                                color: '#666',
                                display: 'block',
                                mt: 0.5,
                                fontSize: '0.65rem'
                              }}>
                                {msg.timestamp.toLocaleTimeString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}

                      {isTyping && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Gemini está escribiendo...
                          </Typography>
                          <CircularProgress size={14} sx={{ color: '#9C27B0' }} />
                        </Box>
                      )}
                    </Box>

                    {/* Input del chat */}
                    <Box sx={{
                      p: 1.5,
                      borderTop: '1px solid #E1BEE7',
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
                            bgcolor: 'white',
                            '& fieldset': {
                              borderColor: '#CE93D8',
                            },
                            '&:hover fieldset': {
                              borderColor: '#BA68C8',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#9C27B0',
                            },
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim()}
                        size="small"
                        sx={{
                          bgcolor: '#9C27B0',
                          color: 'white',
                          minWidth: 'auto',
                          px: 1.5,
                          '&:hover': {
                            bgcolor: '#7B1FA2',
                          },
                          '&:disabled': {
                            bgcolor: '#E1BEE7',
                            color: '#9C27B0',
                          }
                        }}
                      >
                        <ArrowBack sx={{ transform: 'rotate(90deg)', fontSize: 18 }} />
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Recomendaciones de IA */}
          {showRecommendations && aiRecommendations.length > 0 && (
            <Box sx={{ width: '100%', mb: 3 }}>
              <Paper sx={{
                bgcolor: '#F3E5F5',
                border: '1px solid #E1BEE7',
                borderRadius: 2,
                boxShadow: 'none',
                p: 2
              }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Box sx={{
                    bgcolor: 'rgba(156, 39, 176, 0.1)',
                    borderRadius: '50%',
                    p: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography sx={{ fontSize: 20 }}>🤖</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#7B1FA2' }}>
                      Recomendaciones de IA
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9C27B0' }}>
                      Basadas en tu ubicación y progreso del viaje
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setShowRecommendations(false)}
                    sx={{ color: '#666' }}
                  >
                    <ArrowBack />
                  </IconButton>
                </Box>

                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {aiRecommendations.map((recommendation, index) => (
                    <Box key={index} sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      p: 1.5,
                      mb: 1.5,
                      border: recommendation.priority === 'high' ? '2px solid #9C27B0' : '1px solid #E0E0E0'
                    }}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                          {recommendation.title}
                        </Typography>
                        <Chip
                          label={recommendation.priority === 'high' ? 'ALTA' : recommendation.priority === 'medium' ? 'MEDIA' : 'BAJA'}
                          size="small"
                          sx={{
                            bgcolor: recommendation.priority === 'high' ? '#F44336' :
                              recommendation.priority === 'medium' ? '#FF9800' : '#4CAF50',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 18
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                        {recommendation.description}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTime sx={{ fontSize: 14, color: '#666' }} />
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {recommendation.estimated_time} min
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Place sx={{ fontSize: 14, color: '#666' }} />
                          <Typography variant="caption" sx={{ color: '#666' }}>
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
                    <CircularProgress size={18} sx={{ color: '#9C27B0' }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Obteniendo nuevas recomendaciones...
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </Box>
      </Container>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions
          .filter(a => a.show !== false)
          .map((action) => (
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

      {/* Dialog para editar fechas */}
      <Dialog open={openEditDates} onClose={() => setOpenEditDates(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Fechas del Viaje</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Fecha de Inicio"
              type="date"
              value={editDateI}
              onChange={(e) => setEditDateI(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                min: new Date().toISOString().split('T')[0] // No permitir fechas anteriores a hoy
              }}
            />
            <TextField
              label="Fecha de Fin"
              type="date"
              value={editDateF}
              onChange={(e) => setEditDateF(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                min: editDateI || new Date().toISOString().split('T')[0] // No permitir fechas anteriores a la fecha de inicio
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDates(false)}>Cancelar</Button>
          <Button onClick={handleUpdateTripDates} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar ubicaciones */}
      <Dialog
        open={openEditLocations}
        onClose={() => setOpenEditLocations(false)}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          onEntered: () => {
            // Inicializar autocompletados cuando el Dialog esté completamente montado
            if (isGoogleMapsLoaded && window.google && window.google.maps) {
              setTimeout(() => {
                // Inicializar autocompletado para origen
                if (originAutocompleteRef.current) {
                  const inputElement = originAutocompleteRef.current.querySelector('input');
                  if (inputElement) {
                    const hasAutocomplete = (inputElement as any).__autocomplete;
                    if (!hasAutocomplete) {
                      const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
                        types: ['geocode']
                      });

                      (inputElement as any).__autocomplete = autocomplete;

                      autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (place.geometry && place.geometry.location) {
                          const location = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                          };
                          setEditOrigin(place.formatted_address || place.name || '');
                          setEditOriginCoords(location);
                        }
                      });

                      setOriginAutocomplete(autocomplete);
                    }
                  }
                }

                // Inicializar autocompletado para destino
                if (destinationAutocompleteRef.current) {
                  const inputElement = destinationAutocompleteRef.current.querySelector('input');
                  if (inputElement) {
                    const hasAutocomplete = (inputElement as any).__autocomplete;
                    if (!hasAutocomplete) {
                      const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
                        types: ['geocode']
                      });

                      (inputElement as any).__autocomplete = autocomplete;

                      autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (place.geometry && place.geometry.location) {
                          const location = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                          };
                          setEditDestination(place.formatted_address || place.name || '');
                          setEditDestinationCoords(location);
                        }
                      });

                      setDestinationAutocomplete(autocomplete);
                    }
                  }
                }
              }, 100);

              // Inicializar mapas si hay coordenadas
              setTimeout(() => {
                initializeMapsInModal();
              }, 300);
            }
          }
        }}
      >
        <DialogTitle>Editar Origen y Destino</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Origen */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                ref={originAutocompleteRef}
                label="Origen"
                value={editOrigin}
                onChange={(e) => setEditOrigin(e.target.value)}
                fullWidth
                placeholder="Ej: Buenos Aires, Argentina"
                helperText="Escribe para buscar ubicaciones o haz click en el mapa para seleccionar"
              />
              {editOrigin && !isGoogleMapsLoaded && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Cargando Google Maps...
                  </Typography>
                </Box>
              )}
              {editOriginCoords && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                    💡 Haz click en el mapa para seleccionar una ubicación más específica
                  </Typography>
                  <Box
                    ref={originMapModalRef}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                ref={destinationAutocompleteRef}
                label="Destino"
                value={editDestination}
                onChange={(e) => setEditDestination(e.target.value)}
                fullWidth
                placeholder="Ej: Córdoba, Argentina"
                helperText="Escribe para buscar ubicaciones o haz click en el mapa para seleccionar"
              />
              {editDestination && !isGoogleMapsLoaded && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Cargando Google Maps...
                  </Typography>
                </Box>
              )}
              {editDestinationCoords && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                    💡 Haz click en el mapa para seleccionar una ubicación más específica
                  </Typography>
                  <Box
                    ref={destinationMapModalRef}
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

            {/* Selección de Vehículo */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                Tipo de Vehículo
              </Typography>
              <ToggleButtonGroup
                value={editVehicle}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setEditVehicle(newValue);
                  }
                }}
                aria-label="tipo de vehículo"
                sx={{
                  display: 'flex',
                  gap: 1,
                  '& .MuiToggleButton-root': {
                    flex: 1,
                    flexDirection: 'column',
                    gap: 1,
                    py: 2,
                    borderRadius: 2,
                    border: '2px solid #E0E0E0',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.05)',
                      borderColor: '#1976D2',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      borderColor: '#1976D2',
                      color: '#1976D2',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.15)',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="auto" aria-label="auto">
                  <DirectionsCar sx={{ fontSize: 32 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Auto
                  </Typography>
                </ToggleButton>
                <ToggleButton value="avion" aria-label="avión">
                  <Flight sx={{ fontSize: 32 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Avión
                  </Typography>
                </ToggleButton>
                <ToggleButton value="caminando" aria-label="caminando">
                  <DirectionsWalk sx={{ fontSize: 32 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Caminando
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEditLocations(false);
            setEditOriginCoords(null);
            setEditDestinationCoords(null);
          }}>Cancelar</Button>
          <Button
            onClick={handleUpdateTripLocations}
            variant="contained"
            disabled={!editOrigin || !editDestination || !editOriginCoords || !editDestinationCoords}
          >
            Guardar
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

      {/* Dialog para confirmar eliminación del viaje */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !deletingTrip && setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
          Eliminando el Viaje
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro que deseas eliminar el viaje <strong>{trip?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Se eliminará el viaje para todos los participantes.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={deletingTrip}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={deletingTrip ? <CircularProgress size={16} color="inherit" /> : <Delete />}
            onClick={handleDeleteTrip}
            disabled={deletingTrip}
          >
            {deletingTrip ? 'Eliminando...' : 'Eliminar Viaje'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
