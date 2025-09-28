'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Trip } from '../../types/trip';
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
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Divider,
  CircularProgress,
  Backdrop,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  TravelExplore,
  BarChart,
  Logout,
  Add,
  WbSunny,
  Landscape,
  LocationCity,
  CheckCircle,
  Schedule,
  People,
  TrendingUp,
  Visibility,
  Edit,
} from '@mui/icons-material';

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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
      }
    ];
    setTrips(mockTrips);
  }, []);

  if (isLoading) {
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
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'planning':
        return 'Planificando';
      case 'active':
        return 'En curso';
      default:
        return status;
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

        {/* Create New Trip Card */}
        <Card sx={{ 
          mb: 6, 
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
          color: 'white',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(3, 169, 244, 0.3)',
          },
          transition: 'all 0.3s ease',
        }} onClick={() => router.push('/travel')}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={4}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: 80, 
                height: 80,
                backdropFilter: 'blur(10px)',
              }}>
                <Add sx={{ fontSize: 40 }} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                  Crear Nuevo Viaje
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  Planifica tu próxima aventura y descubre nuevos destinos
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Haz clic aquí para comenzar a planificar tu próximo viaje con nuestras herramientas inteligentes
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Trips Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 4, color: 'text.primary' }}>
            Tus Viajes
          </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {trips.map((trip) => (
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
                    <Box display="flex" alignItems="flex-start" gap={3} mb={3}>
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

                    <Box sx={{ mb: 3 }}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                        <Schedule sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1.5}>
                        <People sx={{ fontSize: 20, color: 'secondary.main' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {trip.participants} personas
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
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
                      sx={{ flexGrow: 1, fontWeight: 600 }}
                    >
                      Detalles
                    </Button>
                  </CardActions>
                </Card>
            </Box>
          ))}
        </Box>
        </Box>

        {/* Quick Stats */}
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
                  {trips.filter(t => t.status === 'completed').length}
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
                  {trips.filter(t => t.status === 'planning').length}
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
                  {trips.reduce((acc, trip) => acc + trip.participants, 0)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                  Participantes
                </Typography>
              </Card>
            </Box>
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
    </Box>
  );
}
