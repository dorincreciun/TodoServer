// Setup pentru testele Jest
require('dotenv').config({ path: '.env.test' });

// Mock console.log pentru a reduce zgomotul în teste
const originalConsoleLog = console.log;
console.log = jest.fn();

// Mock logger pentru a evita scrierea în fișiere în timpul testelor
jest.mock('../config/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn(),
  logSecurityEvent: jest.fn(),
}));

// Mock Redis client pentru teste
jest.mock('../config/redis', () => ({
  client: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
  },
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
}));

// Set timeout global pentru teste
jest.setTimeout(10000);

// Cleanup după fiecare test
afterEach(() => {
  jest.clearAllMocks();
  console.log = originalConsoleLog;
});

// Cleanup global
afterAll(() => {
  jest.restoreAllMocks();
});
