import type Database from 'better-sqlite3';

/**
 * Migration 004: Add Video Recording Date Tracking
 *
 * Adds fields to track when videos were actually recorded (not just when they were uploaded/processed).
 * This enables accurate sighting timestamps by calculating: detected_at = recorded_at + timestamp_in_video
 */

export const up = (db: Database.Database): void => {
  console.log('Running migration 004: Add video recording date tracking...');

  // Add recorded_at column to videos table
  db.exec(`
    ALTER TABLE videos
    ADD COLUMN recorded_at DATETIME;
  `);

  console.log('  ✓ Added recorded_at column to videos table');

  // Add metadata_source column to track how we got the date
  db.exec(`
    ALTER TABLE videos
    ADD COLUMN recorded_at_source VARCHAR(50)
    CHECK(recorded_at_source IN ('metadata', 'file_ctime', 'filename', 'fallback', NULL));
  `);

  console.log('  ✓ Added recorded_at_source column to videos table');

  // Add index for performance when querying by recording date
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_videos_recorded_at ON videos(recorded_at);
  `);

  console.log('  ✓ Created index on videos.recorded_at');

  console.log('✓ Migration 004 completed: Video recording date tracking schema added');
};

export const down = (db: Database.Database): void => {
  console.log('Rolling back migration 004: Remove video recording date tracking...');

  // Drop the index
  db.exec(`
    DROP INDEX IF EXISTS idx_videos_recorded_at;
  `);

  console.log('  ✓ Dropped index idx_videos_recorded_at');

  // Note: SQLite doesn't support DROP COLUMN easily without recreating the table
  // For simplicity, we'll leave the columns in place but drop the index
  // If full rollback is needed, restore from database backup

  console.log('✓ Migration 004 rolled back: Index removed (columns remain)');
  console.log('  Note: To fully remove columns, restore from database backup');
};
