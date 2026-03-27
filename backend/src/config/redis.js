const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const createMockRedis = () => {
  logger.warn('Running with Mock Redis (In-Memory mode). Caching works in current process.');
  const store = new Map();
  return {
    isMock: true,
    on: () => {},
    once: () => {},
    off: () => {},
    emit: () => {},
    get: async (key) => store.get(key) || null,
    set: async (key, val) => { store.set(key, val); return 'OK'; },
    setex: async (key, ttl, val) => { store.set(key, val); return 'OK'; },
    del: async (key) => { store.delete(key); return 1; },
    keys: async () => Array.from(store.keys()),
    exists: async (key) => store.has(key) ? 1 : 0,
    ttl: async () => 3600,
    incr: async (key) => {
       const val = parseInt(store.get(key) || '0') + 1;
       store.set(key, val.toString());
       return val;
    },
    expire: async () => true,
    quit: async () => 'OK',
    ping: async () => 'PONG',
    status: 'ready'
  };
};

const connectRedis = async () => {
  if (process.env.SKIP_REDIS === 'true') {
     redisClient = createMockRedis();
     return redisClient;
  }

  try {
    const client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB) || 0,
      maxRetriesPerRequest: 1, // Minimize failure time
      retryStrategy: (times) => {
        if (times > 2) {
          logger.error('Redis max retries reached, giving up');
          return null; // Give up
        }
        return 1000;
      },
      showFriendlyErrorStack: false,
    });

    return new Promise((resolve) => {
      client.on('error', (err) => {
        logger.error(`Redis connection failed: ${err.message}`);
        redisClient = createMockRedis();
        resolve(redisClient);
      });

      client.on('connect', () => {
        logger.info('✅ Redis connected');
        redisClient = client;
        resolve(client);
      });

      // Timeout the connection attempt after 2 seconds
      setTimeout(() => {
        if (!redisClient || redisClient.isMock) {
          logger.warn('Redis connection timeout - using mock');
          redisClient = createMockRedis();
          resolve(redisClient);
        }
      }, 3000);
    });
  } catch (error) {
    logger.error(`Failed to initialize Redis: ${error.message}`);
    redisClient = createMockRedis();
    return redisClient;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    logger.warn('Redis not initialized, returning mock.');
    return createMockRedis();
  }
  return redisClient;
};

const cache = {
  get: async (key) => {
    try {
      const val = await getRedisClient().get(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  set: async (key, val, ttl = 3600) => { try { await getRedisClient().setex(key, ttl, JSON.stringify(val)); } catch {} },
  del: async (key) => { try { await getRedisClient().del(key); } catch {} },
  exists: async (key) => { try { return await getRedisClient().exists(key); } catch { return 0; } }
};

module.exports = { connectRedis, getRedisClient, cache };

