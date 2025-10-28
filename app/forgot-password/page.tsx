'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '../../lib/api';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
} from '@mui/material';
import {
  LockReset,
  Email,
  Lock,
  VpnKey,
  ArrowBack,
} from '@mui/icons-material';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: email, 1: code, 2: password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const steps = ['Ingresa tu email', 'Verifica el código', 'Nueva contraseña'];

  // Timer para el reenvío de código
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && step === 1) {
      setCanResend(true);
    }
  }, [resendTimer, step]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Código enviado a tu email. Revisa tu bandeja de entrada.');
        setCanResend(false);
        setResendTimer(60);
        setTimeout(() => setStep(1), 2000);
      } else {
        setError(data.message || 'Error al enviar el código');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Código reenviado correctamente. Revisa tu email.');
        setCanResend(false);
        setResendTimer(60);
        setCode('');
      } else {
        setError(data.message || 'Error al reenviar el código');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Código verificado correctamente');
        setTimeout(() => setStep(2), 1500);
      } else {
        setError(data.message || 'Código inválido');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('¡Contraseña actualizada exitosamente! Redirigiendo...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.message || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
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
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
              }}
            >
              <LockReset sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Recuperar Contraseña
            </Typography>
            <Typography color="text.secondary">
              {step === 0 && 'Ingresa tu email para recibir un código'}
              {step === 1 && 'Ingresa el código que enviamos a tu email'}
              {step === 2 && 'Ingresa tu nueva contraseña'}
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Step 0: Email */}
          {step === 0 && (
            <Box component="form" onSubmit={handleSendCode}>
              <TextField
                fullWidth
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    Enviando...
                  </Box>
                ) : (
                  'Enviar Código'
                )}
              </Button>
            </Box>
          )}

          {/* Step 1: Verify Code */}
          {step === 1 && (
            <Box component="form" onSubmit={handleVerifyCode}>
              <TextField
                fullWidth
                label="Código de verificación"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={loading}
                margin="normal"
                inputProps={{
                  maxLength: 6,
                  style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKey />
                    </InputAdornment>
                  ),
                }}
                helperText="Revisa tu email. El código expira en 15 minutos."
              />

              {/* Resend button */}
              <Box sx={{ textAlign: 'center', my: 2 }}>
                {canResend ? (
                  <Button
                    onClick={handleResendCode}
                    disabled={loading}
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    ¿No recibiste el código? Reenviar
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Podrás reenviar el código en {resendTimer}s
                  </Typography>
                )}
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2, mb: 1, py: 1.5 }}
              >
                {loading ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    Verificando...
                  </Box>
                ) : (
                  'Verificar Código'
                )}
              </Button>
              <Button
                fullWidth
                variant="text"
                startIcon={<ArrowBack />}
                onClick={() => setStep(0)}
                disabled={loading}
              >
                Volver
              </Button>
            </Box>
          )}

          {/* Step 2: New Password */}
          {step === 2 && (
            <Box component="form" onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                label="Nueva contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                margin="normal"
                inputProps={{ minLength: 6 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
                helperText="Mínimo 6 caracteres"
              />
              <TextField
                fullWidth
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                margin="normal"
                inputProps={{ minLength: 6 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, py: 1.5 }}
              >
                {loading ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    Actualizando...
                  </Box>
                ) : (
                  'Cambiar Contraseña'
                )}
              </Button>
            </Box>
          )}

          {/* Back to login */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link href="/login" passHref>
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
                ← Volver al inicio de sesión
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}