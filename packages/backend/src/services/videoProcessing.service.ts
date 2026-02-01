import { VideosRepository } from '../repositories/videos.repository.js';
import { frameExtractorService } from './frameExtractor.service.js';
import { birdIdentificationService } from './birdIdentification.service.js';
import { visualSimilarityService } from './visualSimilarity.service.js';
import { motionDetectionService } from './motionDetection.service.js';
import { jobQueueService } from './jobQueue.service.js';
import { createLogger } from '../utils/logger.js';
import { toAbsoluteUploadPath } from '../utils/pathUtils.js';
import type { ProcessingJob } from '@ai-birdwatcher/shared';

const logger = createLogger('VideoProcessingService');

export class VideoProcessingService {
  private videosRepo: VideosRepository;

  constructor() {
    this.videosRepo = new VideosRepository();

    // Register job handlers
    this.registerJobHandlers();
  }

  /**
   * Register handlers for different job types
   */
  private registerJobHandlers(): void {
    jobQueueService.registerHandler('frame_extraction', async (job) => {
      await this.handleFrameExtraction(job);
    });

    jobQueueService.registerHandler('bird_identification', async (job) => {
      await this.handleBirdIdentification(job);
    });

    jobQueueService.registerHandler('similarity_matching', async (job) => {
      await this.handleSimilarityMatching(job);
    });
  }

  /**
   * Start processing a video
   */
  async processVideo(videoId: number): Promise<void> {
    logger.info(`Starting video processing for video ${videoId}`);

    const video = this.videosRepo.findById(videoId);

    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    if (video.status === 'processing') {
      logger.warn(`Video ${videoId} is already being processed`);
      return;
    }

    try {
      // Update video status to processing
      this.videosRepo.updateStatus(videoId, 'processing');

      // Create frame extraction job
      await jobQueueService.addJob(videoId, 'frame_extraction');

      logger.info(`Video ${videoId} processing initiated`);
    } catch (error) {
      logger.error(`Failed to initiate processing for video ${videoId}`, {
        error: (error as Error).message,
      });

      this.videosRepo.updateStatus(videoId, 'failed', (error as Error).message);
      throw error;
    }
  }

