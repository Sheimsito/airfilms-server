# 🏗️ Arquitectura del Proyecto AirFilms Server

Este documento describe la arquitectura, patrones de diseño y decisiones técnicas del backend de AirFilms.

---

## 📐 Tabla de Contenidos

1. [Visión General](#-visión-general)
2. [Arquitectura en Capas](#-arquitectura-en-capas)
3. [Flujo de Datos](#-flujo-de-datos)
4. [Patrones de Diseño](#-patrones-de-diseño)
5. [Estructura de Carpetas](#-estructura-de-carpetas)
6. [Componentes Principales](#-componentes-principales)
7. [Base de Datos](#-base-de-datos)
8. [Decisiones Técnicas](#-decisiones-técnicas)
9. [Escalabilidad](#-escalabilidad)

---

## 🎯 Visión General

AirFilms Server es una API RESTful construida con **arquitectura en capas** que separa las responsabilidades en diferentes niveles, facilitando el mantenimiento, testing y escalabilidad.

### Principios Arquitectónicos

- ✅ **Separation of Concerns (SoC)**: Cada capa tiene una responsabilidad específica
- ✅ **Single Responsibility Principle (SRP)**: Cada clase/módulo tiene un propósito único
- ✅ **Dependency Injection**: Las dependencias se inyectan, no se instancian
- ✅ **DRY (Don't Repeat Yourself)**: Código reutilizable mediante abstracciones
- ✅ **Type Safety**: TypeScript garantiza tipos en tiempo de compilación

---

## 🧱 Arquitectura en Capas

```
┌─────────────────────────────────────────────┐
│           CLIENT (Frontend/Mobile)           │
└─────────────────────────────────────────────┘
                     ↕ HTTPS
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER (Express)         │
│  ┌──────────────────────────────────────┐   │
│  │   Routes → Controllers → Middleware   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────┐
│                  SERVICES LAYER             │
│  ┌──────────────────────────────────────┐   │
│  │  External Services Integration       │   │
│  │  • Email (Resend)                    │   │
│  │  • Movies API (TMDB, OMDB, etc.)     │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────┐
│          DATA ACCESS LAYER (DAO)            │
│  ┌──────────────────────────────────────┐   │
│  │    BaseDAO → SpecificDAO → Supabase  │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────┐
│         DATABASE (Supabase)       │
└─────────────────────────────────────────────┘
```

### Descripción de Capas

#### 1. **Presentation Layer (Capa de Presentación)**

**Responsabilidad:** Manejar las peticiones HTTP y respuestas.

**Componentes:**
- **Routes:** Definen los endpoints de la API
- **Controllers:** Procesan las peticiones y delegan la lógica
- **Middleware:** Interceptan peticiones (autenticación, validación, manejo de errores)

**Ubicación:** `src/routes/`, `src/controllers/`, `src/middleware/`

#### 2. **Business Logic & Services Layer (Capa de Lógica de Negocio y Servicios Externos)**

**Responsabilidad:** Integrar servicios externos y orquestar operaciones complejas.

**Componentes:**
- **External Services:** Integraciones con APIs y servicios de terceros
  - **Email Service (Resend):** Envío de emails transaccionales (recuperación de contraseña)
  - **Movies API Service:** Consumo de APIs de películas (TMDB, OMDB, etc.) para obtener información de contenido multimedia NOTA: En investigación

**Ubicación:** `src/service/`
```

#### 3. **Data Access Layer (Capa de Acceso a Datos)**

**Responsabilidad:** Abstraer las operaciones de base de datos.

**Componentes:**
- **DAOs (Data Access Objects):** Encapsulan consultas a la base de datos
- **BaseDAO:** Clase genérica con operaciones CRUD comunes
- **Specific DAOs:** Extienden BaseDAO con operaciones específicas

**Ubicación:** `src/dao/`

#### 4. **Database Layer (Capa de Base de Datos)**

**Responsabilidad:** Almacenar y gestionar datos persistentes.

**Tecnología:** Supabase (PostgreSQL)

---

## 🔄 Flujo de Datos

### Ejemplo 1: Registro de Usuario

```
1. CLIENT
   └─> POST /api/auth/register
       Body: { name, lastName, age, email, password }
          ↓
2. ROUTE (routes/index.ts → authRoutes.ts)
   └─> router.post('/register', authController.register)
          ↓
3. CONTROLLER (authController.ts)
   ├─> Valida campos requeridos (name, lastName, age, email, password)
   ├─> Valida formato de email (regex)
   ├─> Valida formato de contraseña (min 8 chars, mayúscula, número, especial)
   ├─> Verifica que el email no exista (userDAO.findByEmail)
   └─> Llama a userDAO.create(userData)
          ↓
4. DAO (userDAO.ts → baseDAO.ts)
   ├─> userDAO.create() hashea la contraseña con bcrypt
   ├─> BaseDAO.create() ejecuta:
   │   └─> supabase.from('users').insert([payload]).select('*').single()
   └─> Retorna el usuario creado
          ↓
5. DATABASE (Supabase)
   ├─> Valida constraints (unique email, not null, check constraints)
   ├─> Inserta registro con valores por defecto (isDeleted: false, timestamps)
   └─> Retorna datos insertados
          ↓
6. RESPONSE
   └─> Controller envía respuesta al cliente
       Status: 201 Created
       Body: { userId: "uuid" }
```

### Ejemplo 2: Recuperación de Contraseña

```
1. CLIENT
   └─> POST /api/auth/forgot-password
       Body: { email: "user@example.com" }
          ↓
2. CONTROLLER (authController.forgotPassword)
   ├─> Busca usuario por email (userDAO.findByEmail)
   ├─> Si no existe: retorna 202 (por seguridad, no revelar si existe)
   ├─> Genera jwtid único (random string)
   ├─> Crea JWT con userId y jwtid, expiración 1h
   ├─> Guarda jwtid en DB (userDAO.updateResetPasswordJti)
          ↓
3. EXTERNAL SERVICE (resendService)
   ├─> Genera link: ${FRONTEND_URL}/reset-password?token=${resetToken}
   ├─> En desarrollo: envía a email verificado (kealgri@gmail.com)
   ├─> En producción: envía al email del usuario
   ├─> sendMail() usa Resend API
   └─> Email: "Haz clic para restablecer tu contraseña"
          ↓
4. CLIENT (Usuario hace click en el link)
   └─> POST /api/auth/reset-password
       Body: { token: "jwt...", newPassword: "NewPass123!" }
          ↓
5. CONTROLLER (authController.resetPassword)
   ├─> Verifica JWT (jwt.verify)
   ├─> Busca usuario (userDAO.findById)
   ├─> Verifica que user.resetPasswordJti === decoded.jti
   ├─> Valida nueva contraseña (min 8, mayúscula, número, especial)
   ├─> Invalida el token (updateResetPasswordJti con "")
   ├─> Actualiza contraseña hasheada (userDAO.updateById)
          ↓
6. RESPONSE
   └─> Status: 200 OK
       Body: { success: true, message: "Contraseña actualizada." }
```

### Ejemplo 3: Verificación de Autenticación

```
1. CLIENT
   └─> GET /api/auth/verify-auth
       Headers: Authorization: Bearer <token> o Cookie: access_token
          ↓
2. MIDDLEWARE (authenticateToken)
   ├─> Extrae token del header o cookie
   ├─> Verifica firma del JWT (jwt.verify)
   ├─> Verifica expiración
   ├─> Inyecta user.userId en req.user
   └─> Pasa al controlador
          ↓
3. CONTROLLER (authController.verifyAuth)
   ├─> Lee req.user.userId (inyectado por middleware)
   └─> Retorna información del usuario
          ↓
4. RESPONSE
   └─> Status: 200 OK
       Body: { success: true, user: { id: "uuid" } }

// Si el token es inválido o expiró:
MIDDLEWARE → 401 Unauthorized: { message: "No autorizado." }
```



---

## 🎨 Patrones de Diseño

### 1. **DAO Pattern (Data Access Object)**

Abstrae y encapsula todo el acceso a la fuente de datos.

**Ventajas:**
- Separa la lógica de persistencia de la lógica de negocio
- Facilita el cambio de base de datos sin afectar otras capas
- Permite testing mediante mocks

**Implementación:**

```typescript
// Base genérico
class BaseDAO<Row, Insert, Update> {
  async create(payload: Insert): Promise<Row> { }
  async findById(id: string): Promise<Row> { }
  async list(params): Promise<Paginated<Row>> { }
  async updateById(id: string, payload: Update): Promise<Row> { }
  async deleteById(id: string): Promise<boolean> { }
}

// Implementación específica
class UserDAO extends BaseDAO<UserRow, UserInsert, UserUpdate> {
  constructor() {
    super('users'); // nombre de la tabla
  }
  
  // Métodos adicionales específicos de usuarios
  async findByEmail(email: string): Promise<UserRow | null> { }
}
```

### 2. **Repository Pattern (implícito en DAO)**

Similar al DAO, pero más orientado al dominio.

### 3. **Singleton Pattern**

El cliente de Supabase se instancia una sola vez:

```typescript
// supabaseClient.ts
export const supabase = createClient(...); // Una sola instancia

// Uso en múltiples archivos
import { supabase } from './lib/supabaseClient';
```

### 4. **MVC Pattern (Model-View-Controller)**

Aunque no hay "vistas" (es una API), seguimos una variante:
- **Model:** `src/types/database.ts` (tipos de datos)
- **Controller:** `src/controllers/`
- **"View":** JSON responses

**Nota:** No usamos carpeta `models/` porque con DAO Pattern los tipos están centralizados en `types/database.ts`

### 5. **Middleware Pattern**

Interceptan peticiones antes de llegar al controlador:

```typescript
app.use(express.json());           // Parse JSON
app.use('/api/users', userRoutes); // Routing
app.use(errorHandler);             // Error handling
```

---

## 📂 Estructura de Carpetas

```
src/
├── config/              # 🔧 Configuración
│   ├── config.ts        # Variables de entorno centralizadas
│   └── server.ts        # Configuración de Express (CORS, body parser, middlewares)
│
├── controllers/         # 🎮 Controladores 
│   ├── authController.ts   # Registro, login, logout, forgot/reset password, verify auth
│   └── userController.ts   # Perfil de usuario, actualización, soft delete
│
├── dao/                 # 🗄️ Data Access Objects
│   ├── baseDAO.ts       # DAO genérico (CRUD + soft delete)
│   └── userDAO.ts       # DAO específico de usuarios
│
├── lib/                 # 📚 Librerías externas
│   └── supabaseClient.ts # Cliente de Supabase (tipado y genérico)
│
├── middleware/          # 🛡️ Middlewares
│   ├── auth.ts          # Autenticación JWT + rate limiting
│   ├── errorHandler.ts  # Manejo centralizado de errores (Supabase, JWT, etc.)
│   ├── logger.ts        # Logger de peticiones HTTP
│   └── notFound.ts      # Manejo de rutas 404
│
├── routes/              # 🛣️ Definición de rutas
│   ├── index.ts         # Router principal que agrupa todas las rutas
│   ├── authRoutes.ts    # Rutas de autenticación (públicas)
│   └── userRoutes.ts    # Rutas de usuario (protegidas)
│
├── service/             # 🌐 Servicios externos e integraciones
│   └── resendService.ts # Servicio de emails (Resend API)
│
├── types/               # 🏷️ Tipos TypeScript compartidos
│   ├── database.ts      # Tipos de base de datos (Supabase) - Single Source of Truth
│   └── express.d.ts     # Extensiones de tipos de Express (AuthRequest)
│
└── server.ts            # 🌐 Punto de entrada principal (HTTP server)
```

## 🗄️ Base de Datos

### Tecnología: Supabase (PostgreSQL)

**Características:**
- Base de datos PostgreSQL gestionada
- Row Level Security (RLS)
- Realtime subscriptions
- API REST automática
- Storage para archivos

### Tipos de Base de Datos

Todos los tipos están centralizados en `src/types/database.ts` como **single source of truth**.

```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      users: {
        Row: { /* campos de la tabla */ };
        Insert: { /* campos requeridos para insert */ };
        Update: { /* campos opcionales para update */ };
      };
    };
  };
}

// Helper types exportados
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
```

**Ventajas:**
- ✅ Single source of truth
- ✅ Puede generarse automáticamente desde Supabase
- ✅ No hay duplicación de tipos
- ✅ Consistencia garantizada

### Esquema de Base de Datos

#### Tabla: `users`

| Columna            | Tipo        | Descripción                      |
|--------------------|-------------|----------------------------------|
| id                 | UUID        | Primary Key (auto-generado)     |
| name               | VARCHAR     | Nombre del usuario               |
| lastName           | VARCHAR     | Apellido del usuario             |
| age                | INTEGER     | Edad del usuario                 |
| email              | VARCHAR     | Email único (unique constraint)  |
| password           | VARCHAR     | Contraseña (debe hashearse)      |
| resetPasswordJti   | VARCHAR     | Token para reset de contraseña   |
| isDeleted          | BOOLEAN     | Soft delete flag                 |
| createdAt          | TIMESTAMP   | Fecha de creación                |
| updatedAt          | TIMESTAMP   | Fecha de última actualización    |

### Conexión

```typescript
// Dos clientes según necesidad:

// 1. Cliente tipado (para uso específico)
export const supabase = createClient<Database>(url, key);

// 2. Cliente genérico (para BaseDAO)
export const supabaseGeneric = createClient(url, key);
```

**¿Por qué dos clientes?**
- El cliente tipado requiere que las tablas estén definidas en `Database`
- El `BaseDAO` es genérico y trabaja con cualquier tabla
- Esto evita conflictos de tipos en TypeScript

---

## 🧠 Decisiones Técnicas

### 1. **TypeScript sobre JavaScript**

**Razón:** Type-safety, mejor DX, menos bugs en producción.

### 2. **ESM (ES Modules) en lugar de CommonJS**

**Configuración:**
- `"type": "module"` en `package.json`
- `moduleResolution: "Node"` en `tsconfig.json`

**Ventajas:**
- Estándar moderno de JavaScript
- Mejor tree-shaking
- Sintaxis import/export consistente

### 3. **Services para Integraciones Externas**

**Razón:**
- Separar la lógica de integración con APIs externas
- Facilita el testing mediante mocks
- Permite cambiar proveedores sin afectar controladores
- Centraliza la configuración de servicios externos

**Ejemplos de servicios:**
- **Email Service (Resend):** Envío de emails transaccionales
- **Movies API Service (TMDB):** Obtención de información de películas
- **Storage Service (Supabase Storage):** Gestión de archivos

**Ventajas:**
- Un solo lugar para cambiar la API de películas (de TMDB a OMDB)
- Fácil mockear en tests
- Rate limiting y retry logic centralizados

### 4. **tsx en lugar de ts-node**

**Razón:** 
- `ts-node` tiene problemas con ESM
- `tsx` es más rápido y maneja ESM perfectamente
- No requiere extensiones `.js` en imports

### 5. **Supabase sobre ORM tradicional**

**Ventajas:**
- Backend-as-a-Service completo
- Cliente JavaScript nativo
- Realtime integrado
- Menos boilerplate que Prisma/TypeORM

**Trade-off:**
- Vendor lock-in (pero PostgreSQL estándar debajo)

### 6. **DAO Pattern sobre Active Record**

**Razón:**
- Mejor separación de responsabilidades
- Más fácil de testear (mocking)
- No mezcla lógica de negocio con persistencia

### 7. **Arquitectura en Capas sobre Monolítico**

**Razón:**
- Escalabilidad
- Mantenibilidad
- Facilita testing unitario
- Permite migrar a microservicios si es necesario

---

## 📈 Escalabilidad

### Escalabilidad Horizontal

```
         Load Balancer
              │
      ┌───────┼───────┐
      ↓       ↓       ↓
   Server1 Server2 Server3
      │       │       │
      └───────┴───────┘
              ↓
         Supabase DB
```

**Preparación:**
- ✅ Arquitectura stateless (sin sesiones en memoria)
- ✅ Variables de entorno para configuración


### Escalabilidad de Base de Datos

**Supabase maneja:**
- Connection pooling
- Replicación
- Backups automáticos

**Futuras optimizaciones:**
- Índices en columnas frecuentemente consultadas
- Query optimization
- Read replicas para lectura intensiva



### API Rate Limiting & Caching

**Para APIs externas (TMDB, etc.):**

```typescript
// Implementar cache para reducir llamadas a APIs
class CachedMoviesApiService extends MoviesApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_TTL = 3600000; // 1 hora
  
  async getMovieDetails(movieId: string) {
    const cached = this.cache.get(`movie:${movieId}`);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    
    const data = await super.getMovieDetails(movieId);
    this.cache.set(`movie:${movieId}`, { data, timestamp: Date.now() });
    
    return data;
  }
}
```
---


## 🔐 Seguridad

### Implementadas

✅ **Variables de entorno para secrets**  
✅ **CORS configurado** (múltiples orígenes, credentials habilitados)  
✅ **Express JSON body parser** (límite de 10mb)  
✅ **Hash de contraseñas** (bcrypt con 10 salt rounds)  
✅ **Rate limiting** (express-rate-limit en login: 3-5 intentos/5min)  
✅ **JWT authentication** (tokens con expiración de 24h)  
✅ **Validación de input** (validación manual en controllers)  
✅ **SQL injection prevention** (Supabase maneja prepared statements)  
✅ **Middleware de autenticación** (verifica JWT en rutas protegidas)  
✅ **Soft delete** (no elimina datos físicamente)  
✅ **Cookie seguras** (httpOnly, secure en producción, sameSite)

### Medidas de Seguridad Específicas

**Contraseñas:**
- Hash con bcrypt (10 salt rounds)
- Validación: mínimo 8 caracteres, mayúscula, minúscula, número, carácter especial
- Never retornadas en responses

**JWT:**
- Tokens firmados con secret seguro
- Expiración de 24h para access tokens
- Expiración de 1h para reset password tokens
- JTI (JWT ID) único para reset tokens (previene reutilización)

**Rate Limiting:**
- Login: 3-5 intentos por 5 minutos
- Skip en desarrollo para facilitar testing
- Headers estándar de rate limit incluidos

**CORS:**
- Lista blanca de orígenes permitidos
- Credentials habilitados para cookies
- En desarrollo: permite todos los orígenes

### Pendientes

⚠️ Helmet.js para headers de seguridad  
⚠️ Input sanitization (DOMPurify para contenido HTML)  
⚠️ CSRF protection  
⚠️ Refresh tokens (para sessions de larga duración)  
⚠️ Account lockout después de múltiples intentos fallidos
---

## 📚 Recursos Adicionales

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📊 Componentes Principales Implementados

| Componente         | Descripción                                    | Estado           |
|------------        |------------------------------------------------|------------------|
| **AuthController** | Registro, login, logout, forgot/reset password, verify auth | ✅ Implementado |
| **UserController** | Perfil, actualización, soft delete             | ✅ Implementado |
| **BaseDAO**        | CRUD genérico + soft delete                    | ✅ Implementado |
| **UserDAO**        | Operaciones específicas de usuarios            | ✅ Implementado |
| **Auth Middleware** | JWT verification + rate limiting              | ✅ Implementado |
| **Error Handler**  | Manejo de errores Supabase/PostgreSQL          | ✅ Implementado |
| **Logger Middleware** | Logging de requests/responses               | ✅ Implementado |
| **NotFound Middleware** | Manejo de rutas 404                       | ✅ Implementado |
| **Resend Service**  | Envío de emails transaccionales               | ✅ Implementado |

---

**Última actualización:** Octubre 2025  
**Versión de arquitectura:** 1.5 
**Estado:** Producción Ready (Backend Auth & User Management)

