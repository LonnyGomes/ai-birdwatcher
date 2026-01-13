import type Database from 'better-sqlite3';
import { getDatabase } from '../database/connection.js';
import type {
  ProcessingJob,
  CreateJobInput,
  UpdateJobInput,
  JobType,
  JobStatus,
} from '@ai-birdwatcher/shared';

export class JobsRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new processing job
   */
  create(input: CreateJobInput): ProcessingJob {
    const stmt = this.db.prepare(`
      INSERT INTO processing_jobs (video_id, job_type)
      VALUES (?, ?)
    `);

    const result = stmt.run(input.video_id, input.job_type);
    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find job by ID
   */
  findById(id: number): ProcessingJob | null {
    const stmt = this.db.prepare('SELECT * FROM processing_jobs WHERE id = ?');
    return stmt.get(id) as ProcessingJob | null;
  }

  /**
   * Find jobs by video ID
   */
  findByVideoId(videoId: number): ProcessingJob[] {
    const stmt = this.db.prepare('SELECT * FROM processing_jobs WHERE video_id = ? ORDER BY created_at DESC');
    return stmt.all(videoId) as ProcessingJob[];
  }

  /**
   * Find pending jobs
   */
  findPending(jobType?: JobType, limit?: number): ProcessingJob[] {
    let query = "SELECT * FROM processing_jobs WHERE status = 'pending'";
    const params: any[] = [];

    if (jobType) {
      query += ' AND job_type = ?';
      params.push(jobType);
    }

    query += ' ORDER BY created_at ASC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as ProcessingJob[];
  }

  /**
   * Get next pending job for processing
   */
  getNextPendingJob(jobType?: JobType): ProcessingJob | null {
    const jobs = this.findPending(jobType, 1);
    return jobs[0] || null;
  }

  /**
   * Update job
   */
  update(id: number, input: UpdateJobInput): ProcessingJob | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (input.status !== undefined) {
      updates.push('status = ?');
      params.push(input.status);
    }
    if (input.progress !== undefined) {
      updates.push('progress = ?');
      params.push(input.progress);
    }
    if (input.error_message !== undefined) {
      updates.push('error_message = ?');
      params.push(input.error_message);
    }
    if (input.started_at !== undefined) {
      updates.push('started_at = ?');
      params.push(input.started_at);
    }
    if (input.completed_at !== undefined) {
      updates.push('completed_at = ?');
      params.push(input.completed_at);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE processing_jobs SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...params);
    return this.findById(id);
  }

  /**
   * Start job (set status to active and record start time)
   */
  startJob(id: number): void {
    this.update(id, {
      status: 'active',
      started_at: new Date().toISOString(),
    });
  }

  /**
   * Complete job successfully
   */
  completeJob(id: number): void {
    this.update(id, {
      status: 'completed',
      progress: 100,
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Fail job with error message
   */
  failJob(id: number, errorMessage: string): void {
    this.update(id, {
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Update job progress
   */
  updateProgress(id: number, progress: number): void {
    this.update(id, { progress });
  }

  /**
   * Count jobs by status
   */
  countByStatus(status: JobStatus): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM processing_jobs WHERE status = ?');
    const result = stmt.get(status) as { count: number };
    return result.count;
  }

  /**
   * Delete job
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM processing_jobs WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Delete all jobs for a video
   */
  deleteByVideoId(videoId: number): number {
    const stmt = this.db.prepare('DELETE FROM processing_jobs WHERE video_id = ?');
    const result = stmt.run(videoId);
    return result.changes;
  }
}
