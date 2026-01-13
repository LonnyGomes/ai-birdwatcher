import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { paths } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import { ensureDir } from '../utils/imageUtils.js';

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
}

export class FrameExtractorService {
  /**
   * Get video metadata
   */
  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
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

        resolve({ duration, width, height, fps });
      });
    });
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
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .output(outputPath)
        .on('end', () => {
          logger.debug(`Extracted frame at ${timestamp}s to ${outputPath}`);
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
