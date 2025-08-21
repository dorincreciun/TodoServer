const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const Brute = require('express-brute');
const BruteRedis = require('express-brute-redis');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const { logSecurityEvent, logError } = require('../config/logger');
const redisClient = require('../config/redis');

// Configurare rate limiting general
const generalRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limită de 100 de cereri per fereastră
  message: {
    success: false,
    message: 'Prea multe cereri de la această adresă IP, vă rugăm încercați din nou mai târziu.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Folosește IP-ul pentru utilizatorii anonimi
    return req.ip;
  },
  skip: (req) => {
    // Skip pentru health checks și documentație
    return req.path === '/api/health' || req.path.startsWith('/api-docs');
  },
  handler: (req, res) => {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    res.status(429).json({
      success: false,
      message: 'Prea multe cereri de la această adresă IP, vă rugăm încercați din nou mai târziu.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 / 60),
    });
  },
});

// Rate limiting pentru autentificare (mai strict)
const authRateLimit = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minute
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5, // doar 5 încercări
  message: {
    success: false,
    message: 'Prea multe încercări de autentificare, vă rugăm încercați din nou mai târziu.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Folosește IP-ul pentru rate limiting pe autentificare
    return `auth:${req.ip}`;
  },
  handler: (req, res) => {
    logSecurityEvent('AUTH_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email,
    });
    res.status(429).json({
      success: false,
      message: 'Prea multe încercări de autentificare, vă rugăm încercați din nou mai târziu.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) / 1000 / 60),
    });
  },
});

// Slow down pentru request-uri suspecte
const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minute
  delayAfter: 50, // începe să încetinească după 50 de request-uri
  delayMs: 500, // adaugă 500ms la fiecare request după limita
  maxDelayMs: 20000, // maxim 20 secunde de întârziere
  keyGenerator: (req) => req.ip,
  skip: (req) => {
    return req.path === '/api/health' || req.path.startsWith('/api-docs');
  },
});

// Brute force protection pentru autentificare
const bruteStore = new BruteRedis({
  client: redisClient.client,
  prefix: 'brute:',
});

const bruteForce = new Brute(bruteStore, {
  freeRetries: 3,
  minWait: 5 * 60 * 1000, // 5 minute
  maxWait: 60 * 60 * 1000, // 1 oră
  lifetime: 24 * 60 * 60 * 1000, // 24 ore
  refreshTimeoutOnRequest: false,
  failCallback: (req, res, next, nextValidRequestDate) => {
    logSecurityEvent('BRUTE_FORCE_DETECTED', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email,
      nextValidRequest: nextValidRequestDate,
    });

    res.status(429).json({
      success: false,
      message: 'Prea multe încercări eșuate. Vă rugăm încercați din nou mai târziu.',
      code: 'BRUTE_FORCE_DETECTED',
      nextValidRequest: nextValidRequestDate,
    });
  },
});

// IP filtering custom (înlocuiește express-ipfilter)
const ipFilter = (req, res, next) => {
  const clientIP = req.headers['x-forwarded-for']?.split(',')[0] ||
                   req.headers['x-real-ip'] ||
                   req.connection.remoteAddress ||
                   req.socket.remoteAddress ||
                   req.ip;

  // Lista de IP-uri permise (configurabilă prin environment variables)
  const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
  
  // Dacă nu sunt specificate IP-uri permise, permite toate
  if (allowedIPs.length === 0) {
    return next();
  }

  // Verifică dacă IP-ul clientului este în lista de IP-uri permise
  if (allowedIPs.includes(clientIP) || allowedIPs.includes('*')) {
    return next();
  }

  // IP-ul nu este permis
  logSecurityEvent('IP_FILTER_BLOCKED', {
    ip: clientIP,
    userAgent: req.get('User-Agent'),
    path: req.path,
  });

  res.status(403).json({
    success: false,
    message: 'Acces interzis de la această adresă IP.',
    code: 'IP_ACCESS_DENIED',
  });
};

// Middleware pentru protecția împotriva XSS
const xssProtection = xss();

// Middleware pentru protecția împotriva injection-urilor MongoDB
const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logSecurityEvent('MONGODB_INJECTION_ATTEMPT', {
      ip: req.ip,
      key,
      userAgent: req.get('User-Agent'),
    });
  },
});

// Middleware pentru protecția împotriva HTTP Parameter Pollution
const hppProtection = hpp({
  whitelist: ['tags'], // Permite array-uri pentru tags
});

// Configurare Helmet avansată
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: parseInt(process.env.HELMET_HSTS_MAX_AGE) || 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

// Middleware pentru verificarea User-Agent
const userAgentCheck = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  
  if (!userAgent) {
    logSecurityEvent('MISSING_USER_AGENT', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(400).json({
      success: false,
      message: 'User-Agent header lipsă',
      code: 'MISSING_USER_AGENT',
    });
  }

  // Verifică pentru User-Agent-uri suspecte
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /perl/i,
    /ruby/i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious) {
    logSecurityEvent('SUSPICIOUS_USER_AGENT', {
      ip: req.ip,
      userAgent,
      path: req.path,
    });
  }

  next();
};

// Middleware pentru verificarea Content-Type
const contentTypeCheck = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type trebuie să fie application/json',
        code: 'INVALID_CONTENT_TYPE',
      });
    }
  }
  
  next();
};

// Middleware pentru verificarea dimensiunii request-ului
const requestSizeCheck = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request-ul este prea mare',
      code: 'REQUEST_TOO_LARGE',
    });
  }
  
  next();
};

// Middleware pentru logging de securitate
const securityLogging = (req, res, next) => {
  const securityHeaders = {
    'x-forwarded-for': req.get('x-forwarded-for'),
    'x-real-ip': req.get('x-real-ip'),
    'user-agent': req.get('User-Agent'),
    'referer': req.get('Referer'),
    'origin': req.get('Origin'),
  };

  // Log pentru request-uri suspecte
  const suspiciousIndicators = [
    req.get('User-Agent')?.includes('bot'),
    req.get('User-Agent')?.includes('crawler'),
    req.get('User-Agent')?.includes('curl'),
    req.path.includes('admin'),
    req.path.includes('config'),
    req.path.includes('.env'),
    req.path.includes('wp-'),
    req.path.includes('php'),
  ];

  if (suspiciousIndicators.some(Boolean)) {
    logSecurityEvent('SUSPICIOUS_REQUEST', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      headers: securityHeaders,
    });
  }

  next();
};

// Middleware pentru verificarea origin-ului (CORS)
const originCheck = (req, res, next) => {
  const origin = req.get('Origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  if (origin && !allowedOrigins.includes(origin)) {
    logSecurityEvent('INVALID_ORIGIN', {
      ip: req.ip,
      origin,
      allowedOrigins,
    });
  }
  
  next();
};

module.exports = {
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
}; 