# TravelMate - Aplicación de Gestión de Viajes

Una aplicación moderna de gestión de viajes construida con Next.js (frontend) y preparada para integrarse con un backend en Java.

## 🚀 Características

- **Autenticación completa**: Sistema de login con email y contraseña
- **Diseño moderno**: Interfaz atractiva con Tailwind CSS
- **Validación de formularios**: Validación en tiempo real con mensajes de error
- **Preparado para backend Java**: Estructura lista para conectar con API REST
- **Responsive**: Diseño adaptable a diferentes dispositivos
- **TypeScript**: Tipado estático para mayor robustez

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS
- **Autenticación**: Context API + localStorage (temporal)
- **Validación**: Sistema personalizado de validación

## 📁 Estructura del Proyecto

```
TravelMate/
├── app/                    # App Router de Next.js
│   ├── login/             # Página de login
│   ├── dashboard/         # Dashboard principal
│   ├── layout.tsx         # Layout principal con AuthProvider
│   └── page.tsx           # Página de inicio (redirección)
├── components/            # Componentes reutilizables
│   └── LoginForm.tsx      # Formulario de login
├── hooks/                 # Hooks personalizados
│   └── useAuth.ts         # Hook de autenticación
├── utils/                 # Utilidades
│   └── validation.ts      # Sistema de validación
└── public/                # Archivos estáticos
```

## 🚀 Instalación y Uso

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

## 🔐 Sistema de Autenticación

### Funcionalidades Actuales
- Login con email y contraseña
- Validación de formularios en tiempo real
- Persistencia de sesión con localStorage
- Redirección automática según estado de autenticación
- Logout funcional

### Preparado para Backend Java
El sistema está diseñado para integrarse fácilmente con un backend Java:

```typescript
// En hooks/useAuth.ts - Función de login preparada para API
const login = async (email: string, password: string): Promise<boolean> => {
  // TODO: Reemplazar con llamada real al backend Java
  // Ejemplo de integración futura:
  // const response = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password })
  // });
}
```

## 📝 Validaciones Implementadas

- **Email**: Formato válido y campo obligatorio
- **Contraseña**: Mínimo 6 caracteres y campo obligatorio
- **Mensajes de error**: En español y específicos para cada campo
- **Validación en tiempo real**: Los errores se limpian al escribir

## 🎨 Diseño

- **Paleta de colores**: Azul/Índigo como color principal
- **Gradientes**: Fondo con gradiente suave
- **Componentes**: Diseño moderno con sombras y bordes redondeados
- **Iconos**: SVG integrados para mejor rendimiento
- **Responsive**: Adaptable a móviles y desktop

## 🔄 Flujo de Navegación

1. **Página inicial** (`/`): Redirecciona automáticamente
2. **Login** (`/login`): Formulario de autenticación
3. **Dashboard** (`/dashboard`): Panel principal (requiere autenticación)

## 🚧 Próximos Pasos

Para conectar con el backend Java:

1. **Configurar API endpoints** en el hook `useAuth`
2. **Implementar manejo de tokens JWT**
3. **Agregar interceptores para requests**
4. **Implementar refresh tokens**
5. **Agregar manejo de errores de red**

## 📱 Páginas Disponibles

- **`/`**: Redirección automática
- **`/login`**: Formulario de login
- **`/dashboard`**: Panel principal (protegido)

## 🧪 Testing

Para probar el login, puedes usar cualquier email y contraseña (mínimo 6 caracteres). El sistema simula la autenticación hasta que se conecte con el backend real.

## 📄 Licencia

Este proyecto es privado y está destinado para uso interno.