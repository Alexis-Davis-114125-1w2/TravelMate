'use client';

import React from 'react';
import { Box, Alert, AlertTitle, Button, Typography, Card, CardContent } from '@mui/material';
import { ErrorOutline, Refresh, Settings } from '@mui/icons-material';

interface BackendErrorProps {
  error: string;
  onRetry?: () => void;
  showBackendInfo?: boolean;
}

export const BackendError: React.FC<BackendErrorProps> = ({ 
  error, 
  onRetry, 
  showBackendInfo = true 
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Alert 
        severity="error" 
        icon={<ErrorOutline />}
        sx={{ mb: 2 }}
      >
        <AlertTitle>Error de Conexión</AlertTitle>
        {error}
      </Alert>
      
      {showBackendInfo && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔧 Información del Backend
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Para que la aplicación funcione correctamente, necesitas ejecutar el backend de Spring Boot.
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                📋 Pasos para ejecutar el backend:
              </Typography>
              <Box component="ol" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Abre una terminal en la carpeta <code>TravelMate-Backend</code>
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Ejecuta: <code>./mvnw spring-boot:run</code> (Windows) o <code>./mvnw spring-boot:run</code> (Mac/Linux)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Espera a que aparezca: <code>Started DemoApplication in X.XXX seconds</code>
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  El backend estará disponible en: <code>http://localhost:8080</code>
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                🔍 Verificar que el backend esté funcionando:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Abre <code>http://localhost:8080/api/health</code> en tu navegador. 
                Deberías ver una respuesta JSON.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {onRetry && (
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={onRetry}
            color="primary"
          >
            Reintentar Conexión
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => window.open('http://localhost:8080/api/health', '_blank')}
          >
            Verificar Backend
          </Button>
        </Box>
      )}
    </Box>
  );
};
