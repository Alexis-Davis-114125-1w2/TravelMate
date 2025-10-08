'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Backdrop,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  TravelExplore,
  WbSunny,
  Landscape,
  LocationCity,
  BeachAccess,
  Save,
  Cancel,
} from '@mui/icons-material';

export default function CreateTripPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  
  // Estados para el formulario - alineados con TripCreate DTO
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dateI, setDateI] = useState('');
  const [dateF, setDateF] = useState('');
  const [cost, setCost] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedIcon, setSelectedIcon] = useState('sun');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirección si no está autenticado
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
          <Typography variant="h6">Cargando...</Typography>
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

  // Manejar la selección de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validaciones básicas
    if (!name || !dateI || !dateF) {
      setError('Por favor, completa todos los campos obligatorios');
      setIsSubmitting(false);
      return;
    }

    if (new Date(dateI) >= new Date(dateF)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      setIsSubmitting(false);
      return;
    }

    if (!user?.id) {
      setError('No se pudo obtener la información del usuario');
      setIsSubmitting(false);
      return;
    }

    try {
      // Obtener el token JWT del localStorage
      const token = localStorage.getItem('authToken'); // ← CAMBIADO DE 'token' A 'authToken'
      
      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      // Crear FormData para enviar el trip con la imagen
      const formData = new FormData();
      
      // Crear el objeto trip según TripCreate DTO
      const tripData = {
        name: name,
        dateI: dateI,  // camelCase para que coincida con el DTO
        dateF: dateF,  // camelCase para que coincida con el DTO
        description: description || null,
        cost: cost ? parseFloat(cost) : 0,
        status: 'planning' // Agregar status
      };

      console.log('Datos del viaje a enviar:', tripData); // Para debug
      console.log('Fechas - Inicio:', dateI, 'Fin:', dateF); // Verificar que no estén vacías

      // Agregar el trip como JSON string
      formData.append('trip', new Blob([JSON.stringify(tripData)], {
        type: 'application/json'
      }));

      // Agregar la imagen si existe
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Llamada a la API - POST /api/trips/add
      const response = await fetch(`http://localhost:8080/api/trips/add?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // CRÍTICO: Enviar el JWT
        },
        body: formData,
        // NO incluir Content-Type header, el navegador lo establece automáticamente con boundary
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al crear el viaje');
      }

      const createdTrip = await response.json();
      console.log('Viaje creado exitosamente:', createdTrip);
      
      // Redirigir al dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error al crear el viaje:', error);
      setError(error instanceof Error ? error.message : 'Hubo un error al crear el viaje. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular duración en días
  const calculateDuration = () => {
    if (dateI && dateF) {
      const start = new Date(dateI);
      const end = new Date(dateF);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const iconOptions = [
    { value: 'sun', label: 'Sol/Playa' },
    { value: 'mountain', label: 'Montaña' },
    { value: 'city', label: 'Ciudad' },
    { value: 'beach', label: 'Playa' }
  ];

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
            <Add />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
              Crear Nuevo Viaje
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Planifica tu próxima aventura
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Header Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Crear Nuevo Viaje
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Planifica tu próxima aventura con todos los detalles importantes
          </Typography>
        </Box>

        {/* Mostrar errores */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card sx={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          <CardContent sx={{ p: 6 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ '& > *': { mb: 4 } }}>
            
              {/* Nombre del viaje */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Información Básica
                </Typography>
                <TextField
                  fullWidth
                  label="Nombre del viaje"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Aventura en París"
                  required
                  inputProps={{ maxLength: 150 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>
              
              {/* Descripción */}
              <TextField
                fullWidth
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu viaje..."
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              {/* Imagen del viaje */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Imagen del Viaje (Opcional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ borderRadius: 2 }}
                >
                  {imageFile ? 'Cambiar Imagen' : 'Subir Imagen'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {imageFile && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Archivo seleccionado: {imageFile.name}
                  </Typography>
                )}
              </Box>

              {/* Fechas */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Fechas del Viaje
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <TextField
                      fullWidth
                      label="Fecha de inicio"
                      type="date"
                      value={dateI}
                      onChange={(e) => setDateI(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <TextField
                      fullWidth
                      label="Fecha de fin"
                      type="date"
                      value={dateF}
                      onChange={(e) => setDateF(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Mostrar duración calculada */}
              {calculateDuration() > 0 && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
                    color: 'white',
                    '& .MuiAlert-icon': {
                      color: 'white'
                    }
                  }}
                >
                  Duración: {calculateDuration()} día{calculateDuration() !== 1 ? 's' : ''}
                </Alert>
              )}

              {/* Costo */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Presupuesto
                </Typography>
                <TextField
                  fullWidth
                  label="Presupuesto aproximado"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: 'primary.main', fontWeight: 600 }}>$</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>

              {/* Selector de icono */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                  Tipo de Viaje
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value)}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 2,
                      '& .MuiFormControlLabel-root': {
                        flex: '1 1 0',
                        margin: 0,
                        padding: 3,
                        borderRadius: 3,
                        border: '2px solid transparent',
                        transition: 'all 0.3s ease',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: 'rgba(3, 169, 244, 0.05)',
                          borderColor: 'primary.light',
                          transform: 'translateY(-2px)',
                        },
                        '&.Mui-checked': {
                          backgroundColor: 'rgba(3, 169, 244, 0.1)',
                          borderColor: 'primary.main',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 16px rgba(3, 169, 244, 0.2)',
                        }
                      }
                    }}
                  >
                    {iconOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio sx={{ color: 'primary.main' }} />}
                        label={
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            gap: 2, 
                            width: '100%',
                            textAlign: 'center'
                          }}>
                            <Avatar sx={{ 
                              bgcolor: selectedIcon === option.value ? 'primary.main' : 'grey.300',
                              width: 50, 
                              height: 50,
                              transition: 'all 0.3s ease',
                              mb: 1
                            }}>
                              {getIcon(option.value)}
                            </Avatar>
                            <Typography sx={{ 
                              fontWeight: 600, 
                              color: 'text.primary',
                              fontSize: '0.9rem'
                            }}>
                              {option.label}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>

              {/* Preview del viaje */}
              {name && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                    Vista Previa
                  </Typography>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
                    color: 'white',
                    borderRadius: 3,
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(3, 169, 244, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          width: 80, 
                          height: 80,
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255,255,255,0.3)'
                        }}>
                          {getIcon(selectedIcon)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h5" component="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {name}
                          </Typography>
                          {description && (
                            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                              {description}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {dateI && dateF && (
                              <Chip
                                label={`${new Date(dateI).toLocaleDateString('es-ES')} - ${new Date(dateF).toLocaleDateString('es-ES')}`}
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(255,255,255,0.2)',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            )}
                            {cost && (
                              <Chip
                                label={`$${parseFloat(cost).toLocaleString()}`}
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(255,255,255,0.2)',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* Botones */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 3, 
                pt: 4,
                borderTop: '1px solid rgba(0,0,0,0.1)',
                mt: 4
              }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  startIcon={<Cancel />}
                  disabled={isSubmitting}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'rgba(3, 169, 244, 0.05)',
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #03a9f4 0%, #4fc3f7 100%)',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0288d1 0%, #29b6f6 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(3, 169, 244, 0.3)',
                    },
                    '&:disabled': {
                      background: 'grey.300',
                      color: 'grey.500',
                    }
                  }}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Viaje'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}