const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Configurare culori pentru console
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Format personalizat pentru loguri
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Format pentru fișiere (fără culori)
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Configurare transport pentru fișiere
const fileTransport = new DailyRotateFile({
  filename: path.join(process.env.LOG_FILE_PATH || 'logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  format: fileLogFormat,
});

// Configurare transport pentru erori
const errorFileTransport = new DailyRotateFile({
  filename: path.join(process.env.LOG_FILE_PATH || 'logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  level: 'error',
  format: fileLogFormat,
});

// Configurare logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileLogFormat,
  transports: [
    fileTransport,
    errorFileTransport,
  ],
  exitOnError: false,
});

// Adăugare transport pentru console în development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: logFormat,
  }));
}

// Middleware pentru logging HTTP requests
const httpLogger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(process.env.LOG_FILE_PATH || 'logs', 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
    }),
  ],
});

// Funcție pentru logging de securitate
const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(process.env.LOG_FILE_PATH || 'logs', 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
    }),
  ],
});

// Funcție pentru logging de performanță
const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(process.env.LOG_FILE_PATH || 'logs', 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
    }),
  ],
});

// Funcții helper pentru logging
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
    };

    if (res.statusCode >= 400) {
      logger.error('HTTP Request Error', logData);
    } else {
      httpLogger.http('HTTP Request', logData);
    }

    // Log performanță pentru request-uri lente
    if (duration > 1000) {
      performanceLogger.warn('Slow Request Detected', {
        ...logData,
        threshold: '1000ms',
      });
    }
  });

  next();
};

// Funcție pentru logging de securitate
const logSecurityEvent = (event, details) => {
  securityLogger.warn('Security Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Funcție pentru logging de erori
const logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Funcție pentru logging de informații
const logInfo = (message, data = {}) => {
  logger.info(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Funcție pentru logging de debug
const logDebug = (message, data = {}) => {
  logger.debug(message, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  logger,
  httpLogger,
  securityLogger,
  performanceLogger,
  logRequest,
  logSecurityEvent,
  logError,
  logInfo,
  logDebug,
}; 