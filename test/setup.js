// Setup pentru testele Jest
require('dotenv').config({ path: '.env.test' });

// Mock pentru console.log în testele
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock pentru timers
jest.useFakeTimers();

// Mock pentru process.env
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.TEST_DATABASE_URI || 'mongodb://localhost:27017/todo-list-test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379/1';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-purposes-only';

// Mock pentru Winston logger
jest.mock('../config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  logRequest: jest.fn((req, res, next) => next()),
  logSecurityEvent: jest.fn(),
  logError: jest.fn(),
  logInfo: jest.fn(),
  logDebug: jest.fn(),
}));

// Mock pentru Redis
jest.mock('../config/redis', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  ping: jest.fn(() => Promise.resolve(true)),
  isTokenBlacklisted: jest.fn(() => Promise.resolve(false)),
  blacklistToken: jest.fn(() => Promise.resolve(true)),
}));

// Global test timeout
jest.setTimeout(10000);

// Cleanup după fiecare test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Cleanup după toate testele
afterAll(() => {
  jest.restoreAllMocks();
}); 