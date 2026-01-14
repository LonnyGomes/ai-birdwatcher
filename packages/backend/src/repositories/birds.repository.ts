import type Database from 'better-sqlite3';
import { getDatabase } from '../database/connection.js';
import type {
  BirdProfile,
  CreateBirdProfileInput,
  UpdateBirdProfileInput,
  BirdRepresentativeImage,
  CreateBirdRepresentativeImageInput,
} from '@ai-birdwatcher/shared';

export class BirdsRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new bird profile
   */
  create(input: CreateBirdProfileInput): BirdProfile {
    const stmt = this.db.prepare(`
      INSERT INTO bird_profiles (
        unique_identifier, species, common_name, primary_gender,
        confidence_score, first_seen, last_seen, total_visits,
        representative_image_path, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.unique_identifier,
      input.species,
      input.common_name ?? null,
      input.primary_gender ?? null,
      input.confidence_score ?? null,
      input.first_seen,
      input.last_seen,
      input.total_visits ?? 1,
      input.representative_image_path ?? null,
      input.notes ?? null
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find bird profile by ID
   */
  findById(id: number): BirdProfile | null {
    const stmt = this.db.prepare('SELECT * FROM bird_profiles WHERE id = ?');
    return stmt.get(id) as BirdProfile | null;
  }

  /**
   * Find bird profile by unique identifier
   */
  findByIdentifier(identifier: string): BirdProfile | null {
    const stmt = this.db.prepare('SELECT * FROM bird_profiles WHERE unique_identifier = ?');
    return stmt.get(identifier) as BirdProfile | null;
  }

  /**
   * Find all bird profiles for a given species
   */
  findBySpecies(species: string, options?: {
    orderBy?: 'last_seen' | 'total_visits' | 'created_at';
    limit?: number;
  }): BirdProfile[] {
    const orderBy = options?.orderBy ?? 'last_seen';
    let query = `SELECT * FROM bird_profiles WHERE species = ? ORDER BY ${orderBy} DESC`;

    const params: any[] = [species];

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as BirdProfile[];
  }

  /**
   * Find all bird profiles
   */
  findAll(options?: {
    limit?: number;
    offset?: number;
  }): BirdProfile[] {
    let query = 'SELECT * FROM bird_profiles ORDER BY last_seen DESC';
    const params: any[] = [];

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);

      if (options?.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as BirdProfile[];
  }

  /**
   * Update bird profile
   */
  update(id: number, input: UpdateBirdProfileInput): BirdProfile | null {
    const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const params: any[] = [];

    if (input.primary_gender !== undefined) {
      updates.push('primary_gender = ?');
      params.push(input.primary_gender);
    }
    if (input.confidence_score !== undefined) {
      updates.push('confidence_score = ?');
      params.push(input.confidence_score);
    }
    if (input.last_seen !== undefined) {
      updates.push('last_seen = ?');
      params.push(input.last_seen);
    }
    if (input.total_visits !== undefined) {
      updates.push('total_visits = ?');
      params.push(input.total_visits);
    }
    if (input.representative_image_path !== undefined) {
      updates.push('representative_image_path = ?');
      params.push(input.representative_image_path);
    }
    if (input.notes !== undefined) {
      updates.push('notes = ?');
      params.push(input.notes);
    }

    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE bird_profiles SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...params);
    return this.findById(id);
  }

  /**
   * Increment visit count for a bird profile
   */
  incrementVisits(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE bird_profiles
      SET total_visits = total_visits + 1,
          last_seen = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * Count bird profiles by species
   */
  countBySpecies(species: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM bird_profiles WHERE species = ?');
    const result = stmt.get(species) as { count: number };
    return result.count;
  }

  /**
   * Get unique species list
   */
  getUniqueSpecies(): string[] {
    const stmt = this.db.prepare('SELECT DISTINCT species FROM bird_profiles ORDER BY species');
    const results = stmt.all() as { species: string }[];
    return results.map(r => r.species);
  }

  /**
   * Add representative image for a bird profile
   */
  addRepresentativeImage(input: CreateBirdRepresentativeImageInput): BirdRepresentativeImage {
    const stmt = this.db.prepare(`
      INSERT INTO bird_representative_images (
        bird_profile_id, sighting_id, image_path, quality_score, is_primary
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.bird_profile_id,
      input.sighting_id,
      input.image_path,
      input.quality_score ?? null,
      input.is_primary ? 1 : 0
    );

    return this.getRepresentativeImageById(result.lastInsertRowid as number)!;
  }

  /**
   * Get representative image by ID
   */
  getRepresentativeImageById(id: number): BirdRepresentativeImage | null {
    const stmt = this.db.prepare('SELECT * FROM bird_representative_images WHERE id = ?');
    return stmt.get(id) as BirdRepresentativeImage | null;
  }

  /**
   * Get all representative images for a bird profile
   */
  getRepresentativeImages(birdProfileId: number): BirdRepresentativeImage[] {
    const stmt = this.db.prepare(`
      SELECT * FROM bird_representative_images
      WHERE bird_profile_id = ?
      ORDER BY is_primary DESC, quality_score DESC
    `);
    return stmt.all(birdProfileId) as BirdRepresentativeImage[];
  }

  /**
   * Set image as primary representative
   */
  setPrimaryImage(birdProfileId: number, imageId: number): void {
    const db = this.db;

    db.transaction(() => {
      // Remove primary flag from all images
      db.prepare('UPDATE bird_representative_images SET is_primary = 0 WHERE bird_profile_id = ?')
        .run(birdProfileId);

      // Set new primary
      db.prepare('UPDATE bird_representative_images SET is_primary = 1 WHERE id = ?')
        .run(imageId);

      // Update bird profile with new primary image path
      const image = this.getRepresentativeImageById(imageId);
      if (image) {
        db.prepare('UPDATE bird_profiles SET representative_image_path = ? WHERE id = ?')
          .run(image.image_path, birdProfileId);
      }
    })();
  }

  /**
   * Delete bird profile
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM bird_profiles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
