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

const createQueue = (name, opts) => {
  const conn = getConnection();
  if (conn.isMock) {
    logger.warn(`Bypassing BullMQ Queue [${name}] - Running without Redis fallback.`);
    return {
      name,
      add: async (jobName, data) => {
        logger.info(`[Fallback Queue] Job ${jobName} skipped for ${name} (Redis bypassed).`);
        return { id: 'mock-' + Date.now(), data };
      },
      on: () => {}
    };
  }
  return new Queue(name, opts);
};

const resumeQueue = createQueue('resume-processing', {
  connection: getConnection,
  defaultJobOptions: { ...defaultJobOptions, priority: 2 },
});

const aiQueue = createQueue('ai-processing', {
  connection: getConnection,
  defaultJobOptions: { ...defaultJobOptions, priority: 3 },
});

const notificationQueue = createQueue('notifications', {
  connection: getConnection,
  defaultJobOptions: { ...defaultJobOptions, priority: 5, attempts: 5 },
});

const emailQueue = createQueue('email', {
  connection: getConnection,
  defaultJobOptions: { ...defaultJobOptions, priority: 4, attempts: 5 },
});

// Log queue events
const setupQueueEvents = (queue) => {
  if (queue.on) {
    queue.on('error', (error) => {
      logger.error({ message: `Queue error: ${queue.name}`, error: error.message });
    });
  }
};

[resumeQueue, aiQueue, notificationQueue, emailQueue].forEach(setupQueueEvents);

module.exports = { resumeQueue, aiQueue, notificationQueue, emailQueue };
