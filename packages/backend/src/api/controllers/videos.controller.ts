import { VideosRepository } from '../../repositories/videos.repository.js';
import { videoProcessingService } from '../../services/videoProcessing.service.js';
import { paths } from '../../config/environment.js';
import { toRelativeUploadPath, toAbsoluteUploadPath } from '../../utils/pathUtils.js';
import path from 'path';
import fs from 'fs/promises';
import { pipeline } from 'stream/promises';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';

interface VideoIdParams {
  id: string;
}

interface ListQuerystring {
  status?: string;
  limit?: string;
  offset?: string;
}

export class VideosController {
  private videosRepo: VideosRepository;

  constructor() {
    this.videosRepo = new VideosRepository();
  }

  /**
   * Upload video
   */
  async upload(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'No file uploaded',
        });
      }

      // Validate file type
      const allowedMimeTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid file type. Only video files are allowed.',
        });
      }

      // Ensure uploads directory exists
      await fs.mkdir(paths.uploads, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = data.filename;
      const ext = path.extname(originalName);
      const basename = path.basename(originalName, ext);
      const filename = `${basename}_${timestamp}${ext}`;
      const filepath = path.join(paths.uploads, filename);

      // Save file
      await pipeline(data.file, fs.createWriteStream(filepath));

      // Create video record (store relative path in DB)
      const video = this.videosRepo.create({
        filename,
        filepath: toRelativeUploadPath(filepath),
        source: 'upload',
      });

      // Start processing
      await videoProcessingService.processVideo(video.id);

      return reply.status(201).send({
        video,
        message: 'Video uploaded successfully and processing started',
      });
    } catch (error) {
      request.log.error('Video upload failed:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to upload video',
      });
    }
  }

  /**
   * List all videos
   */
  async list(request: FastifyRequest<{ Querystring: ListQuerystring }>, reply: FastifyReply) {
    const { status, limit, offset } = request.query;

    const videos = this.videosRepo.findAll({
      status: status as any,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    const total = this.videosRepo.count(status as any);

    return reply.send({
      videos,
      total,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  /**
   * Get video by ID
   */
  async getById(request: FastifyRequest<{ Params: VideoIdParams }>, reply: FastifyReply) {
    const videoId = parseInt(request.params.id);

    if (isNaN(videoId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid video ID',
      });
    }

    const video = this.videosRepo.findById(videoId);

    if (!video) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Video not found',
      });
    }

    return reply.send({ video });
  }

  /**
   * Get processing status
   */
  async getStatus(request: FastifyRequest<{ Params: VideoIdParams }>, reply: FastifyReply) {
    const videoId = parseInt(request.params.id);

    if (isNaN(videoId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid video ID',
      });
    }

    try {
      const status = await videoProcessingService.getProcessingStatus(videoId);
      return reply.send(status);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Video not found',
        });
      }
      throw error;
    }
  }

  /**
   * Delete video
   */
  async delete(request: FastifyRequest<{ Params: VideoIdParams }>, reply: FastifyReply) {
    const videoId = parseInt(request.params.id);

    if (isNaN(videoId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid video ID',
      });
    }

    const video = this.videosRepo.findById(videoId);

    if (!video) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Video not found',
      });
    }

    // Delete video file (reconstruct absolute path from relative DB path)
    try {
      await fs.unlink(toAbsoluteUploadPath(video.filepath));
    } catch (error) {
      request.log.warn('Failed to delete video file:', error);
    }

    // Delete from database
    this.videosRepo.delete(videoId);

    return reply.send({
      message: 'Video deleted successfully',
    });
  }

  /**
   * Cancel processing
   */
  async cancelProcessing(request: FastifyRequest<{ Params: VideoIdParams }>, reply: FastifyReply) {
    const videoId = parseInt(request.params.id);

    if (isNaN(videoId)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid video ID',
      });
    }

    try {
      await videoProcessingService.cancelProcessing(videoId);
      return reply.send({
        message: 'Processing cancelled',
      });
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Video not found',
        });
      }
      throw error;
    }
  }
}

export const videosController = new VideosController();
