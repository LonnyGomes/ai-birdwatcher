import type Database from 'better-sqlite3';
import { getDatabase } from '../database/connection.js';
import type { Video, CreateVideoInput, UpdateVideoInput, VideoStatus } from '@ai-birdwatcher/shared';

export class VideosRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new video record
   */
  create(input: CreateVideoInput): Video {
    const stmt = this.db.prepare(`
      INSERT INTO videos (
        filename, filepath, source, duration_seconds, frame_count,
        recorded_at, recorded_at_source
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.filename,
      input.filepath,
      input.source,
      input.duration_seconds ?? null,
      input.frame_count ?? null,
      input.recorded_at ?? null,
      input.recorded_at_source ?? null
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find video by ID
   */
  findById(id: number): Video | null {
    const stmt = this.db.prepare('SELECT * FROM videos WHERE id = ?');
    return stmt.get(id) as Video | null;
  }

  /**
   * Find video by filepath
   */
  findByFilepath(filepath: string): Video | null {
    const stmt = this.db.prepare('SELECT * FROM videos WHERE filepath = ?');
    return stmt.get(filepath) as Video | null;
  }

  /**
   * Find all videos with optional filters
   */
  findAll(options?: {
    status?: VideoStatus;
    limit?: number;
    offset?: number;
  }): Video[] {
    let query = 'SELECT * FROM videos';
    const params: any[] = [];

    if (options?.status) {
      query += ' WHERE status = ?';
      params.push(options.status);
    }

    query += ' ORDER BY created_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);

      if (options?.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as Video[];
  }

  /**
   * Update video
   */
  update(id: number, input: UpdateVideoInput): Video | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (input.status !== undefined) {
      updates.push('status = ?');
      params.push(input.status);
    }
    if (input.duration_seconds !== undefined) {
      updates.push('duration_seconds = ?');
      params.push(input.duration_seconds);
    }
    if (input.frame_count !== undefined) {
      updates.push('frame_count = ?');
      params.push(input.frame_count);
    }
    if (input.error_message !== undefined) {
      updates.push('error_message = ?');
      params.push(input.error_message);
    }
    if (input.processed_at !== undefined) {
      updates.push('processed_at = ?');
      params.push(input.processed_at);
    }
    if (input.recorded_at !== undefined) {
      updates.push('recorded_at = ?');
      params.push(input.recorded_at);
    }
    if (input.recorded_at_source !== undefined) {
      updates.push('recorded_at_source = ?');
      params.push(input.recorded_at_source);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE videos SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...params);
    return this.findById(id);
  }

  /**
   * Update video status
   */
  updateStatus(id: number, status: VideoStatus, errorMessage?: string): void {
    const updates: UpdateVideoInput = { status };

    if (status === 'completed') {
      updates.processed_at = new Date().toISOString();
    }

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    this.update(id, updates);
  }

  /**
   * Delete video
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM videos WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Count videos with optional filter
   */
  count(status?: VideoStatus): number {
    let query = 'SELECT COUNT(*) as count FROM videos';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  }
}
