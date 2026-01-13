export type BirdGender = 'male' | 'female' | 'unknown';

export interface BirdProfile {
  id: number;
  unique_identifier: string;
  species: string;
  common_name: string | null;
  primary_gender: BirdGender | null;
  confidence_score: number | null;
  first_seen: string;
  last_seen: string;
  total_visits: number;
  representative_image_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBirdProfileInput {
  unique_identifier: string;
  species: string;
  common_name?: string;
  primary_gender?: BirdGender;
  confidence_score?: number;
  first_seen: string;
  last_seen: string;
  total_visits?: number;
  representative_image_path?: string;
  notes?: string;
}

export interface UpdateBirdProfileInput {
  primary_gender?: BirdGender;
  confidence_score?: number;
  last_seen?: string;
  total_visits?: number;
  representative_image_path?: string;
  notes?: string;
}

export interface BirdRepresentativeImage {
  id: number;
  bird_profile_id: number;
  sighting_id: number;
  image_path: string;
  quality_score: number | null;
  is_primary: boolean;
  created_at: string;
}

export interface CreateBirdRepresentativeImageInput {
  bird_profile_id: number;
  sighting_id: number;
  image_path: string;
  quality_score?: number;
  is_primary?: boolean;
}
