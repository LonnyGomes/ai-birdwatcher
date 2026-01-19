import type Database from 'better-sqlite3';
import { getDatabase } from '../database/connection.js';
import type {
  ProcessingMetrics,
  CreateProcessingMetricsInput,
} from '@ai-birdwatcher/shared';

export class ProcessingMetricsRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  create(input: CreateProcessingMetricsInput): ProcessingMetrics {
    const stmt = this.db.prepare(`
      INSERT INTO processing_metrics (
        video_id,
        job_id,
        total_frames,
        skipped_low_quality_duplicate,
        skipped_no_birds
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.video_id,
      input.job_id ?? null,
      input.total_frames,
      input.skipped_low_quality_duplicate,
      input.skipped_no_birds
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  findById(id: number): ProcessingMetrics | null {
    const stmt = this.db.prepare('SELECT * FROM processing_metrics WHERE id = ?');
    return stmt.get(id) as ProcessingMetrics | null;
  }

  findByVideoId(videoId: number): ProcessingMetrics[] {
    const stmt = this.db.prepare(
      'SELECT * FROM processing_metrics WHERE video_id = ? ORDER BY created_at DESC'
    );
    return stmt.all(videoId) as ProcessingMetrics[];
  }
}
