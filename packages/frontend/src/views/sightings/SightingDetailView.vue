<template>
  <div v-if="sightingsStore.currentSighting">
    <v-row>
      <v-col cols="12">
        <v-btn :to="{ name: 'sightings' }" text>
          <v-icon>mdi-arrow-left</v-icon> Back to Sightings
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card>
          <v-tabs v-model="activeTab">
            <v-tab value="frame">Frame</v-tab>
            <v-tab value="video" :disabled="!video">Video</v-tab>
          </v-tabs>

          <v-tabs-window v-model="activeTab">
            <v-tabs-window-item value="frame">
              <div ref="frameContainer" class="media-container">
                <v-img
                  :src="`/api/files/${sightingsStore.currentSighting.frame_path}`"
                  contain
                  max-height="600"
                  @load="onFrameLoaded"
                />
              </div>
            </v-tabs-window-item>

            <v-tabs-window-item value="video">
              <div
                class="media-container video-container"
                :style="{ minHeight: containerHeight ? `${containerHeight}px` : undefined }"
              >
                <video
                  v-if="video"
                  ref="videoElement"
                  :src="`/api/videos/stream/${video.filepath}`"
                  controls
                  class="video-player"
                  @loadedmetadata="onVideoLoaded"
                >
                  Your browser does not support the video tag.
                </video>
                <div v-else class="video-loading">
                  <v-progress-circular indeterminate color="primary" />
                  <p class="mt-4 text-medium-emphasis">Loading video...</p>
                </div>
                <div
                  v-if="video && videoDuration > 0"
                  class="timestamp-marker"
                  :style="{ left: `${markerPosition}%` }"
                  :title="`Frame extracted at ${formatTimestamp(sightingsStore.currentSighting.timestamp_in_video)}`"
                >
                  <v-icon size="16" color="primary">mdi-map-marker</v-icon>
                </div>
              </div>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>

        <v-alert
          v-if="video && activeTab === 'video'"
          type="success"
          variant="tonal"
          class="mt-2"
          density="compact"
        >
          <v-icon class="mr-1">mdi-map-marker</v-icon>
          Frame was extracted at
          <strong>{{ formatTimestamp(sightingsStore.currentSighting.timestamp_in_video) }}</strong>
          into the video
        </v-alert>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title
            >{{ sightingsStore.currentSighting.species }} ({{
              sightingsStore.currentSighting.ai_analysis?.common_name || "Unknown"
            }})</v-card-title
          >
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Detected At</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(sightingsStore.currentSighting.detected_at) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Confidence</v-list-item-title>
                <v-list-item-subtitle>
                  {{ Math.round(sightingsStore.currentSighting.confidence_score) }}%
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item
                v-if="sightingsStore.currentSighting.bird_common_name"
              >
                <v-list-item-title>Bird Profile</v-list-item-title>
                <v-list-item-subtitle>
                  <router-link
                    v-if="sightingsStore.currentSighting.bird_profile_id"
                    :to="{
                      name: 'bird-profile',
                      params: {
                        id: sightingsStore.currentSighting.bird_profile_id,
                      },
                    }"
                  >
                    {{ sightingsStore.currentSighting.bird_common_name }}
                  </router-link>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="sightingsStore.currentSighting.gender">
                <v-list-item-title>Gender</v-list-item-title>
                <v-list-item-subtitle>
                  {{ sightingsStore.currentSighting.gender }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Wikipedia Species Reference -->
        <v-card v-if="speciesImageUrl" class="mt-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-wikipedia</v-icon>
            Species Reference
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="80" class="mr-4">
                <v-img :src="speciesImageUrl" cover />
              </v-avatar>
              <div>
                <p class="text-body-2 text-medium-emphasis mb-1">
                  Reference photo from Wikipedia
                </p>
                <p class="text-caption text-disabled">
                  Compare with the detected frame to verify identification
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card v-if="sightingsStore.currentSighting.ai_analysis" class="mt-4">
          <v-card-title>AI Analysis</v-card-title>
          <v-list>
            <v-card-text>
              <p class="mb-2">
                The AI model has provided the following analysis for this
                sighting:
              </p>
              <v-list-item>
                <v-list-item-title>Common name</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    sightingsStore.currentSighting.ai_analysis.common_name ||
                    "uknown"
                  }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:default>
                  <div>
                    <div class="text-subtitle-2 mb-1">Features observed</div>
                    <div
                      class="text-body-2 text-medium-emphasis"
                      style="white-space: normal"
                    >
                      {{
                        sightingsStore.currentSighting.ai_analysis.features ||
                        "None"
                      }}
                    </div>
                  </div>
                </template>
              </v-list-item>

              <v-list-item>
                <v-list-item-title>Image quality</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    sightingsStore.currentSighting.ai_analysis.image_quality ||
                    "unknown"
                  }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <v-list-item-title>Assessed quality</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    sightingsStore.currentSighting.ai_analysis
                      .assessed_quality || "unknown"
                  }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-card-text>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
  <LoadingSpinner v-else-if="sightingsStore.loading" />
</template>

<style scoped>
.text-wrap {
  white-space: normal !important;
  overflow-wrap: break-word;
}

.media-container {
  width: 100%;
  background-color: #000;
}

.video-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player {
  width: 100%;
  height: auto;
  max-height: 600px;
  display: block;
  object-fit: contain;
}

.video-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.timestamp-marker {
  position: absolute;
  bottom: 32px;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}
</style>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useSightingsStore } from "@/stores/sightings.store";
import { useSpeciesStore } from "@/stores/species.store";
import videosService from "@/services/videos.service";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import { format } from "date-fns";

const route = useRoute();
const sightingsStore = useSightingsStore();
const speciesStore = useSpeciesStore();

const speciesImageUrl = ref<string | null>(null);
const activeTab = ref("frame");
const video = ref<any>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const videoDuration = ref(0);
const frameContainer = ref<HTMLElement | null>(null);
const containerHeight = ref<number | null>(null);

// Calculate marker position as percentage of video duration
const markerPosition = computed(() => {
  if (!sightingsStore.currentSighting || videoDuration.value <= 0) return 0;
  const timestamp = sightingsStore.currentSighting.timestamp_in_video || 0;
  return (timestamp / videoDuration.value) * 100;
});

// Fetch video data when sighting loads
watch(
  () => sightingsStore.currentSighting,
  async (sighting) => {
    if (sighting?.video_id) {
      try {
        video.value = await videosService.getById(sighting.video_id);
      } catch (err) {
        console.error("Failed to fetch video:", err);
        video.value = null;
      }
    }
  },
  { immediate: true }
);

// Fetch species image when sighting loads
watch(
  () => sightingsStore.currentSighting,
  async (sighting) => {
    if (sighting?.species) {
      await speciesStore.fetchSpeciesImage(sighting.species);
      speciesImageUrl.value = speciesStore.getSpeciesImage(sighting.species);
    }
  },
  { immediate: true }
);

function onFrameLoaded() {
  // Capture frame container height to use for video container
  if (frameContainer.value) {
    containerHeight.value = frameContainer.value.offsetHeight;
  }
}

function onVideoLoaded() {
  if (videoElement.value) {
    videoDuration.value = videoElement.value.duration;
  }
}

onMounted(() => {
  const id = parseInt(route.params.id as string);
  sightingsStore.fetchSightingById(id);
});

function formatDate(date: string) {
  return format(new Date(date), "PPpp");
}

function formatTimestamp(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
</script>
