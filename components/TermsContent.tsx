'use client';
import { Box, Typography } from '@mui/material';

export default function TermsContent() {
  return (
    <Box
      sx={{
        '& h6': { mt: 3, mb: 1, fontWeight: 600 },
        '& p': { mb: 2 },
      }}
    >
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Términos y Condiciones de Uso - TravelMate
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Última actualización: Noviembre 2025
      </Typography>

      {/* 👇 Aquí va todo el texto que ya tenías */}
      <Box
                    sx={{
                      '& h6': { mt: 3, mb: 1, fontWeight: 600 },
                      '& p': { mb: 2 },
                    }}
                  >
                    <Typography variant="h6">1. GENERALIDADES</Typography>
                    <Typography variant="body2" paragraph>
                      Bienvenido a TravelMate, proporcionado por TravelMate. Nos complace
                      ofrecerle acceso al Servicio, sujeto a estos términos y condiciones y a la
                      Política de Privacidad correspondiente.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Al acceder y utilizar TravelMate, usted expresa su consentimiento, acuerdo
                      y entendimiento de los Términos de Servicio y la Política de Privacidad.
                      Si no está de acuerdo con los Términos de Servicio o la Política de
                      Privacidad, no utilice el Servicio.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Si utiliza el servicio está aceptando las modalidades operativas en
                      vigencia descriptas más adelante, las declara conocer y aceptar, las que
                      se habiliten en el futuro y en los términos y condiciones que a
                      continuación se detallan.
                    </Typography>
      
                    <Typography variant="h6">2. DESCRIPCIÓN DEL SERVICIO</Typography>
                    <Typography variant="body2" paragraph>
                      TravelMate es una plataforma digital de gestión colaborativa de viajes que
                      permite a los usuarios:
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      • Crear y organizar viajes compartidos con otros participantes <br />
                      • Gestionar fondos comunes para gastos del viaje <br />
                      • Administrar billeteras personales individuales dentro de cada viaje{" "}
                      <br />
                      • Visualizar y coordinar actividades, itinerarios y gastos en tiempo real{" "}
                      <br />
                      • Invitar y colaborar con otros usuarios en la planificación de viajes{" "}
                      <br />
                      • Acceder a estadísticas y resúmenes de viajes completados y en curso
                    </Typography>
      
                    <Typography variant="h6">3. PERMISO PARA UTILIZAR EL SERVICIO</Typography>
                    <Typography variant="body2" paragraph fontWeight={600}>
                      3.1 Requisitos de Registro
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Para utilizar TravelMate, los usuarios deberán:
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      • Ser mayores de 18 años o contar con autorización de un tutor legal
                      <br />
                      • Proporcionar información verídica y actualizada durante el registro
                      <br />
                      • Crear una cuenta con email personal <br />
                      • Establecer una clave personal segura para acceso al Servicio
                    </Typography>
      
                    <Typography variant="body2" paragraph fontWeight={600}>
                      3.2 Acceso y Autenticación
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      El acceso al Servicio requiere: <br />
                      • Dispositivo con conexión a Internet <br />
                      • Credenciales de usuario: email y clave personal <br />
                      La clave personal tiene carácter secreto e intransferible. <br />
                      <br />
                      <strong>IMPORTANTE:</strong> Usted asume las consecuencias de la
                      divulgación de su clave a terceros, liberando a TravelMate de toda
                      responsabilidad que de ello se derive. TravelMate NUNCA solicitará la
                      totalidad de sus datos por correo electrónico ni requerirá información
                      personal a través de canales no oficiales.
                    </Typography>
      
                    <Typography variant="h6">4. OPERACIONES HABILITADAS</Typography>
                    <Typography variant="body2" paragraph>
                      Las operaciones disponibles en TravelMate incluyen, sin limitarse a:
                    </Typography>
      
                    <Typography variant="body2" paragraph fontWeight={600}>
                      4.1 Gestión de Viajes
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      • Crear nuevos viajes <br />
                      • Unirse a viajes existentes mediante invitación <br />
                      • Modificar y actualizar información de viajes <br />
                      • Eliminar viajes
                    </Typography>
      
                    <Typography variant="body2" paragraph fontWeight={600}>
                      4.2 Gestión Financiera
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      • Crear y administrar fondos comunes compartidos entre participantes{" "}
                      <br />
                      • Gestionar billeteras personales dentro de cada viaje <br />
                      • Registrar gastos individuales y compartidos <br />
                      • Visualizar balances y estadísticas de gastos
                    </Typography>
                
                    <Typography variant="body2" paragraph fontWeight={600}>
                      4.3 Colaboración
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      • Invitar participantes a viajes <br />
                      • Asignar roles y permisos dentro de cada viaje
                    </Typography>
                
                    <Typography variant="body2" paragraph>
                      TravelMate se reserva el derecho de ampliar o restringir las operaciones
                      habilitadas, comunicándolo previamente con una antelación no menor a 60
                      días corridos.
                    </Typography>
                
                    <Typography variant="h6">5. GESTIÓN DE FONDOS Y TRANSACCIONES</Typography>
                    <Typography variant="body2" paragraph fontWeight={600}>
                      5.1 Fondos Comunes
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Los fondos comunes creados en TravelMate son de carácter informativo y
                      organizativo. TravelMate NO es una entidad financiera y NO procesa
                    transacciones monetarias reales dentro de la aplicación.
                    </Typography>
                
                    <Typography variant="body2" paragraph fontWeight={600}>
                      5.2 Responsabilidad de Usuarios
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      • Los usuarios son responsables de gestionar las transferencias
                      monetarias reales fuera de la plataforma <br />
                      • TravelMate no actúa como intermediario financiero ni custodio de fondos{" "}
                      <br />
                      • La plataforma no garantiza el cumplimiento de acuerdos financieros entre
                      usuarios <br />
                      • Cada usuario es responsable de sus transacciones con otros participantes
                    </Typography>
                
                    <Typography variant="body2" paragraph fontWeight={600}>
                      5.3 Registros Financieros
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Los registros de gastos y balances en TravelMate son herramientas de
                      organización y no constituyen documentos contables oficiales ni
                      comprobantes legales de transacciones.
                    </Typography>
                
                    <Typography variant="h6">6. COSTO DEL SERVICIO</Typography>
                    <Typography variant="body2" paragraph>
                      Actualmente, TravelMate ofrece acceso gratuito a sus funcionalidades
                      básicas. TravelMate se reserva el derecho de:
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      • Implementar planes de suscripción en el futuro <br />
                      • Cobrar comisiones por funcionalidades adicionales <br />
                      • Modificar la estructura de precios con previo aviso de 60 días
                    </Typography>
                    <Typography variant="body2" paragraph>
                      En caso de implementarse cargos, se notificará a los usuarios con la
                      debida antelación y se requerirá su consentimiento explícito para
                      continuar utilizando funcionalidades de pago.
                    </Typography>
                
                    <Typography variant="h6">7. PRIVACIDAD Y PROTECCIÓN DE DATOS</Typography>
                    <Typography variant="body2" paragraph fontWeight={600}>
                      7.1 Recopilación de Datos
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      Para proporcionar el Servicio, TravelMate recopila y procesa: <br />
                      • Datos de registro: nombre, correo electrónico, contraseña <br />
                      • Datos de uso: viajes creados, participantes, gastos registrados,
                      actividad en la plataforma <br />
                      • Datos técnicos: cookies <br />
                      • Datos de interacción: preferencias de usuario, configuraciones,
                      estadísticas de uso
                    </Typography>
                
                    <Typography variant="body2" paragraph fontWeight={600}>
                      7.2 Uso de la Información
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      Sus datos personales se utilizan para: <br />
                      • Proporcionar y mejorar el Servicio <br />
                      • Facilitar la colaboración entre usuarios <br />
                      • Generar estadísticas y análisis de uso <br />
                      • Comunicar actualizaciones o notificaciones <br />
                      • Personalizar la experiencia del usuario <br />
                      • Garantizar la seguridad
                    </Typography>
                
                    <Typography variant="body2" paragraph fontWeight={600}>
                      7.3 Compartir Información
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      TravelMate comparte información con: <br />
                      • Otros participantes del viaje: nombre y datos necesarios <br />
                      • Terceros proveedores técnicos <br />
                      • Autoridades legales cuando sea requerido por ley <br />
                      No vendemos sus datos personales a terceros con fines comerciales.
                    </Typography>
                
                    <Typography variant="body2" paragraph fontWeight={600}>
                      7.4 Seguridad de Datos
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Su información personal se procesa y almacena en servidores con altos
                      estándares de seguridad, incluyendo encriptación, acceso restringido y
                      monitoreo constante.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Para mayor información, consulte nuestra Política de Privacidad completa.
                    </Typography>
                
                    <Typography variant="h6">8. PROPIEDAD INTELECTUAL</Typography>
                    <Typography variant="body2" paragraph>
                      Todo el contenido de TravelMate (diseño, código fuente, gráficos, textos,
                      logotipos, materiales, algoritmos, etc.) está protegido por las leyes de
                      propiedad intelectual de Argentina (Ley 11.723) y tratados
                      internacionales. Todos los derechos están reservados.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      El usuario conserva los derechos sobre el contenido que crea, pero otorga
                      a TravelMate una licencia no exclusiva para utilizar dicho contenido en la
                      prestación del Servicio.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Está prohibido copiar, modificar, redistribuir o realizar ingeniería
                      inversa sobre el software o contenidos de TravelMate.
                    </Typography>
                
                    <Typography variant="h6">
                      9. VALIDEZ DE OPERACIONES Y NOTIFICACIONES
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Los registros emitidos por la aplicación constituyen prueba suficiente de
                      las operaciones realizadas. Las notificaciones enviadas por correo o en la
                      plataforma tienen validez legal.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      TravelMate se comunicará con los usuarios por correo electrónico o avisos
                      en el panel. Es responsabilidad del usuario mantener actualizada su
                      información de contacto.
                    </Typography>
                
                    <Typography variant="h6">10. OBLIGACIONES DEL USUARIO</Typography>
                    <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                      • Proporcionar información verídica y actualizada <br />
                      • Usar el Servicio responsablemente <br />
                      • No realizar actividades ilegales o fraudulentas <br />
                      • Respetar los derechos de otros usuarios <br />
                      • Proteger sus credenciales de acceso <br />
                      • No interferir con el funcionamiento del Servicio <br />
                      • Cumplir con leyes locales de protección de datos
                    </Typography>
                
                    <Typography variant="h6">11. VIGENCIA Y TERMINACIÓN</Typography>
                    <Typography variant="body2" paragraph fontWeight={600}>
                      11.1 Terminación por el Usuario
                    </Typography>
                    <Typography variant="body2" paragraph>
                      El usuario puede dar de baja su cuenta en cualquier momento desde la
                      configuración o contactando a travelmate@gmail.com.
                    </Typography>
                
                    <Typography variant="body2" paragraph fontWeight={600}>
                      11.2 Terminación por TravelMate
                    </Typography>
                    <Typography variant="body2" paragraph>
                      TravelMate podrá suspender el acceso si el usuario incumple los términos,
                      realiza actividades fraudulentas o pone en riesgo la seguridad.
                    </Typography>
                
                    <Typography variant="body2" paragraph fontWeight={600}>
                      11.3 Cancelación del Servicio
                    </Typography>
                    <Typography variant="body2" paragraph>
                      TravelMate puede discontinuar el servicio con 60 días de preaviso, sin
                      derecho a indemnización, salvo devolución proporcional de servicios pagos.
                    </Typography>
                
                    <Typography variant="body2" paragraph fontWeight={600}>
                      11.4 Efectos de la Terminación
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Al finalizar la relación, el usuario perderá acceso a su cuenta. TravelMate
                      conservará los datos según las obligaciones legales.
                    </Typography>
                
                    <Typography variant="h6">12. RESPONSABILIDADES Y LIMITACIONES</Typography>
                    <Typography variant="body2" paragraph>
                      TravelMate no garantiza disponibilidad continua ni resultados específicos.
                      No se responsabiliza por pérdidas, daños, acuerdos entre usuarios,
                      transacciones externas o pérdida de datos por factores externos.
                    </Typography>
                
                    <Typography variant="h6">13. MODIFICACIONES</Typography>
                    <Typography variant="body2" paragraph>
                      TravelMate puede modificar estos términos con aviso de 60 días. El uso
                      continuo implica aceptación de las modificaciones.
                    </Typography>
                
                    <Typography variant="h6">14. JURISDICCIÓN Y LEY APLICABLE</Typography>
                    <Typography variant="body2" paragraph>
                      Estos términos se rigen por las leyes de la República Argentina. Cualquier
                      controversia será resuelta por los tribunales competentes del país.
                    </Typography>
                
                    <Typography variant="h6">15. CONTACTO</Typography>
                    <Typography variant="body2" paragraph>
                      Para preguntas o reclamos: <strong>travelmate@gmail.com</strong>
                    </Typography>
                
                    <Typography
                      variant="body2"
                      paragraph
                      sx={{ mt: 3, fontStyle: "italic", textAlign: "center" }}
                    >
                      Al utilizar TravelMate, usted confirma que ha leído, comprendido y aceptado
                      estos Términos y Condiciones en su totalidad.
                      <br />
                      TravelMate - Todos los derechos reservados © 2025
                    </Typography>
                  </Box>
    </Box>
  );
}
