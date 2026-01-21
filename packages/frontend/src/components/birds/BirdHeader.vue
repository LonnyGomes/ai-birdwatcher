<template>
  <v-card>
    <v-row no-gutters>
      <v-col cols="12" md="4">
        <v-img
          :src="imageSource"
          height="300"
          cover
        >
          <template #placeholder>
            <v-row class="fill-height" align="center" justify="center">
              <v-icon size="64" color="primary">mdi-bird</v-icon>
            </v-row>
          </template>
        </v-img>
      </v-col>
      <v-col cols="12" md="8">
        <v-card-title class="text-h4 d-flex align-center">
          {{ bird.common_name || bird.species }}
          <v-btn
            v-if="wikipediaPageUrl"
            icon
            size="small"
            variant="text"
            color="primary"
            :href="wikipediaPageUrl"
            target="_blank"
            class="ml-2"
          >
            <v-icon>mdi-wikipedia</v-icon>
            <v-tooltip activator="parent" location="top">
              View on Wikipedia
            </v-tooltip>
          </v-btn>
        </v-card-title>
        <v-card-subtitle class="text-h6">
          {{ bird.species }}
        </v-card-subtitle>
        <v-card-text>
          <v-chip color="primary" class="mr-2">
            ID: {{ bird.unique_identifier }}
          </v-chip>
          <v-chip v-if="bird.confidence_score" class="mr-2">
            {{ Math.round(bird.confidence_score) }}% confidence
          </v-chip>
        </v-card-text>
        <v-card-text v-if="bird.notes">
          <strong>Notes:</strong> {{ bird.notes }}
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  bird: any;
  speciesImageUrl?: string | null;
  wikipediaPageUrl?: string | null;
}>();

const imageSource = computed(() => {
  // Prefer Wikipedia image, fall back to representative image
  if (props.speciesImageUrl) {
    return props.speciesImageUrl;
  }
  if (props.bird.representative_image_path) {
    return `/api/files/${props.bird.representative_image_path}`;
  }
  return '/placeholder.png';
});
</script>
