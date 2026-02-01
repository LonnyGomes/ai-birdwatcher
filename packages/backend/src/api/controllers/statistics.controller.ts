import { VideosRepository } from '../../repositories/videos.repository.js';
import { BirdsRepository } from '../../repositories/birds.repository.js';
import { SightingsRepository } from '../../repositories/sightings.repository.js';
import { SpeciesRepository } from '../../repositories/species.repository.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface TimelineQuerystring {
  date_from?: string;
  date_to?: string;
  interval?: 'hour' | 'day' | 'week' | 'month';
}

export class StatisticsController {
  private videosRepo: VideosRepository;
  private birdsRepo: BirdsRepository;
  private sightingsRepo: SightingsRepository;
  private speciesRepo: SpeciesRepository;

  constructor() {
    this.videosRepo = new VideosRepository();
    this.birdsRepo = new BirdsRepository();
    this.sightingsRepo = new SightingsRepository();
    this.speciesRepo = new SpeciesRepository();
  }

  /**
   * Get overview statistics
   */
  async overview(request: FastifyRequest, reply: FastifyReply) {
    const totalVideos = this.videosRepo.count();
    const processingVideos = this.videosRepo.count('processing');
    const completedVideos = this.videosRepo.count('completed');
    const failedVideos = this.videosRepo.count('failed');

    const totalSightings = this.sightingsRepo.count();
    const totalBirds = this.birdsRepo.findAll().length;
    const uniqueSpecies = this.birdsRepo.getUniqueSpecies().length;

    // Get most recent sightings
    const recentSightings = this.sightingsRepo.findAllWithBird({ limit: 5 });

    // Get most active birds
    const allBirds = this.birdsRepo.findAll({ limit: 5 });
    const topVisitors = allBirds.sort((a, b) => b.total_visits - a.total_visits).slice(0, 5);

    // Enrich with species info
    const sightingSpecies = [...new Set(recentSightings.map(s => s.species))];
    const visitorSpecies = [...new Set(topVisitors.map(b => b.species))];
    const allSpecies = [...new Set([...sightingSpecies, ...visitorSpecies])];
    const speciesInfoMap = this.speciesRepo.findBySpeciesList(allSpecies);

    // Add species info to recent sightings
    const enrichedRecentSightings = recentSightings.map(sighting => {
      const speciesInfo = speciesInfoMap.get(sighting.species);
      return {
        ...sighting,
        frame_path: sighting.frame_path,
        species_common_name: speciesInfo?.common_name || sighting.bird_common_name || null,
        species_wikipedia_image: speciesInfo?.wikipedia_image_url || null,
      };
    });

    // Add species info to top visitors
    const enrichedTopVisitors = topVisitors.map(bird => {
      const speciesInfo = speciesInfoMap.get(bird.species);
      return {
        ...bird,
        species_common_name: speciesInfo?.common_name || bird.common_name || null,
        species_wikipedia_image: speciesInfo?.wikipedia_image_url || null,
      };
    });

    return reply.send({
      videos: {
        total: totalVideos,
        processing: processingVideos,
        completed: completedVideos,
        failed: failedVideos,
      },
      birds: {
        total_individuals: totalBirds,
        unique_species: uniqueSpecies,
        total_sightings: totalSightings,
      },
      recent_sightings: enrichedRecentSightings,
      top_visitors: enrichedTopVisitors,
    });
  }

  /**
   * Get species frequency statistics
   */
  async species(request: FastifyRequest, reply: FastifyReply) {
    const speciesFrequency = this.sightingsRepo.getSpeciesFrequency();

    // Get bird profiles grouped by species
    const allBirds = this.birdsRepo.findAll();
    const birdsBySpecies: Record<string, number> = {};

    for (const bird of allBirds) {
      birdsBySpecies[bird.species] = (birdsBySpecies[bird.species] || 0) + 1;
    }

    const speciesData = speciesFrequency.map(freq => ({
      species: freq.species,
      sightings: freq.count,
      individuals: birdsBySpecies[freq.species] || 0,
    }));

    return reply.send({
      species: speciesData,
      total_species: speciesData.length,
    });
  }

  /**
   * Get timeline statistics
   */
  async timeline(request: FastifyRequest<{ Querystring: TimelineQuerystring }>, reply: FastifyReply) {
    const { date_from, date_to, interval = 'day' } = request.query;

    // Get sightings within date range
    const sightings = this.sightingsRepo.findAll({
      dateFrom: date_from,
      dateTo: date_to,
    });

    // Group by time interval
    const timeline: Record<string, number> = {};

    for (const sighting of sightings) {
      const date = new Date(sighting.detected_at);
      let key: string;

      switch (interval) {
        case 'hour':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getDate() + 1) / 7)).padStart(2, '0')}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      timeline[key] = (timeline[key] || 0) + 1;
    }

    // Convert to array and sort
    const timelineData = Object.entries(timeline)
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return reply.send({
      timeline: timelineData,
      interval,
      date_from: date_from || null,
      date_to: date_to || null,
    });
  }

  /**
   * Get hourly activity statistics
   */
  async hourlyActivity(request: FastifyRequest, reply: FastifyReply) {
    const hourlyActivity = this.sightingsRepo.getHourlyActivity();

    // Ensure all 24 hours are represented
    const completeActivity = Array.from({ length: 24 }, (_, hour) => {
      const existing = hourlyActivity.find(a => a.hour === hour);
      return {
        hour,
        count: existing?.count || 0,
      };
    });

    // Calculate peak hours
    const sortedByCount = [...completeActivity].sort((a, b) => b.count - a.count);
    const peakHours = sortedByCount.slice(0, 3).map(a => a.hour);

    return reply.send({
      hourly_activity: completeActivity,
      peak_hours: peakHours,
      total_sightings: completeActivity.reduce((sum, a) => sum + a.count, 0),
    });
  }

  /**
   * Get top visitors (most frequent birds)
   */
  async topVisitors(request: FastifyRequest<{ Querystring: { limit?: string } }>, reply: FastifyReply) {
    const limit = request.query.limit ? parseInt(request.query.limit) : 10;

    const allBirds = this.birdsRepo.findAll();
    const topBirds = allBirds
      .sort((a, b) => b.total_visits - a.total_visits)
      .slice(0, limit);

    return reply.send({
      top_visitors: topBirds,
      total_tracked_birds: allBirds.length,
    });
  }
}

export const statisticsController = new StatisticsController();
