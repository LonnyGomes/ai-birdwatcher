import { sightingsController } from '../controllers/sightings.controller.js';
import type { FastifyInstance } from 'fastify';

export default async function sightingsRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // List sightings with filters
  fastify.get('/', {
    handler: sightingsController.list.bind(sightingsController),
  });

  // Get sighting by ID
  fastify.get('/:id', {
    handler: sightingsController.getById.bind(sightingsController),
  });

  // Get sightings by video ID
  fastify.get('/video/:videoId', {
    handler: sightingsController.getByVideoId.bind(sightingsController),
  });
}
