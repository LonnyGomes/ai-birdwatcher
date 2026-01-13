import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs/promises';
import { paths } from '../config/environment.js';
import { VideosRepository } from '../repositories/videos.repository.js';
import { videoProcessingService } from './videoProcessing.service.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('FileWatcherService');

export class FileWatcherService {
  private watcher: chokidar.FSWatcher | null;
  private videosRepo: VideosRepository;
  private isWatching: boolean;
  private readonly videoExtensions: string[];

  constructor() {
    this.watcher = null;
    this.videosRepo = new VideosRepository();
    this.isWatching = false;
    this.videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'];
  }

  /**
   * Start watching the folder for new videos
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      logger.warn('File watcher is already running');
      return;
    }

    // Ensure watch folder exists
    try {
      await fs.access(paths.watchFolder);
    } catch {
      logger.info(`Creating watch folder: ${paths.watchFolder}`);
      await fs.mkdir(paths.watchFolder, { recursive: true });
    }

    logger.info(`Starting file watcher on: ${paths.watchFolder}`);

    this.watcher = chokidar.watch(paths.watchFolder, {
      ignored: /(^|[\/\\])\../, // Ignore dotfiles
      persistent: true,
      ignoreInitial: false, // Process existing files on startup
      awaitWriteFinish: {
        stabilityThreshold: 2000, // Wait 2s for file to be fully written
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', async (filePath) => {
        await this.handleNewFile(filePath);
      })
      .on('ready', () => {
        this.isWatching = true;
        logger.info('File watcher is ready and monitoring for new videos');
      })
      .on('error', (error) => {
        logger.error('File watcher error', { error: error.message });
      });
  }

  /**
   * Stop watching the folder
   */
  async stop(): Promise<void> {
    if (!this.isWatching || !this.watcher) {
      return;
    }

    logger.info('Stopping file watcher...');

    await this.watcher.close();
    this.watcher = null;
    this.isWatching = false;

    logger.info('File watcher stopped');
  }

  /**
   * Handle a new file detected in the watch folder
   */
  private async handleNewFile(filePath: string): Promise<void> {
    const ext = path.extname(filePath).toLowerCase();

    // Check if it's a video file
    if (!this.videoExtensions.includes(ext)) {
      logger.debug(`Ignoring non-video file: ${path.basename(filePath)}`);
      return;
    }

    logger.info(`New video detected: ${path.basename(filePath)}`);

    try {
      // Check if video already exists in database
      const existing = this.videosRepo.findByFilepath(filePath);

      if (existing) {
        logger.info(`Video already exists in database (ID: ${existing.id}), skipping`);
        return;
      }

      // Copy video to uploads directory
      const filename = path.basename(filePath);
      const uploadPath = path.join(paths.uploads, filename);

      await fs.mkdir(paths.uploads, { recursive: true });
      await fs.copyFile(filePath, uploadPath);

      logger.info(`Copied video to uploads: ${uploadPath}`);

      // Create video record
      const video = this.videosRepo.create({
        filename,
        filepath: uploadPath,
        source: 'camera',
      });

      logger.info(`Created video record (ID: ${video.id}) for ${filename}`);

      // Start processing
      await videoProcessingService.processVideo(video.id);

      logger.info(`Initiated processing for video ${video.id}`);
    } catch (error) {
      logger.error(`Failed to process new video: ${path.basename(filePath)}`, {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Check if file watcher is running
   */
  isRunning(): boolean {
    return this.isWatching;
  }

  /**
   * Get watch folder path
   */
  getWatchPath(): string {
    return paths.watchFolder;
  }

  /**
   * Manually trigger processing of all videos in watch folder
   */
  async processExistingVideos(): Promise<void> {
    logger.info('Processing existing videos in watch folder');

    const files = await fs.readdir(paths.watchFolder);

    for (const file of files) {
      const filePath = path.join(paths.watchFolder, file);
      const ext = path.extname(file).toLowerCase();

      if (this.videoExtensions.includes(ext)) {
        await this.handleNewFile(filePath);
      }
    }

    logger.info('Finished processing existing videos');
  }
}

// Export singleton instance
export const fileWatcherService = new FileWatcherService();
