// Re-export shared types
export * from '@shared/types/video.types';
export * from '@shared/types/bird.types';
export * from '@shared/types/sighting.types';
export * from '@shared/types/user.types';

// API response wrappers
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number | null;
  offset: number;
}

// Statistics API responses
export interface StatisticsOverview {
  videos: {
    total: number;
    processing: number;
    completed: number;
    failed: number;
  };
  birds: {
    total_individuals: number;
    unique_species: number;
    total_sightings: number;
  };
  recent_sightings: any[]; // Will use proper type from shared
  top_visitors: any[]; // Will use proper type from shared
}

export interface SpeciesData {
  species: string;
  sightings: number;
  individuals: number;
}

export interface TimelineData {
  timestamp: string;
  count: number;
}

export interface HourlyActivityData {
  hour: number;
  count: number;
}
