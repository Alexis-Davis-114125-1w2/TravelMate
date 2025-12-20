'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Avatar,
    IconButton,
    Alert,
    CircularProgress,
    Divider,
    Backdrop,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
    InputAdornment,
} from '@mui/material';
import {
    ArrowBack,
    PhotoCamera,
    Save,
    Person,
    Email,
    DeleteOutline,
    VpnKey,
    Warning,
    Logout,
} from '@mui/icons-material';

interface UserData {
    id: number;
    name: string;
    email: string;
    profilePictureUrl: string | null;
    provider: string;
}

export default function ProfileEditPage() {
    const router = useRouter();
    
    // Estados del formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados para cambio de email
    const [emailChangeStep, setEmailChangeStep] = useState(0); // 0: nuevo email, 1: código, 2: confirmado
    const [newEmail, setNewEmail] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [openEmailDialog, setOpenEmailDialog] = useState(false);
    const [canResendEmail, setCanResendEmail] = useState(false);
    const [resendEmailTimer, setResendEmailTimer] = useState(0);

    // Estados para eliminación de cuenta
    const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const emailSteps = ['Nuevo email', 'Verificar código', 'Confirmar cambio'];

    // Cargar datos del usuario desde localStorage
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userDataStr = localStorage.getItem('userData');
                const token = localStorage.getItem('authToken');

                if (userDataStr) {
                    const userData: UserData = JSON.parse(userDataStr);
                    setUserId(userData.id);
                    setName(userData.name || '');
                    setEmail(userData.email || '');
                    setOriginalEmail(userData.email || '');

                    // Cargar la foto desde el API
                    if (token) {
                        try {
                            const photoResponse = await fetch('http://localhost:8080/api/profile/photo', {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });

                            if (photoResponse.ok) {
                                const photoUrl = await photoResponse.text();
                                setProfileImage(photoUrl);
                                setImagePreview(photoUrl);
                            }
                        } catch (photoErr) {
                            console.error('Error al cargar foto de perfil:', photoErr);
                            // Continuar sin foto si falla
                        }
                    }
                } else {
                    setError('No se encontraron datos de usuario. Por favor, inicia sesión nuevamente.');
                }
            } catch (err) {
                console.error('Error al cargar datos del usuario:', err);
                setError('Error al cargar los datos del perfil');
            } finally {
                setLoadingData(false);
            }
        };

        loadUserData();
    }, []);

    // Manejar selección de imagen
    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            setError('Por favor selecciona un archivo de imagen válido');
            return;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen debe ser menor a 5MB');
            return;
        }

        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setImagePreview(result);
            setProfileImage(result);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    // Eliminar foto de perfil
    const handleDeleteImage = () => {
        setImagePreview(null);
        setProfileImage(null);
    };

    // Timer para reenvío de código de email
    useEffect(() => {
        if (resendEmailTimer > 0) {
            const timer = setTimeout(() => setResendEmailTimer(resendEmailTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else if (resendEmailTimer === 0 && emailChangeStep === 1) {
            setCanResendEmail(true);
        }
    }, [resendEmailTimer, emailChangeStep]);

    // Manejar guardado (solo nombre e imagen, email se cambia por separado)
    const handleSave = async () => {
        // Validaciones
        if (!name.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError('No hay sesión activa. Por favor, inicia sesión nuevamente.');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:8080/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: originalEmail, // Mantener el email original
                    profilePictureUrl: profileImage,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar el perfil');
            }

            const updatedUser = await response.json();

            // Actualizar localStorage con los nuevos datos
            const currentUserData = localStorage.getItem('userData');
            if (currentUserData) {
                const userData = JSON.parse(currentUserData);
                const updatedUserData = {
                    ...userData,
                    name: updatedUser.name,
                };
                localStorage.setItem('userData', JSON.stringify(updatedUserData));
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                window.location.href = '/dashboard';
            }, 2000);
        } catch (err: any) {
            console.error('Error al guardar:', err);
            setError(err.message || 'Error al guardar los cambios. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Iniciar cambio de email
    const handleInitiateEmailChange = async () => {
        if (!newEmail.trim()) {
            setError('El nuevo email es obligatorio');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            setError('El formato del email no es válido');
            return;
        }

        if (newEmail === originalEmail) {
            setError('El nuevo email debe ser diferente al actual');
            return;
        }

        setEmailLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/api/profile/email/change/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ newEmail: newEmail.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setEmailChangeStep(1);
                setCanResendEmail(false);
                setResendEmailTimer(60);
            } else {
                setError(data.error || 'Error al enviar el código');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setEmailLoading(false);
        }
    };

    // Verificar código de cambio de email
    const handleVerifyEmailCode = async () => {
        if (!emailCode.trim()) {
            setError('El código es obligatorio');
            return;
        }

        setEmailLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/api/profile/email/change/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ code: emailCode.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setEmailChangeStep(2);
            } else {
                setError(data.error || 'Código inválido');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setEmailLoading(false);
        }
    };

    // Confirmar cambio de email
    const handleConfirmEmailChange = async () => {
        setEmailLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/api/profile/email/change/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ code: emailCode.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                // Actualizar email en localStorage
                const currentUserData = localStorage.getItem('userData');
                if (currentUserData) {
                    const userData = JSON.parse(currentUserData);
                    userData.email = newEmail;
                    localStorage.setItem('userData', JSON.stringify(userData));
                }
                
                setEmail(newEmail);
                setOriginalEmail(newEmail);
                setOpenEmailDialog(false);
                setEmailChangeStep(0);
                setNewEmail('');
                setEmailCode('');
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(data.error || 'Error al confirmar el cambio de email');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setEmailLoading(false);
        }
    };

    // Reenviar código de email
    const handleResendEmailCode = async () => {
        setEmailLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/api/profile/email/change/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ newEmail: newEmail.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setCanResendEmail(false);
                setResendEmailTimer(60);
                setEmailCode('');
            } else {
                setError(data.error || 'Error al reenviar el código');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setEmailLoading(false);
        }
    };

    // Eliminar cuenta
    const handleDeleteAccount = async () => {
        setDeletingAccount(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/api/profile/account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                // Limpiar localStorage y redirigir
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                router.push('/login');
            } else {
                setError(data.error || 'Error al eliminar la cuenta');
                setDeletingAccount(false);
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
            setDeletingAccount(false);
        }
    };

    // Loading inicial
    if (loadingData) {
        return (
            <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress color="inherit" size={60} />
                    <Typography variant="h6">Cargando perfil...</Typography>
                </Box>
            </Backdrop>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#FAFAFA',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        }}>
            {/* Header */}
            <Box sx={{
                bgcolor: 'white',
                borderBottom: '1px solid #E0E0E0',
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
            }}>
                <IconButton size="small" sx={{ color: '#666' }} onClick={() => window.history.back()}>
                    <ArrowBack />
                </IconButton>
                <Person sx={{ color: '#03a9f4', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#424242' }}>
                    Editar Perfil
                </Typography>
            </Box>

            {/* Main Content */}
            <Container maxWidth="md" sx={{ py: 4 }}>
                {/* Success Alert */}
                {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess(false)}>
                        ¡Perfil actualizado exitosamente!
                    </Alert>
                )}

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Profile Card */}
                <Paper sx={{
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: '1px solid #E0E0E0',
                }}>
                    {/* Profile Picture Section */}
                    <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242', mb: 3 }}>
                            Foto de Perfil
                        </Typography>

                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <Avatar
                                src={imagePreview || undefined}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    bgcolor: '#E3F2FD',
                                    color: '#1976D2',
                                    fontSize: 48,
                                    border: '3px solid #BBDEFB',
                                }}
                            >
                                {!imagePreview && <Person sx={{ fontSize: 60 }} />}
                            </Avatar>

                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    bgcolor: '#03a9f4',
                                    color: 'white',
                                    width: 36,
                                    height: 36,
                                    '&:hover': {
                                        bgcolor: '#0288D1',
                                    },
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <PhotoCamera sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Box>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageSelect}
                        />

                        {imagePreview && (
                            <Button
                                size="small"
                                startIcon={<DeleteOutline />}
                                onClick={handleDeleteImage}
                                sx={{
                                    color: '#f44336',
                                    textTransform: 'none',
                                    mt: 1,
                                }}
                            >
                                Eliminar foto
                            </Button>
                        )}

                        <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', mt: 1 }}>
                            JPG, PNG o GIF (máximo 5MB)
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Form Fields */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Name Field */}
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#424242', mb: 1 }}>
                                Nombre
                            </Typography>
                            <TextField
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ingresa tu nombre"
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <Person sx={{ color: '#999', mr: 1, fontSize: 20 }} />
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#FAFAFA',
                                        '&:hover': {
                                            bgcolor: '#F5F5F5',
                                        },
                                        '&.Mui-focused': {
                                            bgcolor: 'white',
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Email Field */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#424242' }}>
                                    Email
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                        setOpenEmailDialog(true);
                                        setEmailChangeStep(0);
                                        setNewEmail('');
                                        setEmailCode('');
                                    }}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Cambiar Email
                                </Button>
                            </Box>
                            <TextField
                                fullWidth
                                type="email"
                                value={email}
                                disabled
                                placeholder="tu@email.com"
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <Email sx={{ color: '#999', mr: 1, fontSize: 20 }} />
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#FAFAFA',
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => window.history.back()}
                            disabled={loading}
                            sx={{
                                borderColor: '#E0E0E0',
                                color: '#666',
                                textTransform: 'none',
                                fontWeight: 500,
                                borderRadius: 2,
                                '&:hover': {
                                    borderColor: '#BDBDBD',
                                    bgcolor: '#FAFAFA',
                                },
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            onClick={handleSave}
                            disabled={loading}
                            sx={{
                                bgcolor: '#03a9f4',
                                textTransform: 'none',
                                fontWeight: 500,
                                borderRadius: 2,
                                px: 4,
                                '&:hover': {
                                    bgcolor: '#0288D1',
                                },
                            }}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Box>
                </Paper>

                {/* Info Cards */}
                <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Paper sx={{
                        p: 3,
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: '1px solid #E0E0E0',
                        bgcolor: '#E3F2FD',
                    }}>
                        <Typography variant="body2" sx={{ color: '#1976D2', fontWeight: 600, mb: 1 }}>
                            Seguridad
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64B5F6' }}>
                            Tu información está protegida y encriptada
                        </Typography>
                    </Paper>

                    <Paper sx={{
                        p: 3,
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: '1px solid #E0E0E0',
                        bgcolor: '#E8F5E9',
                    }}>
                        <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600, mb: 1 }}>
                            Privacidad
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                            Solo tú puedes ver y editar esta información
                        </Typography>
                    </Paper>

                    {/* Sección de eliminación de cuenta */}
                    <Paper sx={{
                        p: 4,
                        mt: 3,
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: '1px solid #FFEBEE',
                        bgcolor: '#FFF5F5',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Warning sx={{ color: '#f44336', fontSize: 28 }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                                    Zona de Peligro
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Acciones irreversibles
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                            Si eliminas tu cuenta, se perderán todos tus datos de forma permanente. Esta acción no se puede deshacer.
                        </Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutline />}
                            onClick={() => setOpenDeleteAccountDialog(true)}
                            sx={{ textTransform: 'none' }}
                        >
                            Eliminar Cuenta Permanentemente
                        </Button>
                    </Paper>
                </Box>

                {/* Dialog para cambio de email */}
                <Dialog
                    open={openEmailDialog}
                    onClose={() => {
                        if (!emailLoading) {
                            setOpenEmailDialog(false);
                            setEmailChangeStep(0);
                            setNewEmail('');
                            setEmailCode('');
                            setError(null);
                        }
                    }}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Cambiar Email
                    </DialogTitle>
                    <DialogContent>
                        <Stepper activeStep={emailChangeStep} sx={{ mb: 3, mt: 2 }}>
                            {emailSteps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {emailChangeStep === 0 && (
                            <Box>
                                <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                                    Se enviará un código de verificación a tu email actual: <strong>{originalEmail}</strong>
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Nuevo email"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    disabled={emailLoading}
                                    margin="normal"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        )}

                        {emailChangeStep === 1 && (
                            <Box>
                                <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                                    Ingresa el código que enviamos a <strong>{originalEmail}</strong>
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Código de verificación"
                                    value={emailCode}
                                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    disabled={emailLoading}
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
                                <Box sx={{ textAlign: 'center', my: 2 }}>
                                    {canResendEmail ? (
                                        <Button
                                            onClick={handleResendEmailCode}
                                            disabled={emailLoading}
                                            size="small"
                                            sx={{ textTransform: 'none' }}
                                        >
                                            ¿No recibiste el código? Reenviar
                                        </Button>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Podrás reenviar el código en {resendEmailTimer}s
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {emailChangeStep === 2 && (
                            <Box>
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Código verificado correctamente. ¿Confirmas el cambio de email a <strong>{newEmail}</strong>?
                                </Alert>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setOpenEmailDialog(false);
                                setEmailChangeStep(0);
                                setNewEmail('');
                                setEmailCode('');
                                setError(null);
                            }}
                            disabled={emailLoading}
                        >
                            Cancelar
                        </Button>
                        {emailChangeStep === 0 && (
                            <Button
                                variant="contained"
                                onClick={handleInitiateEmailChange}
                                disabled={emailLoading || !newEmail.trim()}
                                startIcon={emailLoading ? <CircularProgress size={16} /> : null}
                            >
                                {emailLoading ? 'Enviando...' : 'Enviar Código'}
                            </Button>
                        )}
                        {emailChangeStep === 1 && (
                            <Button
                                variant="contained"
                                onClick={handleVerifyEmailCode}
                                disabled={emailLoading || !emailCode.trim() || emailCode.length !== 6}
                                startIcon={emailLoading ? <CircularProgress size={16} /> : null}
                            >
                                {emailLoading ? 'Verificando...' : 'Verificar Código'}
                            </Button>
                        )}
                        {emailChangeStep === 2 && (
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleConfirmEmailChange}
                                disabled={emailLoading}
                                startIcon={emailLoading ? <CircularProgress size={16} /> : null}
                            >
                                {emailLoading ? 'Confirmando...' : 'Confirmar Cambio'}
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>

                {/* Dialog para eliminar cuenta */}
                <Dialog
                    open={openDeleteAccountDialog}
                    onClose={() => !deletingAccount && setOpenDeleteAccountDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
                        Eliminar Cuenta Permanentemente
                    </DialogTitle>
                    <DialogContent>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Esta acción no se puede deshacer
                        </Alert>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            ¿Estás seguro que deseas eliminar tu cuenta?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Se eliminarán todos tus datos, viajes, y toda la información asociada a tu cuenta de forma permanente.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setOpenDeleteAccountDialog(false)}
                            disabled={deletingAccount}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={deletingAccount ? <CircularProgress size={16} color="inherit" /> : <DeleteOutline />}
                            onClick={handleDeleteAccount}
                            disabled={deletingAccount}
                        >
                            {deletingAccount ? 'Eliminando...' : 'Eliminar Cuenta'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}