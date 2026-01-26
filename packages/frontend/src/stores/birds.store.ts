import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import birdsService from '@/services/birds.service';

export const useBirdsStore = defineStore('birds', () => {
  const birds = ref<any[]>([]);
  const currentBird = ref<any | null>(null);
  const birdHistory = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Group birds by species (one entry per species)
  const birdsBySpecies = computed(() => {
    const grouped = new Map<string, {
      species: string;
      common_name: string;
      total_visits: number;
      first_seen: string;
      last_seen: string;
      individual_count: number;
      representative_image_path: string | null;
      profiles: any[];
    }>();

    birds.value.forEach((bird) => {
      const existing = grouped.get(bird.species);

      if (existing) {
        // Update aggregated data
        existing.total_visits += bird.total_visits || 0;
        existing.individual_count += 1;
        existing.profiles.push(bird);

        // Use the most recent last_seen
        if (new Date(bird.last_seen) > new Date(existing.last_seen)) {
          existing.last_seen = bird.last_seen;
          existing.representative_image_path = bird.representative_image_path;
        }

        // Use the earliest first_seen
        if (new Date(bird.first_seen) < new Date(existing.first_seen)) {
          existing.first_seen = bird.first_seen;
        }
      } else {
        // Create new species entry
        grouped.set(bird.species, {
          species: bird.species,
          common_name: bird.common_name,
          total_visits: bird.total_visits || 0,
          first_seen: bird.first_seen,
          last_seen: bird.last_seen,
          individual_count: 1,
          representative_image_path: bird.representative_image_path,
          profiles: [bird],
        });
      }
    });

    return Array.from(grouped.values()).sort((a, b) =>
      new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
    );
  });

  async function fetchBirds(params?: any) {
    loading.value = true;
    error.value = null;
    try {
      birds.value = await birdsService.list(params);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch birds';
    } finally {
      loading.value = false;
    }
  }

  async function fetchBirdById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      currentBird.value = await birdsService.getById(id);
      birdHistory.value = await birdsService.getHistory(id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch bird';
    } finally {
      loading.value = false;
    }
  }

  async function updateBird(id: number, data: any) {
    try {
      currentBird.value = await birdsService.update(id, data);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update bird';
      throw err;
    }
  }

  async function deleteBird(id: number) {
    try {
      await birdsService.delete(id);
      birds.value = birds.value.filter(b => b.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete bird';
      throw err;
    }
  }

  return {
    birds,
    birdsBySpecies,
    currentBird,
    birdHistory,
    loading,
    error,
    fetchBirds,
    fetchBirdById,
    updateBird,
    deleteBird,
  };
});
