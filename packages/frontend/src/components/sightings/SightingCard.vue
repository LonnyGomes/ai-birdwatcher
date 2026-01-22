<template>
  <v-card
    :to="{ name: 'sighting-detail', params: { id: sighting.id } }"
    class="sighting-card glass-card"
  >
    <div class="image-container">
      <v-img
        :src="`/api/files/${sighting.frame_path}`"
        height="220"
        cover
        class="sighting-image"
      >
        <template #placeholder>
          <div class="image-placeholder">
            <v-progress-circular indeterminate color="primary" size="32" width="3" />
          </div>
        </template>

        <!-- Gradient Overlay -->
        <div class="image-overlay"></div>

        <!-- Wikipedia Species Reference Image -->
        <div v-if="speciesImageUrl" class="species-reference-badge">
          <v-avatar size="44" class="species-avatar">
            <v-img :src="speciesImageUrl" cover>
              <template #placeholder>
                <v-icon color="grey-lighten-1" size="20">mdi-bird</v-icon>
              </template>
            </v-img>
          </v-avatar>
          <v-tooltip activator="parent" location="right">
            Wikipedia reference
          </v-tooltip>
        </div>

        <!-- Confidence Badge on Image -->
        <div class="confidence-badge">
          <div class="confidence-chip" :class="`confidence-chip--${getConfidenceLevel(sighting.confidence_score)}`">
            <v-icon size="12" class="mr-1">mdi-check-circle</v-icon>
            {{ Math.round(sighting.confidence_score) }}%
          </div>
        </div>
      </v-img>
    </div>

    <div class="card-content">
      <h3 class="sighting-species">{{ sighting.species }}</h3>

      <div class="sighting-time">
        <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
        {{ formatDate(sighting.detected_at) }}
      </div>

      <div class="sighting-tags">
        <span v-if="sighting.bird_common_name" class="tag tag--primary">
          <v-icon size="12" class="mr-1">mdi-bird</v-icon>
          {{ sighting.bird_common_name }}
        </span>

        <span v-if="sighting.gender" class="tag" :class="sighting.gender === 'male' ? 'tag--male' : 'tag--female'">
          <v-icon size="12" class="mr-1">
            {{ sighting.gender === 'male' ? 'mdi-gender-male' : 'mdi-gender-female' }}
          </v-icon>
          {{ sighting.gender }}
        </span>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { format } from 'date-fns';

defineProps<{
  sighting: any;
  speciesImageUrl?: string | null;
}>();

function formatDate(date: string) {
  return format(new Date(date), 'PPp');
}

function getConfidenceLevel(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}
</script>

<style scoped>
.sighting-card {
  border-radius: 20px !important;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.sighting-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 20px 40px rgba(27, 67, 50, 0.18),
    0 0 0 1px rgba(64, 145, 108, 0.1) !important;
}

.v-theme--dark .sighting-card:hover {
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(116, 198, 157, 0.15) !important;
}

.image-container {
  position: relative;
  overflow: hidden;
}

.sighting-image {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.sighting-card:hover .sighting-image {
  transform: scale(1.08);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.08) 0%, rgba(64, 145, 108, 0.08) 100%);
}

.v-theme--dark .image-placeholder {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.12) 0%, rgba(116, 198, 157, 0.12) 100%);
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
    transparent 40%,
    rgba(27, 67, 50, 0.7) 100%
  );
  pointer-events: none;
}

.confidence-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.confidence-chip {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  backdrop-filter: blur(8px);
  border-radius: 20px;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.confidence-chip--high {
  background: rgba(45, 106, 79, 0.9);
}

.confidence-chip--medium {
  background: rgba(232, 93, 4, 0.9);
}

.confidence-chip--low {
  background: rgba(155, 34, 38, 0.9);
}

.species-reference-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
}

.species-avatar {
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.species-avatar:hover {
  transform: scale(1.15) rotate(-5deg);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
}

.card-content {
  padding: 16px 18px 18px;
}

.sighting-species {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 6px;
  line-height: 1.3;
  color: rgb(var(--v-theme-on-surface));
}

.sighting-time {
  display: flex;
  align-items: center;
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  opacity: 0.6;
  margin-bottom: 14px;
}

.sighting-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: capitalize;
}

.tag--primary {
  background: rgba(27, 67, 50, 0.1);
  color: #1B4332;
}

.v-theme--dark .tag--primary {
  background: rgba(64, 145, 108, 0.15);
  color: #74C69D;
}

.tag--male {
  background: rgba(61, 90, 128, 0.12);
  color: #3D5A80;
}

.v-theme--dark .tag--male {
  background: rgba(78, 168, 222, 0.15);
  color: #4EA8DE;
}

.tag--female {
  background: rgba(232, 93, 4, 0.1);
  color: #E85D04;
}

.v-theme--dark .tag--female {
  background: rgba(244, 140, 6, 0.15);
  color: #F48C06;
}
</style>
