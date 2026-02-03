import { defineStore } from "pinia";
import { ref } from "vue";
import sightingsService, {
  type SightingWithParsedAnalysis,
} from "@/services/sightings.service";
import type { SightingWithBird } from "@shared/types/sighting.types";

export const useSightingsStore = defineStore("sightings", () => {
  const sightings = ref<SightingWithBird[]>([]);
  const currentSighting = ref<SightingWithParsedAnalysis | null>(null);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSightings(params?: any) {
    loading.value = true;
    error.value = null;
    try {
      const result = await sightingsService.list(params);
      sightings.value = result.data;
      total.value = result.total;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch sightings";
    } finally {
      loading.value = false;
    }
  }

  async function fetchSightingById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      currentSighting.value = await sightingsService.getById(id);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch sighting";
    } finally {
      loading.value = false;
    }
  }

  return {
    sightings,
    currentSighting,
    total,
    loading,
    error,
    fetchSightings,
    fetchSightingById,
  };
});
