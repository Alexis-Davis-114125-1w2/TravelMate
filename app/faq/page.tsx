'use client';

import { Container, Paper, Box, IconButton, Typography, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/navigation';

export default function FAQPage() {
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
            Preguntas Frecuentes
          </Typography>
        </Box>

        {/* Contenido de las preguntas */}
        <Box>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>¿Qué es TravelMate?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                TravelMate es una plataforma que te permite planificar, gestionar y compartir tus viajes de forma sencilla, tanto con amigos como de manera individual.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>¿Cómo puedo crear un nuevo viaje?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Desde tu Dashboard, hacé clic en “Crear viaje”, completá los detalles y agregá participantes si querés. Luego podrás ver toda la información del viaje desde la sección principal.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>¿Puedo editar o eliminar un viaje?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Sí. Entrá al detalle del viaje y encontrarás las opciones para editar la información si sos administrador. Para eliminarlo completamente, hay un tacho en el menu principal visible solo para administradores.
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>¿Puedo modificar las billeteras si no soy administrador?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Sí. Cualquiera con acceso al viaje puede hacer compras tanto en la billetera personal como en la general. Solo los administradores pueden modificar el presupuesto general.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>¿Dónde puedo ver los términos y condiciones?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Podés acceder a los términos y condiciones desde el menú lateral del Dashboard o directamente en la página <b>/terms</b>.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Botón de volver al final */}
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
