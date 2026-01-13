import { birdsController } from '../controllers/birds.controller.js';
import type { FastifyInstance } from 'fastify';

export default async function birdsRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // List bird profiles
  fastify.get('/', {
    handler: birdsController.list.bind(birdsController),
  });

  // Get bird profile by ID
  fastify.get('/:id', {
    handler: birdsController.getById.bind(birdsController),
  });

  // Get bird visit history
  fastify.get('/:id/history', {
    handler: birdsController.getHistory.bind(birdsController),
  });

  // Get representative images
  fastify.get('/:id/images', {
    handler: birdsController.getImages.bind(birdsController),
  });

  // Update bird profile
  fastify.patch('/:id', {
    handler: birdsController.update.bind(birdsController),
  });

  // Merge bird profiles
  fastify.post('/:id/merge/:targetId', {
    handler: birdsController.merge.bind(birdsController),
  });

  // Delete bird profile
  fastify.delete('/:id', {
    handler: birdsController.delete.bind(birdsController),
  });
}
