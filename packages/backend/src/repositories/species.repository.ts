import type Database from 'better-sqlite3';
import { getDatabase } from '../database/connection.js';

export interface SpeciesInfo {
  id: number;
  species: string;
  common_name: string | null;
  wikipedia_image_url: string | null;
  wikipedia_page_url: string | null;
  description: string | null;
  fetched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSpeciesInfoInput {
  species: string;
  common_name?: string;
  wikipedia_image_url?: string;
  wikipedia_page_url?: string;
  description?: string;
}

export class SpeciesRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create or update species info
   */
  upsert(input: CreateSpeciesInfoInput): SpeciesInfo {
    const existing = this.findBySpecies(input.species);

    if (existing) {
      return this.update(existing.id, input);
    }

    const stmt = this.db.prepare(`
      INSERT INTO species_info (
        species, common_name, wikipedia_image_url, wikipedia_page_url, description, fetched_at
      )
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(
      input.species,
      input.common_name ?? null,
      input.wikipedia_image_url ?? null,
      input.wikipedia_page_url ?? null,
      input.description ?? null
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find species info by ID
   */
  findById(id: number): SpeciesInfo | null {
    const stmt = this.db.prepare('SELECT * FROM species_info WHERE id = ?');
    return stmt.get(id) as SpeciesInfo | null;
  }

  /**
   * Find species info by species name
   */
  findBySpecies(species: string): SpeciesInfo | null {
    const stmt = this.db.prepare('SELECT * FROM species_info WHERE species = ?');
    return stmt.get(species) as SpeciesInfo | null;
  }

  /**
   * Find all species info
   */
  findAll(): SpeciesInfo[] {
    const stmt = this.db.prepare('SELECT * FROM species_info ORDER BY species');
    return stmt.all() as SpeciesInfo[];
  }

  /**
   * Find species info for multiple species
   */
  findBySpeciesList(speciesList: string[]): Map<string, SpeciesInfo> {
    if (speciesList.length === 0) {
      return new Map();
    }

    const placeholders = speciesList.map(() => '?').join(',');
    const stmt = this.db.prepare(`SELECT * FROM species_info WHERE species IN (${placeholders})`);
    const results = stmt.all(...speciesList) as SpeciesInfo[];

    const map = new Map<string, SpeciesInfo>();
    for (const info of results) {
      map.set(info.species, info);
    }
    return map;
  }

  /**
   * Update species info
   */
  update(id: number, input: Partial<CreateSpeciesInfoInput>): SpeciesInfo {
    const updates: string[] = [];
    const params: any[] = [];

    if (input.common_name !== undefined) {
      updates.push('common_name = ?');
      params.push(input.common_name);
    }
    if (input.wikipedia_image_url !== undefined) {
      updates.push('wikipedia_image_url = ?');
      params.push(input.wikipedia_image_url);
    }
    if (input.wikipedia_page_url !== undefined) {
      updates.push('wikipedia_page_url = ?');
      params.push(input.wikipedia_page_url);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      params.push(input.description);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      updates.push("fetched_at = datetime('now')");
      params.push(id);

      const stmt = this.db.prepare(`
        UPDATE species_info SET ${updates.join(', ')} WHERE id = ?
      `);
      stmt.run(...params);
    }

    return this.findById(id)!;
  }

  /**
   * Check if species info needs refresh (older than specified hours)
   */
  needsRefresh(species: string, maxAgeHours: number = 168): boolean {
    const info = this.findBySpecies(species);
    if (!info || !info.fetched_at) {
      return true;
    }

    const fetchedAt = new Date(info.fetched_at);
    const now = new Date();
    const ageHours = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);

    return ageHours > maxAgeHours;
  }

  /**
   * Delete species info
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM species_info WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const speciesRepository = new SpeciesRepository();
