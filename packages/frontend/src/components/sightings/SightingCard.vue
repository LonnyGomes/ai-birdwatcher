<template>
  <v-card
    :to="{ name: 'sighting-detail', params: { id: sighting.id } }"
    class="sighting-card"
    elevation="2"
    hover
  >
    <div class="image-container">
      <v-img
        :src="`/api/files/${sighting.frame_path}`"
        height="240"
        cover
        class="sighting-image"
      >
        <template #placeholder>
          <v-row class="fill-height" align="center" justify="center">
            <v-progress-circular indeterminate color="primary" />
          </v-row>
        </template>

        <!-- Gradient Overlay -->
        <div class="image-overlay"></div>

        <!-- Confidence Badge on Image -->
        <div class="confidence-badge">
          <v-chip
            size="small"
            :color="getConfidenceColor(sighting.confidence_score)"
            variant="flat"
          >
            <v-icon start size="small">mdi-check-circle</v-icon>
            {{ Math.round(sighting.confidence_score) }}%
          </v-chip>
        </div>
      </v-img>
    </div>

    <v-card-title class="text-h6 font-weight-bold pb-2">
      {{ sighting.species }}
    </v-card-title>

    <v-card-subtitle class="d-flex align-center pb-2">
      <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
      {{ formatDate(sighting.detected_at) }}
    </v-card-subtitle>

    <v-card-text class="pt-2">
      <v-chip
        v-if="sighting.bird_common_name"
        size="small"
        color="primary"
        variant="tonal"
        class="mr-2"
      >
        <v-icon start size="small">mdi-bird</v-icon>
        {{ sighting.bird_common_name }}
      </v-chip>

      <v-chip
        v-if="sighting.gender"
        size="small"
        variant="tonal"
      >
        <v-icon start size="small">
          {{ sighting.gender === 'male' ? 'mdi-gender-male' : 'mdi-gender-female' }}
        </v-icon>
        {{ sighting.gender }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { format } from 'date-fns';

defineProps<{
  sighting: any;
}>();

function formatDate(date: string) {
  return format(new Date(date), 'PPp');
}

function getConfidenceColor(score: number): string {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}
</script>

<style scoped>
.sighting-card {
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sighting-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2) !important;
}

.image-container {
  position: relative;
  overflow: hidden;
}

.sighting-image {
  transition: transform 0.3s ease;
}

.sighting-card:hover .sighting-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
}

.confidence-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}
</style>
