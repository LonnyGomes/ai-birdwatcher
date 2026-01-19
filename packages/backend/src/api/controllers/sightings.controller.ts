import { SightingsRepository } from '../../repositories/sightings.repository.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import path from 'node:path';

interface SightingIdParams {
  id: string;
}

interface ListQuerystring {
  video_id?: string;
  bird_profile_id?: string;
  species?: string;
  date_from?: string;
  date_to?: string;
  limit?: string;
  offset?: string;
}

export class SightingsController {
  private sightingsRepo: SightingsRepository;

  constructor() {
    this.sightingsRepo = new SightingsRepository();
  }

  /**
   * Convert absolute frame path to relative path for API response
   */
  private normalizeFramePath(framePath: string): string {
    // Extract the relative path from the absolute path
    // Example: /Users/.../data/frames/7/frame_0001.jpg -> 7/frame_0001.jpg
    const framesIndex = framePath.indexOf('frames/');
    if (framesIndex !== -1) {
      return framePath.substring(framesIndex + 'frames/'.length);
    }
    return framePath;
  }

  /**
   * Normalize sighting data for API response
   */
  private normalizeSighting(sighting: any): any {
    return {
      ...sighting,
      frame_path: this.normalizeFramePath(sighting.frame_path),
    };
  }

  /**
   * List all sightings with filters
   */
  async list(request: FastifyRequest<{ Querystring: ListQuerystring }>, reply: FastifyReply) {
    const {
      video_id,
      bird_profile_id,
      species,
      date_from,
      date_to,
      limit,
      offset,
    } = request.query;

    const sightings = this.sightingsRepo.findAllWithBird({
      videoId: video_id ? parseInt(video_id) : undefined,
      species,
      dateFrom: date_from,
      dateTo: date_to,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });

    const total = this.sightingsRepo.count({
      videoId: video_id ? parseInt(video_id) : undefined,
      species,
      dateFrom: date_from,
      dateTo: date_to,
    });

    return reply.send({
      sightings: sightings.map((s) => this.normalizeSighting(s)),
      total,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  /**
   * Get sighting by ID
   */
  async getById(request: FastifyRequest<{ Params: SightingIdParams }>, reply: FastifyReply) {
    const sightingId = parseInt(request.params.id);

    if (isNaN(sightingId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid sighting ID',
      });
    }

    const sighting = this.sightingsRepo.findById(sightingId);

    if (!sighting) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Sighting not found',
      });
    }

    return reply.send({ sighting: this.normalizeSighting(sighting) });
  }

  /**
   * Get sightings by video ID
   */
  async getByVideoId(request: FastifyRequest<{ Params: { videoId: string } }>, reply: FastifyReply) {
    const videoId = parseInt(request.params.videoId);

    if (isNaN(videoId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid video ID',
      });
    }

    const sightings = this.sightingsRepo.findByVideoId(videoId);

    return reply.send({
      sightings: sightings.map((s) => this.normalizeSighting(s)),
      total: sightings.length,
    });
  }
}

export const sightingsController = new SightingsController();
