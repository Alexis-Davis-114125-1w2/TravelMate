# 🤖 Configuración de Google Gemini AI

## 📋 Pasos para Configurar Gemini

### 1. Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Get API Key" o "Create API Key"
4. Copia tu API key

### 2. Configurar la API Key

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
NEXT_PUBLIC_GEMINI_API_KEY=tu_api_key_aqui
```

**Importante:** 
- El archivo `.env.local` ya está en `.gitignore`, así que no se subirá al repositorio
- No compartas tu API key públicamente
- Reinicia el servidor de desarrollo después de crear/modificar el archivo `.env.local`

### 3. Verificar la Instalación

La dependencia `@google/generative-ai` ya está instalada. Si necesitas reinstalarla:

```bash
npm install @google/generative-ai
```

## ✅ Funcionalidades

### 🤖 Gemini Real Integrado

- **Chat Conversacional**: Gemini responde a preguntas generales sobre el viaje
- **Recomendaciones Inteligentes**: Gemini genera recomendaciones basadas en el contexto del viaje
- **Fallback Inteligente**: Si Gemini no está disponible, usa respuestas genéricas

### 🔧 Funcionalidades Mantenidas

- **Búsqueda de Lugares**: Las búsquedas de restaurantes, hoteles, atracciones y gasolineras siguen usando Google Places API
- **Detección de Acciones**: Las consultas que requieren búsqueda real de lugares mantienen su funcionalidad
- **Todas las características existentes** siguen funcionando igual

## 🎯 Cómo Funciona

1. **Consultas de Acción** (buscar lugares):
   - Si el usuario pregunta "lugares para comer", "restaurantes", etc.
   - El sistema usa Google Places API para buscar lugares reales
   - Gemini NO se usa para estas consultas

2. **Consultas Conversacionales**:
   - Si el usuario hace preguntas generales o conversacionales
   - Gemini genera respuestas inteligentes basadas en:
     - Información del viaje
     - Ubicación actual
     - Lugares guardados
     - Contexto del usuario

3. **Recomendaciones Inteligentes**:
   - Cuando el usuario viaja, Gemini analiza lugares cercanos
   - Genera recomendaciones personalizadas basadas en el progreso del viaje

## 🐛 Solución de Problemas

### Error: "Gemini API key no configurada"
- Verifica que el archivo `.env.local` existe en la raíz del proyecto
- Verifica que la variable se llama exactamente `NEXT_PUBLIC_GEMINI_API_KEY`
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "API key no válida"
- Verifica que copiaste la API key correctamente
- Asegúrate de que no hay espacios extra al inicio o final
- Verifica que la API key esté activa en Google AI Studio

### Gemini no responde
- Verifica la consola del navegador para ver errores
- El sistema tiene fallback automático a respuestas genéricas
- Las búsquedas de lugares seguirán funcionando aunque Gemini falle

## 📝 Notas

- Gemini se usa para respuestas conversacionales e inteligentes
- Las búsquedas de lugares reales siguen usando Google Places API
- Todas las funcionalidades existentes se mantienen intactas

