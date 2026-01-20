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
          <v-img
            :src="`/api/files/${sightingsStore.currentSighting.frame_path}`"
            contain
            max-height="600"
          />
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title
            >{{ sightingsStore.currentSighting.species }} ({{
              sightingsStore.currentSighting.ai_analysis.common_name
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

// add style for a two column layout using CSS grid
<style scoped>
.text-wrap {
  white-space: normal !important;
  overflow-wrap: break-word;
}
</style>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useSightingsStore } from "@/stores/sightings.store";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import { format } from "date-fns";

const route = useRoute();
const sightingsStore = useSightingsStore();

onMounted(() => {
  const id = parseInt(route.params.id as string);
  sightingsStore.fetchSightingById(id);
});

function formatDate(date: string) {
  return format(new Date(date), "PPpp");
}
</script>
