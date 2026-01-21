import type { FastifyRequest, FastifyReply } from 'fastify';
import { SpeciesRepository } from '../../repositories/species.repository.js';
import { SightingsRepository } from '../../repositories/sightings.repository.js';
import { wikipediaService } from '../../services/wikipedia.service.js';
import { logger } from '../../utils/logger.js';

interface SpeciesParams {
  species: string;
}

export class SpeciesController {
  private speciesRepo: SpeciesRepository;
  private sightingsRepo: SightingsRepository;

  constructor() {
    this.speciesRepo = new SpeciesRepository();
    this.sightingsRepo = new SightingsRepository();
  }

  /**
   * Get all species with Wikipedia images
   */
  async getAllSpecies(_request: FastifyRequest, reply: FastifyReply) {
    // Get all unique species from sightings
    const speciesFrequency = this.sightingsRepo.getSpeciesFrequency();
    const speciesList = speciesFrequency.map(s => s.species);

    // Get cached species info
    const cachedInfo = this.speciesRepo.findBySpeciesList(speciesList);

    // Build response with species info
    const speciesData = await Promise.all(
      speciesFrequency.map(async freq => {
        let info = cachedInfo.get(freq.species) ?? null;

        // If not cached or needs refresh, fetch from Wikipedia
        if (!info || this.speciesRepo.needsRefresh(freq.species)) {
          info = await this.fetchAndCacheSpeciesInfo(freq.species);
        }

        return {
          species: freq.species,
          sightings_count: freq.count,
          wikipedia_image_url: info?.wikipedia_image_url || null,
          wikipedia_page_url: info?.wikipedia_page_url || null,
          description: info?.description || null,
        };
      })
    );

    return reply.send({
      species: speciesData,
      total: speciesData.length,
    });
  }

  /**
   * Get species info by name
   */
  async getSpeciesInfo(request: FastifyRequest<{ Params: SpeciesParams }>, reply: FastifyReply) {
    const { species } = request.params;

    let info = this.speciesRepo.findBySpecies(species);

    // If not cached or needs refresh, fetch from Wikipedia
    if (!info || this.speciesRepo.needsRefresh(species)) {
      info = await this.fetchAndCacheSpeciesInfo(species);
    }

    if (!info) {
      return reply.status(404).send({ error: 'Species not found' });
    }

    return reply.send(info);
  }

  /**
   * Get Wikipedia images for multiple species (bulk endpoint)
   */
  async getSpeciesImages(
    request: FastifyRequest<{ Body: { species: string[] } }>,
    reply: FastifyReply
  ) {
    const { species: speciesList } = request.body;

    if (!speciesList || !Array.isArray(speciesList)) {
      return reply.status(400).send({ error: 'species array is required' });
    }

    // Get cached species info
    const cachedInfo = this.speciesRepo.findBySpeciesList(speciesList);

    // Fetch missing or stale entries
    const results: Record<string, string | null> = {};

    await Promise.all(
      speciesList.map(async species => {
        let info = cachedInfo.get(species) ?? null;

        if (!info || this.speciesRepo.needsRefresh(species)) {
          info = await this.fetchAndCacheSpeciesInfo(species);
        }

        results[species] = info?.wikipedia_image_url || null;
      })
    );

    return reply.send({ images: results });
  }

  /**
   * Refresh Wikipedia info for a species
   */
  async refreshSpeciesInfo(request: FastifyRequest<{ Params: SpeciesParams }>, reply: FastifyReply) {
    const { species } = request.params;

    const info = await this.fetchAndCacheSpeciesInfo(species, true);

    if (!info) {
      return reply.status(404).send({ error: 'Could not fetch species info' });
    }

    return reply.send(info);
  }

  /**
   * Helper to fetch and cache species info from Wikipedia
   */
  private async fetchAndCacheSpeciesInfo(species: string, _forceRefresh: boolean = false) {
    try {
      // Try to parse common name from AI analysis if available
      const recentSighting = this.sightingsRepo.findAll({ species, limit: 1 })[0];
      let commonName: string | undefined;

      if (recentSighting?.ai_analysis) {
        try {
          const analysis = JSON.parse(recentSighting.ai_analysis);
          commonName = analysis.common_name;
        } catch {
          // Ignore parse errors
        }
      }

      const wikiInfo = await wikipediaService.fetchSpeciesInfo(species, commonName);

      const info = this.speciesRepo.upsert({
        species,
        common_name: commonName,
        wikipedia_image_url: wikiInfo.imageUrl || undefined,
        wikipedia_page_url: wikiInfo.pageUrl || undefined,
        description: wikiInfo.description || undefined,
      });

      return info;
    } catch (error) {
      logger.error(`Error fetching Wikipedia info for ${species}:`, error);
      return null;
    }
  }
}

export const speciesController = new SpeciesController();
