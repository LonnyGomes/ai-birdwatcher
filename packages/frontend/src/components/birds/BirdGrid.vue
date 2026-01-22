<template>
  <div class="bird-grid">
    <v-row>
      <v-col
        v-for="(bird, index) in birds"
        :key="bird.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="bird-grid-item"
        :style="{ '--stagger-delay': `${index * 50}ms` }"
      >
        <BirdCard
          :bird="bird"
          :species-image-url="getSpeciesImage(bird.species)"
          :wikipedia-page-url="getWikipediaUrl(bird.species)"
          class="stagger-item"
        />
      </v-col>
    </v-row>
  </div>
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

<style scoped>
.bird-grid {
  padding: 4px;
}

.bird-grid-item {
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
  .bird-grid-item {
    animation: none;
    opacity: 1;
  }
}
</style>
