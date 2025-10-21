// Configuración de la API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Headers por defecto
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Funciones de API
export const api = {
  // Autenticación
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response;
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response;
  },

  // Viajes
  createTrip: async (tripData: any, userId: number, imageFile: File | null) => {
    // Crear FormData para enviar como multipart/form-data
    const formData = new FormData();
    
    // Crear un Blob con el JSON para que se envíe correctamente como RequestPart
    const tripBlob = new Blob([JSON.stringify(tripData)], { type: 'application/json' });
    formData.append('trip', tripBlob);
    
    // Obtener solo el token de autorización, sin Content-Type
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (imageFile) {
      formData.append('image',imageFile);
    }
    
    console.log('Enviando request a /api/trips/add con token:', token ? 'Presente' : 'Ausente');
    console.log('Token completo:', token);
    console.log('FormData contents:', Array.from(formData.entries()));
    
    const response = await fetch(`${API_BASE_URL}/api/trips/add?userId=${userId}`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    return response;
  },

  getUserTrips: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/trips/get/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },
};
