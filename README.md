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

- 🔐 **Autenticación completa**: Registro, login, logout, recuperación de contraseña, verificación de sesión
- 👤 **Gestión de usuarios**: Perfil, actualización, soft delete
- 🎬 **Sistema de películas**: Búsqueda, detalles, películas populares
- ❤️ **Sistema de favoritos**: Agregar, eliminar y listar películas favoritas
- 💬 **Sistema de comentarios**: Agregar, eliminar y listar comentarios de películas con paginación
- ⭐ **Sistema de ratings**: Calificar películas (0-5 estrellas), ver estadísticas y distribución
- 🎥 **Integración con APIs externas**: TMDB para películas, Pexels para videos
- 🗄️ **Integración con Supabase** (PostgreSQL)
- 🏗️ **Arquitectura en capas** (DAO, Services, Controllers)
- 📝 **TypeScript** para type-safety completa
- 🔄 **Hot-reload** en desarrollo con `tsx`
- 🛡️ **Manejo centralizado de errores** (Supabase, JWT, validación)
- ✅ **Validación robusta** de datos de entrada
- 🔒 **Seguridad implementada**:
  - Bcrypt para contraseñas (10 salt rounds)
  - JWT para autenticación (24h)
  - Rate limiting en login (3-5 intentos/5min)
  - CORS configurado
  - Cookies seguras (httpOnly, secure)
- 📧 **Email transaccional** con Resend API
- 📊 **Logging** de requests/responses
- 🚫 **Soft delete** (no eliminación física de datos)

---

## 🛠️ Tecnologías

- **Runtime:** Node.js v22+
- **Framework:** Express v5
- **Lenguaje:** TypeScript v5
- **Base de Datos:** Supabase (PostgreSQL)
- **APIs Externas:** TMDB API, Pexels API
- **Email Service:** Resend API
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

# External APIs
TMDB_API_KEY=tu_tmdb_api_key
PEXELS_API_KEY=tu_pexels_api_key

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

### Obtener las credenciales de APIs externas

