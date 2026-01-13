import type Database from 'better-sqlite3';

export const up = (db: Database.Database): void => {
  // Videos table: tracks uploaded/monitored video files
  db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename VARCHAR(255) NOT NULL,
      filepath VARCHAR(500) NOT NULL UNIQUE,
      source VARCHAR(50) NOT NULL CHECK(source IN ('upload', 'camera')),
      duration_seconds INTEGER,
      frame_count INTEGER,
      status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME
    );
  `);

  // Bird profiles: unique individual birds identified by visual similarity
  db.exec(`
    CREATE TABLE IF NOT EXISTS bird_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unique_identifier VARCHAR(100) UNIQUE NOT NULL,
      species VARCHAR(100) NOT NULL,
      common_name VARCHAR(100),
      primary_gender VARCHAR(20) CHECK(primary_gender IN ('male', 'female', 'unknown', NULL)),
      confidence_score FLOAT,
      first_seen DATETIME NOT NULL,
      last_seen DATETIME NOT NULL,
      total_visits INTEGER DEFAULT 1,
      representative_image_path VARCHAR(500),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Sightings: individual bird detections from video frames
  db.exec(`
    CREATE TABLE IF NOT EXISTS sightings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER NOT NULL,
      bird_profile_id INTEGER,
      frame_number INTEGER NOT NULL,
      timestamp_in_video FLOAT NOT NULL,
      species VARCHAR(100) NOT NULL,
      gender VARCHAR(20) CHECK(gender IN ('male', 'female', 'unknown', NULL)),
      confidence_score FLOAT NOT NULL,
      frame_path VARCHAR(500) NOT NULL,
      ai_analysis TEXT,
      is_matched BOOLEAN DEFAULT 0,
      match_confidence FLOAT,
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
      FOREIGN KEY (bird_profile_id) REFERENCES bird_profiles(id) ON DELETE SET NULL
    );
  `);

  // Representative images: multiple reference images per bird profile
  db.exec(`
    CREATE TABLE IF NOT EXISTS bird_representative_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bird_profile_id INTEGER NOT NULL,
      sighting_id INTEGER NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      quality_score FLOAT,
      is_primary BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bird_profile_id) REFERENCES bird_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (sighting_id) REFERENCES sightings(id) ON DELETE CASCADE
    );
  `);

  // Processing jobs: SQLite-based job queue
  db.exec(`
    CREATE TABLE IF NOT EXISTS processing_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER NOT NULL,
      job_type VARCHAR(50) NOT NULL CHECK(job_type IN ('frame_extraction', 'bird_identification', 'similarity_matching')),
      status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'completed', 'failed')),
      progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
      error_message TEXT,
      started_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
    );
  `);

  // Users table: basic authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sightings_video_id ON sightings(video_id);
    CREATE INDEX IF NOT EXISTS idx_sightings_bird_profile_id ON sightings(bird_profile_id);
    CREATE INDEX IF NOT EXISTS idx_sightings_species ON sightings(species);
    CREATE INDEX IF NOT EXISTS idx_sightings_detected_at ON sightings(detected_at);
    CREATE INDEX IF NOT EXISTS idx_bird_profiles_species ON bird_profiles(species);
    CREATE INDEX IF NOT EXISTS idx_bird_profiles_last_seen ON bird_profiles(last_seen);
    CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
    CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
    CREATE INDEX IF NOT EXISTS idx_processing_jobs_video_id ON processing_jobs(video_id);
  `);

  console.log('✓ Initial schema migration completed');
};

export const down = (db: Database.Database): void => {
  db.exec(`
    DROP TABLE IF EXISTS bird_representative_images;
    DROP TABLE IF EXISTS sightings;
    DROP TABLE IF EXISTS processing_jobs;
    DROP TABLE IF EXISTS bird_profiles;
    DROP TABLE IF EXISTS videos;
    DROP TABLE IF EXISTS users;
  `);

  console.log('✓ Initial schema migration rolled back');
};
