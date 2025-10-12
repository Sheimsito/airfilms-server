# 🎬 AirFilms Server

Backend API para la plataforma AirFilms construido con Node.js, Express, TypeScript y Supabase.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Scripts Disponibles](#-scripts-disponibles)
- [Arquitectura](#-arquitectura)
- [Contribuir](#-contribuir)

---

## ✨ Características

- 🔐 Sistema de autenticación y registro de usuarios
- 🗄️ Integración con Supabase (PostgreSQL)
- 🏗️ Arquitectura en capas (DAO, Services, Controllers)
- 📝 TypeScript para type-safety
- 🔄 Hot-reload en desarrollo con `tsx`
- 🛡️ Manejo centralizado de errores
- ✅ Validación de datos
- 🔒 Variables de entorno seguras

---

## 🛠️ Tecnologías

- **Runtime:** Node.js v22+
- **Framework:** Express v5
- **Lenguaje:** TypeScript v5
- **Base de Datos:** Supabase (PostgreSQL)
- **Dev Tools:** tsx, ESLint, Prettier
- **ORM/Query Builder:** @supabase/supabase-js

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v18 o superior)
- [npm](https://www.npmjs.com/) o [pnpm](https://pnpm.io/)
- Una cuenta de [Supabase](https://supabase.com/)

---

## 🚀 Instalación

1. **Clona el repositorio:**

```bash
git clone <url-del-repositorio>
cd airfilms-server
```

2. **Instala las dependencias:**

```bash
npm install
```

3. **Configura las variables de entorno:**

Crea un archivo `.env` en la raíz del proyecto (ver [Configuración](#-configuración)).

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173

# JWT Secrets
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_RESET_PASSWORD_SECRET=tu_jwt_reset_password_secret

# Email Service (Resend)
RESEND_API_KEY=tu_resend_api_key

# API Configuration
API_VERSION=v1
API_PREFIX=/api
```

### Obtener las credenciales de Supabase

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (¡solo para backend!)

---

## 🎮 Uso

### Modo Desarrollo

Ejecuta el servidor con hot-reload:

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Modo Producción

1. **Compila el proyecto:**

```bash
npm run build
```

2. **Inicia el servidor:**

```bash
npm start
```

### Linting

```bash
npm run lint
```

---

## 📁 Estructura del Proyecto

```
airfilms-server/
├── src/
│   ├── config/           # Configuración de la aplicación
│   │   └── config.ts     # Variables de entorno centralizadas
│   ├── controllers/      # Controladores de rutas
│   │   └── authController.ts
│   ├── dao/              # Data Access Objects
│   │   ├── baseDAO.ts    # DAO genérico con operaciones CRUD
│   │   └── userDAO.ts    # DAO específico de usuarios
│   ├── lib/              # Librerías y clientes externos
│   │   └── supabaseClient.ts
│   ├── middleware/       # Middlewares de Express
│   │   ├── auth.ts       # Middleware de autenticación
│   │   └── errorHandler.ts
│   ├── routes/           # Definición de rutas
│   │   └── userRoutes.ts
│   ├── service/          # Integraciones con servicios externos
│   │   ├── emailService.ts    # Resend para emails
│   │   └── moviesApiService.ts # TMDB para películas
│   ├── types/            # Tipos TypeScript (Single Source of Truth)
│   │   └── database.ts   # Tipos de base de datos Supabase
│   ├── app.ts            # Configuración de Express
│   └── server.ts         # Punto de entrada de la aplicación
├── .env                  # Variables de entorno (no versionado)
├── .gitignore
├── package.json
├── tsconfig.json         # Configuración de TypeScript
├── ARCHITECTURE.md       # Documentación de arquitectura
├── README.md             # Este archivo
└── SETUP.md              # Guía de configuración detallada
```

---

## 🔌 API Endpoints

### Autenticación

#### `POST /api/users/register`

Registra un nuevo usuario en el sistema.

**Request Body:**

```json
{
  "name": "Juan",
  "lastName": "Pérez",
  "age": 25,
  "email": "juan.perez@example.com",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "userId": "uuid-del-usuario"
}
```

**Response (409 Conflict):**

```json
{
  "message": "Este correo ya está registrado."
}
```

**Response (400 Bad Request):**

```json
{
  "message": "Error interno del servidor"
}
```

---

## 📜 Scripts Disponibles

| Script         | Descripción                                    |
| -------------- | ---------------------------------------------- |
| `npm run dev`  | Inicia el servidor en modo desarrollo         |
| `npm run build`| Compila TypeScript a JavaScript               |
| `npm start`    | Inicia el servidor compilado (producción)     |
| `npm run lint` | Ejecuta ESLint para validar el código        |

---

## 🏛️ Arquitectura

Este proyecto sigue una **arquitectura en capas** para mantener la separación de responsabilidades:

- **Controllers:** Manejan las peticiones HTTP y respuestas
- **DAO (Data Access Objects):** Interactúan directamente con la base de datos
- **Services:** Contienen la lógica de negocio (capa intermedia)
- **Models:** Definen las interfaces y tipos de datos
- **Middleware:** Procesan las peticiones antes de llegar a los controladores

Para más detalles, consulta [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🤝 Contribuir

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commitea tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Notas Importantes

### TypeScript y ESM

Este proyecto usa:
- `"type": "module"` en `package.json` (ES Modules)
- `moduleResolution: "Node"` en `tsconfig.json`
- Imports SIN extensiones `.js` gracias a `tsx`

### Supabase

- ⚠️ **NUNCA** expongas el `service_role_key` en el frontend
- Usa el `anon key` en el cliente (frontend)
- El `service_role_key` bypasea las políticas RLS de Supabase

### Seguridad

- 🔒 Las contraseñas deben hashearse antes de guardar (pendiente: bcrypt)
- 🔑 Los tokens JWT deben tener expiración
- 🛡️ Implementar validación de entrada robusta

---

## 📄 Licencia

ISC License

---

## 🐛 Soporte

Si encuentras algún bug o tienes alguna pregunta, por favor abre un [issue](https://github.com/Sheimsito/airfilms-server/issues).

---

**Desarrollado con ❤️ y TypeScript**

