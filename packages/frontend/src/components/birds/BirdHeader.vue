<template>
  <v-card class="bird-header-card glass-card-prominent">
    <div class="header-content">
      <!-- Image Section -->
      <div class="image-section">
        <div class="image-frame">
          <v-img
            :src="imageSource"
            height="320"
            cover
            class="bird-portrait"
          >
            <template #placeholder>
              <div class="image-placeholder">
                <v-icon size="64" class="placeholder-icon">mdi-bird</v-icon>
              </div>
            </template>

            <!-- Gradient overlay -->
            <div class="image-gradient"></div>

            <!-- Wikipedia badge -->
            <div v-if="wikipediaPageUrl" class="wiki-badge">
              <v-btn
                icon
                size="small"
                variant="flat"
                :href="wikipediaPageUrl"
                target="_blank"
                class="wiki-btn"
                @click.stop
              >
                <v-icon size="20">mdi-wikipedia</v-icon>
                <v-tooltip activator="parent" location="left">
                  View on Wikipedia
                </v-tooltip>
              </v-btn>
            </div>
          </v-img>
        </div>
      </div>

      <!-- Info Section -->
      <div class="info-section">
        <div class="info-content">
          <!-- Title area -->
          <div class="title-area">
            <h1 class="bird-name">{{ bird.common_name || bird.species }}</h1>
            <p class="bird-species">{{ bird.species }}</p>
          </div>

          <!-- Stats chips -->
          <div class="stats-row">
            <div class="stat-chip stat-chip--primary">
              <v-icon size="16" class="mr-1">mdi-identifier</v-icon>
              <span class="stat-label">ID</span>
              <span class="stat-value">{{ bird.unique_identifier }}</span>
            </div>

            <div v-if="bird.confidence_score" class="stat-chip stat-chip--confidence" :class="`stat-chip--${getConfidenceLevel(bird.confidence_score)}`">
              <v-icon size="16" class="mr-1">mdi-check-circle</v-icon>
              <span class="stat-label">Confidence</span>
              <span class="stat-value">{{ Math.round(bird.confidence_score) }}%</span>
            </div>

            <div v-if="bird.gender" class="stat-chip" :class="bird.gender === 'male' ? 'stat-chip--male' : 'stat-chip--female'">
              <v-icon size="16" class="mr-1">
                {{ bird.gender === 'male' ? 'mdi-gender-male' : 'mdi-gender-female' }}
              </v-icon>
              <span class="stat-value capitalize">{{ bird.gender }}</span>
            </div>

            <div v-if="bird.total_visits" class="stat-chip stat-chip--visits">
              <v-icon size="16" class="mr-1">mdi-eye</v-icon>
              <span class="stat-label">Visits</span>
              <span class="stat-value">{{ bird.total_visits }}</span>
            </div>
          </div>

          <!-- Notes section -->
          <div v-if="bird.notes" class="notes-section">
            <div class="notes-header">
              <v-icon size="16" class="mr-2">mdi-note-text</v-icon>
              <span>Notes</span>
            </div>
            <p class="notes-content">{{ bird.notes }}</p>
          </div>

          <!-- First/Last seen -->
          <div v-if="bird.first_seen_at || bird.last_seen_at" class="timeline-section">
            <div v-if="bird.first_seen_at" class="timeline-item">
              <div class="timeline-icon timeline-icon--first">
                <v-icon size="14">mdi-calendar-start</v-icon>
              </div>
              <div class="timeline-info">
                <span class="timeline-label">First seen</span>
                <span class="timeline-value">{{ formatDate(bird.first_seen_at) }}</span>
              </div>
            </div>
            <div v-if="bird.last_seen_at" class="timeline-item">
              <div class="timeline-icon timeline-icon--last">
                <v-icon size="14">mdi-calendar-end</v-icon>
              </div>
              <div class="timeline-info">
                <span class="timeline-label">Last seen</span>
                <span class="timeline-value">{{ formatDate(bird.last_seen_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';

const props = defineProps<{
  bird: any;
  speciesImageUrl?: string | null;
  wikipediaPageUrl?: string | null;
}>();

const imageSource = computed(() => {
  if (props.speciesImageUrl) {
    return props.speciesImageUrl;
  }
  if (props.bird.representative_image_path) {
    return `/api/files/${props.bird.representative_image_path}`;
  }
  return '/placeholder.png';
});

function formatDate(date: string) {
  return format(new Date(date), 'PPP');
}

function getConfidenceLevel(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}
</script>

<style scoped>
.bird-header-card {
  border-radius: 24px !important;
  overflow: hidden;
}

.header-content {
  display: flex;
  flex-direction: column;
}

@media (min-width: 960px) {
  .header-content {
    flex-direction: row;
  }
}

/* Image Section */
.image-section {
  flex: 0 0 auto;
  width: 100%;
}

@media (min-width: 960px) {
  .image-section {
    width: 340px;
  }
}

.image-frame {
  position: relative;
  overflow: hidden;
}

.bird-portrait {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.bird-header-card:hover .bird-portrait {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(64, 145, 108, 0.1) 100%);
}

.v-theme--dark .image-placeholder {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.15) 0%, rgba(116, 198, 157, 0.15) 100%);
}

.placeholder-icon {
  color: rgba(27, 67, 50, 0.4);
}

.v-theme--dark .placeholder-icon {
  color: rgba(116, 198, 157, 0.5);
}

.image-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 50%,
    rgba(27, 67, 50, 0.6) 100%
  );
  pointer-events: none;
}

