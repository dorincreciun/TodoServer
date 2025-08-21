# Todo List API - Documentație Completă

## Prezentare Generală

API-ul Todo List oferă o soluție completă pentru gestionarea todo-urilor cu autentificare JWT, validare avansată și funcționalități de filtrare și statistici.

### Caracteristici Principale

- 🔐 **Autentificare JWT** cu refresh tokens
- 👤 **Gestionare utilizatori** cu profil complet
- ✅ **CRUD Todo-uri** cu validare avansată
- 🔍 **Filtrare și căutare** avansată
- 📊 **Statistici** detaliate
- 📄 **Paginare** și sortare
- 🏷️ **Tag-uri** pentru organizare
- 📅 **Scadențe** și notificări
- 🔒 **Securitate** cu rate limiting și validare

## Base URL

```
http://localhost:3000/api
```

## Autentificare

Toate endpoint-urile (cu excepția celor de autentificare) necesită un token JWT în header-ul `Authorization`:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoint-uri

### 🔐 Autentificare

#### POST /auth/register
Înregistrează un utilizator nou.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Utilizator înregistrat cu succes",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/login
Autentifică un utilizator existent.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Autentificare reușită",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "lastLogin": "2023-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/refresh
Reîmprospătează token-ul de acces.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token reîmprospătat cu succes",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/logout
Deconectează utilizatorul.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizat cu succes"
}
```

### 👤 Profil

#### GET /auth/profile
Obține profilul utilizatorului curent.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "lastLogin": "2023-01-01T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### PUT /auth/profile
Actualizează profilul utilizatorului.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profil actualizat cu succes",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john.smith@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "isActive": true,
      "lastLogin": "2023-01-01T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### PUT /auth/change-password
Schimbă parola utilizatorului.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Parola schimbată cu succes"
}
```

### ✅ Todo-uri

#### POST /todos
Creează un todo nou.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Cumpără pâine",
  "description": "Nu uita să cumpăr pâine de la magazin",
  "priority": "medium",
  "dueDate": "2023-12-31T23:59:59.000Z",
  "tags": ["cumpărături", "alimente"],
  "isPublic": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Todo creat cu succes",
  "data": {
    "todo": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Cumpără pâine",
      "description": "Nu uita să cumpăr pâine de la magazin",
      "status": "pending",
      "priority": "medium",
      "dueDate": "2023-12-31T23:59:59.000Z",
      "tags": ["cumpărături", "alimente"],
      "isPublic": false,
      "user": "507f1f77bcf86cd799439012",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET /todos
Obține toate todo-urile cu filtrare și paginare.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Filtrare după status (pending, in_progress, completed, cancelled)
- `priority` - Filtrare după prioritate (low, medium, high, urgent)
- `dateFilter` - Filtrare după dată (today, week, two_weeks, month, overdue)
- `search` - Căutare în titlu și descriere
- `page` - Numărul paginii (default: 1)
- `limit` - Elemente per pagină (default: 10, max: 100)
- `sortBy` - Câmp de sortare (title, priority, dueDate, status, createdAt, updatedAt)
- `sortOrder` - Ordinea de sortare (asc, desc)

**Example Request:**
```
GET /todos?status=pending&priority=high&page=1&limit=10&sortBy=dueDate&sortOrder=asc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Cumpără pâine",
        "description": "Nu uita să cumpăr pâine",
        "status": "pending",
        "priority": "medium",
        "dueDate": "2023-12-31T23:59:59.000Z",
        "isOverdue": false,
        "timeUntilDue": "2 zile",
        "progress": 0,
        "tags": ["cumpărături", "alimente"],
        "isPublic": false,
        "user": {
          "_id": "507f1f77bcf86cd799439012",
          "firstName": "John",
          "lastName": "Doe",
          "username": "john_doe"
        },
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    }
  }
}
```

#### GET /todos/stats
Obține statistici pentru todo-uri.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 10,
      "completed": 5,
      "pending": 3,
      "inProgress": 1,
      "cancelled": 1,
      "overdue": 2,
      "completionRate": 50,
      "priorityBreakdown": {
        "low": 2,
        "medium": 4,
        "high": 3,
        "urgent": 1
      }
    }
  }
}
```

#### GET /todos/{id}
Obține un todo specific.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "todo": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Cumpără pâine",
      "description": "Nu uita să cumpăr pâine",
      "status": "pending",
      "priority": "medium",
      "dueDate": "2023-12-31T23:59:59.000Z",
      "isOverdue": false,
      "timeUntilDue": "2 zile",
      "progress": 0,
      "tags": ["cumpărături", "alimente"],
      "isPublic": false,
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "John",
        "lastName": "Doe",
        "username": "john_doe"
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### PUT /todos/{id}
Actualizează un todo.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Cumpără pâine și lapte",
  "description": "Nu uita să cumpăr pâine și lapte de la magazin",
  "status": "in_progress",
  "priority": "high",
  "dueDate": "2023-12-31T23:59:59.000Z",
  "tags": ["cumpărături", "alimente", "urgent"],
  "isPublic": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Todo actualizat cu succes",
  "data": {
    "todo": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Cumpără pâine și lapte",
      "description": "Nu uita să cumpăr pâine și lapte de la magazin",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2023-12-31T23:59:59.000Z",
      "isOverdue": false,
      "timeUntilDue": "2 zile",
      "progress": 50,
      "tags": ["cumpărături", "alimente", "urgent"],
      "isPublic": false,
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "John",
        "lastName": "Doe",
        "username": "john_doe"
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### DELETE /todos/{id}
Șterge un todo.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Todo șters cu succes"
}
```

