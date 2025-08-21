const redis = require('redis');
const { logError, logInfo } = require('./logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD || undefined,
        database: parseInt(process.env.REDIS_DB) || 0,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logError(new Error('Redis server refused connection'), { context: 'Redis Connect' });
            return new Error('Redis server refused connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logError(new Error('Redis retry time exhausted'), { context: 'Redis Connect' });
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            logError(new Error('Redis max retry attempts reached'), { context: 'Redis Connect' });
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logInfo('Redis client connected', { context: 'Redis' });
      });

      this.client.on('ready', () => {
        logInfo('Redis client ready', { context: 'Redis' });
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        logError(err, { context: 'Redis Error' });
      });

      this.client.on('end', () => {
        this.isConnected = false;
        logInfo('Redis client disconnected', { context: 'Redis' });
      });

      this.client.on('reconnecting', () => {
        logInfo('Redis client reconnecting', { context: 'Redis' });
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      logError(error, { context: 'Redis Connect' });
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logError(error, { context: 'Redis Get', key });
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      logError(error, { context: 'Redis Set', key, ttl });
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      await this.client.del(key);
      return true;
    } catch (error) {
      logError(error, { context: 'Redis Delete', key });
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logError(error, { context: 'Redis Exists', key });
      return false;
    }
  }

  async expire(key, ttl) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logError(error, { context: 'Redis Expire', key, ttl });
      return false;
    }
  }

  async ttl(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      return await this.client.ttl(key);
    } catch (error) {
      logError(error, { context: 'Redis TTL', key });
      return -1;
    }
  }

  async keys(pattern) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      return await this.client.keys(pattern);
    } catch (error) {
      logError(error, { context: 'Redis Keys', pattern });
      return [];
    }
  }

  async flushdb() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      await this.client.flushDb();
      logInfo('Redis database flushed', { context: 'Redis' });
      return true;
    } catch (error) {
      logError(error, { context: 'Redis FlushDB' });
      return false;
    }
  }

  async ping() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logError(error, { context: 'Redis Ping' });
      return false;
    }
  }

  // Funcții helper pentru cache
  async cacheGet(key) {
    return this.get(`cache:${key}`);
  }

  async cacheSet(key, value, ttl = 300) {
    return this.set(`cache:${key}`, value, ttl);
  }

  async cacheDel(key) {
    return this.del(`cache:${key}`);
  }

  // Funcții helper pentru session
  async sessionGet(key) {
    return this.get(`session:${key}`);
  }

  async sessionSet(key, value, ttl = 3600) {
    return this.set(`session:${key}`, value, ttl);
  }

  async sessionDel(key) {
    return this.del(`session:${key}`);
  }

  // Funcții helper pentru rate limiting
  async rateLimitGet(key) {
    return this.get(`ratelimit:${key}`);
  }

  async rateLimitSet(key, value, ttl = 900) {
    return this.set(`ratelimit:${key}`, value, ttl);
  }

  async rateLimitIncr(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      return await this.client.incr(`ratelimit:${key}`);
    } catch (error) {
      logError(error, { context: 'Redis Rate Limit Incr', key });
      return 0;
    }
  }

  // Funcții helper pentru blacklist JWT
  async blacklistToken(token, ttl = 3600) {
    return this.set(`blacklist:${token}`, { blacklisted: true }, ttl);
  }

  async isTokenBlacklisted(token) {
    return this.exists(`blacklist:${token}`);
  }
}

// Singleton instance
const redisClient = new RedisClient();

module.exports = redisClient; 