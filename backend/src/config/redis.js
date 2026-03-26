const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const createRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error('Redis max retries reached, giving up');
        return null;
      }
      return Math.min(times * 100, 3000);
    },
    reconnectOnError: (err) => {
      logger.warn(`Redis reconnecting on error: ${err.message}`);
      return true;
    },
    lazyConnect: false,
    enableReadyCheck: true,
    showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
  });

  client.on('connect', () => logger.info('✅ Redis connected'));
  client.on('ready', () => logger.info('Redis client ready'));
  client.on('error', (err) => logger.error(`Redis error: ${err.message}`));
  client.on('close', () => logger.warn('Redis connection closed'));
  client.on('reconnecting', () => logger.info('Redis reconnecting...'));

  return client;
};

const connectRedis = async () => {
  redisClient = createRedisClient();
  await redisClient.ping();
  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redisClient;
};

// Cache utility methods
const cache = {
  get: async (key) => {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  },
  set: async (key, value, ttlSeconds = 3600) => {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  },
  del: async (key) => {
    const client = getRedisClient();
    await client.del(key);
  },
  invalidatePattern: async (pattern) => {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(...keys);
  },
  exists: async (key) => {
    const client = getRedisClient();
    return await client.exists(key);
  },
  ttl: async (key) => {
    const client = getRedisClient();
    return await client.ttl(key);
  },
  increment: async (key, ttlSeconds = 3600) => {
    const client = getRedisClient();
    const value = await client.incr(key);
    if (value === 1) await client.expire(key, ttlSeconds);
    return value;
  },
};

module.exports = { connectRedis, getRedisClient, cache };
