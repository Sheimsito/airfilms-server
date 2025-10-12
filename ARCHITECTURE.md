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
   └─> POST /api/users/register
       Body: { name, email, password, ... }
          ↓
2. ROUTE (userRoutes.ts)
   └─> router.post('/register', authController.register)
          ↓
3. CONTROLLER (authController.ts)
   ├─> Extrae datos del request body
   ├─> Valida datos básicos
   └─> Llama a userDAO.create(userData)
          ↓
4. DAO (userDAO.ts → baseDAO.ts)
   ├─> userDAO extiende BaseDAO
   ├─> BaseDAO.create() ejecuta:
   │   └─> supabase.from('users').insert([payload])
   └─> Retorna el usuario creado
          ↓
5. DATABASE (Supabase)
   ├─> Valida constraints (unique email, not null, etc.)
   ├─> Inserta registro
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
2. CONTROLLER
   ├─> Busca usuario por email (userDAO.findByEmail)
   ├─> Genera token de recuperación (JWT)
   ├─> Guarda token en DB (userDAO.updateResetToken)
          ↓
3. EXTERNAL SERVICE (emailService)
   ├─> emailService.sendPasswordReset(email, token)
   ├─> Resend API envía email con link de recuperación
   └─> Email: "Click aquí para resetear tu contraseña"
          ↓
4. RESPONSE
   └─> Status: 200 OK
       Body: { message: "Email de recuperación enviado" }
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
│   └── config.ts        # Variables de entorno centralizadas
│
├── controllers/         # 🎮 Controladores 
│   └── authController.ts
│
├── dao/                 # 🗄️ Data Access Objects
│   ├── baseDAO.ts       # DAO genérico (CRUD base)
│   └── userDAO.ts       # DAO específico de usuarios
│
├── lib/                 # 📚 Librerías externas
│   └── supabaseClient.ts # Cliente de Supabase
│
├── middleware/          # 🛡️ Middlewares
│   ├── auth.ts          # Verificación de autenticación
│   └── errorHandler.ts  # Manejo centralizado de errores
│
├── routes/              # 🛣️ Definición de rutas
│   └── userRoutes.ts    # Rutas de usuarios
│
├── service/             # 🌐 Servicios externos e integraciones
│   ├── emailService.ts      # Servicio de emails (Resend)
│   ├── moviesApiService.ts  # API de películas (TMDB/OMDB)
│   └── storageService.ts    # Gestión de archivos (Supabase Storage)
│
├── types/               # 🏷️ Tipos TypeScript compartidos
│   └── database.ts      # Tipos de base de datos (Supabase) - Single Source of Truth
│
├── app.ts               # 🚀 Configuración de Express
└── server.ts            # 🌐 Punto de entrada (HTTP server)
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

✅ Variables de entorno para secrets  
✅ CORS configurado  
✅ Express JSON body parser (evita payload muy grandes)

### Pendientes

⚠️ Hash de contraseñas (bcrypt)  
⚠️ Rate limiting (express-rate-limit)  
⚠️ Helmet.js para headers de seguridad  
⚠️ Validación de input (Zod/Joi)  
⚠️ JWT authentication  
⚠️ SQL injection prevention (Supabase lo maneja, pero validar inputs)

---

## 📚 Recursos Adicionales

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Última actualización:** Octubre 2025  
**Versión de arquitectura:** 1.0

