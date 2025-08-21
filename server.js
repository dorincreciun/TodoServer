require('dotenv').config();
require('express-async-errors'); // Pentru gestionarea automată a erorilor async

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');

// Importă configurațiile
const { connectDB, getConnectionStatus } = require('./config/database');
const redisClient = require('./config/redis');
const swaggerSpecs = require('./config/swagger');

// Importă middleware-urile
const { logRequest, logInfo, logError } = require('./config/logger');
const {
  generalRateLimit,
  authRateLimit,
  slowDownMiddleware,
  bruteForce,
  ipFilter,
  xssProtection,
  mongoSanitizeMiddleware,
  hppProtection,
  helmetConfig,
  userAgentCheck,
  contentTypeCheck,
  requestSizeCheck,
  securityLogging,
  originCheck,
} = require('./middleware/security');

// Importă rutele
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();

// Configurare pentru detectarea IP-ului real în spatele proxy-urilor
app.set('trust proxy', 1);

// Middleware de securitate (ordinea este importantă!)
app.use(helmetConfig);
app.use(xssProtection);
app.use(mongoSanitizeMiddleware);
app.use(hppProtection);

// Middleware pentru logging și securitate
app.use(securityLogging);
app.use(userAgentCheck);
app.use(contentTypeCheck);
app.use(requestSizeCheck);
app.use(originCheck);

// Configurare CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite request-uri fără origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Nu este permis de CORS'));
    }
  },
  credentials: true,
  methods: process.env.ALLOWED_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: process.env.ALLOWED_HEADERS?.split(',') || ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
}));

// Compresie pentru răspunsuri
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Rate limiting
app.use('/api/', generalRateLimit);
app.use('/api/auth', authRateLimit);
app.use('/api/auth/login', bruteForce.prevent);
app.use('/api/auth/register', bruteForce.prevent);

// Slow down pentru request-uri suspecte
app.use(slowDownMiddleware);

// Middleware pentru parsarea JSON cu limite
app.use(express.json({ 
  limit: process.env.UPLOAD_MAX_SIZE || '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'JSON invalid',
        code: 'INVALID_JSON',
      });
      throw new Error('JSON invalid');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.UPLOAD_MAX_SIZE || '10mb' 
}));

// Middleware pentru logging HTTP requests
app.use(logRequest);

// Rute pentru API
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';

app.use(`${apiPrefix}/${apiVersion}/auth`, authRoutes);
app.use(`${apiPrefix}/${apiVersion}/todos`, todoRoutes);

// Documentație Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Todo List API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true,
  },
}));

// Endpoint pentru specificația OpenAPI în format JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check pentru server
 *     description: Verifică dacă serverul funcționează corect și starea serviciilor
 *     tags: [Sistem]
 *     responses:
 *       200:
 *         description: Serverul funcționează corect
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp-ul curent
 *                     environment:
 *                       type: string
 *                       description: Mediul de rulare
 *                     services:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                             connection:
 *                               type: object
 *                         redis:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                             ping:
 *                               type: string
 *                     uptime:
 *                       type: number
 *                       description: Timpul de funcționare în secunde
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                         total:
 *                           type: number
 *                         percentage:
 *                           type: number
 *             example:
 *               success: true
 *               message: "Serverul funcționează corect"
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *               environment: "development"
 *               services:
 *                 database:
 *                   status: "connected"
 *                   connection:
 *                     host: "localhost"
 *                     port: 27017
 *                     name: "todo-list"
 *                 redis:
 *                   status: "connected"
 *                   ping: "PONG"
 *               uptime: 3600
 *               memory:
 *                 used: 52428800
 *                 total: 1073741824
 *                 percentage: 4.88
 */
