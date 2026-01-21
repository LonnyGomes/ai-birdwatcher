<template>
  <v-row>
    <v-col
      v-for="bird in birds"
      :key="bird.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <BirdCard
        :bird="bird"
        :species-image-url="getSpeciesImage(bird.species)"
        :wikipedia-page-url="getWikipediaUrl(bird.species)"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import BirdCard from './BirdCard.vue';

const props = defineProps<{
  birds: any[];
  speciesImages?: Record<string, string | null>;
  speciesUrls?: Record<string, string | null>;
}>();

function getSpeciesImage(species: string): string | null {
  return props.speciesImages?.[species] ?? null;
}

function getWikipediaUrl(species: string): string | null {
  return props.speciesUrls?.[species] ?? null;
}
</script>
