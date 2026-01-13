import { BirdsRepository } from '../../repositories/birds.repository.js';
import { SightingsRepository } from '../../repositories/sightings.repository.js';
import { visualSimilarityService } from '../../services/visualSimilarity.service.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface BirdIdParams {
  id: string;
}

interface MergeBirdsParams {
  id: string;
  targetId: string;
}

interface UpdateBirdBody {
  notes?: string;
}

interface ListQuerystring {
  limit?: string;
  offset?: string;
}

export class BirdsController {
  private birdsRepo: BirdsRepository;
  private sightingsRepo: SightingsRepository;

  constructor() {
    this.birdsRepo = new BirdsRepository();
    this.sightingsRepo = new SightingsRepository();
  }

  /**
   * List all bird profiles
   */
  async list(request: FastifyRequest<{ Querystring: ListQuerystring }>, reply: FastifyReply) {
    const { limit, offset } = request.query;

    const birds = this.birdsRepo.findAll({
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });

    // Get species list
    const species = this.birdsRepo.getUniqueSpecies();

    return reply.send({
      birds,
      species,
      total: birds.length,
    });
  }

  /**
   * Get bird profile by ID
   */
  async getById(request: FastifyRequest<{ Params: BirdIdParams }>, reply: FastifyReply) {
    const birdId = parseInt(request.params.id);

    if (isNaN(birdId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid bird ID',
      });
    }

    const bird = this.birdsRepo.findById(birdId);

    if (!bird) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Bird profile not found',
      });
    }

    return reply.send({ bird });
  }

  /**
   * Get bird visit history
   */
  async getHistory(request: FastifyRequest<{ Params: BirdIdParams }>, reply: FastifyReply) {
    const birdId = parseInt(request.params.id);

    if (isNaN(birdId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid bird ID',
      });
    }

    const bird = this.birdsRepo.findById(birdId);

    if (!bird) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Bird profile not found',
      });
    }

    const sightings = this.sightingsRepo.findByBirdProfileId(birdId);

    return reply.send({
      bird,
      sightings,
      total_visits: bird.total_visits,
    });
  }

  /**
   * Get representative images
   */
  async getImages(request: FastifyRequest<{ Params: BirdIdParams }>, reply: FastifyReply) {
    const birdId = parseInt(request.params.id);

    if (isNaN(birdId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid bird ID',
      });
    }

    const bird = this.birdsRepo.findById(birdId);

    if (!bird) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Bird profile not found',
      });
    }

    const images = this.birdsRepo.getRepresentativeImages(birdId);

    return reply.send({
      bird,
      images,
    });
  }

  /**
   * Update bird profile
   */
  async update(request: FastifyRequest<{ Params: BirdIdParams; Body: UpdateBirdBody }>, reply: FastifyReply) {
    const birdId = parseInt(request.params.id);

    if (isNaN(birdId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid bird ID',
      });
    }

    const bird = this.birdsRepo.findById(birdId);

    if (!bird) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Bird profile not found',
      });
    }

    const { notes } = request.body;

    const updatedBird = this.birdsRepo.update(birdId, { notes });

    return reply.send({
      bird: updatedBird,
      message: 'Bird profile updated successfully',
    });
  }

  /**
   * Merge two bird profiles
   */
  async merge(request: FastifyRequest<{ Params: MergeBirdsParams }>, reply: FastifyReply) {
    const sourceBirdId = parseInt(request.params.id);
    const targetBirdId = parseInt(request.params.targetId);

    if (isNaN(sourceBirdId) || isNaN(targetBirdId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid bird IDs',
      });
    }

    const sourceBird = this.birdsRepo.findById(sourceBirdId);
    const targetBird = this.birdsRepo.findById(targetBirdId);

    if (!sourceBird || !targetBird) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'One or both bird profiles not found',
      });
    }

    if (sourceBird.species !== targetBird.species) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Cannot merge birds of different species',
      });
    }

    try {
      await visualSimilarityService.mergeBirdProfiles(sourceBirdId, targetBirdId);

      return reply.send({
        message: 'Bird profiles merged successfully',
        target_bird: this.birdsRepo.findById(targetBirdId),
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to merge bird profiles',
      });
    }
  }

  /**
   * Delete bird profile
   */
  async delete(request: FastifyRequest<{ Params: BirdIdParams }>, reply: FastifyReply) {
    const birdId = parseInt(request.params.id);

    if (isNaN(birdId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid bird ID',
      });
    }

    const bird = this.birdsRepo.findById(birdId);

    if (!bird) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Bird profile not found',
      });
    }

    this.birdsRepo.delete(birdId);

    return reply.send({
      message: 'Bird profile deleted successfully',
    });
  }
}

export const birdsController = new BirdsController();
