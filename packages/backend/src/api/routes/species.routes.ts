import type { FastifyInstance } from 'fastify';
import { speciesController } from '../controllers/species.controller.js';

interface SpeciesParams {
  species: string;
}

interface SpeciesImagesBody {
  species: string[];
}

export async function speciesRoutes(fastify: FastifyInstance) {
  // Get all species with Wikipedia images
  fastify.get('/', async (request, reply) => {
    return speciesController.getAllSpecies(request, reply);
  });

  // Get species info by name
  fastify.get<{ Params: SpeciesParams }>('/:species', async (request, reply) => {
    return speciesController.getSpeciesInfo(request, reply);
  });

  // Bulk fetch species images
  fastify.post<{ Body: SpeciesImagesBody }>('/images', async (request, reply) => {
    return speciesController.getSpeciesImages(request, reply);
  });

  // Refresh species info from Wikipedia
  fastify.post<{ Params: SpeciesParams }>('/:species/refresh', async (request, reply) => {
    return speciesController.refreshSpeciesInfo(request, reply);
  });
}
