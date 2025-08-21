# 🚀 Todo List API - Backend Modern și Secur

**API modern pentru gestionarea todo-urilor cu autentificare JWT avansată, securitate robustă și CI/CD complet**

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-blue.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.2-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-✓-blue.svg)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/CI/CD-GitHub%20Actions-green.svg)](https://github.com/features/actions)

---

## 🌟 Caracteristici

### 🔒 **Securitate Avansată**
- **JWT cu Refresh Tokens** - Autentificare sigură cu reîmprospătare automată
- **Rate Limiting Avansat** - Protecție împotriva atacurilor brute force
- **Brute Force Protection** - Detectare și blocare automată
- **Helmet.js Configurabil** - Headers de securitate HTTP
- **XSS Protection** - Protecție împotriva Cross-Site Scripting
- **MongoDB Sanitization** - Protecție împotriva injection-urilor
- **CORS Configurabil** - Control granular asupra origin-urilor

### 📊 **Logging și Monitoring**
- **Winston Logger** - Logging structurat cu rotație automată
- **Security Logging** - Tracking pentru evenimente de securitate
- **Performance Monitoring** - Detectarea request-urilor lente
- **Health Checks** - Verificarea stării serviciilor
- **Prometheus + Grafana** - Monitoring complet

### 🗄️ **Baza de Date și Cache**
- **MongoDB 8.0** - Versiunea cea mai nouă cu validare avansată
- **Redis** - Cache și session management
- **Connection Pooling** - Gestionarea eficientă a conexiunilor
- **Indexuri Optimizate** - Performanță îmbunătățită

### 🔧 **Validare și Error Handling**
- **Joi Validation** - Validare robustă a datelor cu mesaje în română
- **Error Handling Centralizat** - Gestionarea consistentă a erorilor
- **Custom Error Codes** - Coduri de eroare standardizate
- **Async Error Handling** - Gestionarea automată a erorilor async

### 📚 **Documentație API**
- **Swagger/OpenAPI 3.0** - Documentație interactivă completă
- **Endpoint Examples** - Exemple pentru toate endpoint-urile
- **Schema Validation** - Validare automată a request-urilor

### 🐳 **Containerizare Completă**
- **Docker Multi-stage Build** - Imagini optimizate pentru producție
- **Docker Compose** - Dezvoltare locală simplă
- **Health Checks** - Verificarea stării containerelor
- **Non-root User** - Securitate îmbunătățită
- **Nginx Reverse Proxy** - Load balancing și SSL

### 🧪 **Testing Complet**
- **Jest Configuration** - Testing framework modern
- **Supertest** - Testing pentru API endpoints
- **Coverage Reports** - Rapoarte de acoperire
- **Test Setup** - Configurare automată pentru teste

### 🔧 **Development Tools**
- **ESLint + Prettier** - Standardizarea codului
- **Husky + lint-staged** - Git hooks pentru calitatea codului
- **TypeScript Support** - Generarea tipurilor din Swagger

### 🚀 **CI/CD Pipeline**
- **GitHub Actions** - Automatizare completă
- **Multi-environment** - Development, Staging, Production
- **Automated Testing** - Teste automate la fiecare commit
- **Docker Registry** - Imagini Docker automatizate
- **Rollback Support** - Rollback automat în caz de eroare
- **Slack Notifications** - Notificări pentru deployment

---

## 🛠️ Tehnologii

- **Backend**: Node.js, Express.js
- **Database**: MongoDB 8.0, Mongoose
- **Cache**: Redis 7.2
- **Authentication**: JWT, bcryptjs
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet.js, express-rate-limit, express-brute
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Reverse Proxy**: Nginx
- **Code Quality**: ESLint, Prettier, Husky

---

## 📋 Cerințe

- Node.js 18.x sau mai nou
- MongoDB 7.0+
- Redis 7.2+
- Docker și Docker Compose
- Git

---

## 🚀 Instalare și Configurare

### 1. **Clonează Repository-ul**

```bash
git clone https://github.com/your-username/todo-list-backend.git
cd todo-list-backend
```

### 2. **Instalare Dependențe**

```bash
npm install
```

### 3. **Configurare Variabile de Mediu**

```bash
# Copiază fișierul de configurare
cp env.example .env

# Editează .env cu configurațiile tale
nano .env
```

### 4. **Pornire cu Docker Compose (Recomandat)**

```bash
# Pornește toate serviciile
docker-compose up -d

# Verifică starea
docker-compose ps

# Vezi logurile
docker-compose logs -f backend
```

### 5. **Pornire Locală**

```bash
# Pornește MongoDB și Redis local
# Apoi pornește serverul
npm run dev
```

---

## 🧪 Testing

```bash
# Rulează testele
npm test

# Cu coverage
npm run test:coverage

# Testează API-ul
npm run test:api

# Testează staging
npm run test:staging
```

---

## 📊 Monitoring și Logs

### **Logs Structurate**
- **Application Logs**: `logs/application-YYYY-MM-DD.log`
- **Error Logs**: `logs/error-YYYY-MM-DD.log`
- **HTTP Logs**: `logs/http-YYYY-MM-DD.log`
- **Security Logs**: `logs/security-YYYY-MM-DD.log`
- **Performance Logs**: `logs/performance-YYYY-MM-DD.log`

### **Health Checks**
```bash
# Verifică starea API-ului
curl http://localhost:3000/api/health

# Verifică starea serviciilor Docker
docker-compose ps
```

### **Monitoring Dashboards**
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **MongoDB Express**: http://localhost:8081 (admin/admin123)
- **Redis Commander**: http://localhost:8082

---

## 🚀 CI/CD Pipeline

### **Workflow-uri GitHub Actions**

#### 1. **Staging Deployment** (`staging.yml`)
- Rulează automat pentru fiecare Pull Request
- Testează codul cu MongoDB și Redis
- Build Docker image pentru staging
- Comentează PR cu informații despre staging

#### 2. **Production Deployment** (`deploy.yml`)
- Rulează automat pentru push pe `main`/`master`
- Testează codul complet
- Build și push Docker images
- Deploy automat pe serverul de producție
- Rollback automat în caz de eroare
- Notificări Slack

### **Configurare Secrets GitHub**

Adaugă următoarele secrets în repository-ul tău GitHub:

```bash
# Server Configuration
HOST=your-server-ip
USERNAME=your-server-username
SSH_KEY=your-private-ssh-key
PORT=22
PROJECT_PATH=/opt/todo-list-backend

# Optional: Slack Notifications
SLACK_WEBHOOK=your-slack-webhook-url
```

### **Deployment Manual**

```bash
# Pe serverul de producție
cd /opt/todo-list-backend
chmod +x scripts/deploy.sh

# Deployment complet
./scripts/deploy.sh deploy

# Rollback
./scripts/deploy.sh rollback

# Verificare status
./scripts/deploy.sh status

# Backup manual
./scripts/deploy.sh backup
```

---

## 🌐 Endpoint-uri Disponibile

- **API Base URL**: `http://localhost:3000/api/v1`
- **Documentație Swagger**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/api/health`
- **MongoDB Express**: `http://localhost:8081` (admin/admin123)
- **Redis Commander**: `http://localhost:8082`

### **Staging Environment**
- **API Base URL**: `http://localhost:3001/api/v1`
- **Documentație Swagger**: `http://localhost:3001/api-docs`
- **MongoDB Express**: `http://localhost:8083` (admin/staging123)
- **Redis Commander**: `http://localhost:8084`

---

## 🔒 Securitate Implementată

- **Rate Limiting**: 100 request-uri per 15 minute (general), 5 per 15 minute (autentificare)
- **Brute Force Protection**: Blocare automată după 3 încercări eșuate
- **JWT cu Refresh Tokens**: Autentificare sigură cu reîmprospătare automată
- **Input Validation**: Validare robustă cu Joi
- **Security Headers**: Helmet.js pentru protecție HTTP

---

## 📊 Monitoring și Logs

- **Logs Structurate**: Winston cu rotație automată
- **Security Logging**: Tracking pentru evenimente de securitate
- **Performance Monitoring**: Detectarea request-urilor lente
- **Health Checks**: Verificarea stării serviciilor
- **Prometheus + Grafana**: Monitoring complet

---

## 📝 Scripturi Disponibile

```bash
# Development
npm run dev          # Pornește în mod development
npm run start        # Pornește în mod production

# Testing
npm test             # Rulează testele
npm run test:watch   # Teste în mod watch
npm run test:coverage # Teste cu coverage

# Code Quality
npm run lint         # ESLint
npm run lint:fix     # ESLint cu auto-fix
npm run format       # Prettier
npm run format:check # Verifică formatarea

# Database
npm run db:reset     # Reset database
npm run db:seed      # Seed database

# Docker
npm run docker:build # Build Docker image
npm run docker:up    # Pornește serviciile
npm run docker:down  # Oprește serviciile
npm run docker:logs  # Vezi logurile

# Deployment
npm run deploy       # Deploy manual
npm run rollback     # Rollback manual
```

---

## 🐳 Docker

### **Development**
```bash
docker-compose up -d
```

### **Staging**
```bash
docker-compose -f docker-compose.staging.yml up -d
```

### **Production**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔧 Configurare Avansată

### **Environment Variables**

Vezi `env.example` pentru toate variabilele disponibile și descrierile lor.

### **Custom Middleware**

Poți adăuga middleware-uri custom în `middleware/` și să le configurezi în `server.js`.

### **Database Migrations**

Pentru migrații de bază de date, folosește scripturile din `scripts/`.

---

## 🤝 Contribuții

1. Fork repository-ul
2. Creează un branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. Commit modificările (`git commit -m 'Add some AmazingFeature'`)
4. Push la branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

### **Code Style**

- Folosește ESLint și Prettier
- Scrie teste pentru funcționalități noi
- Documentează API-ul cu Swagger
- Urmează convențiile de commit

---

## 📄 Licență

Acest proiect este licențiat sub [MIT License](LICENSE).

---

## 🆘 Suport

- **Documentație**: [Wiki](https://github.com/your-username/todo-list-backend/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/todo-list-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/todo-list-backend/discussions)

---

## 📈 Roadmap

- [ ] GraphQL Support
- [ ] WebSocket pentru real-time updates
- [ ] Microservices Architecture
- [ ] Kubernetes Deployment
- [ ] Multi-tenant Support
- [ ] Advanced Analytics
- [ ] Mobile API Optimization

---

**Construit cu ❤️ pentru aplicații moderne și sigure** 