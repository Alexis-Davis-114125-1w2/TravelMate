'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Backdrop,
  Grid,
  Paper,
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
  ShoppingCart,
} from '@mui/icons-material';

// Tipos para las estadísticas
interface UserStats {
  totalTrips: number;
  completedTrips: number;
  planningTrips: number;
  activeTrips: number;
  totalDaysTraveled: number;
  totalSpent: number;
  averageSpentPerTrip: number;
  mostExpensiveTrip: {
    tripId: number;
    tripName: string;
    totalExpense: number;
    currency: string;
  } | null;
  mostTraveledLocation: string | null;
  mostTraveledLocationCount: number | null;
  monthlyTrips: Array<{
    month: string;
    monthName: string;
    tripCount: number;
  }>;
  monthlyExpenses: Array<{
    month: string;
    monthName: string;
    totalExpense: number;
    currency: string;
  }>;
  topExpensiveTrips: Array<{
    tripId: number;
    tripName: string;
    totalExpense: number;
    currency: string;
  }>;
  totalParticipants: number;
}

export default function StatsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoadingStats(true);
        setError(null);

        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        const response = await api.getUserStats(userId);

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          const errorText = await response.text();
          setError('Error al cargar estadísticas: ' + errorText);
        }
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        setError('Error de conexión al cargar estadísticas');
      } finally {
        setLoadingStats(false);
      }
    };

    if (isAuthenticated && user) {
      fetchStats();
    }
  }, [isAuthenticated, user]);

  if (isLoading || loadingStats) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6">Cargando estadísticas...</Typography>
        </Box>
      </Backdrop>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatCurrency = (amount: number, currency: string = 'PESOS') => {
    const formatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'DOLARES' ? 'USD' : currency === 'EUROS' ? 'EUR' : 'ARS',
    });
    return formatter.format(amount);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: '#424242', borderBottom: '1px solid #E0E0E0' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.back()}
            sx={{ mr: 2, color: '#666' }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 600, color: '#424242' }}>
            Estadísticas
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#ffebee', borderRadius: 2, color: '#c62828' }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {stats && (
          <>
            {/* Header Section */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: '#424242' }}>
                Tus Estadísticas de Viajes
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Análisis completo de tu actividad de viajes y gastos
              </Typography>
            </Box>

            {/* Stats Cards Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Total de Viajes */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(3, 169, 244, 0.3)' },
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography sx={{ opacity: 0.9, mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                          Total de Viajes
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {stats.totalTrips}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                          {stats.completedTrips} completados
                        </Typography>
                      </Box>
                      <TravelExplore sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Viajes Completados */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #66bb6a 0%, #81c784 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(102, 187, 106, 0.3)' },
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography sx={{ opacity: 0.9, mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                          Completados
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {stats.completedTrips}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                          {stats.totalTrips > 0 ? Math.round((stats.completedTrips / stats.totalTrips) * 100) : 0}% del total
                        </Typography>
                      </Box>
                      <CheckCircle sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Días Totales */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #ff7043 0%, #ffab91 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(255, 112, 67, 0.3)' },
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography sx={{ opacity: 0.9, mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                          Días Totales
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {stats.totalDaysTraveled}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                          {stats.totalTrips > 0 ? Math.round(stats.totalDaysTraveled / stats.totalTrips) : 0} días/viaje
                        </Typography>
                      </Box>
                      <CalendarToday sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Total Gastado */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #ab47bc 0%, #ba68c8 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(171, 71, 188, 0.3)' },
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography sx={{ opacity: 0.9, mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                          Total Gastado
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.8rem' }}>
                          {formatCurrency(stats.totalSpent, 'PESOS')}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                          {formatCurrency(stats.averageSpentPerTrip, 'PESOS')} promedio
                        </Typography>
                      </Box>
                      <AttachMoney sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Gráficos y Análisis */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Viajes por Mes */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#424242' }}>
                    Viajes por Mes
                  </Typography>
                  {stats.monthlyTrips.length > 0 ? (
                    <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                      {stats.monthlyTrips.map((month, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#666' }}>
                              {month.monthName}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#424242' }}>
                              {month.tripCount} {month.tripCount === 1 ? 'viaje' : 'viajes'}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            height: 24, 
                            bgcolor: '#E3F2FD', 
                            borderRadius: 1,
                            position: 'relative',
                            overflow: 'hidden',
                          }}>
                            <Box sx={{
                              height: '100%',
                              width: `${(month.tripCount / Math.max(...stats.monthlyTrips.map(m => m.tripCount))) * 100}%`,
                              bgcolor: '#03a9f4',
                              transition: 'width 0.5s ease',
                            }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No hay datos de viajes por mes
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* Gastos por Mes */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#424242' }}>
                    Gastos por Mes
                  </Typography>
                  {stats.monthlyExpenses.length > 0 ? (
                    <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                      {stats.monthlyExpenses.map((month, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#666' }}>
                              {month.monthName}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#424242' }}>
                              {formatCurrency(month.totalExpense, month.currency)}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            height: 24, 
                            bgcolor: '#F3E5F5', 
                            borderRadius: 1,
                            position: 'relative',
                            overflow: 'hidden',
                          }}>
                            <Box sx={{
                              height: '100%',
                              width: `${(month.totalExpense / Math.max(...stats.monthlyExpenses.map(m => m.totalExpense))) * 100}%`,
                              bgcolor: '#ab47bc',
                              transition: 'width 0.5s ease',
                            }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No hay datos de gastos por mes
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Información Adicional */}
            <Grid container spacing={3}>
              {/* Destino Más Visitado */}
              {stats.mostTraveledLocation && (
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid #E0E0E0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ fontSize: 32, color: '#03a9f4', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                        Destino Favorito
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#424242' }}>
                      {stats.mostTraveledLocation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Visitado {stats.mostTraveledLocationCount} {stats.mostTraveledLocationCount === 1 ? 'vez' : 'veces'}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* Viaje Más Costoso */}
              {stats.mostExpensiveTrip && (
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid #E0E0E0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ShoppingCart sx={{ fontSize: 32, color: '#ab47bc', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                        Viaje Más Costoso
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#424242' }}>
                      {stats.mostExpensiveTrip.tripName}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#ab47bc' }}>
                      {formatCurrency(stats.mostExpensiveTrip.totalExpense, stats.mostExpensiveTrip.currency)}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* Total Participantes */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid #E0E0E0', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People sx={{ fontSize: 32, color: '#66bb6a', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                      Participantes Totales
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#424242' }}>
                    {stats.totalParticipants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En todos tus viajes
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Top Viajes Más Costosos */}
            {stats.topExpensiveTrips.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid #E0E0E0', mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#424242' }}>
                  Top Viajes Más Costosos
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {stats.topExpensiveTrips.slice(0, 5).map((trip, index) => (
                    <Box key={trip.tripId} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      bgcolor: index % 2 === 0 ? '#FAFAFA' : 'white',
                      borderRadius: 1,
                    }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                          {index + 1}. {trip.tripName}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#ab47bc' }}>
                        {formatCurrency(trip.totalExpense, trip.currency)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </>
        )}

        {!stats && !loadingStats && !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <TravelExplore sx={{ fontSize: 60, color: '#BDBDBD', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#666', mb: 2, fontWeight: 500 }}>
              No hay estadísticas disponibles
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Crea tu primer viaje para comenzar a ver estadísticas
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
