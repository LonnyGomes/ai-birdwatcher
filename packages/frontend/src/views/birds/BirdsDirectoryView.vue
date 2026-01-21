<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Birds Directory</h1>
      </v-col>
    </v-row>

    <v-row v-if="birdsStore.loading">
      <v-col cols="12">
        <LoadingSpinner />
      </v-col>
    </v-row>

    <BirdGrid
      v-else-if="birdsStore.birds.length"
      :birds="birdsStore.birds"
      :species-images="speciesStore.speciesImages"
      :species-urls="speciesStore.speciesPageUrls"
    />

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
import BirdGrid from '@/components/birds/BirdGrid.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const birdsStore = useBirdsStore();
const speciesStore = useSpeciesStore();

// Fetch species data when birds are loaded
watch(() => birdsStore.birds, async (birds) => {
  if (birds.length > 0) {
    const speciesNames = birds.map((b: any) => b.species as string);
    const uniqueSpecies = Array.from(new Set<string>(speciesNames));
    await speciesStore.fetchSpeciesData(uniqueSpecies);
  }
}, { immediate: true });

onMounted(() => {
  birdsStore.fetchBirds();
});
</script>
