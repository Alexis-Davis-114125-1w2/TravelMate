'use client';

import { useAuth } from '../../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Trip } from '../../../../types/trip';
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
} from '@mui/material';
import {
  ArrowBack,
  TravelExplore,
  CheckCircle,
  CalendarToday,
  LocationOn,
  People,
  AttachMoney,
  TrendingUp,
  WbSunny,
  Landscape,
  LocationCity,
  Schedule,
  Assignment,
  Museum,
  DirectionsBoat,
} from '@mui/icons-material';

export default function TripStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripId, setTripId] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Resolve the params promise
    params.then((resolvedParams) => {
      setTripId(resolvedParams.id);
    });
  }, [params]);

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
      },
        {
      id: '4',
      name: 'Safari en Kenia',
      destination: 'Nairobi, Kenia',
      startDate: '2025-02-10',
      endDate: '2025-02-20',
      participants: 5,
      status: 'completed',
      image: 'sun'
    },
    {
      id: '5',
      name: 'Tour por Japón',
      destination: 'Tokio, Japón',
      startDate: '2025-04-01',
      endDate: '2025-04-15',
      participants: 6,
      status: 'planning',
      image: 'city'
    },
    {
      id: '6',
      name: 'Relax en Bali',
      destination: 'Bali, Indonesia',
      startDate: '2025-08-05',
      endDate: '2025-08-19',
      participants: 2,
      status: 'planning',
      image: 'sun'
    },
    {
      id: '7',
      name: 'Ruta por los Alpes',
      destination: 'Zermatt, Suiza',
      startDate: '2025-01-12',
      endDate: '2025-01-19',
      participants: 4,
      status: 'completed',
      image: 'mountain'
    }
    ];

    const foundTrip = mockTrips.find(t => t.id === tripId);
    setTrip(foundTrip || null);
  }, [tripId]);

  if (isLoading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6">Cargando estadísticas del viaje...</Typography>
        </Box>
      </Backdrop>
    );
  }

  if (!isAuthenticated || !trip) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getIcon = (image: string) => {
    switch (image) {
      case 'sun':
        return <WbSunny sx={{ fontSize: 50 }} />;
      case 'mountain':
        return <Landscape sx={{ fontSize: 50 }} />;
      case 'city':
        return <LocationCity sx={{ fontSize: 50 }} />;
      default:
        return <TravelExplore sx={{ fontSize: 50 }} />;
    }
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
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Estadísticas del Viaje
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Trip Info */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80 }}>
            {getIcon(trip.image || 'default')}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                  {trip.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {trip.destination}
                </Typography>
                <Box display="flex" alignItems="center" gap={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <People sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {trip.participants} participantes
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(trip.status)}
                    color={getStatusColor(trip.status) as any}
                    size="medium"
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Participantes
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {trip.participants}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <People />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Duración
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600, color: 'success.main' }}>
                      7 días
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <Schedule />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Estado
                    </Typography>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {getStatusLabel(trip.status)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                    <CheckCircle />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Gasto Total
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600, color: 'error.main' }}>
                      $4,200
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                    <AttachMoney />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Gasto por Persona
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                      $1,050
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                    <TrendingUp />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Actividades
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600, color: 'info.main' }}>
                      12
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                    <Assignment />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Activities */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Actividades del Viaje
          </Typography>
          
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <LocationOn />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Visita a la Torre Eiffel"
                secondary="Día 1 - $45 por persona"
              />
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Museum />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Museo del Louvre"
                secondary="Día 2 - $30 por persona"
              />
            </ListItem>
            
            <Divider variant="inset" component="li" />
            
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <DirectionsBoat />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Crucero por el Sena"
                secondary="Día 3 - $25 por persona"
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
}