<template>
  <v-card
    :to="{ name: 'bird-profile', params: { id: bird.id } }"
    class="bird-card glass-card"
  >
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
            {{ bird.total_visits }}
          </div>
        </div>
      </v-img>
    </div>

    <div class="card-content">
      <h3 class="bird-name">{{ bird.common_name || bird.species }}</h3>
      <p class="bird-species">{{ bird.species }}</p>

      <div class="bird-tags">
        <span class="tag tag--secondary">
          <v-icon size="12" class="mr-1">mdi-identifier</v-icon>
          {{ bird.unique_identifier }}
        </span>

        <span v-if="bird.gender" class="tag" :class="bird.gender === 'male' ? 'tag--male' : 'tag--female'">
          <v-icon size="12" class="mr-1">
            {{ bird.gender === 'male' ? 'mdi-gender-male' : 'mdi-gender-female' }}
          </v-icon>
          {{ bird.gender }}
        </span>
      </div>
    </div>
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
  if (props.speciesImageUrl) {
    return props.speciesImageUrl;
  }
  if (props.bird.representative_image_path) {
    return `/api/files/${props.bird.representative_image_path}`;
  }
  return '/placeholder.png';
});
</script>

<style scoped>
.bird-card {
  border-radius: 20px !important;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.bird-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 20px 40px rgba(27, 67, 50, 0.18),
    0 0 0 1px rgba(64, 145, 108, 0.1) !important;
}

.v-theme--dark .bird-card:hover {
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

.bird-card:hover .bird-image {
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

.tag--secondary {
  background: rgba(92, 64, 51, 0.1);
  color: #5C4033;
}

.v-theme--dark .tag--secondary {
  background: rgba(155, 123, 107, 0.15);
  color: #B89B8B;
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
