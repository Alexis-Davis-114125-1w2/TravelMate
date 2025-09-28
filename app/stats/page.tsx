'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
  Add,
} from '@mui/icons-material';

export default function StatsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
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
            Estadísticas
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Estadísticas Generales
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Un vistazo completo a tu actividad de viajes y logros alcanzados
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 6 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(3, 169, 244, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Total de Viajes
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                      12
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      +3 este mes
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    backdropFilter: 'blur(10px)',
                  }}>
                    <TravelExplore sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #66bb6a 0%, #81c784 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(102, 187, 106, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Viajes Completados
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                      8
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      67% de éxito
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    backdropFilter: 'blur(10px)',
                  }}>
                    <CheckCircle sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #ff7043 0%, #ffab91 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(255, 112, 67, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Días Totales
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                      156
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      +24 este año
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    backdropFilter: 'blur(10px)',
                  }}>
                    <CalendarToday sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #29b6f6 0%, #4fc3f7 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(41, 182, 246, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Destino Favorito
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                      París
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      3 visitas
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    backdropFilter: 'blur(10px)',
                  }}>
                    <LocationOn sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(3, 169, 244, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Participantes Totales
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                      47
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      +12 este año
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    backdropFilter: 'blur(10px)',
                  }}>
                    <People sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #ff7043 0%, #ffab91 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(255, 112, 67, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Gasto Promedio
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                      $2,450
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      por viaje
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    backdropFilter: 'blur(10px)',
                  }}>
                    <AttachMoney sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Recent Activity */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid #e2e8f0',
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 4, color: 'text.primary' }}>
              Actividad Reciente
            </Typography>
            
            <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
              <ListItem sx={{ py: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: 'success.main',
                    width: 48,
                    height: 48,
                  }}>
                    <CheckCircle />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Viaje a París completado"
                  secondary={
                    <Box>
                      <Box sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                        Hace 2 días
                      </Box>
                      <Box sx={{ color: 'text.secondary' }}>
                        ¡Felicidades! Has completado exitosamente tu viaje a París
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              
              <Divider sx={{ my: 2 }} />
              
              <ListItem sx={{ py: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48,
                  }}>
                    <Add />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Nuevo viaje a Tokio creado"
                  secondary={
                    <Box>
                      <Box sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                        Hace 1 semana
                      </Box>
                      <Box sx={{ color: 'text.secondary' }}>
                        Has comenzado a planificar tu próxima aventura en Japón
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              
              <Divider sx={{ my: 2 }} />
              
              <ListItem sx={{ py: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: 'secondary.main',
                    width: 48,
                    height: 48,
                  }}>
                    <People />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="María se unió al viaje a Bariloche"
                  secondary={
                    <Box>
                      <Box sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                        Hace 2 semanas
                      </Box>
                      <Box sx={{ color: 'text.secondary' }}>
                        Tu amiga María se ha unido a tu viaje de montaña
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
