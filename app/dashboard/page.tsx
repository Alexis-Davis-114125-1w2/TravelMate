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
  Chip,
  Avatar,
  CircularProgress,
  Backdrop,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
} from '@mui/icons-material';

interface TripWithParticipants extends Trip {
  participantCount?: number;
  joinCode?: string;
}

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

  const handleCopyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
          
          // Obtener el número de participantes para cada viaje
          const tripsWithParticipants = await Promise.all(
            tripsData.map(async (trip: Trip) => {
              try {
                const participantsResponse = await fetch(
                  `${API_BASE_URL}/api/trips/${trip.id}/participants?userId=${userId}`,
                { headers: getAuthHeaders() }
                );
      
                if (participantsResponse.ok) {
                  const participantsData = await participantsResponse.json();
                  // La respuesta tiene estructura: { success: true, data: [...], total: 2 }
                  const participantCount = participantsData.total || participantsData.data?.length || 0;
                  return { ...trip, participantCount };
                }
                return { ...trip, participantCount: trip.participants || 0 };
              } catch (err) {
                console.error(`Error al obtener participantes del viaje ${trip.id}:`, err);
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
        
        // Mostrar mensaje de éxito (opcional)
        alert('¡Te has unido al viaje exitosamente!');
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

  const handleDeleteTrip = async () => {
    if (!tripToDelete || !user?.id) return;
  
    try {
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    
      const response = await fetch(
        `${API_BASE_URL}/api/trips/${tripToDelete.id}/${userId}?userId=${userId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
    
      if (response.ok) {
        // Remover el viaje de la lista
        setTrips(trips.filter(t => t.id !== tripToDelete.id));
        setDeleteDialogOpen(false);
        setTripToDelete(null);
      } else {
        const errorText = await response.text();
        console.error('Error al eliminar viaje:', errorText);
        setError('No se pudo eliminar el viaje. Por favor, intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error al eliminar viaje:', err);
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

  const actions = [
    { icon: <Add />, name: 'Nuevo Viaje', action: () => router.push('/travel') },
    { icon: <BarChart />, name: 'Estadísticas', action: () => router.push('/stats') },
  ];

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <TravelExplore />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
              Mis Viajes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bienvenido, {user?.name || user?.email}
            </Typography>
          </Box>
          <IconButton
            color="inherit"
            onClick={() => router.push('/stats')}
            sx={{ mr: 1 }}
          >
            <BarChart />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={logout}
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            ¡Bienvenido de vuelta!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Aquí tienes un resumen de tus viajes y actividades recientes
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Action Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 6, flexWrap: 'wrap' }}>
          {/* Create New Trip Card */}
          <Card sx={{ 
            flex: '1 1 400px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
            color: 'white',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(3, 169, 244, 0.3)',
            },
            transition: 'all 0.3s ease',
          }} onClick={() => router.push('/travel')}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 64, 
                  height: 64,
                  backdropFilter: 'blur(10px)',
                }}>
                  <Add sx={{ fontSize: 32 }} />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    Crear Nuevo Viaje
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Planifica tu próxima aventura
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Join Trip Card */}
          <Card sx={{ 
            flex: '1 1 400px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #66bb6a 0%, #81c784 100%)',
            color: 'white',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(102, 187, 106, 0.3)',
            },
            transition: 'all 0.3s ease',
          }} onClick={() => setOpenJoinDialog(true)}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 64, 
                  height: 64,
                  backdropFilter: 'blur(10px)',
                }}>
                  <GroupAdd sx={{ fontSize: 32 }} />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    Unirme a un Viaje
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Únete con un código de invitación
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Trips Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 4, color: 'text.primary' }}>
            Tus Viajes
          </Typography>
          
          {trips.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <TravelExplore sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No tienes viajes todavía
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                ¡Comienza tu aventura creando tu primer viaje o únete a uno existente!
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => router.push('/travel')}
                >
                  Crear Mi Primer Viaje
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<GroupAdd />}
                  onClick={() => setOpenJoinDialog(true)}
                >
                  Unirme a un Viaje
                </Button>
              </Box>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {trips.map((trip) => {
                const isPlanning = trip.status?.toLowerCase() === 'planning';
                
                return (
                  <Box key={trip.id} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box display="flex" alignItems="flex-start" gap={3} mb={3} position= "relative">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setTripToDelete(trip);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'error.main',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'error.dark',
                              },
                              width: 32,
                              height: 32,
                            }}
                          >
                            <Delete sx={{ fontSize: 18 }} />
                          </IconButton>
                          <Avatar sx={{ 
                            bgcolor: trip.status === 'completed' ? 'success.main' : trip.status === 'planning' ? 'primary.main' : 'warning.main', 
                            width: 56, 
                            height: 56 
                          }}>
                            {getIcon(trip.image || 'default')}
                          </Avatar>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                              {trip.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
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

                        {/* Join Code Section */}
                        {trip.joinCode && (
                          <Box sx={{ 
                            mb: 3, 
                            p: 2, 
                            bgcolor: 'action.hover', 
                            borderRadius: 1,
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
                                <ContentCopy sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Box>
                            {copiedCode === trip.joinCode && (
                              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                                ¡Código copiado!
                              </Typography>
                            )}
                          </Box>
                        )}

                        <Box sx={{ mb: 3 }}>
                          <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                            <Schedule sx={{ fontSize: 20, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {formatDate(trip.dateI)} - {formatDate(trip.dateF)}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1.5}>
                            <People sx={{ fontSize: 20, color: 'secondary.main' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {trip.participantCount || trip.participants || 0} {(trip.participantCount || trip.participants || 0) === 1 ? 'persona' : 'personas'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>

                      <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                        {isPlanning ? (
                          <>
                            <Button
                              size="medium"
                              startIcon={<Place />}
                              onClick={() => router.push(`/trip/${trip.id}/destinations`)}
                              sx={{ flexGrow: 1, fontWeight: 600 }}
                            >
                              Destinos
                            </Button>
                            <Button
                              size="medium"
                              startIcon={<PersonAdd />}
                              variant="outlined"
                              onClick={() => router.push(`/trip/${trip.id}/details`)}
                              sx={{ flexGrow: 1, fontWeight: 600 }}
                            >
                              Ver Detalles
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="medium"
                              startIcon={<TrendingUp />}
                              onClick={() => router.push(`/trip/${trip.id}/stats`)}
                              sx={{ flexGrow: 1, fontWeight: 600 }}
                            >
                              Ver Stats
                            </Button>
                            <Button
                              size="medium"
                              startIcon={<Visibility />}
                              variant="outlined"
                              onClick={() => router.push(`/trip/${trip.id}/details`)}
                              sx={{ flexGrow: 1, fontWeight: 600 }}
                            >
                              Detalles
                            </Button>
                          </>
                        )}
                      </CardActions>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Quick Stats */}
        {trips.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 4, color: 'text.primary' }}>
              Resumen de Actividad
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
                  color: 'white',
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {trips.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                    Viajes Totales
                  </Typography>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: 'linear-gradient(135deg, #66bb6a 0%, #81c784 100%)',
                  color: 'white',
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {trips.filter(t => t.status?.toLowerCase() === 'completed').length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                    Completados
                  </Typography>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: 'linear-gradient(135deg, #ff7043 0%, #ffab91 100%)',
                  color: 'white',
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {trips.filter(t => t.status?.toLowerCase() === 'planning').length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                    Planificando
                  </Typography>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: 'linear-gradient(135deg, #29b6f6 0%, #4fc3f7 100%)',
                  color: 'white',
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {trips.reduce((acc, trip) => acc + (trip.participantCount || trip.participants || 0), 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                    Participantes
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Box>
        )}
      </Container>

      {/* Join Trip Dialog */}
      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} maxWidth="sm" fullWidth>
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

      {/* Delete Trip Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>¿Eliminar viaje?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            ¿Estás seguro que deseas eliminar el viaje <strong>{tripToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteTrip}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}