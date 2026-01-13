import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('MotionDetectionService');

export interface MotionSegment {
  start: number; // seconds
  end: number; // seconds
  duration: number; // seconds
}

export class MotionDetectionService {
  /**
   * Detect motion segments in a video using FFmpeg scene detection
   * Returns time ranges where significant motion/changes occur
   */
  async detectMotionSegments(
    videoPath: string,
    threshold = 0.3 // Scene change threshold (0-1, lower = more sensitive)
  ): Promise<MotionSegment[]> {
    logger.info(`Detecting motion in video: ${videoPath}`);

    const sceneTimestamps = await this.detectSceneChanges(videoPath, threshold);

    if (sceneTimestamps.length === 0) {
      logger.warn('No scene changes detected, will process entire video');
      return [];
    }

    // Convert scene change timestamps to motion segments
    const segments = this.groupIntoSegments(sceneTimestamps);

    logger.info(`Detected ${segments.length} motion segments (total duration: ${this.getTotalDuration(segments)}s)`);

    return segments;
  }

  /**
   * Detect scene changes using FFmpeg
   */
  private async detectSceneChanges(
    videoPath: string,
    threshold: number
  ): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const timestamps: number[] = [];
      let outputBuffer = '';

      ffmpeg(videoPath)
        .outputOptions([
          '-vf',
          `select='gt(scene,${threshold})',showinfo`, // Scene detection filter
          '-f',
          'null', // No output file
        ])
        .output('-')
        .on('start', (command) => {
          logger.debug('FFmpeg scene detection command', { command });
        })
        .on('stderr', (stderrLine) => {
          // FFmpeg outputs showinfo to stderr
          outputBuffer += stderrLine + '\n';

          // Parse pts_time from showinfo output
          // Example: pts_time:5.005
          const match = stderrLine.match(/pts_time:(\d+\.?\d*)/);
          if (match) {
            const timestamp = parseFloat(match[1]);
            timestamps.push(timestamp);
          }
        })
        .on('end', () => {
          logger.debug(`Found ${timestamps.length} scene changes`);
          resolve(timestamps);
        })
        .on('error', (err) => {
          logger.error('Scene detection failed', { error: err.message });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Group timestamps into motion segments
   * Timestamps close together (within 3 seconds) are grouped into one segment
   */
  private groupIntoSegments(
    timestamps: number[],
    groupWindow = 3 // seconds
  ): MotionSegment[] {
    if (timestamps.length === 0) {
      return [];
    }

    const sorted = [...timestamps].sort((a, b) => a - b);
    const segments: MotionSegment[] = [];
    let currentStart = sorted[0];
    let currentEnd = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      const timestamp = sorted[i];

      if (timestamp - currentEnd <= groupWindow) {
        // Extend current segment
        currentEnd = timestamp;
      } else {
        // Save current segment and start new one
        segments.push({
          start: Math.max(0, currentStart - 1), // Add 1s buffer before
          end: currentEnd + 1, // Add 1s buffer after
          duration: currentEnd - currentStart + 2,
        });

        currentStart = timestamp;
        currentEnd = timestamp;
      }
    }

    // Add final segment
    segments.push({
      start: Math.max(0, currentStart - 1),
      end: currentEnd + 1,
      duration: currentEnd - currentStart + 2,
    });

    return segments;
  }

  /**
   * Calculate total duration of all segments
   */
  private getTotalDuration(segments: MotionSegment[]): number {
    return segments.reduce((sum, seg) => sum + seg.duration, 0);
  }

  /**
   * Determine if we should use motion detection for this video
   * Based on video duration and preliminary analysis
   */
  async shouldUseMotionDetection(
    videoPath: string,
    videoDuration: number
  ): Promise<boolean> {
    // Always use motion detection for videos longer than 30 seconds
    if (videoDuration > 30) {
      logger.info('Using motion detection (video > 30s)');
      return true;
    }

    // For shorter videos, quick check if there's static content
    if (videoDuration <= 10) {
      logger.info('Skipping motion detection (video too short)');
      return false;
    }

    // For 10-30s videos, do quick scene detection
    try {
      const sceneChanges = await this.detectSceneChanges(videoPath, 0.4);

      // If very few scene changes, likely mostly static
      const changesPerSecond = sceneChanges.length / videoDuration;

      if (changesPerSecond < 0.1) {
        logger.info('Using motion detection (low activity detected)');
        return true;
      }
    } catch (error) {
      logger.warn('Failed to analyze video for motion detection decision', {
        error: (error as Error).message,
      });
    }

    return false;
  }

  /**
   * Get timestamps for frame extraction within motion segments
   * Returns evenly spaced timestamps at target FPS within motion segments
   */
  getFrameTimestamps(
    segments: MotionSegment[],
    targetFps = 1
  ): number[] {
    const timestamps: number[] = [];

    for (const segment of segments) {
      const frameInterval = 1 / targetFps;
      let currentTime = segment.start;

      while (currentTime < segment.end) {
        timestamps.push(parseFloat(currentTime.toFixed(2)));
        currentTime += frameInterval;
      }
    }

    return timestamps.sort((a, b) => a - b);
  }

  /**
   * Estimate cost savings from using motion detection
   */
  estimateCostSavings(
    videoDuration: number,
    motionSegments: MotionSegment[],
    targetFps = 1
  ): {
    withoutMotionDetection: number;
    withMotionDetection: number;
    framesSaved: number;
    percentageSaved: number;
  } {
    const totalFrames = Math.floor(videoDuration * targetFps);
    const motionDuration = this.getTotalDuration(motionSegments);
    const motionFrames = Math.floor(motionDuration * targetFps);
    const framesSaved = totalFrames - motionFrames;
    const percentageSaved = (framesSaved / totalFrames) * 100;

    return {
      withoutMotionDetection: totalFrames,
      withMotionDetection: motionFrames,
      framesSaved,
      percentageSaved,
    };
  }
}

// Export singleton instance
export const motionDetectionService = new MotionDetectionService();
