import apiClient from "./api.service";
import type {
  SightingAIAnalysis,
  SightingWithBird,
} from "@shared/types/sighting.types";

interface SightingsListParams {
  video_id?: number;
  bird_profile_id?: number;
  species?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// Frontend-specific type where ai_analysis is parsed from JSON string to object
export interface SightingWithParsedAnalysis
  extends Omit<SightingWithBird, "ai_analysis"> {
  ai_analysis: SightingAIAnalysis | null;
}

interface SightingsListResponse {
  data: SightingWithBird[];
  total: number;
  limit: number;
  offset: number;
}

class SightingsService {
  async list(params?: SightingsListParams): Promise<SightingsListResponse> {
    const response = await apiClient.get<{
      sightings: SightingWithBird[];
      total: number;
      limit: number;
      offset: number;
    }>("/api/sightings", { params });
    return {
      data: response.data.sightings,
      total: response.data.total,
      limit: response.data.limit,
      offset: response.data.offset,
    };
  }

  async getById(id: number): Promise<SightingWithParsedAnalysis> {
    const response = await apiClient.get<{ sighting: SightingWithBird }>(
      `/api/sightings/${id}`,
    );

    const sighting = response.data.sighting as SightingWithParsedAnalysis;

    if (sighting.ai_analysis && typeof sighting.ai_analysis === "string") {
      try {
        sighting.ai_analysis = JSON.parse(
          sighting.ai_analysis,
        ) as SightingAIAnalysis;
      } catch (error) {
        console.error("Error parsing AI analysis JSON:", error);
        sighting.ai_analysis = null;
      }
    } else if (!sighting.ai_analysis) {
      sighting.ai_analysis = null;
    }

    return sighting;
  }

  async getByVideoId(videoId: number): Promise<SightingWithBird[]> {
    const response = await apiClient.get<{ sightings: SightingWithBird[] }>(
      `/api/sightings/video/${videoId}`,
    );
    return response.data.sightings;
  }
}

export default new SightingsService();