  /**
   * Handle frame extraction job
   */
  private async handleFrameExtraction(job: ProcessingJob): Promise<void> {
    const video = this.videosRepo.findById(job.video_id);

    if (!video) {
      throw new Error(`Video ${job.video_id} not found`);
    }

    logger.info(`Extracting frames from video ${video.id}: ${video.filename}`);

    try {
      // Reconstruct absolute path for filesystem operations
      const videoPath = toAbsoluteUploadPath(video.filepath);

      // Get video metadata
      const metadata = await frameExtractorService.getVideoMetadata(videoPath);

      logger.info(`Video metadata: ${metadata.duration}s, ${metadata.width}x${metadata.height}`, {
        recordedAt: metadata.recordedAt?.toISOString(),
        recordedAtSource: metadata.recordedAtSource,
      });

      // Check if we should use motion detection
      const useMotionDetection = await motionDetectionService.shouldUseMotionDetection(
        videoPath,
        metadata.duration
      );

      let frames;

      if (useMotionDetection) {
        // Use motion detection to reduce frame extraction
        const motionSegments = await motionDetectionService.detectMotionSegments(videoPath);

        const savings = motionDetectionService.estimateCostSavings(
          metadata.duration,
          motionSegments
        );

        logger.info(`Motion detection will save ${savings.percentageSaved.toFixed(1)}% of frames (${savings.framesSaved} frames)`);

        // Get frame timestamps within motion segments
        const timestamps = motionDetectionService.getFrameTimestamps(motionSegments);

        if (timestamps.length === 0) {
          logger.warn('Motion detection found no segments; falling back to full frame extraction');
          frames = await frameExtractorService.extractFrames(videoPath, video.id);
        } else {
          // Extract frames at specific timestamps
          frames = [];
          for (let i = 0; i < timestamps.length; i++) {
            const timestamp = timestamps[i];
            const framePath = `${video.id}/frame_${String(i + 1).padStart(4, '0')}.jpg`;

            await frameExtractorService.extractFrameAtTimestamp(
              videoPath,
              timestamp,
              framePath
            );

            frames.push({
              number: i + 1,
              timestamp,
              path: framePath,
            });

            // Update progress
            const progress = Math.floor(((i + 1) / timestamps.length) * 100);
            jobQueueService.updateProgress(job.id, progress);
          }
        }
      } else {
        // Extract all frames at 1 fps
        frames = await frameExtractorService.extractFrames(videoPath, video.id);
      }

      logger.info(`Extracted ${frames.length} frames from video ${video.id}`);

      // Update video with frame count, duration, and recording date
      this.videosRepo.update(video.id, {
        frame_count: frames.length,
        duration_seconds: Math.floor(metadata.duration),
        recorded_at: metadata.recordedAt?.toISOString() ?? null,
        recorded_at_source: metadata.recordedAtSource,
      });

      // Create bird identification job
      await jobQueueService.addJob(video.id, 'bird_identification');
    } catch (error) {
      logger.error(`Frame extraction failed for video ${video.id}`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Handle bird identification job
   */
  private async handleBirdIdentification(job: ProcessingJob): Promise<void> {
    const video = this.videosRepo.findById(job.video_id);

    if (!video) {
      throw new Error(`Video ${job.video_id} not found`);
    }

    logger.info(`Identifying birds in frames from video ${video.id}`);

    try {
      // Get all extracted frames (read from filesystem)
      const fs = await import('fs/promises');
      const path = await import('path');
      const { paths } = await import('../config/environment.js');
      const { ensureDir } = await import('../utils/imageUtils.js');

      const framesDir = path.join(paths.frames, video.id.toString());
      await ensureDir(framesDir);
      const frameFiles = await fs.readdir(framesDir);

      // Filter only JPG files and sort
      const sortedFrames = frameFiles
        .filter(f => f.endsWith('.jpg'))
        .sort()
        .map((filename, index) => ({
          path: path.join(framesDir, filename),
          number: index + 1,
          timestamp: index, // Approximate timestamp based on 1fps
        }));

      logger.info(`Found ${sortedFrames.length} frames to analyze`);

      // Process frames in batches
      const batchSize = 10;
      let totalSightings = 0;

      for (let i = 0; i < sortedFrames.length; i += batchSize) {
        const batch = sortedFrames.slice(i, i + batchSize);

        const results = await birdIdentificationService.identifyBirdsInFrames(
          video.id,
          batch,
          job.id
        );

        totalSightings += results.length;

        // Update progress
        const progress = Math.floor(((i + batch.length) / sortedFrames.length) * 100);
        jobQueueService.updateProgress(job.id, progress);

        logger.info(`Processed ${i + batch.length}/${sortedFrames.length} frames, ${totalSightings} sightings so far`);
      }

      logger.info(`Identified ${totalSightings} bird sightings in video ${video.id}`);

      if (totalSightings > 0) {
        // Create similarity matching job
        await jobQueueService.addJob(video.id, 'similarity_matching');
      } else {
        // No birds found, mark video as completed
        this.videosRepo.updateStatus(video.id, 'completed');
        logger.info(`No birds detected in video ${video.id}, marked as completed`);
      }
    } catch (error) {
      logger.error(`Bird identification failed for video ${video.id}`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Handle similarity matching job
   */
  private async handleSimilarityMatching(job: ProcessingJob): Promise<void> {
    const video = this.videosRepo.findById(job.video_id);

    if (!video) {
      throw new Error(`Video ${job.video_id} not found`);
    }

    logger.info(`Matching birds from video ${video.id} to profiles`);

    try {
      // Get all sightings for this video that haven't been matched
      const sightings = birdIdentificationService.getSightingsByVideoId(video.id);
      const unmatchedSightings = sightings.filter(s => !s.is_matched);

      logger.info(`Found ${unmatchedSightings.length} unmatched sightings to process`);

      if (unmatchedSightings.length === 0) {
        this.videosRepo.updateStatus(video.id, 'completed');
        return;
      }

      // Process sightings
      const sightingIds = unmatchedSightings.map(s => s.id);
      const results = await visualSimilarityService.matchMultipleSightings(sightingIds);

      const newBirds = results.filter(r => r.isNewBird).length;
      const matched = results.filter(r => r.matched && !r.isNewBird).length;

      logger.info(`Similarity matching complete for video ${video.id}: ${matched} matched, ${newBirds} new birds`);

      // Mark video as completed
      this.videosRepo.updateStatus(video.id, 'completed');

      logger.info(`Video ${video.id} processing completed successfully`);
    } catch (error) {
      logger.error(`Similarity matching failed for video ${video.id}`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Get processing status for a video
   */
  async getProcessingStatus(videoId: number): Promise<{
    video: any;
    jobs: any[];
    overallProgress: number;
  }> {
    const video = this.videosRepo.findById(videoId);

    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    const jobs = jobQueueService.getJobsByVideoId(videoId);

    // Calculate overall progress
    let overallProgress = 0;

    if (video.status === 'completed') {
      overallProgress = 100;
    } else if (video.status === 'failed') {
      overallProgress = 0;
    } else if (jobs.length > 0) {
      const totalProgress = jobs.reduce((sum, job) => sum + job.progress, 0);
      overallProgress = Math.floor(totalProgress / jobs.length);
    }

    return {
      video,
      jobs,
      overallProgress,
    };
  }

  /**
   * Cancel video processing
   */
  async cancelProcessing(videoId: number): Promise<void> {
    logger.info(`Cancelling processing for video ${videoId}`);

    // Update video status
    this.videosRepo.updateStatus(videoId, 'failed', 'Processing cancelled by user');

    // Delete pending jobs
    const jobs = jobQueueService.getJobsByVideoId(videoId);
    for (const job of jobs) {
      if (job.status === 'pending') {
        jobQueueService.jobsRepo.delete(job.id);
      }
    }

    logger.info(`Processing cancelled for video ${videoId}`);
  }
}

// Export singleton instance
export const videoProcessingService = new VideoProcessingService();
