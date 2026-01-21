import type Database from 'better-sqlite3';

export const up = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS species_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      species VARCHAR(100) UNIQUE NOT NULL,
      common_name VARCHAR(100),
      wikipedia_image_url VARCHAR(500),
      wikipedia_page_url VARCHAR(500),
      description TEXT,
      fetched_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_species_info_species ON species_info(species);
  `);

  console.log('✓ Species info migration completed');
};

export const down = (db: Database.Database): void => {
  db.exec(`
    DROP TABLE IF EXISTS species_info;
  `);

  console.log('✓ Species info migration rolled back');
};
