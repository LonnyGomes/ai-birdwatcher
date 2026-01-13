import { statisticsController } from '../controllers/statistics.controller.js';
import type { FastifyInstance } from 'fastify';

export default async function statisticsRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // Overview statistics
  fastify.get('/overview', {
    handler: statisticsController.overview.bind(statisticsController),
  });

  // Species frequency
  fastify.get('/species', {
    handler: statisticsController.species.bind(statisticsController),
  });

  // Timeline (visits over time)
  fastify.get('/timeline', {
    handler: statisticsController.timeline.bind(statisticsController),
  });

  // Hourly activity patterns
  fastify.get('/hourly-activity', {
    handler: statisticsController.hourlyActivity.bind(statisticsController),
  });

  // Top visitors (most frequent birds)
  fastify.get('/top-visitors', {
    handler: statisticsController.topVisitors.bind(statisticsController),
  });
}
