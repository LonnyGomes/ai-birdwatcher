import { openaiService } from './openai.service.js';
import { BirdsRepository } from '../repositories/birds.repository.js';
import { SightingsRepository } from '../repositories/sightings.repository.js';
import { env } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import { calculateImageSimilarity, assessImageQuality } from '../utils/imageUtils.js';
import { toAbsoluteFramePath } from '../utils/pathUtils.js';
import type { BirdProfile, Sighting } from '@ai-birdwatcher/shared';

const logger = createLogger('VisualSimilarityService');

export interface MatchResult {
  matched: boolean;
  birdProfileId: number | null;
  confidence: number;
  isNewBird: boolean;
}

export class VisualSimilarityService {
  private birdsRepo: BirdsRepository;
  private sightingsRepo: SightingsRepository;
  private readonly similarityThreshold: number;
  private readonly maxComparisons: number;

  constructor() {
    this.birdsRepo = new BirdsRepository();
    this.sightingsRepo = new SightingsRepository();
    this.similarityThreshold = env.SIMILARITY_THRESHOLD;
    this.maxComparisons = env.MAX_SIMILARITY_COMPARISONS;
  }

  /**
   * Match a sighting to an existing bird profile or create a new one
   */
  async matchOrCreateBirdProfile(sightingId: number): Promise<MatchResult> {
    const sighting = this.sightingsRepo.findById(sightingId);

    if (!sighting) {
      throw new Error(`Sighting ${sightingId} not found`);
    }

    logger.info(`Matching sighting ${sightingId} (${sighting.species}) to bird profile`);

    // Get existing bird profiles for this species, ordered by last seen (most recent first)
    const existingBirds = this.birdsRepo.findBySpecies(sighting.species, {
      orderBy: 'last_seen',
      limit: this.maxComparisons,
    });

    if (existingBirds.length === 0) {
      // No existing birds of this species, create new profile
      const birdProfile = await this.createNewBirdProfile(sighting);
      return {
        matched: true,
        birdProfileId: birdProfile.id,
        confidence: 100,
        isNewBird: true,
      };
    }

    // Try to match with existing birds
    const matchResult = await this.findMatchingBird(sighting, existingBirds);

    if (matchResult.matched && matchResult.birdProfileId) {
      // Link sighting to existing bird profile
      await this.linkSightingToBird(sighting, matchResult.birdProfileId, matchResult.confidence);
      return matchResult;
    }

    // No match found, create new bird profile
    const birdProfile = await this.createNewBirdProfile(sighting);
    return {
      matched: true,
      birdProfileId: birdProfile.id,
      confidence: 100,
      isNewBird: true,
    };
  }

  /**
   * Find matching bird from existing profiles
   */
  private async findMatchingBird(
    sighting: Sighting,
    candidates: BirdProfile[]
  ): Promise<MatchResult> {
    logger.debug(`Comparing with ${candidates.length} existing bird profiles`);

    // Pre-filter using perceptual hashing for efficiency
    const preFilteredCandidates = await this.preFilterByImageSimilarity(
      sighting.frame_path,
      candidates
    );

    logger.debug(`${preFilteredCandidates.length} candidates passed pre-filtering`);

    // Compare with AI for remaining candidates
    for (const candidate of preFilteredCandidates) {
      try {
        const comparison = await this.compareSightingWithBird(sighting, candidate);

        if (comparison.is_same_bird && comparison.confidence >= this.similarityThreshold) {
          logger.info(`Found match: Bird ${candidate.unique_identifier} (confidence: ${comparison.confidence}%)`);

          return {
            matched: true,
            birdProfileId: candidate.id,
            confidence: comparison.confidence,
            isNewBird: false,
          };
        }

        logger.debug(`No match with bird ${candidate.unique_identifier} (confidence: ${comparison.confidence}%)`);
      } catch (error) {
        logger.error(`Error comparing with bird ${candidate.id}`, {
          error: (error as Error).message,
        });
        // Continue with next candidate
      }
    }

    return {
      matched: false,
      birdProfileId: null,
      confidence: 0,
      isNewBird: false,
    };
  }

  /**
   * Pre-filter candidates using fast perceptual hash comparison
   * This reduces expensive AI comparisons
   */
  private async preFilterByImageSimilarity(
    sightingFramePath: string,
    candidates: BirdProfile[]
  ): Promise<BirdProfile[]> {
    const filtered: BirdProfile[] = [];

    for (const candidate of candidates) {
      if (!candidate.representative_image_path) {
        // Include birds without representative images in AI comparison
        filtered.push(candidate);
        continue;
      }

      try {
        const similarity = await calculateImageSimilarity(
          toAbsoluteFramePath(sightingFramePath),
          toAbsoluteFramePath(candidate.representative_image_path)
        );

        // If perceptual hash shows decent similarity (>40%), include in AI comparison
        if (similarity > 40) {
          filtered.push(candidate);
        }
      } catch (error) {
        // If perceptual hash fails, include in AI comparison to be safe
        logger.warn(`Perceptual hash comparison failed for bird ${candidate.id}, including in AI comparison`);
        filtered.push(candidate);
      }
    }

    return filtered;
  }

