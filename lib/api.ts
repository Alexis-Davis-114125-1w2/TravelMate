// Configuración de la API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Función para verificar si el backend está disponible
export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('❌ Backend no disponible:', error);
    return false;
  }
};

// Función para verificar conectividad con el backend
export const checkBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('❌ Backend no disponible:', error);
    return false;
  }
};

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
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/user/${userId}`, {
        headers: getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('❌ Error en getUserTrips:', error);
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8080');
    }
  },

  // Obtener detalles de un viaje específico
  getTripDetails: async (tripId: string, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  // Obtener participantes de un viaje
  getTripParticipants: async (tripId: string, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}/participants?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  // Unirse a un viaje por código
  joinTripByCode: async (code: string, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/trips/join?code=${encodeURIComponent(code)}&userId=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response;
  },

  // Actualizar un viaje
  updateTrip: async (tripId: string, tripData: any, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tripData),
    });
    return response;
  },

  // Eliminar un viaje
  deleteTrip: async (tripId: string, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}?userId=${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response;
  },

  // Tips
  createTip: async (tripId: string, tipData: any, userEmail: string) => {
    try {
      console.log('🔗 Creando tip:', { tripId, tipData, userEmail });
      console.log('🔗 URL:', `${API_BASE_URL}/api/tips/trip/${tripId}?userEmail=${encodeURIComponent(userEmail)}`);
      
      const response = await fetch(`${API_BASE_URL}/api/tips/trip/${tripId}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(), // Agregar headers de autenticación
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tipData),
      });
      
      console.log('🔗 Respuesta del servidor:', response.status, response.statusText);
      return response;
    } catch (error) {
      console.error('❌ Error en createTip:', error);
      throw new Error(`No se pudo conectar con el servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  getTipsByTrip: async (tripId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tips/trip/${tripId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  getTipsByType: async (tripId: string, tipType: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tips/trip/${tripId}/type/${tipType}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  getNearbyTips: async (tripId: string, latitude: number, longitude: number, radiusKm: number = 5.0) => {
    const response = await fetch(`${API_BASE_URL}/api/tips/trip/${tripId}/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  getTipById: async (tipId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tips/${tipId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  updateTip: async (tipId: string, tipData: any, userEmail: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tips/${tipId}?userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tipData),
    });
    return response;
  },

  deleteTip: async (tipId: string, userEmail: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tips/${tipId}?userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
    });
    return response;
  },

  getTipStats: async (tripId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/tips/trip/${tripId}/stats`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  // Billeteras
  getGeneralWallet: async (tripId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/wallets/trip/${tripId}/general`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  getIndividualWallet: async (tripId: string, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/wallets/trip/${tripId}/individual/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  updateGeneralWallet: async (tripId: string, walletData: { amount: number; currency: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/wallets/trip/${tripId}/general`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(walletData),
    });
    return response;
  },

  updateIndividualWallet: async (tripId: string, userId: number, walletData: { amount: number; currency: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/wallets/trip/${tripId}/individual/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(walletData),
    });
    return response;
  },

  // Compras
  createGeneralPurchase: async (tripId: string, userId: number, purchaseData: { description: string; price: number; currency: string; purchaseDate: string }) => {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'User-Id': userId.toString(),
    };
    const response = await fetch(`${API_BASE_URL}/api/purchases/trip/${tripId}/general`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(purchaseData),
    });
    return response;
  },

  createIndividualPurchase: async (tripId: string, userId: number, createdByUserId: number, purchaseData: { description: string; price: number; currency: string; purchaseDate: string }) => {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'User-Id': createdByUserId.toString(),
    };
    const response = await fetch(`${API_BASE_URL}/api/purchases/trip/${tripId}/individual/${userId}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(purchaseData),
    });
    return response;
  },

  getGeneralPurchases: async (tripId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/purchases/trip/${tripId}/general`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  getIndividualPurchases: async (tripId: string, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/purchases/trip/${tripId}/individual/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  getAllPurchases: async (tripId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/purchases/trip/${tripId}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  updateGeneralPurchase: async (tripId: string, purchaseId: string, purchaseData: { description: string; price: number; currency: string; purchaseDate: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/purchases/trip/${tripId}/general/${purchaseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(purchaseData),
    });
    return response;
  },

  updateIndividualPurchase: async (tripId: string, userId: number, purchaseId: string, purchaseData: { description: string; price: number; currency: string; purchaseDate: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/purchases/trip/${tripId}/individual/${userId}/${purchaseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(purchaseData),
    });
    return response;
  },

  deletePurchase: async (tripId: string, purchaseId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/purchases/trip/${tripId}/${purchaseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response;
  },
};
