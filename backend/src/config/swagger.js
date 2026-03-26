const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Career OS API',
      version: '1.0.0',
      description: `
## AI Career OS – Intelligent Career Development Operating System

A production-grade, enterprise-level API powering the AI Career OS platform.

### Features
- 🔐 JWT Authentication with refresh token rotation
- 📄 Resume Intelligence with ATS scoring  
- 🧠 AI-powered skill gap analysis
- 💼 Intelligent job matching
- 📚 Personalized learning roadmaps
- 🎯 AI interview simulator
- 🔔 Real-time notifications via WebSocket

### Authentication
All protected endpoints require a Bearer token in the Authorization header.
      `,
      contact: {
        name: 'AI Career OS Team',
        email: 'dev@aicareeros.com',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'AI Career OS API Docs',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    })
  );

  // Raw JSON spec
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = { setupSwagger };
