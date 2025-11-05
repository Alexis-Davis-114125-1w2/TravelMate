'use client';

import { Container, Paper, Box, IconButton, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TermsContent from '@/components/TermsContent';
import { useRouter } from 'next/navigation'; // ✅ <-- cambio importante

export default function TermsPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        {/* Encabezado con botón de volver */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => router.push('/dashboard')}
            sx={{
              mr: 1,
              color: 'primary.main',
              '&:hover': { backgroundColor: 'rgba(3,169,244,0.1)' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Términos y condiciones
          </Typography>
        </Box>

        {/* Contenido reutilizable */}
        <TermsContent />

        {/* Botón de volver al final (opcional) */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/dashboard')}
          >
            Volver al Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
