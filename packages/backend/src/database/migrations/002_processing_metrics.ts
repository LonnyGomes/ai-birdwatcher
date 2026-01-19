import type Database from 'better-sqlite3';

export const up = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS processing_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER NOT NULL,
      job_id INTEGER,
      total_frames INTEGER NOT NULL,
      skipped_low_quality_duplicate INTEGER NOT NULL DEFAULT 0,
      skipped_no_birds INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES processing_jobs(id) ON DELETE SET NULL
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_processing_metrics_video_id ON processing_metrics(video_id);
    CREATE INDEX IF NOT EXISTS idx_processing_metrics_job_id ON processing_metrics(job_id);
  `);

  console.log('✓ Processing metrics migration completed');
};

export const down = (db: Database.Database): void => {
  db.exec(`
    DROP TABLE IF EXISTS processing_metrics;
  `);

  console.log('✓ Processing metrics migration rolled back');
};
