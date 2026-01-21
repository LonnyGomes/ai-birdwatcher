import { defineStore } from "pinia";
import { ref } from "vue";
import speciesService, { type SpeciesWithCount } from "@/services/species.service";

export const useSpeciesStore = defineStore("species", () => {
  const speciesList = ref<SpeciesWithCount[]>([]);
  const speciesImages = ref<Record<string, string | null>>({});
  const speciesPageUrls = ref<Record<string, string | null>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Get image URL for a species
  function getSpeciesImage(species: string): string | null {
    return speciesImages.value[species] ?? null;
  }

  // Get Wikipedia page URL for a species
  function getSpeciesPageUrl(species: string): string | null {
    return speciesPageUrls.value[species] ?? null;
  }

  // Check if we have data for a species
  function hasSpeciesData(species: string): boolean {
    return species in speciesImages.value;
  }

  // Fetch all species with their Wikipedia images
  async function fetchAllSpecies() {
    loading.value = true;
    error.value = null;
    try {
      speciesList.value = await speciesService.getAllSpecies();

      // Update caches
      for (const sp of speciesList.value) {
        speciesImages.value[sp.species] = sp.wikipedia_image_url;
        speciesPageUrls.value[sp.species] = sp.wikipedia_page_url;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch species";
    } finally {
      loading.value = false;
    }
  }

  // Fetch data for specific species (bulk)
  async function fetchSpeciesData(speciesNames: string[]) {
    // Filter out species we already have
    const needed = speciesNames.filter(s => !hasSpeciesData(s));
    if (needed.length === 0) return;

    try {
      // Fetch full species info for each
      await Promise.all(needed.map(async (species) => {
        const info = await speciesService.getSpeciesInfo(species);
        if (info) {
          speciesImages.value[species] = info.wikipedia_image_url;
          speciesPageUrls.value[species] = info.wikipedia_page_url;
        }
      }));
    } catch (err: any) {
      console.error("Failed to fetch species data:", err);
    }
  }

  // Fetch data for a single species
  async function fetchSpeciesInfo(species: string) {
    if (hasSpeciesData(species)) return;

    try {
      const info = await speciesService.getSpeciesInfo(species);
      if (info) {
        speciesImages.value[species] = info.wikipedia_image_url;
        speciesPageUrls.value[species] = info.wikipedia_page_url;
      }
    } catch (err: any) {
      console.error(`Failed to fetch species info for ${species}:`, err);
    }
  }

  // Legacy alias for backward compatibility
  async function fetchSpeciesImages(speciesNames: string[]) {
    return fetchSpeciesData(speciesNames);
  }

  // Legacy alias for backward compatibility
  async function fetchSpeciesImage(species: string) {
    return fetchSpeciesInfo(species);
  }

  return {
    speciesList,
    speciesImages,
    speciesPageUrls,
    loading,
    error,
    getSpeciesImage,
    getSpeciesPageUrl,
    hasSpeciesData,
    fetchAllSpecies,
    fetchSpeciesData,
    fetchSpeciesInfo,
    fetchSpeciesImages,
    fetchSpeciesImage,
  };
});
