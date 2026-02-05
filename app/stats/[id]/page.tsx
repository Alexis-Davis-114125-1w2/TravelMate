'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, API_BASE_URL, getAuthHeaders } from '@/lib/api';
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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
} from '@mui/material';
import {
    ArrowBack,
    TravelExplore,
    CalendarToday,
    LocationOn,
    People,
    AttachMoney,
    AccountBalanceWallet,
    TrendingUp,
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
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// Tipos para las estadísticas del viaje
interface TripStats {
    tripId: number;
    tripName: string;
    destination: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    status: string;

    // Participantes
    totalParticipants: number;
    participantsList: Array<{
        id: number;
        userName: string;
        email: string;
        profilePicture: string;
    }>;

    // Gastos generales
    totalSpent: number;
    initialGeneralBudget: number;
    currentGeneralBalance: number;
    generalBudgetUsagePercent: number;

    // Gastos personales del usuario
    userPersonalSpent: number;
    userInitialPersonalBudget: number;
    userCurrentPersonalBalance: number;
    userPersonalBudgetUsagePercent: number;

    // Gastos por día
    dailyExpenses: Array<{
        date: string;
        dayNumber: number;
        totalExpense: number;
        expenseCount: number;
    }>;

    // Días más gastados
    topExpensiveDays: Array<{
        date: string;
        dayNumber: number;
        totalExpense: number;
        expenseCount: number;
    }>;

    //Días más gastados INDIVIDUALES
    topIndividualExpensiveDays: Array<{
        date: string;
        dayNumber: number;
        totalExpense: number;
        expenseCount: number;
    }>;

    // Gastos por categoría
    expensesByCategory: Array<{
        category: string;
        totalAmount: number;
        expenseCount: number;
        percentage: number;
    }>;

    // Gastos por participante
    expensesByParticipant: Array<{
        userId: number;
        userName: string;
        totalSpent: number;
        expenseCount: number;
    }>;

    // Promedio diario
    averageDailyExpense: number;

    currency: string;
}

export default function TripStatsPage() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const tripId = params.id?.toString();

    const [stats, setStats] = useState<TripStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    // Cargar fotos de perfil de participantes de estadísticas
    useEffect(() => {
        const loadParticipantPhotosFromStats = async () => {
            if (!stats || !stats.participantsList || stats.participantsList.length === 0) return;

            try {
                const participantsWithPhotos = await Promise.all(
                    stats.participantsList.map(async (participant) => {
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
                            console.error(`Error cargando foto de ${participant.userName}:`, photoErr);
                        }

                        return participant;
                    })
                );

                // Actualizar stats con las fotos
                setStats(prevStats => {
                    if (!prevStats) return null;
                    return {
                        ...prevStats,
                        participantsList: participantsWithPhotos
                    };
                });
            } catch (error) {
                console.error('Error cargando fotos de participantes:', error);
            }
        };

        // Esperar un poco para que las estadísticas se carguen primero
        const timer = setTimeout(() => {
            loadParticipantPhotosFromStats();
        }, 1000);

        return () => clearTimeout(timer);
    }, [stats?.participantsList]); // Solo cuando cambie el número de participantes


    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id || !tripId) return;

            try {
                setLoadingStats(true);
                setError(null);

                const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
                const response = await api.getTripStatsBy(parseInt(tripId), userId);

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

        if (isAuthenticated && user && tripId) {
            fetchStats();
        }
    }, [isAuthenticated, user, tripId]);

    if (isLoading || loadingStats) {
        return (
            <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress color="inherit" size={60} />
                    <Typography variant="h6">Cargando estadísticas del viaje...</Typography>
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    };

    const COLORS = ['#03a9f4', '#66bb6a', '#ff7043', '#ab47bc', '#ffa726', '#26c6da', '#ef5350', '#9ccc65'];

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
                        Estadísticas del Viaje
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#424242' }}>
                                    {stats.tripName}
                                </Typography>
                                <Chip
                                    label={stats.status}
                                    color={stats.status === 'COMPLETED' ? 'success' : stats.status === 'ACTIVE' ? 'primary' : 'default'}
                                    size="small"
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationOn sx={{ fontSize: 18, color: '#666' }} />
                                    <Typography variant="body2" color="text.secondary">{stats.destination}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarToday sx={{ fontSize: 18, color: '#666' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDate(stats.startDate)} - {formatDate(stats.endDate)} ({stats.totalDays} días)
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <People sx={{ fontSize: 18, color: '#666' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {stats.totalParticipants} participantes
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* KPIs Grid - 6 cards */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
                            gap: 2,
                            mb: 3,
                        }}>
                            {/* 1. Total Gastado */}
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
                                    <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.4rem' }}>
                                        {formatCurrency(stats.totalSpent, stats.currency)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                                        {formatCurrency(stats.averageDailyExpense, stats.currency)}/día
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* 2. Presupuesto General */}
                            <Card sx={{
                                height: '100%',
                                background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                                        Billetera General
                                    </Typography>
                                    <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.4rem' }}>
                                        {formatCurrency(stats.currentGeneralBalance, stats.currency)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                                        {stats.generalBudgetUsagePercent.toFixed(0)}% usado de {formatCurrency(stats.initialGeneralBudget, stats.currency)}
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* 3. Presupuesto Personal */}
                            <Card sx={{
                                height: '100%',
                                background: 'linear-gradient(135deg, #66bb6a 0%, #81c784 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                                        Mi Billetera
                                    </Typography>
                                    <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.4rem' }}>
                                        {formatCurrency(stats.userCurrentPersonalBalance, stats.currency)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                                        {stats.userPersonalBudgetUsagePercent.toFixed(0)}% usado de {formatCurrency(stats.userInitialPersonalBudget, stats.currency)}
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* 4. Mi Gasto Personal */}
                            <Card sx={{
                                height: '100%',
                                background: 'linear-gradient(135deg, #ff7043 0%, #ffab91 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                                        Mi Gasto Total
                                    </Typography>
                                    <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.4rem' }}>
                                        {formatCurrency(stats.userPersonalSpent, stats.currency)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                                        {((stats.userPersonalSpent / stats.totalSpent) * 100).toFixed(0)}% del total
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* 5. Días de Viaje */}
                            <Card sx={{
                                height: '100%',
                                background: 'linear-gradient(135deg, #ffa726 0%, #ffb74d 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                                        Días de Viaje
                                    </Typography>
                                    <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        {stats.totalDays}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                                        {formatDate(stats.startDate)} - {formatDate(stats.endDate)}
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* 6. Participantes */}
                            <Card sx={{
                                height: '100%',
                                background: 'linear-gradient(135deg, #26c6da 0%, #4dd0e1 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography sx={{ opacity: 0.9, mb: 0.5, fontWeight: 600, fontSize: '0.85rem' }}>
                                        Participantes
                                    </Typography>
                                    <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        {stats.totalParticipants}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                                        Viajeros en total
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Dashboard Grid */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                            gap: 3,
                            mb: 3,
                        }}>
                            {/* 1. Gastos por Día (Escalera) - 2 columnas */}
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
                                        Gastos por Día
                                    </Typography>
                                    {stats.dailyExpenses.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={stats.dailyExpenses.map(d => ({
                                                name: `Día ${d.dayNumber}`,
                                                fecha: formatDate(d.date),
                                                gasto: d.totalExpense,
                                                cantidad: d.expenseCount
                                            }))}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                                                <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} />
                                                <YAxis stroke="#666" />
                                                <Tooltip
                                                    formatter={(value: number, name: string) => {
                                                        if (name === 'gasto') return [formatCurrency(value, stats.currency), 'Gasto'];
                                                        return [value, 'Cantidad'];
                                                    }}
                                                    labelFormatter={(label, payload) => {
                                                        if (payload && payload[0]) {
                                                            return `${label} (${payload[0].payload.fecha})`;
                                                        }
                                                        return label;
                                                    }}
                                                />
                                                <Legend />
                                                <Bar dataKey="gasto" fill="#ab47bc" radius={[8, 8, 0, 0]} name="Gasto del día" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No hay gastos registrados
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>

                            {/* 2. Distribución de Presupuestos - Pie */}
                            <Box>
                                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
                                        Estado de Billeteras
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={320}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Billetera General Restante', value: stats.currentGeneralBalance },
                                                    { name: 'Billetera General Usada', value: stats.initialGeneralBudget - stats.currentGeneralBalance },
                                                    { name: 'Mi Billetera Restante', value: stats.userCurrentPersonalBalance },
                                                    { name: 'Mi Billetera Usada', value: stats.userInitialPersonalBudget - stats.userCurrentPersonalBalance },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => {
                                                    if (!percent || percent === 0) return '';
                                                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                                                }}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                <Cell fill="#03a9f4" />
                                                <Cell fill="#0288d1" />
                                                <Cell fill="#66bb6a" />
                                                <Cell fill="#43a047" />
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value, stats.currency)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Box>

                            {/* 3. Top Días Más Gastados GENERALES - Tabla */}
<Box>
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
            Días Más Gastados (General)
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
            Gastos de la billetera general del viaje
        </Typography>
        {stats.topExpensiveDays && stats.topExpensiveDays.length > 0 ? (
            <TableContainer sx={{ maxHeight: 320, overflow: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Día</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Gasto General</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stats.topExpensiveDays.map((day, index) => (
                            <TableRow key={day.date} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FAFAFA' } }}>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        #{index + 1} - Día {day.dayNumber}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {formatDate(day.date)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#03a9f4' }}>
                                        {formatCurrency(day.totalExpense, stats.currency)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {day.expenseCount} gastos
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
                    No hay gastos generales
                </Typography>
            </Box>
        )}
    </Paper>
</Box>

                            {/* 4. Gastos por Categoría */}
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
                                        Gastos por Categoría
                                    </Typography>
                                    {stats.expensesByCategory.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, height: 350 }}>
                                            {/* Gráfico de Torta */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats.expensesByCategory}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={(props: any) => {
                                                                const { percentage } = props;
                                                                if (!percentage || percentage < 5) return ''; // Solo mostrar si es mayor al 5%
                                                                return `${percentage?.toFixed(0)}%`;
                                                            }}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="totalAmount"
                                                        >
                                                            {stats.expensesByCategory.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            formatter={(value: number) => formatCurrency(value, stats.currency)}
                                                            contentStyle={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                border: '1px solid #E0E0E0',
                                                                borderRadius: '8px',
                                                                padding: '10px'
                                                            }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Box>

                                            {/* Lista de Categorías */}
                                            <Box sx={{
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1.5,
                                                overflowY: 'auto',
                                                pr: 1,
                                                maxHeight: 350
                                            }}>
                                                {stats.expensesByCategory.map((category, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 2,
                                                            p: 1.5,
                                                            bgcolor: '#FAFAFA',
                                                            borderRadius: 2,
                                                            border: '1px solid #E0E0E0',
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                transform: 'translateX(4px)',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                borderColor: COLORS[index % COLORS.length]
                                                            }
                                                        }}
                                                    >
                                                        {/* Color indicator */}
                                                        <Box
                                                            sx={{
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '50%',
                                                                bgcolor: COLORS[index % COLORS.length],
                                                                flexShrink: 0
                                                            }}
                                                        />

                                                        {/* Información de la categoría */}
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: '#424242',
                                                                    mb: 0.5,
                                                                    fontSize: '0.9rem',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}
                                                            >
                                                                {category.category}
                                                            </Typography>

                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        color: COLORS[index % COLORS.length],
                                                                        fontSize: '0.95rem'
                                                                    }}
                                                                >
                                                                    {formatCurrency(category.totalAmount, stats.currency)}
                                                                </Typography>
                                                                <Chip
                                                                    label={`${category.percentage.toFixed(1)}%`}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: `${COLORS[index % COLORS.length]}20`,
                                                                        color: COLORS[index % COLORS.length],
                                                                        fontWeight: 600,
                                                                        fontSize: '0.7rem',
                                                                        height: '20px'
                                                                    }}
                                                                />
                                                            </Box>

                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                                {category.expenseCount} {category.expenseCount === 1 ? 'gasto' : 'gastos'}
                                                            </Typography>

                                                            {/* Barra de progreso */}
                                                            <Box sx={{ mt: 1, width: '100%', height: 6, bgcolor: '#E0E0E0', borderRadius: 1, overflow: 'hidden' }}>
                                                                <Box sx={{
                                                                    width: `${category.percentage}%`,
                                                                    height: '100%',
                                                                    bgcolor: COLORS[index % COLORS.length],
                                                                    transition: 'width 0.5s ease'
                                                                }} />
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No hay gastos por categoría
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>

                            {/* 5. Gastos Generales por Participante (quien PAGÓ) - GRÁFICO DE BARRAS */}
<Box>
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
            Gastos Generales por Participante
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
            Quién pagó los gastos de la billetera general
        </Typography>
        {stats.expensesByParticipant && stats.expensesByParticipant.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stats.expensesByParticipant} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="userName" type="category" stroke="#666" width={100} />
                    <Tooltip formatter={(value: number) => formatCurrency(value, stats.currency)} />
                    <Bar dataKey="totalSpent" fill="#03a9f4" radius={[0, 8, 8, 0]} name="Gastado" />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No hay gastos generales
                </Typography>
            </Box>
        )}
    </Paper>
</Box>

{/* 6. Lista de Gastos Generales por Participante */}
<Box>
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
            Detalle de Gastos Generales
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
            Participantes que pagaron gastos de la billetera general
        </Typography>
        {stats.expensesByParticipant && stats.expensesByParticipant.length > 0 ? (
            <Box sx={{ height: 320 }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxHeight: 320,
                    overflowY: 'auto',
                    pr: 1
                }}>
                    {stats.expensesByParticipant.map((participant, index) => {
                        const participantData = stats.participantsList?.find(
                            p => p.id === participant.userId
                        );

                        const totalExpenses = stats.expensesByParticipant.reduce(
                            (sum, p) => sum + (p.totalSpent || 0), 0
                        );
                        const percentage = totalExpenses > 0 
                            ? ((participant.totalSpent || 0) / totalExpenses) * 100 
                            : 0;

                        return (
                            <Box
                                key={`general-${participant.userId}-${index}`}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    bgcolor: '#E3F2FD',
                                    borderRadius: 2,
                                    border: '1px solid #03a9f4',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        transform: 'translateX(4px)',
                                        boxShadow: '0 2px 8px rgba(3,169,244,0.3)',
                                    }
                                }}
                            >
                                <Avatar
                                    src={participantData?.profilePicture || undefined}
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        border: '2px solid #03a9f4',
                                        bgcolor: '#03a9f4'
                                    }}
                                >
                                    {(participant.userName || 'U')[0].toUpperCase()}
                                </Avatar>

                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242', mb: 0.5 }}>
                                        {participant.userName || 'Usuario Desconocido'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#03a9f4' }}>
                                            {formatCurrency(participant.totalSpent || 0, stats.currency)}
                                        </Typography>
                                        <Chip
                                            label={`${percentage.toFixed(1)}%`}
                                            size="small"
                                            sx={{
                                                bgcolor: '#03a9f4',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Pagó {participant.expenseCount || 0} {(participant.expenseCount || 0) === 1 ? 'gasto general' : 'gastos generales'}
                                    </Typography>

                                    <Box sx={{ mt: 1, width: '100%', height: 8, bgcolor: '#E0E0E0', borderRadius: 1, overflow: 'hidden' }}>
                                        <Box sx={{
                                            width: `${Math.min(percentage, 100)}%`,
                                            height: '100%',
                                            bgcolor: '#03a9f4',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        ) : (
            <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No hay gastos generales
                </Typography>
            </Box>
        )}
    </Paper>
</Box>

{/* 7. NUEVO - Top Días Más Gastados INDIVIDUALES */}
<Box>
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', height: '100%', minHeight: 400 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#424242' }}>
            Mis Días Más Gastados (Individual)
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
            Gastos de tu billetera personal
        </Typography>
        {stats.topIndividualExpensiveDays && stats.topIndividualExpensiveDays.length > 0 ? (
            <TableContainer sx={{ maxHeight: 320, overflow: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Día</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Gasto Personal</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stats.topIndividualExpensiveDays.map((day, index) => (
                            <TableRow key={day.date} sx={{ '&:nth-of-type(odd)': { bgcolor: '#F1F8E9' } }}>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        #{index + 1} - Día {day.dayNumber}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {formatDate(day.date)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#66bb6a' }}>
                                        {formatCurrency(day.totalExpense, stats.currency)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {day.expenseCount} gastos
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
                    No tienes gastos individuales
                </Typography>
            </Box>
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
                            No hay estadísticas disponibles para este viaje
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}