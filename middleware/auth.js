const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisClient = require('../config/redis');
const { logError, logSecurityEvent } = require('../config/logger');

// Configurare JWT
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'todo-list-api',
  audience: process.env.JWT_AUDIENCE || 'todo-list-users',
};

// Funcție pentru generarea token-urilor
const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    username: user.username,
    iss: JWT_CONFIG.issuer,
    aud: JWT_CONFIG.audience,
    iat: Math.floor(Date.now() / 1000),
  };

  const accessToken = jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  });

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_CONFIG.refreshSecret,
    {
      expiresIn: JWT_CONFIG.refreshExpiresIn,
    }
  );

  return { accessToken, refreshToken };
};

// Funcție pentru verificarea token-ului
const verifyToken = (token, secret = JWT_CONFIG.secret) => {
  try {
    return jwt.verify(token, secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });
  } catch (error) {
    throw error;
  }
};

// Funcție pentru decodarea token-ului fără verificare
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw error;
  }
};

// Middleware pentru autentificare
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acces lipsă',
        code: 'MISSING_TOKEN',
      });
    }

    // Verifică dacă token-ul este în blacklist
    const isBlacklisted = await redisClient.isTokenBlacklisted(token);
    if (isBlacklisted) {
      logSecurityEvent('BLACKLISTED_TOKEN_ACCESS', {
        token: token.substring(0, 20) + '...',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      return res.status(401).json({
        success: false,
        message: 'Token invalid sau expirat',
        code: 'INVALID_TOKEN',
      });
    }

    // Verifică token-ul
    const decoded = verifyToken(token);

    // Găsește utilizatorul
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit',
        code: 'USER_NOT_FOUND',
      });
    }

    // Verifică dacă utilizatorul este activ
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Contul este dezactivat',
        code: 'ACCOUNT_DISABLED',
      });
    }

    // Adaugă utilizatorul la request
    req.user = user;
    req.token = token;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirat',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      logSecurityEvent('INVALID_TOKEN_ACCESS', {
        token: req.headers.authorization?.substring(0, 20) + '...',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error.message,
      });

      return res.status(401).json({
        success: false,
        message: 'Token invalid',
        code: 'INVALID_TOKEN',
      });
    }

    logError(error, { context: 'Authentication Middleware' });
    return res.status(500).json({
      success: false,
      message: 'Eroare internă server',
      code: 'INTERNAL_ERROR',
    });
  }
};

// Middleware pentru refresh token
const authenticateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token lipsă',
        code: 'MISSING_REFRESH_TOKEN',
      });
    }

    // Verifică dacă refresh token-ul este în blacklist
    const isBlacklisted = await redisClient.isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      logSecurityEvent('BLACKLISTED_REFRESH_TOKEN', {
        token: refreshToken.substring(0, 20) + '...',
        ip: req.ip,
      });

      return res.status(401).json({
        success: false,
        message: 'Refresh token invalid',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Verifică refresh token-ul
    const decoded = verifyToken(refreshToken, JWT_CONFIG.refreshSecret);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Token invalid',
        code: 'INVALID_TOKEN_TYPE',
      });
    }

    // Găsește utilizatorul
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit',
        code: 'USER_NOT_FOUND',
      });
    }

    // Verifică dacă utilizatorul este activ
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Contul este dezactivat',
        code: 'ACCOUNT_DISABLED',
      });
    }

    req.user = user;
    req.refreshToken = refreshToken;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expirat',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    logError(error, { context: 'Refresh Token Authentication' });
    return res.status(401).json({
      success: false,
      message: 'Refresh token invalid',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }
};

// Middleware pentru verificarea rolului (pentru viitoare extensii)
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentificare necesară',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

    // Pentru moment, toți utilizatorii au același rol
    // În viitor, poți adăuga un câmp role la modelul User
    const userRole = req.user.role || 'user';

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Permisiuni insuficiente',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
};

// Funcție pentru invalidarea token-urilor (logout)
const invalidateTokens = async (accessToken, refreshToken) => {
  try {
    // Decodează token-urile pentru a obține timpul de expirare
    const accessDecoded = decodeToken(accessToken);
    const refreshDecoded = decodeToken(refreshToken);

    // Calculează timpul rămas până la expirare
    const now = Math.floor(Date.now() / 1000);
    const accessTtl = accessDecoded.exp - now;
    const refreshTtl = refreshDecoded.exp - now;

    // Adaugă token-urile în blacklist
    if (accessTtl > 0) {
      await redisClient.blacklistToken(accessToken, accessTtl);
    }

    if (refreshTtl > 0) {
      await redisClient.blacklistToken(refreshToken, refreshTtl);
    }

    return true;
  } catch (error) {
    logError(error, { context: 'Token Invalidation' });
    return false;
  }
};

// Funcție pentru verificarea stării de autentificare (opțional)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continuă fără autentificare
    }

    // Verifică dacă token-ul este în blacklist
    const isBlacklisted = await redisClient.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next(); // Continuă fără autentificare
    }

    // Verifică token-ul
    const decoded = verifyToken(token);

    // Găsește utilizatorul
    const user = await User.findById(decoded.userId).select('-password');
    if (user && user.isActive) {
      req.user = user;
      req.token = token;
      req.tokenPayload = decoded;
    }

    next();
  } catch (error) {
    // Ignoră erorile și continuă fără autentificare
    next();
  }
};

// Funcție pentru rate limiting bazat pe utilizator
const userRateLimit = (req, res, next) => {
  if (req.user) {
    // Rate limit mai permisiv pentru utilizatorii autentificați
    req.rateLimitKey = `user:${req.user._id}`;
  } else {
    // Rate limit mai strict pentru utilizatorii anonimi
    req.rateLimitKey = `ip:${req.ip}`;
  }
  next();
};

module.exports = {
  authenticateToken,
  authenticateRefreshToken,
  requireRole,
  optionalAuth,
  generateTokens,
  verifyToken,
  decodeToken,
  invalidateTokens,
  userRateLimit,
  JWT_CONFIG,
}; 