.wiki-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
}

.wiki-btn {
  background: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(8px);
  color: white !important;
  transition: all 0.3s ease;
}

.wiki-btn:hover {
  background: rgba(27, 67, 50, 0.9) !important;
  transform: scale(1.1);
}

/* Info Section */
.info-section {
  flex: 1;
  min-width: 0;
}

.info-content {
  padding: 28px 32px;
}

@media (max-width: 959px) {
  .info-content {
    padding: 24px 20px;
  }
}

.title-area {
  margin-bottom: 24px;
}

.bird-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 2rem;
  line-height: 1.2;
  margin-bottom: 6px;
  background: linear-gradient(135deg, #1B4332 0%, #40916C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.v-theme--dark .bird-name {
  background: linear-gradient(135deg, #74C69D 0%, #52B788 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bird-species {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-style: italic;
  opacity: 0.6;
}

/* Stats Row */
.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  background: rgba(27, 67, 50, 0.08);
  transition: all 0.3s ease;
}

.v-theme--dark .stat-chip {
  background: rgba(116, 198, 157, 0.1);
}

.stat-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27, 67, 50, 0.15);
}

.v-theme--dark .stat-chip:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-weight: 500;
  opacity: 0.7;
  margin-right: 6px;
}

.stat-value {
  font-weight: 700;
}

.stat-chip--primary {
  background: rgba(27, 67, 50, 0.1);
  color: #1B4332;
}

.v-theme--dark .stat-chip--primary {
  background: rgba(64, 145, 108, 0.15);
  color: #74C69D;
}

.stat-chip--high {
  background: rgba(45, 106, 79, 0.12);
  color: #2D6A4F;
}

.v-theme--dark .stat-chip--high {
  background: rgba(82, 183, 136, 0.15);
  color: #52B788;
}

.stat-chip--medium {
  background: rgba(232, 93, 4, 0.1);
  color: #E85D04;
}

.v-theme--dark .stat-chip--medium {
  background: rgba(244, 140, 6, 0.15);
  color: #F48C06;
}

.stat-chip--low {
  background: rgba(155, 34, 38, 0.1);
  color: #9B2226;
}

.v-theme--dark .stat-chip--low {
  background: rgba(230, 57, 70, 0.15);
  color: #E63946;
}

.stat-chip--male {
  background: rgba(61, 90, 128, 0.1);
  color: #3D5A80;
}

.v-theme--dark .stat-chip--male {
  background: rgba(78, 168, 222, 0.15);
  color: #4EA8DE;
}

.stat-chip--female {
  background: rgba(232, 93, 4, 0.1);
  color: #E85D04;
}

.v-theme--dark .stat-chip--female {
  background: rgba(244, 140, 6, 0.15);
  color: #F48C06;
}

.stat-chip--visits {
  background: rgba(92, 64, 51, 0.1);
  color: #5C4033;
}

.v-theme--dark .stat-chip--visits {
  background: rgba(155, 123, 107, 0.15);
  color: #B89B8B;
}

.capitalize {
  text-transform: capitalize;
}

/* Notes Section */
.notes-section {
  padding: 16px 20px;
  background: rgba(27, 67, 50, 0.04);
  border-radius: 12px;
  margin-bottom: 24px;
}

.v-theme--dark .notes-section {
  background: rgba(116, 198, 157, 0.06);
}

.notes-header {
  display: flex;
  align-items: center;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  margin-bottom: 8px;
}

.notes-content {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

/* Timeline Section */
.timeline-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-icon--first {
  background: rgba(45, 106, 79, 0.12);
  color: #2D6A4F;
}

.v-theme--dark .timeline-icon--first {
  background: rgba(82, 183, 136, 0.15);
  color: #52B788;
}

.timeline-icon--last {
  background: rgba(232, 93, 4, 0.1);
  color: #E85D04;
}

.v-theme--dark .timeline-icon--last {
  background: rgba(244, 140, 6, 0.15);
  color: #F48C06;
}

.timeline-info {
  display: flex;
  flex-direction: column;
}

.timeline-label {
  font-family: 'Poppins', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
}

.timeline-value {
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