  /**
   * Compare a sighting with a bird profile using AI
   */
  private async compareSightingWithBird(sighting: Sighting, birdProfile: BirdProfile) {
    if (!birdProfile.representative_image_path) {
      throw new Error(`Bird profile ${birdProfile.id} has no representative image`);
    }

    return openaiService.compareBirds(
      toAbsoluteFramePath(sighting.frame_path),
      toAbsoluteFramePath(birdProfile.representative_image_path)
    );
  }

  /**
   * Create a new bird profile from a sighting
   */
  private async createNewBirdProfile(sighting: Sighting): Promise<BirdProfile> {
    // Generate unique identifier for the bird
    const count = this.birdsRepo.countBySpecies(sighting.species);
    const identifier = `${sighting.species.toUpperCase().replace(/\s+/g, '_')}_${String(count + 1).padStart(3, '0')}`;

    // Assess image quality (needs absolute path for filesystem access)
    const imageQuality = await assessImageQuality(toAbsoluteFramePath(sighting.frame_path));

    // Parse AI analysis for common name
    let commonName = null;
    try {
      const analysis = JSON.parse(sighting.ai_analysis || '{}');
      commonName = analysis.common_name;
    } catch {
      // Ignore parsing errors
    }

    // Create bird profile
    const birdProfile = this.birdsRepo.create({
      unique_identifier: identifier,
      species: sighting.species,
      common_name: commonName,
      primary_gender: sighting.gender || null,
      confidence_score: sighting.confidence_score,
      first_seen: sighting.detected_at,
      last_seen: sighting.detected_at,
      total_visits: 1,
      representative_image_path: sighting.frame_path,
    });

    // Add as representative image
    this.birdsRepo.addRepresentativeImage({
      bird_profile_id: birdProfile.id,
      sighting_id: sighting.id,
      image_path: sighting.frame_path,
      quality_score: imageQuality,
      is_primary: true,
    });

    // Link sighting to bird profile
    this.sightingsRepo.linkToBirdProfile(sighting.id, birdProfile.id, 100);

    logger.info(`Created new bird profile: ${identifier}`);

    return birdProfile;
  }

  /**
   * Link a sighting to an existing bird profile
   */
  private async linkSightingToBird(
    sighting: Sighting,
    birdProfileId: number,
    confidence: number
  ): Promise<void> {
    // Link sighting to bird profile
    this.sightingsRepo.linkToBirdProfile(sighting.id, birdProfileId, confidence);

    // Update bird profile
    this.birdsRepo.incrementVisits(birdProfileId);

    // Potentially add as representative image if quality is high
    const imageQuality = await assessImageQuality(toAbsoluteFramePath(sighting.frame_path));
    if (imageQuality >= 7) {
      this.birdsRepo.addRepresentativeImage({
        bird_profile_id: birdProfileId,
        sighting_id: sighting.id,
        image_path: sighting.frame_path,
        quality_score: imageQuality,
        is_primary: false,
      });

      logger.info(`Added high-quality representative image for bird ${birdProfileId}`);
    }
  }

  /**
   * Batch process multiple sightings for matching
   */
  async matchMultipleSightings(sightingIds: number[]): Promise<MatchResult[]> {
    logger.info(`Batch matching ${sightingIds.length} sightings`);

    const results: MatchResult[] = [];

    for (const sightingId of sightingIds) {
      try {
        const result = await this.matchOrCreateBirdProfile(sightingId);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to match sighting ${sightingId}`, {
          error: (error as Error).message,
        });
        // Continue with next sighting
      }
    }

    const newBirds = results.filter(r => r.isNewBird).length;
    const matched = results.filter(r => r.matched && !r.isNewBird).length;

    logger.info(`Batch matching complete: ${matched} matched to existing birds, ${newBirds} new birds created`);

    return results;
  }

  /**
   * Merge two bird profiles (if they were incorrectly identified as separate)
   */
  async mergeBirdProfiles(sourceBirdId: number, targetBirdId: number): Promise<void> {
    logger.info(`Merging bird ${sourceBirdId} into bird ${targetBirdId}`);

    // Get all sightings from source bird
    const sightings = this.sightingsRepo.findByBirdProfileId(sourceBirdId);

    // Update all sightings to point to target bird
    for (const sighting of sightings) {
      this.sightingsRepo.update(sighting.id, {
        bird_profile_id: targetBirdId,
      });
    }

    // Update target bird's total visits
    const targetBird = this.birdsRepo.findById(targetBirdId);
    if (targetBird) {
      this.birdsRepo.update(targetBirdId, {
        total_visits: targetBird.total_visits + sightings.length,
      });
    }

    // Delete source bird profile
    this.birdsRepo.delete(sourceBirdId);

    logger.info(`Successfully merged bird ${sourceBirdId} into ${targetBirdId}`);
  }
}

// Export singleton instance
export const visualSimilarityService = new VisualSimilarityService();
