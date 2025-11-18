'use client';

import { useState, useRef, useEffect } from 'react';
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
} from '@mui/material';
import {
    ArrowBack,
    PhotoCamera,
    Save,
    Person,
    Email,
    DeleteOutline,
} from '@mui/icons-material';

interface UserData {
    id: number;
    name: string;
    email: string;
    profilePictureUrl: string | null;
    provider: string;
}

export default function ProfileEditPage() {
    // Estados del formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Manejar guardado
    const handleSave = async () => {
        // Validaciones
        if (!name.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        if (!email.trim()) {
            setError('El email es obligatorio');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('El formato del email no es válido');
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
                    email: email.trim(),
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
                    email: updatedUser.email,
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
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#424242', mb: 1 }}>
                                Email
                            </Typography>
                            <TextField
                                fullWidth
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                </Box>
            </Container>
        </Box>
    );
}