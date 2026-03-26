const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');
const { notificationQueue } = require('../jobs/queues');
const { Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');

const connectedUsers = new Map(); // userId -> Set<socketId>

const setupSocketIO = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const isBlacklisted = await cache.exists(`blacklist:${token}`);
      if (isBlacklisted) return next(new Error('Token invalidated'));

      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket;
    logger.info({ message: 'Socket connected', userId, socketId: socket.id });

    // Track connected users
    if (!connectedUsers.has(userId)) connectedUsers.set(userId, new Set());
    connectedUsers.get(userId).add(socket.id);

    // Join personal room
    socket.join(`user:${userId}`);

    // ─── Interview Events ────────────────────────────────────────────
    socket.on('interview:join', ({ sessionId }) => {
      socket.join(`interview:${sessionId}`);
      socket.emit('interview:joined', { sessionId });
    });

    socket.on('interview:typing', ({ sessionId }) => {
      socket.to(`interview:${sessionId}`).emit('interview:typing', { userId });
    });

    socket.on('interview:leave', ({ sessionId }) => {
      socket.leave(`interview:${sessionId}`);
    });

    // ─── Resume Analysis Progress ────────────────────────────────────
    socket.on('resume:subscribe', ({ resumeId }) => {
      socket.join(`resume:${resumeId}`);
    });

    // ─── Disconnect ──────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) connectedUsers.delete(userId);
      }
      logger.info({ message: 'Socket disconnected', userId, socketId: socket.id, reason });
    });
  });

  // ─── Notification Worker ─────────────────────────────────────────────────────
  const notificationWorker = new Worker(
    'notifications',
    async (job) => {
      const { userId, type, data } = job.data;

      // Emit to connected user(s)
      io.to(`user:${userId}`).emit('notification', {
        id: job.id,
        type,
        data,
        timestamp: new Date().toISOString(),
      });

      // Special events
      if (type === 'RESUME_ANALYSIS_COMPLETE' && data.resumeId) {
        io.to(`resume:${data.resumeId}`).emit('resume:analyzed', {
          resumeId: data.resumeId,
          atsScore: data.atsScore,
        });
      }

      logger.info({ message: 'Notification delivered', userId, type });
    },
    {
      connection: getRedisClient,
      concurrency: 10,
    }
  );

  notificationWorker.on('failed', (job, err) => {
    logger.error({ message: 'Notification delivery failed', jobId: job?.id, error: err.message });
  });

  // Utility: Emit to specific user from outside socket context
  const emitToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  const isUserOnline = (userId) => connectedUsers.has(userId);

  return { emitToUser, isUserOnline };
};

module.exports = { setupSocketIO };
