import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { env } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import authPlugin from './plugins/auth.plugin.js';
import errorHandlerPlugin from './plugins/errorHandler.plugin.js';

const logger = createLogger('Server');

export async function buildServer() {
  const fastify = Fastify({
    logger: false, // Use our custom logger instead
    bodyLimit: 100 * 1024 * 1024, // 100MB for video uploads
  });

  // Register security plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Allow for easier development
  });

  await fastify.register(cors, {
    origin: env.NODE_ENV === 'development' ? '*' : false, // Allow all origins in dev
    credentials: true,
  });

  // Register multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB max file size
      files: 1, // Max 1 file per request
    },
  });

  // Register custom plugins
  await fastify.register(errorHandlerPlugin);
  await fastify.register(authPlugin);

  // Health check endpoint
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // API root
  fastify.get('/api', async () => {
    return {
      name: 'AI Bird Watcher API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        videos: '/api/videos',
        sightings: '/api/sightings',
        birds: '/api/birds',
        statistics: '/api/statistics',
      },
    };
  });

  // TODO: Register route handlers here
  // await fastify.register(authRoutes, { prefix: '/api/auth' });
  // await fastify.register(videoRoutes, { prefix: '/api/videos' });
  // await fastify.register(sightingRoutes, { prefix: '/api/sightings' });
  // await fastify.register(birdRoutes, { prefix: '/api/birds' });
  // await fastify.register(statisticsRoutes, { prefix: '/api/statistics' });

  return fastify;
}

export async function startServer() {
  try {
    const fastify = await buildServer();

    await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    logger.info(`🚀 Server listening on port ${env.PORT}`);
    logger.info(`📚 API documentation: http://localhost:${env.PORT}/api`);
    logger.info(`❤️  Health check: http://localhost:${env.PORT}/health`);

    return fastify;
  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message });
    throw error;
  }
}