#### PATCH /todos/{id}/complete
Marchează todo ca completat.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Todo marcat ca completat",
  "data": {
    "todo": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Cumpără pâine",
      "status": "completed",
      "completedAt": "2023-01-01T00:00:00.000Z",
      "progress": 100
    }
  }
}
```

#### PATCH /todos/{id}/progress
Marchează todo ca în progres.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Todo marcat ca în progres",
  "data": {
    "todo": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Cumpără pâine",
      "status": "in_progress",
      "progress": 50
    }
  }
}
```

#### PATCH /todos/{id}/cancel
Anulează todo.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Todo anulat",
  "data": {
    "todo": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Cumpără pâine",
      "status": "cancelled"
    }
  }
}
```

### 🖥️ Sistem

#### GET /health
Health check pentru server.

**Response (200):**
```json
{
  "success": true,
  "message": "Serverul funcționează corect",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "environment": "development"
}
```

#### GET /
Informații despre API.

**Response (200):**
```json
{
  "success": true,
  "message": "Todo List API v1.0.0",
  "documentation": "/api-docs",
  "endpoints": {
    "auth": "/api/auth",
    "todos": "/api/todos",
    "health": "/api/health"
  }
}
```

## Coduri de Eroare

### 400 - Bad Request
Date invalide sau lipsă.

```json
{
  "success": false,
  "message": "Date invalide",
  "errors": [
    {
      "field": "email",
      "message": "Vă rugăm introduceți un email valid",
      "value": "invalid-email"
    }
  ]
}
```

### 401 - Unauthorized
Token invalid sau lipsă.

```json
{
  "success": false,
  "message": "Token invalid"
}
```

### 404 - Not Found
Resursa nu a fost găsită.

```json
{
  "success": false,
  "message": "Todo nu a fost găsit"
}
```

### 422 - Unprocessable Entity
Erori de validare.

```json
{
  "success": false,
  "message": "Eroare de validare",
  "errors": [
    {
      "field": "password",
      "message": "Parola trebuie să aibă cel puțin 6 caractere"
    }
  ]
}
```

### 429 - Too Many Requests
Rate limit depășit.

```json
{
  "success": false,
  "message": "Prea multe cereri de la această adresă IP, vă rugăm încercați din nou mai târziu."
}
```

### 500 - Internal Server Error
Eroare internă server.

```json
{
  "success": false,
  "message": "Eroare internă server"
}
```

## Validări

### Utilizator
- **username**: 3-30 caractere, doar litere, cifre și underscore
- **email**: format email valid
- **password**: minim 6 caractere, cel puțin o literă mică, mare și o cifră
- **firstName/lastName**: 2-50 caractere

### Todo
- **title**: 1-200 caractere (obligatoriu)
- **description**: maxim 1000 caractere
- **priority**: low, medium, high, urgent
- **status**: pending, in_progress, completed, cancelled
- **dueDate**: format ISO 8601
- **tags**: array de string-uri, maxim 20 caractere per tag

## Rate Limiting

API-ul implementează rate limiting pentru a preveni abuzul:
- **Limită**: 100 de cereri per 15 minute per IP
- **Headers**: Include informații despre rate limit în răspunsuri

## Securitate

- **JWT Tokens**: Autentificare sigură cu refresh tokens
- **Password Hashing**: Parole hash-uite cu bcrypt
- **Input Validation**: Validare strictă a tuturor input-urilor
- **CORS**: Configurare pentru origini permise
- **Helmet**: Headers de securitate
- **Rate Limiting**: Protecție împotriva atacurilor brute force

## Documentația Swagger

Documentația interactivă este disponibilă la:
```
http://localhost:3000/api-docs
```

Specificația OpenAPI în format JSON:
```
http://localhost:3000/api-docs.json
```

## Generarea Tipurilor TypeScript

Pentru a genera tipurile TypeScript din documentația OpenAPI:

```bash
# Asigură-te că serverul rulează
npm run dev

# În alt terminal, generează tipurile
npm run generate-types
```

Tipurile vor fi generate în directorul `types/`.

## Testare

Pentru a testa API-ul:

```bash
# Teste unitare
npm test

# Teste API
npm run test:api
```

## Configurare

Creează un fișier `.env` cu următoarele variabile:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/todolist
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
``` 