'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Backdrop,
  Avatar,
} from '@mui/material';
import {
  TravelExplore,
  Assignment,
  People,
  BarChart,
  PlayArrow,
} from '@mui/icons-material';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        setShowWelcome(true);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6">Preparando tu aventura...</Typography>
        </Box>
      </Backdrop>
    );
  }

  if (!showWelcome) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section con gradiente */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #03a9f4 0%, #29b6f6 50%, #4fc3f7 100%)',
        py: 12,
        mb: 8
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 4,
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              <TravelExplore sx={{ fontSize: 60 }} />
            </Avatar>
            
            <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
                TravelMate
            </Typography>
            
            <Typography variant="h5" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', maxWidth: 600, mx: 'auto' }}>
                Tu compañero perfecto para descubrir el mundo
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 6, color: 'rgba(255,255,255,0.8)', maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
              Planifica, organiza y disfruta de tus aventuras con nuestra aplicación inteligente de gestión de viajes. 
              Conecta con otros viajeros, comparte experiencias y crea recuerdos inolvidables.
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/login')}
                sx={{ 
                  px: 6, 
                  py: 2,
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Comenzar Aventura
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/login')}
                sx={{ 
                  px: 6, 
                  py: 2,
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Explorar Demo
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>

        {/* Features Grid */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 8 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card sx={{ 
              height: '100%', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(3, 169, 244, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 3,
                  backdropFilter: 'blur(10px)',
                }}>
                  <Assignment sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
                  Planificación Inteligente
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Organiza tus viajes con herramientas avanzadas de planificación, 
                  itinerarios automáticos y recomendaciones personalizadas.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card sx={{ 
              height: '100%', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #ff7043 0%, #ffab91 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(255, 112, 67, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 3,
                  backdropFilter: 'blur(10px)',
                }}>
                  <People sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
                  Colaboración
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Conecta con otros viajeros, comparte experiencias y 
                  crea grupos de viaje para aventuras inolvidables.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card sx={{ 
              height: '100%', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #29b6f6 0%, #4fc3f7 100%)',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(41, 182, 246, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 3,
                  backdropFilter: 'blur(10px)',
                }}>
                  <BarChart sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
                  Estadísticas
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                  Analiza tus gastos, destinos visitados y experiencias 
                  con gráficos detallados y reportes personalizados.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Estadísticas */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" sx={{ textAlign: 'center', fontWeight: 700, mb: 6, color: 'text.primary' }}>
            Únete a nuestra comunidad
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card sx={{ textAlign: 'center', p: 3, background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)', color: 'white' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>10K+</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>Viajeros Activos</Typography>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card sx={{ textAlign: 'center', p: 3, background: 'linear-gradient(135deg, #ff7043 0%, #ffab91 100%)', color: 'white' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>50K+</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>Viajes Planificados</Typography>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card sx={{ textAlign: 'center', p: 3, background: 'linear-gradient(135deg, #29b6f6 0%, #4fc3f7 100%)', color: 'white' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>100+</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>Países Cubiertos</Typography>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card sx={{ textAlign: 'center', p: 3, background: 'linear-gradient(135deg, #66bb6a 0%, #81c784 100%)', color: 'white' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>4.9★</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>Calificación</Typography>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center' }}>
          <Card sx={{ 
            maxWidth: 600, 
            mx: 'auto',
            background: 'linear-gradient(135deg, #03a9f4 0%, #ff7043 100%)',
            color: 'white',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }
          }}>
            <CardContent sx={{ p: 6, position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              ¿Listo para tu próxima aventura?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Únete a miles de viajeros que ya confían en TravelMate para planificar sus aventuras
              </Typography>
              <Button
                variant="contained"
                size="large"
              onClick={() => router.push('/login')}
                startIcon={<PlayArrow />}
                sx={{ 
                  px: 6, 
                  py: 2,
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
            >
              Comenzar Ahora
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}