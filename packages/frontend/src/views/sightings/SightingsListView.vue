<template>
  <div>
    <!-- Header Section -->
    <div class="page-header mb-8">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h3 font-weight-bold mb-2">Bird Sightings</h1>
          <p class="text-subtitle-1 text-medium-emphasis">
            Browse all detected bird sightings from your videos
          </p>
        </div>
        <v-chip
          v-if="sightingsStore.total"
          color="primary"
          variant="tonal"
          size="large"
        >
          <v-icon start>mdi-binoculars</v-icon>
          {{ sightingsStore.total }} Total
        </v-chip>
      </div>
      <SightingsFilter @filter="handleFilter" />
    </div>

    <!-- Loading State -->
    <v-row v-if="sightingsStore.loading">
      <v-col cols="12">
        <LoadingSpinner />
      </v-col>
    </v-row>

    <!-- Sightings Grid -->
    <v-row v-else-if="sightingsStore.sightings.length" class="mb-6">
      <v-col
        v-for="sighting in sightingsStore.sightings"
        :key="sighting.id"
        cols="12"
        sm="6"
        md="4"
        xl="3"
      >
        <SightingCard
          :sighting="sighting"
          :species-image-url="speciesStore.getSpeciesImage(sighting.species)"
        />
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else>
      <v-col cols="12">
        <EmptyState
          icon="mdi-binoculars"
          title="No sightings found"
          message="Try adjusting your filters or upload more videos"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useSightingsStore } from '@/stores/sightings.store';
import { useSpeciesStore } from '@/stores/species.store';
import SightingsFilter from '@/components/sightings/SightingsFilter.vue';
import SightingCard from '@/components/sightings/SightingCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const sightingsStore = useSightingsStore();
const speciesStore = useSpeciesStore();

// Fetch species images when sightings change
watch(() => sightingsStore.sightings, async (sightings) => {
  if (sightings.length > 0) {
    const speciesNames = sightings.map((s: any) => s.species as string);
    const uniqueSpecies = Array.from(new Set<string>(speciesNames));
    await speciesStore.fetchSpeciesImages(uniqueSpecies);
  }
}, { immediate: true });

onMounted(() => {
  sightingsStore.fetchSightings();
});

function handleFilter(filters: any) {
  sightingsStore.fetchSightings(filters);
}
</script>