#### TMDB API
1. Ve a [TMDB API](https://www.themoviedb.org/settings/api)
2. Crea una cuenta y solicita una API key
3. Copia la API key → `TMDB_API_KEY`

#### Pexels API
1. Ve a [Pexels API](https://www.pexels.com/api/)
2. Crea una cuenta y obtén tu API key
3. Copia la API key → `PEXELS_API_KEY`

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
│   ├── config/              # Configuración de la aplicación
│   │   ├── config.ts        # Variables de entorno centralizadas
│   │   └── server.ts        # Configuración de Express (CORS, middlewares)
│   ├── controllers/         # Controladores de rutas
│   │   ├── authController.ts   # Autenticación, recuperación de contraseña y verificación
│   │   ├── userController.ts   # Gestión de perfil de usuario
│   │   ├── movieController.ts  # Gestión de películas y búsquedas
│   │   ├── favoritesController.ts # Gestión de películas favoritas
│   │   ├── commentController.ts  # Gestión de comentarios de películas
│   │   └── ratingController.ts   # Gestión de calificaciones de películas
│   ├── dao/                 # Data Access Objects
│   │   ├── baseDAO.ts       # DAO genérico (CRUD + soft delete)
│   │   ├── userDAO.ts       # DAO específico de usuarios
│   │   ├── favoritesDAO.ts  # DAO específico de favoritos
│   │   ├── commentDAO.ts    # DAO específico de comentarios
│   │   ├── ratingDAO.ts     # DAO específico de calificaciones
│   │   └── movieAssetsDAO.ts # DAO específico de assets de películas
│   ├── lib/                 # Librerías y clientes externos
│   │   └── supabaseClient.ts
│   ├── middleware/          # Middlewares de Express
│   │   ├── auth.ts          # JWT authentication + rate limiting
│   │   ├── errorHandler.ts  # Manejo de errores centralizados
│   │   ├── logger.ts        # Logger de requests/responses
│   │   └── notFound.ts      # Manejo de rutas 404
│   ├── routes/              # Definición de rutas
│   │   ├── index.ts         # Router principal
│   │   ├── authRoutes.ts    # Rutas de autenticación (públicas)
│   │   ├── userRoutes.ts    # Rutas de usuario (protegidas)
│   │   └── movieRoutes.ts   # Rutas de películas y favoritos
│   ├── service/             # Integraciones con servicios externos
│   │   ├── resendService.ts # Envío de emails transaccionales
│   │   ├── tmbdService.ts   # Integración con TMDB API
│   │   ├── pexelsService.ts # Integración con Pexels API
│   │   └── emailTemplates.ts # Plantillas de emails
│   ├── types/               # Tipos TypeScript (Single Source of Truth)
│   │   ├── database.ts      # Tipos de base de datos Supabase
│   │   └── express.d.ts     # Extensiones de tipos Express
│   └── server.ts            # Punto de entrada de la aplicación
├── .env                     # Variables de entorno (no versionado)
├── .gitignore
├── package.json
├── tsconfig.json            # Configuración de TypeScript
├── ARCHITECTURE.md          # Documentación detallada de arquitectura
└── README.md                # Este archivo
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

---

### 🔓 Autenticación (Públicas)

Todas las rutas bajo `/api/auth` son públicas.

#### `POST /api/auth/register`

Registra un nuevo usuario.

**Request Body:**
```json
{
  "name": "Juan",
  "lastName": "García",
  "age": 25,
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Validaciones:**
- Todos los campos obligatorios
- Edad ≥ 13 años
- Email formato válido
- Password: min 8 chars, mayúscula, minúscula, número, carácter especial

**Response (201 Created):**
```json
{
  "userId": "uuid-generado"
}
```

**Response (409 Conflict):**
```json
{
  "message": "Este correo ya está registrado."
}
```

---

#### `POST /api/auth/login`

Inicia sesión de usuario.

**Rate Limit:** 3-5 intentos por 5 minutos

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Inicio de sesión exitoso.",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Set-Cookie:** `access_token` (httpOnly, 24h)

**Response (401 Unauthorized):**
```json
{
  "message": "Correo o contraseña incorrectos."
}
```

**Response (403 Forbidden):**
```json
{
  "message": "Tu cuenta está deshabilitada."
}
```

---

#### `POST /api/auth/logout`

Cierra sesión (requiere autenticación).

**Headers:** `Authorization: Bearer <token>` o Cookie

**Response (200 OK):**
```json
{
  "message": "Cierre de sesión exitoso."
}
```

---

#### `POST /api/auth/forgot-password`

Solicita restablecimiento de contraseña.

**Request Body:**
```json
{
  "email": "juan@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Nota:** Por seguridad, siempre retorna 200 aunque el email no exista.

---

#### `POST /api/auth/reset-password`

Restablece la contraseña con token recibido por email.

**Request Body:**
```json
{
  "token": "jwt-token-from-email",
  "newPassword": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña actualizada."
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Enlace inválido o ya utilizado."
}
```

---

#### `GET /api/auth/verify-auth`

Verifica si el usuario está autenticado (requiere autenticación).

**Headers:** `Authorization: Bearer <token>` o Cookie

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "No autorizado."
}
```

**Nota:** Este endpoint es útil para verificar si un token sigue siendo válido sin necesidad de hacer una petición completa al perfil.

---

### 🔒 Usuario (Protegidas)

Todas las rutas bajo `/api/users` requieren autenticación.

**Headers requeridos:**
```
Authorization: Bearer <token>
```

O cookie `access_token`.

---

#### `GET /api/users/profile`

Obtiene el perfil del usuario autenticado.

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "Juan",
    "lastName": "García",
    "age": 25,
    "email": "juan@example.com",
    "isDeleted": false,
    "createdAt": "2025-10-13T...",
    "updatedAt": "2025-10-13T..."
  }
}
```

---

#### `PUT /api/users/profile`

Actualiza el perfil del usuario.

**Request Body:**
```json
{
  "name": "Juan Carlos",
  "lastName": "García López",
  "age": 26,
  "email": "juancarlos@example.com",
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

**Nota:** `currentPassword` y `newPassword` son opcionales. Si se proporcionan, se valida la contraseña actual y se actualiza.

**Response (200 OK):**
```json
{
  "success": true,
  "user": { /* usuario actualizado */ },
  "message": "Perfil actualizado exitosamente."
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "La contraseña actual es incorrecta."
}
```

---

#### `DELETE /api/users/profile`

Elimina la cuenta del usuario (soft delete).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cuenta eliminada."
}
```

**Nota:** La cuenta se marca como `isDeleted: true` pero no se elimina físicamente de la base de datos.

---

### 🎬 Películas (Públicas)

Todas las rutas bajo `/api/movies` son públicas (excepto favoritos).

---

#### `GET /api/movies/popular`

Obtiene películas populares con paginación.

**Query Parameters:**
```
?page=1 (opcional, por defecto 1)
```

**Response (200 OK):**
```json
{
  "page": 1,
  "total_pages": 500,
  "results": [
    {
      "id": 550,
      "title": "Fight Club",
      "releaseDate": "1999-10-15",
      "poster": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
    }
  ]
}
```

---

#### `GET /api/movies/details`

Obtiene detalles completos de una película específica.

**Query Parameters:**
```json

  ?id=550

```

**Response (200 OK):**
```json
{
  "id": 550,
  "title": "Fight Club",
  "poster": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "genres": ["Drama"],
  "overview": "A ticking-time-bomb insomniac and a slippery soap salesman...",
  "releaseDate": "1999-10-15",
  "runtime": 139,
  "original_language": "EN",
  "status": "Released",
  "videoId": "12345",
  "videoThumbnail": "https://videos.pexels.com/video-files/12345/thumbnail.jpg"
}
```

---

#### `GET /api/movies/search`

Busca películas por nombre.

**Query Parameters:**
```
  ?name=fight club

```

**Response (200 OK):**
```json
{
  "page": 1,
  "total_pages": 1,
  "results": [
    {
      "id": 550,
      "title": "Fight Club",
      "poster": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
    }
  ]
}
```

---

#### `GET /api/movies/get-video`

Obtiene información de video por ID.

**Query Parameters:**
```

  ?id=12345

```

**Response (200 OK):**
```json
{
  "id": 12345,
  "url": "https://videos.pexels.com/video-files/12345/video.mp4",
  "image": "https://videos.pexels.com/video-files/12345/thumbnail.jpg",
  "duration": 30,
  "user": {
    "id": 123,
    "name": "John Doe"
  }
}
```

---

### ❤️ Favoritos (Protegidas)

Todas las rutas bajo `/api/movies` para favoritos requieren autenticación.

**Headers requeridos:**
```
Authorization: Bearer <token>
```

---

#### `POST /api/movies/add-favorite`

Agrega una película a favoritos.

**Request Body:**
```json
{
  "movieId": 550,
  "movieName": "Fight Club",
  "movieURL": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "favorite": {
    "userId": "uuid",
    "movieId": 550,
    "movieName": "Fight Club",
    "posterURL": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    "createdAt": "2025-01-13T...",
    "updatedAt": "2025-01-13T...",
    "isDeleted": false
  }
}
```

---

#### `DELETE /api/movies/delete-favorite`

Elimina una película de favoritos.

**Request Body:**
```json
{
  "movieId": 550
}
```

**Response (201 OK):**
```json
{
  "success": true,
  "favorite": true
}
```

---

#### `GET /api/movies/get-favorites`

Obtiene todas las películas favoritas del usuario.

**Response (200 OK):**
```json
{
  "success": true,
  "favorites": [
    {
      "userId": "uuid",
      "movieId": 550,
      "movieName": "Fight Club",
      "posterURL": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "createdAt": "2025-01-13T...",
      "updatedAt": "2025-01-13T...",
      "isDeleted": false
    }
  ]
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "No se encontraron favoritos."
}
```

---

### 💬 Comentarios (Protegidas excepto listar)

Las rutas de comentarios bajo `/api/movies` requieren autenticación para crear/eliminar.

**Headers requeridos (para POST/DELETE):**
```
Authorization: Bearer <token>
```

---

#### `GET /api/movies/get-comments/:movieId`

Obtiene todos los comentarios de una película con paginación.

**Query Parameters (opcionales):**
```
?page=1&limit=20&orderBy={"column":"createdAt","ascending":false}
```

**Response (200 OK):**
```json
{
  "success": true,
  "comments": {
    "data": [
      {
        "users": { "name": "Juan", "lastName": "García" },
        "comment": "¡Excelente película!",
        "createdAt": "2025-01-13T..."
      }
    ],
    "count": 150
  }
}
```

---

#### `POST /api/movies/add-comment`

Agrega un comentario a una película.

**Request Body:**
```json
{
  "movieId": 550,
  "comment": "¡Excelente película!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "commentCreated": {
    "movieId": 550,
    "userId": "uuid",
    "comment": "¡Excelente película!",
    "createdAt": "2025-01-13T..."
  }
}
```

---

#### `DELETE /api/movies/delete-comment`

Elimina un comentario de una película.

**Request Body:**
```json
{
  "movieId": 550
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "commentDeleted": true
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Comentario no encontrado."
}
```

---

### ⭐ Ratings (Protegidas excepto listar)

Las rutas de ratings bajo `/api/movies` requieren autenticación para crear/eliminar.

**Headers requeridos (para POST/DELETE):**
```
Authorization: Bearer <token>
```

---

#### `GET /api/movies/get-ratings/:movieId`

Obtiene estadísticas de calificaciones de una película.

**Response (200 OK):**
```json
{
  "success": true,
  "ratings": {
    "totalCount": 1250
  },
  "ratingNumbers": {
    "data": [50, 100, 200, 400, 500]
  }
}
```

**Nota:** `ratingNumbers.data` contiene el conteo de cada calificación de 1⭐ a 5⭐.

---

#### `POST /api/movies/add-rating`

Agrega o actualiza una calificación a una película.

**Request Body:**
```json
{
  "movieId": 550,
  "rating": 5
}
```

**Validaciones:**
- `rating` debe estar entre 0 y 5

**Response (201 Created):**
```json
{
  "success": true,
  "ratingCreated": {
    "movieId": 550,
    "userId": "uuid",
    "rating": 5
  }
}
```

**Nota:** Si el usuario ya calificó la película, se actualiza la calificación existente.

---

#### `DELETE /api/movies/delete-rating`

Elimina una calificación de una película.

**Request Body:**
```json
{
  "movieId": 550
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "ratingDeleted": true
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Calificación no encontrada."
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

Este proyecto sigue una **arquitectura en capas** con separación clara de responsabilidades:

### Capas Implementadas

1. **Presentation Layer (Routes + Controllers)**
   - Manejo de HTTP requests/responses
   - Validación de entrada
   - Delegación de lógica

2. **Business Logic Layer (Services)**
   - Integración con APIs externas (Resend, etc.)
   - Orquestación de operaciones complejas

3. **Data Access Layer (DAOs)**
   - Abstracción de base de datos
   - BaseDAO genérico con CRUD
   - DAOs específicos con queries custom

4. **Database Layer (Supabase/PostgreSQL)**
   - Almacenamiento persistente
   - Row Level Security (RLS)
   - Constraints y validaciones

### Flujo de una Request

```
Client → Route → Middleware → Controller → DAO → Supabase → Database
                    ↓
                Logger, Auth, ErrorHandler
```

Para arquitectura detallada y patrones de diseño, consulta [ARCHITECTURE.md](./ARCHITECTURE.md).

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

**Implementadas:**

- ✅ **Contraseñas hasheadas** con bcrypt (10 salt rounds)
- ✅ **JWT con expiración** (24h para access, 1h para reset)
- ✅ **Rate limiting** en login (3-5 intentos/5min)
- ✅ **Validación robusta** de inputs (email, password, age)
- ✅ **CORS configurado** correctamente
- ✅ **Cookies seguras** (httpOnly, secure en producción)
- ✅ **Soft delete** (no eliminación física)
- ✅ **Reset password con JTI** (previene reutilización de tokens)

**Recomendaciones adicionales:**

- 🔧 Agregar Helmet.js para headers de seguridad
- 🔧 Implementar refresh tokens
- 🔧 2FA (Two-Factor Authentication)
- 🔧 Account lockout tras múltiples intentos fallidos

---

## 📄 Licencia

ISC License

---

## 🐛 Soporte

Si encuentras algún bug o tienes alguna pregunta, por favor abre un [issue](https://github.com/Sheimsito/airfilms-server/issues).

---

## 📊 Estado del Proyecto

### ✅ Completado

- [x] Sistema de autenticación completo
- [x] Gestión de usuarios (CRUD)
- [x] Recuperación de contraseña por email
- [x] JWT authentication + refresh
- [x] Rate limiting
- [x] Error handling centralizado
- [x] Logging de requests
- [x] Soft delete
- [x] Validación de inputs
- [x] TypeScript setup completo
- [x] Integración con TMDB API
- [x] Integración con Pexels API
- [x] Sistema de películas (búsqueda, detalles, populares)
- [x] Sistema de favoritos (agregar, eliminar, listar)
- [x] Sistema de comentarios (agregar, eliminar, listar con paginación)
- [x] Sistema de ratings (agregar, eliminar, estadísticas con distribución)
- [x] Documentación (README + ARCHITECTURE)

### 🚧 En Desarrollo

- [ ] Refactorización de endpoints GET (usar query params en lugar de body)
- [ ] Validación mejorada con Joi/Zod
- [ ] Cache para APIs externas
- [ ] Paginación avanzada
- [ ] Búsqueda y filtros avanzados
- [ ] Moderación de comentarios

### 📝 Roadmap Futuro

- [ ] WebSockets para notificaciones en tiempo real
- [ ] Sistema de recomendaciones
- [ ] Upload de imágenes de perfil
- [ ] 2FA (Two-Factor Authentication)
- [ ] Refresh tokens
- [ ] Tests unitarios y de integración
- [ ] CI/CD pipeline
- [ ] Docker containerization

---

## 🎯 Testing

Para probar los endpoints, puedes usar:

- **Postman:** Importa la collection desde la documentación
- **Thunder Client:** Extension de VSCode
- **curl:** Comandos desde terminal

Ejemplo con curl:

```bash
# Registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","lastName":"User","age":25,"email":"test@test.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Get Profile (con token)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Desarrollado con ❤️ y TypeScript**

**Última actualización:** Enero 2025  
**Versión:** 1.8.0  
**Estado:** Production Ready (Auth, Users, Movies, Favorites, Comments & Ratings)

