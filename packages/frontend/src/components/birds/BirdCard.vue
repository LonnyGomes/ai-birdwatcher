<template>
  <v-card
    :to="{ name: 'bird-profile', params: { id: bird.id } }"
    class="bird-card"
    elevation="2"
    hover
  >
    <div class="image-container">
      <v-img
        :src="bird.representative_image_path ? `/api/files/${bird.representative_image_path}` : '/placeholder.png'"
        height="240"
        cover
        class="bird-image"
      >
        <template #placeholder>
          <v-row class="fill-height bird-placeholder" align="center" justify="center">
            <div class="text-center">
              <v-icon size="64" color="primary">mdi-bird</v-icon>
              <div class="text-subtitle-2 mt-2">No Image</div>
            </div>
          </v-row>
        </template>

        <!-- Gradient Overlay -->
        <div class="image-overlay"></div>

        <!-- Visit Count Badge -->
        <div class="visits-badge">
          <v-chip
            size="small"
            color="primary"
            variant="flat"
          >
            <v-icon start size="small">mdi-eye</v-icon>
            {{ bird.total_visits }} visits
          </v-chip>
        </div>
      </v-img>
    </div>

    <v-card-title class="text-h6 font-weight-bold pb-1">
      {{ bird.common_name || bird.species }}
    </v-card-title>

    <v-card-subtitle class="pb-2">
      <span class="text-caption font-italic">{{ bird.species }}</span>
    </v-card-subtitle>

    <v-card-text class="pt-2">
      <v-chip
        size="small"
        variant="tonal"
        color="secondary"
      >
        <v-icon start size="small">mdi-identifier</v-icon>
        {{ bird.unique_identifier }}
      </v-chip>

      <v-chip
        v-if="bird.gender"
        size="small"
        variant="tonal"
        class="ml-2"
      >
        <v-icon start size="small">
          {{ bird.gender === 'male' ? 'mdi-gender-male' : 'mdi-gender-female' }}
        </v-icon>
        {{ bird.gender }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  bird: any;
}>();
</script>

<style scoped>
.bird-card {
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.3s ease;
}

.bird-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2) !important;
}

.image-container {
  position: relative;
  overflow: hidden;
}

.bird-image {
  transition: transform 0.3s ease;
}

.bird-card:hover .bird-image {
  transform: scale(1.05);
}

.bird-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.1;
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

.visits-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}
</style>
