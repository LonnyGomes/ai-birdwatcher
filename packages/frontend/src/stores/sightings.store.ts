import { defineStore } from 'pinia';
import { ref } from 'vue';
import sightingsService from '@/services/sightings.service';

export const useSightingsStore = defineStore('sightings', () => {
  const sightings = ref<any[]>([]);
  const currentSighting = ref<any | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSightings(params?: any) {
    loading.value = true;
    error.value = null;
    try {
      sightings.value = await sightingsService.list(params);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch sightings';
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
      error.value = err.response?.data?.message || 'Failed to fetch sighting';
    } finally {
      loading.value = false;
    }
  }

  return {
    sightings,
    currentSighting,
    loading,
    error,
    fetchSightings,
    fetchSightingById,
  };
});
