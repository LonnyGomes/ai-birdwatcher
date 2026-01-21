import apiClient from "./api.service";

export interface SpeciesInfo {
  id: number;
  species: string;
  common_name: string | null;
  wikipedia_image_url: string | null;
  wikipedia_page_url: string | null;
  description: string | null;
  fetched_at: string | null;
}

export interface SpeciesWithCount {
  species: string;
  sightings_count: number;
  wikipedia_image_url: string | null;
  wikipedia_page_url: string | null;
  description: string | null;
}

class SpeciesService {
  private imageCache: Map<string, string | null> = new Map();

  async getAllSpecies(): Promise<SpeciesWithCount[]> {
    const response = await apiClient.get<{ species: SpeciesWithCount[]; total: number }>(
      "/api/species"
    );

    // Cache the images
    for (const sp of response.data.species) {
      this.imageCache.set(sp.species, sp.wikipedia_image_url);
    }

    return response.data.species;
  }

  async getSpeciesInfo(species: string): Promise<SpeciesInfo | null> {
    try {
      const response = await apiClient.get<SpeciesInfo>(
        `/api/species/${encodeURIComponent(species)}`
      );

      // Cache the image
      this.imageCache.set(species, response.data.wikipedia_image_url);

      return response.data;
    } catch (error) {
      console.error(`Error fetching species info for ${species}:`, error);
      return null;
    }
  }

  async getSpeciesImages(speciesList: string[]): Promise<Record<string, string | null>> {
    // Return cached values for species we already know about
    const uncached = speciesList.filter(s => !this.imageCache.has(s));

    if (uncached.length === 0) {
      const result: Record<string, string | null> = {};
      for (const species of speciesList) {
        result[species] = this.imageCache.get(species) ?? null;
      }
      return result;
    }

    try {
      const response = await apiClient.post<{ images: Record<string, string | null> }>(
        "/api/species/images",
        { species: uncached }
      );

      // Cache the results
      for (const [species, url] of Object.entries(response.data.images)) {
        this.imageCache.set(species, url);
      }

      // Return all requested species
      const result: Record<string, string | null> = {};
      for (const species of speciesList) {
        result[species] = this.imageCache.get(species) ?? null;
      }
      return result;
    } catch (error) {
      console.error("Error fetching species images:", error);
      return {};
    }
  }

  // Get cached image URL if available
  getCachedImage(species: string): string | null | undefined {
    return this.imageCache.get(species);
  }

  // Check if species image is cached
  hasCachedImage(species: string): boolean {
    return this.imageCache.has(species);
  }
}

export default new SpeciesService();
