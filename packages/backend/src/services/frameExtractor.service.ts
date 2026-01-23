import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { paths } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import { ensureDir } from '../utils/imageUtils.js';
import type { RecordedAtSource } from '@shared/types/video.types.js';

const logger = createLogger('FrameExtractorService');

export interface ExtractedFrame {
  number: number;
  timestamp: number; // seconds
  path: string;
}

export interface VideoMetadata {
  duration: number; // seconds
  width: number;
  height: number;
  fps: number;
  recordedAt: Date | null;
  recordedAtSource: RecordedAtSource;
}

export class FrameExtractorService {
  /**
   * Get video metadata including recording date
   */
  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, async (err, metadata) => {
        if (err) {
          logger.error('Failed to get video metadata', { error: err.message, videoPath });
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const duration = metadata.format.duration || 0;
        const width = videoStream.width || 0;
        const height = videoStream.height || 0;

        // Parse FPS from r_frame_rate (e.g., "30000/1001" or "30/1")
        let fps = 30; // default
        if (videoStream.r_frame_rate) {
          const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
          fps = den ? num / den : num;
        }

        // Extract recording date
        const { recordedAt, recordedAtSource } = await this.extractRecordingDate(
          videoPath,
          metadata
        );

        resolve({
          duration,
          width,
          height,
          fps,
          recordedAt,
          recordedAtSource
        });
      });
    });
  }

  /**
   * Extract recording date from video using multiple strategies
   */
  private async extractRecordingDate(
    videoPath: string,
    metadata: ffmpeg.FfprobeData
  ): Promise<{ recordedAt: Date | null; recordedAtSource: RecordedAtSource }> {
    // Strategy 1: Extract from video metadata tags
    const metadataDate = this.getDateFromMetadata(metadata);
    if (metadataDate) {
      logger.info('Extracted recording date from video metadata', {
        date: metadataDate.toISOString(),
        path: videoPath,
      });
      return { recordedAt: metadataDate, recordedAtSource: 'metadata' };
    }

    // Strategy 2: Try to parse from filename (e.g., birdcam_20260114_071920.mp4)
    const filenameDate = this.getDateFromFilename(videoPath);
    if (filenameDate) {
      logger.info('Extracted recording date from filename', {
        date: filenameDate.toISOString(),
        path: videoPath,
      });
      return { recordedAt: filenameDate, recordedAtSource: 'filename' };
    }

    // Strategy 3: Use file creation time (ctime)
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat(videoPath);
      const fileDate = stats.birthtime || stats.mtime;

      logger.warn('Using file creation time as recording date fallback', {
        date: fileDate.toISOString(),
        path: videoPath,
      });
      return { recordedAt: fileDate, recordedAtSource: 'file_ctime' };
    } catch (error) {
      logger.error('Failed to get file stats for recording date', {
        error: (error as Error).message,
        path: videoPath,
      });
    }

    // Strategy 4: Fallback to current time (marks as unreliable)
    logger.error('Could not determine video recording date, using current time', {
      path: videoPath,
    });
    return { recordedAt: new Date(), recordedAtSource: 'fallback' };
  }

  /**
   * Extract date from video metadata tags
   */
  private getDateFromMetadata(metadata: ffmpeg.FfprobeData): Date | null {
    // Check format tags first
    const formatTags = metadata.format?.tags || {};

    // Common metadata fields for video creation time
    const dateFields = [
      'creation_time',
      'date',
      'com.apple.quicktime.creationdate',
      'com.apple.quicktime.make',
      'creation-time',
      'DATE',
      'CREATION_TIME',
    ];

    for (const field of dateFields) {
      const value = formatTags[field];
      if (value) {
        const date = this.parseMetadataDate(value);
        if (date) {
          return date;
        }
      }
    }

    // Check video stream tags
    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    if (videoStream?.tags) {
      for (const field of dateFields) {
        const value = videoStream.tags[field];
        if (value) {
          const date = this.parseMetadataDate(value);
          if (date) {
            return date;
          }
        }
      }
    }

    return null;
  }

  /**
   * Parse metadata date string
   */
  private parseMetadataDate(value: string): Date | null {
    try {
      // ISO 8601 format: 2024-01-14T07:19:20.000Z
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }

  /**
   * Extract date from filename pattern
   */
  private getDateFromFilename(videoPath: string): Date | null {
    const filename = path.basename(videoPath);

    // Pattern: birdcam_YYYYMMDD_HHMMSS.mp4
    const match = filename.match(/(\d{8})_(\d{6})/);
    if (match) {
      const dateStr = match[1]; // YYYYMMDD
      const timeStr = match[2]; // HHMMSS

      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-indexed
      const day = parseInt(dateStr.substring(6, 8));
      const hour = parseInt(timeStr.substring(0, 2));
      const minute = parseInt(timeStr.substring(2, 4));
      const second = parseInt(timeStr.substring(4, 6));

      const date = new Date(year, month, day, hour, minute, second);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  }

  /**
   * Extract frames from video at specified FPS
   */
  async extractFrames(
    videoPath: string,
    videoId: number,
    targetFps = 1
  ): Promise<ExtractedFrame[]> {
    logger.info(`Extracting frames from video ${videoId} at ${targetFps} fps`);

    // Create output directory for this video's frames
    const outputDir = path.join(paths.frames, videoId.toString());
    await ensureDir(outputDir);

    // Get video metadata first
    const metadata = await this.getVideoMetadata(videoPath);
    logger.info('Video metadata', {
      duration: metadata.duration,
      resolution: `${metadata.width}x${metadata.height}`,
      fps: metadata.fps,
    });

    // Calculate expected number of frames
    const expectedFrames = Math.floor(metadata.duration * targetFps);
    const frames: ExtractedFrame[] = [];

    return new Promise((resolve, reject) => {
      let frameNumber = 0;

      ffmpeg(videoPath)
        .outputOptions([
          `-vf fps=${targetFps}`, // Extract at target FPS
          '-q:v 2', // JPEG quality (1-31, lower = better)
        ])
        .output(path.join(outputDir, 'frame_%04d.jpg'))
        .on('start', (command) => {
          logger.debug('FFmpeg command', { command });
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            logger.debug(`Extraction progress: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', async () => {
          // Collect frame information
          for (let i = 1; i <= expectedFrames; i++) {
            const framePath = path.join(outputDir, `frame_${i.toString().padStart(4, '0')}.jpg`);
            const timestamp = (i - 1) / targetFps;

            frames.push({
              number: i,
              timestamp,
              path: framePath,
            });
          }

          logger.info(`Successfully extracted ${frames.length} frames from video ${videoId}`);
          resolve(frames);
        })
        .on('error', (err) => {
          logger.error('Frame extraction failed', { error: err.message, videoPath });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Extract a single frame at a specific timestamp
   */
  async extractFrameAtTimestamp(
    videoPath: string,
    timestamp: number,
    outputPath: string
  ): Promise<void> {
    const resolvedOutputPath = path.isAbsolute(outputPath)
      ? outputPath
      : path.join(paths.frames, outputPath);

    await ensureDir(path.dirname(resolvedOutputPath));

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .output(resolvedOutputPath)
        .on('end', () => {
          logger.debug(`Extracted frame at ${timestamp}s to ${resolvedOutputPath}`);
          resolve();
        })
        .on('error', (err) => {
          logger.error('Failed to extract frame at timestamp', {
            error: err.message,
            timestamp,
          });
          reject(err);
        })
        .run();
    });
  }

  /**
   * Delete frames for a video
   */
  async deleteFrames(videoId: number): Promise<void> {
    const outputDir = path.join(paths.frames, videoId.toString());

    try {
      const { rm } = await import('fs/promises');
      await rm(outputDir, { recursive: true, force: true });
      logger.info(`Deleted frames for video ${videoId}`);
    } catch (error) {
      logger.error('Failed to delete frames', {
        error: (error as Error).message,
        videoId,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const frameExtractorService = new FrameExtractorService();
