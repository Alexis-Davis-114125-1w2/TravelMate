// Utilidades para manejo de errores de API

export interface ApiError {
  message: string;
  status?: number;
  type: 'NETWORK_ERROR' | 'SERVER_ERROR' | 'AUTH_ERROR' | 'VALIDATION_ERROR';
}

export const handleApiError = (error: any): ApiError => {
  console.error('API Error:', error);
  
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return {
      message: 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8080',
      type: 'NETWORK_ERROR'
    };
  }
  
  if (error.status === 401) {
    return {
      message: 'No tienes autorización para realizar esta acción',
      status: 401,
      type: 'AUTH_ERROR'
    };
  }
  
  if (error.status === 404) {
    return {
      message: 'Recurso no encontrado',
      status: 404,
      type: 'SERVER_ERROR'
    };
  }
  
  if (error.status >= 400 && error.status < 500) {
    return {
      message: 'Error en la solicitud: ' + (error.message || 'Datos inválidos'),
      status: error.status,
      type: 'VALIDATION_ERROR'
    };
  }
  
  if (error.status >= 500) {
    return {
      message: 'Error interno del servidor',
      status: error.status,
      type: 'SERVER_ERROR'
    };
  }
  
  return {
    message: error.message || 'Error desconocido',
    type: 'SERVER_ERROR'
  };
};

export const isNetworkError = (error: ApiError): boolean => {
  return error.type === 'NETWORK_ERROR';
};

export const isAuthError = (error: ApiError): boolean => {
  return error.type === 'AUTH_ERROR';
};

export const getErrorMessage = (error: ApiError): string => {
  switch (error.type) {
    case 'NETWORK_ERROR':
      return '🔌 Error de conexión: ' + error.message;
    case 'AUTH_ERROR':
      return '🔐 Error de autorización: ' + error.message;
    case 'VALIDATION_ERROR':
      return '⚠️ Error de validación: ' + error.message;
    case 'SERVER_ERROR':
      return '🖥️ Error del servidor: ' + error.message;
    default:
      return '❌ Error: ' + error.message;
  }
};
