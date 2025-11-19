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
  CheckCircle,
  CalendarToday,
  LocationOn,
  People,
  AttachMoney,
  TrendingUp,
  ShoppingCart,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#ffebee', borderRadius: 2, color: '#c62828' }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {stats && (
          <>
            {/* Header Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#424242' }}>
                Panel de Estadísticas de Viajes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Análisis completo de tu actividad de viajes y gastos
              </Typography>
            </Box>

            {/* Stats Cards Grid - 6 KPIs en una fila */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
              gap: 2,
              mb: 3,
            }}>
              {/* 1. Total Viajes */}
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                    Total Viajes
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.totalTrips}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    {stats.completedTrips} completados
                  </Typography>
                </CardContent>
              </Card>

              {/* 2. Completados */}
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #66bb6a 0%, #81c784 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                    Completados
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.completedTrips}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    {stats.totalTrips > 0 ? Math.round((stats.completedTrips / stats.totalTrips) * 100) : 0}% del total
                  </Typography>
                </CardContent>
              </Card>

              {/* 3. Días Totales */}
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #ff7043 0%, #ffab91 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                    Días Totales
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.totalDaysTraveled}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    {stats.totalTrips > 0 ? Math.round(stats.totalDaysTraveled / stats.totalTrips) : 0} días/viaje
                  </Typography>
                </CardContent>
              </Card>

              {/* 4. Total Gastado */}
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #ab47bc 0%, #ba68c8 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                    Total Gastado
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.4rem', lineHeight: 1.2 }}>
                    {formatCurrency(stats.totalSpent, 'PESOS')}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    {formatCurrency(stats.averageSpentPerTrip, 'PESOS')} promedio
                  </Typography>
                </CardContent>
              </Card>

              {/* 5. Viaje Más Costoso */}
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #ab47bc 0%, #ba68c8 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                    Viaje Más Costoso
                  </Typography>
                  {stats.mostExpensiveTrip ? (
                    <>
                      <Typography variant="body2" component="div" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem', opacity: 0.95 }}>
                        {stats.mostExpensiveTrip.tripName}
                      </Typography>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {formatCurrency(stats.mostExpensiveTrip.totalExpense, stats.mostExpensiveTrip.currency)}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                      Sin datos
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* 6. Participantes Totales */}
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #66bb6a 0%, #81c784 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                    Participantes Totales
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.totalParticipants}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    En todos tus viajes
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Dashboard Grid - CSS Grid Layout con máximo 3 columnas */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 3,
            }}>
              {/* 1. Overview de Viajes - Ocupa 2 columnas */}
              <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
                    Overview de Viajes
                  </Typography>
                  {stats.monthlyTrips.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={stats.monthlyTrips.map(m => ({ name: m.monthName, viajes: m.tripCount, completados: Math.round(m.tripCount * 0.8) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="viajes" fill="#03a9f4" opacity={0.3} />
                        <Line type="monotone" dataKey="viajes" stroke="#03a9f4" strokeWidth={3} dot={{ fill: '#03a9f4', r: 5 }} />
                        <Line type="monotone" dataKey="completados" stroke="#66bb6a" strokeWidth={3} dot={{ fill: '#66bb6a', r: 5 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay datos disponibles
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* 2. Estado de Viajes - Donut */}
              <Box>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
                    Estado de Viajes
                  </Typography>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completados', value: stats.completedTrips },
                          { name: 'En Planificación', value: stats.planningTrips },
                          { name: 'Activos', value: stats.activeTrips },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          if (!percent || percent === 0) return '';
                          return `${name}: ${(percent * 100).toFixed(0)}%`;
                        }}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#66bb6a" />
                        <Cell fill="#ff7043" />
                        <Cell fill="#03a9f4" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>

              {/* 3. Días de Viaje - Área */}
              <Box>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
                    Días de Viaje
                  </Typography>
                  {stats.monthlyTrips.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={stats.monthlyTrips.map(m => ({ name: m.monthName, días: m.tripCount * 5 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip />
                        <Area type="monotone" dataKey="días" stroke="#ff7043" fill="#ff7043" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay datos disponibles
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* 4. Viajes por Mes - Barras */}
              <Box>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
                    Viajes por Mes
                  </Typography>
                  {stats.monthlyTrips.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={stats.monthlyTrips.map(m => ({ name: m.monthName, viajes: m.tripCount }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip />
                        <Bar dataKey="viajes" fill="#03a9f4" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay datos disponibles
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* 5. Gastos por Mes - Líneas */}
              <Box>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
                    Gastos por Mes
                  </Typography>
                  {stats.monthlyExpenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={stats.monthlyExpenses.map(m => ({ name: m.monthName, gastos: m.totalExpense }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip formatter={(value: number) => formatCurrency(value, 'PESOS')} />
                        <Line type="monotone" dataKey="gastos" stroke="#ab47bc" strokeWidth={3} dot={{ fill: '#ab47bc', r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay datos disponibles
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* 6. Top Viajes Costosos - Tabla */}
              <Box>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
                    Top Viajes Más Costosos
                  </Typography>
                  {stats.topExpensiveTrips.length > 0 ? (
                    <TableContainer sx={{ maxHeight: 320, overflow: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Viaje</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Gasto</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.topExpensiveTrips.slice(0, 5).map((trip, index) => (
                            <TableRow key={trip.tripId} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FAFAFA' } }}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {index + 1}. {trip.tripName}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#ab47bc' }}>
                                  {formatCurrency(trip.totalExpense, trip.currency)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay datos disponibles
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* 7. Destino Favorito */}
              <Box>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 300 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ fontSize: 28, color: '#03a9f4', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                      Destino Favorito
                    </Typography>
                  </Box>
                  {stats.mostTraveledLocation ? (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#424242' }}>
                        {stats.mostTraveledLocation}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Visitado {stats.mostTraveledLocationCount} {stats.mostTraveledLocationCount === 1 ? 'vez' : 'veces'}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay datos disponibles
                    </Typography>
                  )}
                </Paper>
              </Box>
            </Box>
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
