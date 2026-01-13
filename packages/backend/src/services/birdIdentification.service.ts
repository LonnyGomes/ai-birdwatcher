import { openaiService } from './openai.service.js';
import { SightingsRepository } from '../repositories/sightings.repository.js';
import { createLogger } from '../utils/logger.js';
import { assessImageQuality } from '../utils/imageUtils.js';
import type { CreateSightingInput } from '@ai-birdwatcher/shared';

const logger = createLogger('BirdIdentificationService');

export interface IdentificationResult {
  sightingId: number;
  species: string;
  confidence: number;
  birdsDetected: number;
}

export class BirdIdentificationService {
  private sightingsRepo: SightingsRepository;

  constructor() {
    this.sightingsRepo = new SightingsRepository();
  }

  /**
   * Identify birds in a frame and create sighting records
   */
  async identifyBirdsInFrame(
    videoId: number,
    framePath: string,
    frameNumber: number,
    timestamp: number
  ): Promise<IdentificationResult[]> {
    logger.info(`Identifying birds in frame ${frameNumber} from video ${videoId}`);

    try {
      // Call OpenAI to identify birds
      const identification = await openaiService.identifyBirds(framePath);

      if (identification.birds_detected === 0) {
        logger.debug(`No birds detected in frame ${frameNumber}`);
        return [];
      }

      // Assess image quality for the frame
      const imageQuality = await assessImageQuality(framePath);

      // Create sighting records for each bird detected
      const results: IdentificationResult[] = [];

      for (const bird of identification.birds) {
        const sightingInput: CreateSightingInput = {
          video_id: videoId,
          frame_number: frameNumber,
          timestamp_in_video: timestamp,
          species: bird.species,
          gender: bird.gender,
          confidence_score: bird.confidence,
          frame_path: framePath,
          ai_analysis: JSON.stringify({
            features: bird.features,
            common_name: bird.common_name,
            image_quality: bird.image_quality,
            assessed_quality: imageQuality,
          }),
        };

        const sighting = this.sightingsRepo.create(sightingInput);

        results.push({
          sightingId: sighting.id,
          species: bird.species,
          confidence: bird.confidence,
          birdsDetected: identification.birds_detected,
        });

        logger.info(`Created sighting ${sighting.id} for ${bird.species} (confidence: ${bird.confidence}%)`);
      }

      return results;
    } catch (error) {
      logger.error(`Failed to identify birds in frame ${frameNumber}`, {
        error: (error as Error).message,
        videoId,
        framePath,
      });
      throw error;
    }
  }

  /**
   * Batch identify birds in multiple frames
   */
  async identifyBirdsInFrames(
    videoId: number,
    frames: Array<{ path: string; number: number; timestamp: number }>
  ): Promise<IdentificationResult[]> {
    logger.info(`Starting batch identification for ${frames.length} frames from video ${videoId}`);

    const allResults: IdentificationResult[] = [];

    for (const frame of frames) {
      try {
        const results = await this.identifyBirdsInFrame(
          videoId,
          frame.path,
          frame.number,
          frame.timestamp
        );
        allResults.push(...results);
      } catch (error) {
        logger.error(`Failed to process frame ${frame.number}, continuing with next frame`, {
          error: (error as Error).message,
        });
        // Continue processing remaining frames even if one fails
      }
    }

    logger.info(`Completed batch identification: ${allResults.length} sightings created from ${frames.length} frames`);

    return allResults;
  }

  /**
   * Get sighting by ID
   */
  getSighting(sightingId: number) {
    return this.sightingsRepo.findById(sightingId);
  }

  /**
   * Get all sightings for a video
   */
  getSightingsByVideoId(videoId: number) {
    return this.sightingsRepo.findByVideoId(videoId);
  }
}

// Export singleton instance
export const birdIdentificationService = new BirdIdentificationService();
