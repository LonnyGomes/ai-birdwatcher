import { openaiService } from './openai.service.js';
import { SightingsRepository } from '../repositories/sightings.repository.js';
import { ProcessingMetricsRepository } from '../repositories/processingMetrics.repository.js';
import { createLogger } from '../utils/logger.js';
import { assessImageQuality, calculateImageHash, hammingDistance } from '../utils/imageUtils.js';
import type { CreateSightingInput } from '@ai-birdwatcher/shared';

const logger = createLogger('BirdIdentificationService');

export interface IdentificationResult {
  sightingId: number;
  species: string;
  confidence: number;
  birdsDetected: number;
}

interface FrameFilterState {
  lastHash: string | null;
}

export class BirdIdentificationService {
  private sightingsRepo: SightingsRepository;
  private metricsRepo: ProcessingMetricsRepository;

  constructor() {
    this.sightingsRepo = new SightingsRepository();
    this.metricsRepo = new ProcessingMetricsRepository();
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
    frames: Array<{ path: string; number: number; timestamp: number }>,
    jobId?: number
  ): Promise<IdentificationResult[]> {
    logger.info(`Starting batch identification for ${frames.length} frames from video ${videoId}`);

    const allResults: IdentificationResult[] = [];
    const filterState: FrameFilterState = { lastHash: null };
    let skippedLowQualityOrDuplicate = 0;
    let skippedNoBirdsDetected = 0;

    for (const frame of frames) {
      try {
        const shouldSkip = await this.shouldSkipFrame(frame.path, filterState);
        if (shouldSkip) {
          skippedLowQualityOrDuplicate += 1;
          logger.debug(`Skipping frame ${frame.number} due to low quality or duplication`);
          continue;
        }

        const detection = await openaiService.detectBirds(frame.path);
        if (detection.birds_detected === 0) {
          skippedNoBirdsDetected += 1;
          logger.debug(`No birds detected in frame ${frame.number}`);
          continue;
        }

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

    logger.info(
      `Completed batch identification: ${allResults.length} sightings created from ${frames.length} frames ` +
      `(skipped ${skippedLowQualityOrDuplicate} low-quality/duplicate, ` +
      `${skippedNoBirdsDetected} no-bird frames)`
    );

    this.metricsRepo.create({
      video_id: videoId,
      job_id: jobId ?? null,
      total_frames: frames.length,
      skipped_low_quality_duplicate: skippedLowQualityOrDuplicate,
      skipped_no_birds: skippedNoBirdsDetected,
    });

    return allResults;
  }

  private async shouldSkipFrame(
    framePath: string,
    state: FrameFilterState
  ): Promise<boolean> {
    const minQuality = 6;
    const maxHashDistance = 2;

    const quality = await assessImageQuality(framePath);
    if (quality < minQuality) {
      return true;
    }

    const currentHash = await calculateImageHash(framePath);
    if (state.lastHash) {
      const distance = hammingDistance(state.lastHash, currentHash);
      if (distance <= maxHashDistance) {
        state.lastHash = currentHash;
        return true;
      }
    }

    state.lastHash = currentHash;
    return false;
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
