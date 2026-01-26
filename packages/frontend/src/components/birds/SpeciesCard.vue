<template>
  <v-card class="species-card glass-card">
    <div class="image-container">
      <v-img
        :src="imageSource"
        height="220"
        cover
        class="bird-image"
      >
        <template #placeholder>
          <div class="image-placeholder">
            <v-icon size="48" class="placeholder-icon">mdi-bird</v-icon>
          </div>
        </template>

        <!-- Gradient Overlay -->
        <div class="image-overlay"></div>

        <!-- Wikipedia Link Badge -->
        <div v-if="wikipediaPageUrl" class="wikipedia-badge">
          <v-btn
            icon
            size="small"
            variant="flat"
            :href="wikipediaPageUrl"
            target="_blank"
            class="wiki-btn"
            @click.stop
          >
            <v-icon size="18">mdi-wikipedia</v-icon>
            <v-tooltip activator="parent" location="left">
              View on Wikipedia
            </v-tooltip>
          </v-btn>
        </div>

        <!-- Visit Count Badge -->
        <div class="visits-badge">
          <div class="visits-chip">
            <v-icon size="14" class="mr-1">mdi-eye</v-icon>
            {{ species.total_visits }}
          </div>
        </div>
      </v-img>
    </div>

    <div class="card-content">
      <h3 class="bird-name">{{ species.common_name || species.species }}</h3>
      <p class="bird-species">{{ species.species }}</p>

      <div class="bird-tags">
        <span class="tag tag--primary">
          <v-icon size="12" class="mr-1">mdi-calendar</v-icon>
          {{ formatDate(species.first_seen) }}
        </span>

        <span class="tag tag--secondary">
          <v-icon size="12" class="mr-1">mdi-account-multiple</v-icon>
          {{ species.individual_count }} {{ species.individual_count === 1 ? 'bird' : 'birds' }}
        </span>
      </div>

      <!-- Expandable section showing individual birds -->
      <v-expand-transition>
        <div v-if="expanded" class="individuals-list">
          <v-divider class="my-3" />
          <div class="individuals-header">Individual Birds:</div>
          <div
            v-for="profile in species.profiles"
            :key="profile.id"
            class="individual-item"
          >
            <v-btn
              :to="{ name: 'bird-profile', params: { id: profile.id } }"
              variant="text"
              size="small"
              class="individual-btn"
            >
              <v-icon size="16" class="mr-1">mdi-bird</v-icon>
              {{ profile.unique_identifier }}
              <span class="visit-count">({{ profile.total_visits }} visits)</span>
            </v-btn>
          </div>
        </div>
      </v-expand-transition>

      <!-- Expand/Collapse Button -->
      <v-btn
        v-if="species.individual_count > 1"
        variant="text"
        size="small"
        class="expand-btn"
        @click.prevent="expanded = !expanded"
      >
        <v-icon size="18" class="mr-1">
          {{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
        </v-icon>
        {{ expanded ? 'Hide' : 'View' }} individuals
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  species: any;
  speciesImageUrl?: string | null;
  wikipediaPageUrl?: string | null;
}>();

const expanded = ref(false);

const imageSource = computed(() => {
  if (props.speciesImageUrl) {
    return props.speciesImageUrl;
  }
  if (props.species.representative_image_path) {
    return `/api/files/${props.species.representative_image_path}`;
  }
  return '/placeholder.png';
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<style scoped>
.species-card {
  border-radius: 20px !important;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.species-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 20px 40px rgba(27, 67, 50, 0.18),
    0 0 0 1px rgba(64, 145, 108, 0.1) !important;
}

.v-theme--dark .species-card:hover {
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(116, 198, 157, 0.15) !important;
}

.image-container {
  position: relative;
  overflow: hidden;
}

.bird-image {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.species-card:hover .bird-image {
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

.placeholder-icon {
  color: rgba(27, 67, 50, 0.3);
}

.v-theme--dark .placeholder-icon {
  color: rgba(116, 198, 157, 0.4);
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
  transition: opacity 0.3s ease;
}

.visits-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.visits-chip {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: rgba(27, 67, 50, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.wikipedia-badge {
  position: absolute;
  top: 12px;
  left: 12px;
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

.card-content {
  padding: 16px 18px 18px;
}

.bird-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 4px;
  line-height: 1.3;
  color: rgb(var(--v-theme-on-surface));
}

.bird-species {
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  font-style: italic;
  opacity: 0.6;
  margin-bottom: 14px;
}

.bird-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
}

.tag--primary {
  background: rgba(27, 67, 50, 0.1);
  color: #1B4332;
}

.v-theme--dark .tag--primary {
  background: rgba(64, 145, 108, 0.15);
  color: #74C69D;
}

.tag--secondary {
  background: rgba(92, 64, 51, 0.1);
  color: #5C4033;
}

.v-theme--dark .tag--secondary {
  background: rgba(155, 123, 107, 0.15);
  color: #B89B8B;
}

.individuals-list {
  margin-top: 8px;
}

.individuals-header {
  font-family: 'Poppins', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.7;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.individual-item {
  margin-bottom: 4px;
}

.individual-btn {
  width: 100%;
  justify-content: flex-start !important;
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  text-transform: none;
  padding: 4px 8px;
}

.visit-count {
  margin-left: auto;
  opacity: 0.6;
  font-size: 0.75rem;
}

.expand-btn {
  margin-top: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.75rem;
  text-transform: none;
}
</style>
