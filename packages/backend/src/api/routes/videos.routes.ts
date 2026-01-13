import { videosController } from '../controllers/videos.controller.js';
import type { FastifyInstance } from 'fastify';

export default async function videosRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // Upload video
  fastify.post('/upload', {
    handler: videosController.upload.bind(videosController),
  });

  // List videos
  fastify.get('/', {
    handler: videosController.list.bind(videosController),
  });

  // Get video by ID
  fastify.get('/:id', {
    handler: videosController.getById.bind(videosController),
  });

  // Get processing status
  fastify.get('/:id/status', {
    handler: videosController.getStatus.bind(videosController),
  });

  // Cancel processing
  fastify.post('/:id/cancel', {
    handler: videosController.cancelProcessing.bind(videosController),
  });

  // Delete video
  fastify.delete('/:id', {
    handler: videosController.delete.bind(videosController),
  });
}
