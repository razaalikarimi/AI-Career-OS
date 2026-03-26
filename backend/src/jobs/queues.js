const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

let connection = null;

const getConnection = () => {
  if (!connection) {
    connection = getRedisClient();
  }
  return connection;
};

const defaultJobOptions = {
  removeOnComplete: { count: 100, age: 24 * 3600 },
  removeOnFail: { count: 50, age: 7 * 24 * 3600 },
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
};

// ─── Queue Definitions ─────────────────────────────────────────────────────────

const resumeQueue = new Queue('resume-processing', {
  connection: getConnection,
  defaultJobOptions: { ...defaultJobOptions, priority: 2 },
});

const aiQueue = new Queue('ai-processing', {
  connection: getConnection,
  defaultJobOptions: { ...defaultJobOptions, priority: 3 },
});

const notificationQueue = new Queue('notifications', {
  connection: getConnection,
  defaultJobOptions: { ...defaultJobOptions, priority: 5, attempts: 5 },
});

const emailQueue = new Queue('email', {
  connection: getConnection,
  defaultJobOptions: { ...defaultJobOptions, priority: 4, attempts: 5 },
});

// Log queue events
const setupQueueEvents = (queue) => {
  queue.on('error', (error) => {
    logger.error({ message: `Queue error: ${queue.name}`, error: error.message });
  });
};

[resumeQueue, aiQueue, notificationQueue, emailQueue].forEach(setupQueueEvents);

module.exports = { resumeQueue, aiQueue, notificationQueue, emailQueue };
