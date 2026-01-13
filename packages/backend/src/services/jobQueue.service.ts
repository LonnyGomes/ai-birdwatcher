import { JobsRepository } from '../repositories/jobs.repository.js';
import { createLogger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import type { JobType, ProcessingJob } from '@ai-birdwatcher/shared';

const logger = createLogger('JobQueueService');

type JobHandler = (job: ProcessingJob) => Promise<void>;

export class JobQueueService {
  private jobsRepo: JobsRepository;
  private handlers: Map<JobType, JobHandler>;
  private isProcessing: boolean;
  private pollInterval: number;

  constructor(pollInterval = 2000) {
    this.jobsRepo = new JobsRepository();
    this.handlers = new Map();
    this.isProcessing = false;
    this.pollInterval = pollInterval;
  }

  /**
   * Register a handler for a specific job type
   */
  registerHandler(jobType: JobType, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
    logger.info(`Registered handler for job type: ${jobType}`);
  }

  /**
   * Add a job to the queue
   */
  async addJob(videoId: number, jobType: JobType): Promise<ProcessingJob> {
    const job = this.jobsRepo.create({
      video_id: videoId,
      job_type: jobType,
    });

    logger.info(`Added ${jobType} job ${job.id} for video ${videoId}`);

    return job;
  }

  /**
   * Start processing jobs from the queue
   */
  async start(): Promise<void> {
    if (this.isProcessing) {
      logger.warn('Job queue is already processing');
      return;
    }

    this.isProcessing = true;
    logger.info('Job queue started');

    // Process jobs continuously
    while (this.isProcessing) {
      try {
        await this.processNextJob();
      } catch (error) {
        logger.error('Error processing job', {
          error: (error as Error).message,
        });
      }

      // Wait before polling for next job
      await sleep(this.pollInterval);
    }

    logger.info('Job queue stopped');
  }

  /**
   * Stop processing jobs
   */
  stop(): void {
    this.isProcessing = false;
    logger.info('Stopping job queue...');
  }

  /**
   * Process the next pending job
   */
  private async processNextJob(): Promise<void> {
    // Get next pending job
    const job = this.jobsRepo.getNextPendingJob();

    if (!job) {
      // No pending jobs
      return;
    }

    const handler = this.handlers.get(job.job_type);

    if (!handler) {
      logger.error(`No handler registered for job type: ${job.job_type}`);
      this.jobsRepo.failJob(job.id, `No handler registered for job type: ${job.job_type}`);
      return;
    }

    logger.info(`Processing ${job.job_type} job ${job.id} for video ${job.video_id}`);

    try {
      // Mark job as active
      this.jobsRepo.startJob(job.id);

      // Execute handler
      await handler(job);

      // Mark job as completed
      this.jobsRepo.completeJob(job.id);

      logger.info(`Completed ${job.job_type} job ${job.id}`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error(`Failed ${job.job_type} job ${job.id}`, { error: errorMessage });

      // Mark job as failed
      this.jobsRepo.failJob(job.id, errorMessage);
    }
  }

  /**
   * Process all pending jobs of a specific type
   */
  async processPendingJobs(jobType: JobType): Promise<void> {
    const handler = this.handlers.get(jobType);

    if (!handler) {
      throw new Error(`No handler registered for job type: ${jobType}`);
    }

    let processedCount = 0;

    while (true) {
      const job = this.jobsRepo.getNextPendingJob(jobType);

      if (!job) {
        break;
      }

      try {
        this.jobsRepo.startJob(job.id);
        await handler(job);
        this.jobsRepo.completeJob(job.id);
        processedCount++;
      } catch (error) {
        this.jobsRepo.failJob(job.id, (error as Error).message);
      }
    }

    logger.info(`Processed ${processedCount} ${jobType} jobs`);
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    pending: number;
    active: number;
    completed: number;
    failed: number;
  } {
    return {
      pending: this.jobsRepo.countByStatus('pending'),
      active: this.jobsRepo.countByStatus('active'),
      completed: this.jobsRepo.countByStatus('completed'),
      failed: this.jobsRepo.countByStatus('failed'),
    };
  }

  /**
   * Update job progress
   */
  updateProgress(jobId: number, progress: number): void {
    this.jobsRepo.updateProgress(jobId, progress);
  }

  /**
   * Get job by ID
   */
  getJob(jobId: number): ProcessingJob | null {
    return this.jobsRepo.findById(jobId);
  }

  /**
   * Get all jobs for a video
   */
  getJobsByVideoId(videoId: number): ProcessingJob[] {
    return this.jobsRepo.findByVideoId(videoId);
  }

  /**
   * Clear all completed jobs
   */
  clearCompletedJobs(): number {
    const jobs = this.jobsRepo.findPending().filter(j => j.status === 'completed');
    let deleted = 0;

    for (const job of jobs) {
      if (this.jobsRepo.delete(job.id)) {
        deleted++;
      }
    }

    logger.info(`Cleared ${deleted} completed jobs`);
    return deleted;
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: number): Promise<void> {
    const job = this.jobsRepo.findById(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== 'failed') {
      throw new Error(`Job ${jobId} is not in failed state`);
    }

    // Reset job to pending
    this.jobsRepo.update(jobId, {
      status: 'pending',
      error_message: null,
      started_at: null,
      completed_at: null,
      progress: 0,
    });

    logger.info(`Retrying job ${jobId}`);
  }
}

// Export singleton instance
export const jobQueueService = new JobQueueService();
