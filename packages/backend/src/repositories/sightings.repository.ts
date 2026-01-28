import type Database from 'better-sqlite3';
import { getDatabase } from '../database/connection.js';
import type {
  Sighting,
  CreateSightingInput,
  UpdateSightingInput,
  SightingWithBird,
} from '@ai-birdwatcher/shared';

export class SightingsRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new sighting
   */
  create(input: CreateSightingInput): Sighting {
    const stmt = this.db.prepare(`
      INSERT INTO sightings (
        video_id, bird_profile_id, frame_number, timestamp_in_video,
        species, gender, confidence_score, frame_path, ai_analysis,
        is_matched, match_confidence, detected_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.video_id,
      input.bird_profile_id ?? null,
      input.frame_number,
      input.timestamp_in_video,
      input.species,
      input.gender ?? null,
      input.confidence_score,
      input.frame_path,
      input.ai_analysis ?? null,
      input.is_matched ? 1 : 0,
      input.match_confidence ?? null,
      input.detected_at ?? new Date().toISOString()
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find sighting by ID
   */
  findById(id: number): Sighting | null {
    const stmt = this.db.prepare('SELECT * FROM sightings WHERE id = ?');
    return stmt.get(id) as Sighting | null;
  }

  /**
   * Find all sightings with optional filters
   */
  findAll(options?: {
    videoId?: number;
    birdProfileId?: number;
    species?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Sighting[] {
    let query = 'SELECT * FROM sightings WHERE 1=1';
    const params: any[] = [];

    if (options?.videoId) {
      query += ' AND video_id = ?';
      params.push(options.videoId);
    }

    if (options?.birdProfileId) {
      query += ' AND bird_profile_id = ?';
      params.push(options.birdProfileId);
    }

    if (options?.species) {
      query += ' AND species = ?';
      params.push(options.species);
    }

    if (options?.dateFrom) {
      query += ' AND detected_at >= ?';
      params.push(options.dateFrom);
    }

    if (options?.dateTo) {
      query += ' AND detected_at <= ?';
      params.push(options.dateTo);
    }

    query += ' ORDER BY detected_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);

      if (options?.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as Sighting[];
  }

  /**
   * Find sightings with bird profile information
   */
  findAllWithBird(options?: {
    videoId?: number;
    species?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): SightingWithBird[] {
    let query = `
      SELECT
        s.*,
        bp.unique_identifier as bird_unique_identifier,
        bp.common_name as bird_common_name
      FROM sightings s
      LEFT JOIN bird_profiles bp ON s.bird_profile_id = bp.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (options?.videoId) {
      query += ' AND s.video_id = ?';
      params.push(options.videoId);
    }

    if (options?.species) {
      query += ' AND s.species = ?';
      params.push(options.species);
    }

    if (options?.dateFrom) {
      query += ' AND s.detected_at >= ?';
      params.push(options.dateFrom);
    }

    if (options?.dateTo) {
      query += ' AND s.detected_at <= ?';
      params.push(options.dateTo);
    }

    query += ' ORDER BY s.detected_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);

      if (options?.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as SightingWithBird[];
  }

  /**
   * Find sightings by video ID
   */
  findByVideoId(videoId: number): Sighting[] {
    return this.findAll({ videoId });
  }

  /**
   * Find sightings by bird profile ID
   */
  findByBirdProfileId(birdProfileId: number): Sighting[] {
    return this.findAll({ birdProfileId });
  }

  /**
   * Update sighting
   */
  update(id: number, input: UpdateSightingInput): Sighting | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (input.bird_profile_id !== undefined) {
      updates.push('bird_profile_id = ?');
      params.push(input.bird_profile_id);
    }
    if (input.is_matched !== undefined) {
      updates.push('is_matched = ?');
      params.push(input.is_matched ? 1 : 0);
    }
    if (input.match_confidence !== undefined) {
      updates.push('match_confidence = ?');
      params.push(input.match_confidence);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE sightings SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...params);
    return this.findById(id);
  }

  /**
   * Link sighting to bird profile
   */
  linkToBirdProfile(sightingId: number, birdProfileId: number, matchConfidence: number): void {
    this.update(sightingId, {
      bird_profile_id: birdProfileId,
      is_matched: true,
      match_confidence: matchConfidence,
    });
  }

  /**
   * Count sightings with optional filters
   */
  count(options?: {
    videoId?: number;
    birdProfileId?: number;
    species?: string;
    dateFrom?: string;
    dateTo?: string;
  }): number {
    let query = 'SELECT COUNT(*) as count FROM sightings WHERE 1=1';
    const params: any[] = [];

    if (options?.videoId) {
      query += ' AND video_id = ?';
      params.push(options.videoId);
    }

    if (options?.birdProfileId) {
      query += ' AND bird_profile_id = ?';
      params.push(options.birdProfileId);
    }

    if (options?.species) {
      query += ' AND species = ?';
      params.push(options.species);
    }

    if (options?.dateFrom) {
      query += ' AND detected_at >= ?';
      params.push(options.dateFrom);
    }

    if (options?.dateTo) {
      query += ' AND detected_at <= ?';
      params.push(options.dateTo);
    }

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  }

  /**
   * Get species frequency (for statistics)
   */
  getSpeciesFrequency(): { species: string; count: number }[] {
    const stmt = this.db.prepare(`
      SELECT species, COUNT(*) as count
      FROM sightings
      GROUP BY species
      ORDER BY count DESC
    `);
    return stmt.all() as { species: string; count: number }[];
  }

  /**
   * Get hourly activity (for statistics)
   * Converts to local timezone before extracting hour
   */
  getHourlyActivity(): { hour: number; count: number }[] {
    const stmt = this.db.prepare(`
      SELECT
        CAST(strftime('%H', datetime(detected_at, 'localtime')) AS INTEGER) as hour,
        COUNT(*) as count
      FROM sightings
      GROUP BY hour
      ORDER BY hour
    `);
    return stmt.all() as { hour: number; count: number }[];
  }

  /**
   * Delete sighting
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM sightings WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
