<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Birds Directory</h1>
        <p class="text-subtitle-1 mb-6 text-medium-emphasis">
          Showing {{ birdsStore.birdsBySpecies.length }} species
        </p>
      </v-col>
    </v-row>

    <v-row v-if="birdsStore.loading">
      <v-col cols="12">
        <LoadingSpinner />
      </v-col>
    </v-row>

    <!-- Species Grid -->
    <div v-else-if="birdsStore.birdsBySpecies.length" class="species-grid">
      <v-row>
        <v-col
          v-for="(speciesData, index) in birdsStore.birdsBySpecies"
          :key="speciesData.species"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          class="species-grid-item"
          :style="{ '--stagger-delay': `${index * 50}ms` }"
        >
          <SpeciesCard
            :species="speciesData"
            :species-image-url="getSpeciesImage(speciesData.species)"
            :wikipedia-page-url="getWikipediaUrl(speciesData.species)"
            class="stagger-item"
          />
        </v-col>
      </v-row>
    </div>

    <v-row v-else>
      <v-col cols="12">
        <EmptyState message="No birds tracked yet" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useBirdsStore } from '@/stores/birds.store';
import { useSpeciesStore } from '@/stores/species.store';
import SpeciesCard from '@/components/birds/SpeciesCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const birdsStore = useBirdsStore();
const speciesStore = useSpeciesStore();

// Fetch species data when birds are loaded
watch(() => birdsStore.birdsBySpecies, async (speciesData) => {
  if (speciesData.length > 0) {
    const speciesNames = speciesData.map((s: any) => s.species as string);
    await speciesStore.fetchSpeciesData(speciesNames);
  }
}, { immediate: true });

function getSpeciesImage(species: string): string | null {
  return speciesStore.speciesImages[species] ?? null;
}

function getWikipediaUrl(species: string): string | null {
  return speciesStore.speciesPageUrls[species] ?? null;
}

onMounted(() => {
  birdsStore.fetchBirds();
});
</script>

<style scoped>
.species-grid {
  padding: 4px;
}

.species-grid-item {
  animation: stagger-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--stagger-delay, 0ms);
  opacity: 0;
}

@keyframes stagger-fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .species-grid-item {
    animation: none;
    opacity: 1;
  }
}
</style>
