require('express-async-errors');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { setupSwagger } = require('./config/swagger');
const { setupSocketIO } = require('./sockets/socket.handler');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./utils/errors');
const {
  requestId,
  requestTiming,
  securityHeaders,
  apiRateLimiter,
  sanitizeInput,
  corsOptions,
} = require('./middleware/security');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const resumeRoutes = require('./modules/resume/resume.routes');
const jobRoutes = require('./modules/jobs/job.routes');
const interviewRoutes = require('./modules/interview/interview.routes');
const learningRoutes = require('./modules/learning/learning.routes');

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io Setup ─────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(requestId);
app.use(requestTiming);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);
app.use(morgan('combined', { stream: logger.stream }));
app.use(apiRateLimiter);

// Static files for uploaded resumes
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ai-career-os-api',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/resumes`, resumeRoutes);
app.use(`${API_PREFIX}/jobs`, jobRoutes);
app.use(`${API_PREFIX}/interviews`, interviewRoutes);
app.use(`${API_PREFIX}/learning`, learningRoutes);

// ─── Swagger Documentation ───────────────────────────────────────────────────
setupSwagger(app);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Bootstrap ────────────────────────────────────────────────────────
const bootstrap = async () => {
  const PORT = parseInt(process.env.PORT) || 5000;

  try {
    // Initialize dependencies
    await connectDB();
    await connectRedis();

    // Setup Socket.io
    setupSocketIO(io);

    // Start workers if Redis is properly connected
    const { getRedisClient } = require('./config/redis');
    if (!getRedisClient().isMock) {
      require('./jobs/workers/resume.worker');
    } else {
      logger.warn('Redis is mocked, skipping worker process initialization.');
    }

    httpServer.listen(PORT, () => {
      logger.info({
        message: `🚀 AI Career OS API running on port ${PORT}`,
        environment: process.env.NODE_ENV || 'development',
        docs: `http://localhost:${PORT}/api/docs`,
      });
    });
  } catch (error) {
    logger.error({ message: 'Failed to start server', error: error.message });
    process.exit(1);
  }
};

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  logger.info({ message: `Received ${signal}, starting graceful shutdown` });
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    const { getRedisClient } = require('./config/redis');
    try {
      await getRedisClient().quit();
    } catch {}
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error({ message: 'Unhandled rejection', reason: String(reason) });
});
process.on('uncaughtException', (error) => {
  logger.error({ message: 'Uncaught exception', error: error.message, stack: error.stack });
  process.exit(1);
});

bootstrap();

module.exports = app;