app.get('/api/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Verifică starea bazei de date
    const dbStatus = getConnectionStatus();
    
    // Verifică starea Redis
    const redisPing = await redisClient.ping();
    const redisStatus = redisPing ? 'connected' : 'disconnected';
    
    // Informații despre memorie
    const memUsage = process.memoryUsage();
    const memPercentage = (memUsage.heapUsed / memUsage.heapTotal * 100).toFixed(2);
    
    const healthData = {
      success: true,
      message: 'Serverul funcționează corect',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus.state,
          connection: {
            host: dbStatus.host,
            port: dbStatus.port,
            name: dbStatus.name,
          },
        },
        redis: {
          status: redisStatus,
          ping: redisPing ? 'PONG' : 'FAILED',
        },
      },
      uptime: Math.floor(process.uptime()),
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: parseFloat(memPercentage),
      },
      responseTime: `${Date.now() - startTime}ms`,
    };

    // Setează status code în funcție de starea serviciilor
    const allServicesHealthy = dbStatus.state === 'connected' && redisStatus === 'connected';
    const statusCode = allServicesHealthy ? 200 : 503;

    res.status(statusCode).json(healthData);
  } catch (error) {
    logError(error, { context: 'Health Check' });
    res.status(503).json({
      success: false,
      message: 'Eroare la verificarea stării serverului',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Informații despre API
 *     description: Returnează informații generale despre API și endpoint-urile disponibile
 *     tags: [Sistem]
 *     responses:
 *       200:
 *         description: Informații despre API
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Numele API-ului
 *                     version:
 *                       type: string
 *                       description: Versiunea API-ului
 *                     description:
 *                       type: string
 *                       description: Descrierea API-ului
 *                     documentation:
 *                       type: string
 *                       description: URL-ul către documentația Swagger
 *                     endpoints:
 *                       type: object
 *                       properties:
 *                         auth:
 *                           type: string
 *                           description: Endpoint-ul pentru autentificare
 *                         todos:
 *                           type: string
 *                           description: Endpoint-ul pentru todo-uri
 *                         health:
 *                           type: string
 *                           description: Endpoint-ul pentru health check
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Lista de funcționalități
 *             example:
 *               success: true
 *               message: "Todo List API v2.0.0"
 *               name: "Todo List API"
 *               version: "2.0.0"
 *               description: "API modern pentru gestionarea todo-urilor cu autentificare JWT avansată"
 *               documentation: "/api-docs"
 *               endpoints:
 *                 auth: "/api/v1/auth"
 *                 todos: "/api/v1/todos"
 *                 health: "/api/health"
 *               features:
 *                 - "Autentificare JWT cu refresh tokens"
 *                 - "Rate limiting avansat"
 *                 - "Validare robustă cu Joi"
 *                 - "Logging structurat"
 *                 - "Caching cu Redis"
 *                 - "Securitate avansată"
 */
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Todo List API v2.0.0',
    name: 'Todo List API',
    version: '2.0.0',
    description: 'API modern pentru gestionarea todo-urilor cu autentificare JWT avansată',
    documentation: '/api-docs',
    endpoints: {
      auth: `${apiPrefix}/${apiVersion}/auth`,
      todos: `${apiPrefix}/${apiVersion}/todos`,
      health: '/api/health',
    },
    features: [
      'Autentificare JWT cu refresh tokens',
      'Rate limiting avansat',
      'Validare robustă cu Joi',
      'Logging structurat',
      'Caching cu Redis',
      'Securitate avansată',
      'Documentație Swagger completă',
      'Health checks',
      'Monitoring și metrics',
    ],
  });
});

// Middleware pentru gestionarea erorilor 404
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint-ul nu a fost găsit',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl,
    method: req.method,
  });
});

// Middleware pentru gestionarea erorilor globale
app.use((error, req, res, next) => {
  logError(error, {
    context: 'Global Error Handler',
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Verifică dacă este o eroare de validare Joi
  if (error.isJoi) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Eroare de validare',
      code: 'VALIDATION_ERROR',
      errors,
    });
  }

  // Verifică dacă este o eroare de validare Mongoose
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Eroare de validare',
      code: 'VALIDATION_ERROR',
      errors,
    });
  }

  // Verifică dacă este o eroare de duplicare MongoDB
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} există deja în baza de date`,
      code: 'DUPLICATE_ERROR',
      field,
    });
  }

  // Verifică dacă este o eroare de cast MongoDB
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalid',
      code: 'INVALID_ID',
    });
  }

  // Verifică dacă este o eroare de autentificare JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalid',
      code: 'INVALID_TOKEN',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirat',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Eroare generică
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    success: false,
    message: isProduction ? 'Eroare internă server' : error.message,
    code: 'INTERNAL_ERROR',
    ...(isProduction ? {} : { stack: error.stack }),
  });
});

// Configurare port
const PORT = process.env.PORT || 3000;

// Funcție pentru pornirea serverului
const startServer = async () => {
  try {
    // Conectare la baza de date
    await connectDB();
    logInfo('MongoDB conectat cu succes', { context: 'Server Startup' });

    // Conectare la Redis
    await redisClient.connect();
    logInfo('Redis conectat cu succes', { context: 'Server Startup' });

    // Pornire server
    const server = app.listen(PORT, () => {
      logInfo(`🚀 Serverul rulează pe portul ${PORT}`, {
        context: 'Server Startup',
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
      });
      
      console.log(`🚀 Serverul rulează pe portul ${PORT}`);
      console.log(`📚 Documentația API: http://localhost:${PORT}/api-docs`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}${apiPrefix}/${apiVersion}`);
      console.log(`🌍 Mediu: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-list'}`);
      console.log(`🔴 Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
    });

    // Gestionare închidere grațioasă
    const gracefulShutdown = async (signal) => {
      logInfo(`Primit semnal ${signal}, închidere grațioasă...`, { context: 'Server Shutdown' });
      
      server.close(async () => {
        try {
          // Închide conexiunile la baza de date
          await require('mongoose').connection.close();
          logInfo('Conexiunea MongoDB închisă', { context: 'Server Shutdown' });
          
          // Închide conexiunea Redis
          await redisClient.disconnect();
          logInfo('Conexiunea Redis închisă', { context: 'Server Shutdown' });
          
          logInfo('Server închis cu succes', { context: 'Server Shutdown' });
          process.exit(0);
        } catch (error) {
          logError(error, { context: 'Server Shutdown' });
          process.exit(1);
        }
      });

      // Forțează închiderea după 30 de secunde
      setTimeout(() => {
        logError(new Error('Forced shutdown after timeout'), { context: 'Server Shutdown' });
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Gestionare erori neprinse
    process.on('uncaughtException', (error) => {
      logError(error, { context: 'Uncaught Exception' });
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logError(new Error(`Unhandled Rejection at: ${promise}, reason: ${reason}`), {
        context: 'Unhandled Rejection',
      });
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logError(error, { context: 'Server Startup' });
    process.exit(1);
  }
};

// Pornește serverul
startServer();

module.exports = app; 