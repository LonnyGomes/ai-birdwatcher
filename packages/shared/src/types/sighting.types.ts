import type { BirdGender } from "./bird.types.js";

export interface Sighting {
  id: number;
  video_id: number;
  bird_profile_id: number | null;
  frame_number: number;
  timestamp_in_video: number;
  species: string;
  gender: BirdGender | null;
  confidence_score: number;
  frame_path: string;
  ai_analysis: string | null;
  is_matched: boolean;
  match_confidence: number | null;
  detected_at: string;
}

export interface CreateSightingInput {
  video_id: number;
  bird_profile_id?: number;
  frame_number: number;
  timestamp_in_video: number;
  species: string;
  gender?: BirdGender;
  confidence_score: number;
  frame_path: string;
  ai_analysis?: string;
  is_matched?: boolean;
  match_confidence?: number;
}

export interface UpdateSightingInput {
  bird_profile_id?: number;
  is_matched?: boolean;
  match_confidence?: number;
}

export interface SightingWithBird extends Sighting {
  bird_unique_identifier?: string;
  bird_common_name?: string;
}

export interface SightingAIAnalysis {
  common_name?: string;
  features?: string;
  image_quality?: number;
  assessed_quality?: number;
}
