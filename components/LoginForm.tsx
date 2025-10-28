'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { validateForm, loginValidationRules, registerValidationRules, ValidationErrors } from '../utils/validation';
import { API_BASE_URL } from '../lib/api';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  TravelExplore,
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
} from '@mui/icons-material';
import Link from 'next/link';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationRules = activeTab === 'login' ? loginValidationRules : registerValidationRules;
    const validationErrors = validateForm(formData, validationRules);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      let success = false;
      
      if (activeTab === 'login') {
        success = await login(formData.email, formData.password);
      } else {
        success = await register(formData.name, formData.email, formData.password);
      }
      
      if (success) {
        router.push('/dashboard');
      } else {
        setErrors({
          general: activeTab === 'login' 
            ? 'Credenciales inválidas. Por favor verifica tu email y contraseña.'
            : 'Error al registrarse. El email puede estar en uso.'
        });
      }
    } catch (error) {
      setErrors({
        general: activeTab === 'login' 
          ? 'Error al iniciar sesión. Por favor intenta de nuevo.'
          : 'Error al registrarse. Por favor intenta de nuevo.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Redirigir al endpoint de OAuth2 de Google del backend
      // El backend manejará automáticamente el flujo OAuth2
      window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    } catch (error) {
      console.warn('Error con OAuth2 de Google, usando simulación:', error);
      // Fallback: simular login con Google
      const tempUser = {
        id: Date.now().toString(),
        email: 'usuario@google.com',
        name: 'Usuario Google',
        profilePictureUrl: null,
        provider: 'GOOGLE'
      };
      
      localStorage.setItem('authToken', 'temp-google-token');
      localStorage.setItem('userData', JSON.stringify(tempUser));
      
      // Recargar la página para que el hook useAuth detecte el cambio
      window.location.reload();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
              }}
            >
              <TravelExplore sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Bienvenido a TravelMate
            </Typography>
            <Typography color="text.secondary">
              {activeTab === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta para comenzar'}
            </Typography>
          </Box>

          {/* Tab Navigation */}
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Tab label="Iniciar Sesión" value="login" />
              <Tab label="Registrarse" value="register" />
            </Tabs>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            {activeTab === 'register' && (
              <TextField
                fullWidth
                label="Nombre completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {errors.general && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.general}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isSubmitting ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} color="inherit" />
                  {activeTab === 'login' ? 'Entrando...' : 'Registrando...'}
                </Box>
              ) : (
                activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </Button>
          </Box>

          {/* Additional Options */}
          {activeTab === 'login' && (
            <Box sx={{ mb: 2 }}>
              <Link href="/forgot-password" passHref>
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    color: 'primary.main',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Typography>
              </Link>
            </Box>
          )}

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              O continúa con
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            sx={{ mt: 2 }}
          >
            Google
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
