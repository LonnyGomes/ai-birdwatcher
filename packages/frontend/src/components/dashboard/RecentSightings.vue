<template>
  <v-card class="sightings-card glass-card-prominent">
    <div class="card-header">
      <div class="header-icon">
        <v-icon size="20" color="primary">mdi-clock-outline</v-icon>
      </div>
      <span class="header-title">Recent Sightings</span>
    </div>

    <v-card-text class="pa-0">
      <div v-if="statisticsStore.overview?.recent_sightings?.length" class="sightings-timeline">
        <div
          v-for="(sighting, index) in statisticsStore.overview.recent_sightings"
          :key="sighting.id"
          class="timeline-item stagger-item"
          @click="navigateToSighting(sighting.id)"
        >
          <div class="timeline-connector">
            <div class="timeline-dot" :class="{ 'timeline-dot--first': index === 0 }"></div>
            <div v-if="index < (statisticsStore.overview?.recent_sightings?.length || 0) - 1" class="timeline-line"></div>
          </div>

          <div class="timeline-content">
            <div class="sighting-image-wrapper">
              <v-img
                v-if="sighting.frame_path"
                :src="`/api/files/${sighting.frame_path}`"
                class="sighting-image"
                cover
              >
                <template #placeholder>
                  <div class="image-placeholder">
                    <v-icon color="primary" size="24">mdi-bird</v-icon>
                  </div>
                </template>
              </v-img>
              <div v-else class="image-placeholder">
                <v-icon color="primary" size="24">mdi-bird</v-icon>
              </div>
              <div class="image-overlay"></div>
            </div>

            <div class="sighting-info">
              <div class="sighting-species">
                <span class="species-common-name">{{ sighting.species_common_name || sighting.species }}</span>
                <span v-if="sighting.species_common_name" class="species-latin-name">{{ sighting.species }}</span>
              </div>
              <div class="sighting-time">
                <v-icon size="12" class="mr-1">mdi-clock-outline</v-icon>
                {{ formatRelativeTime(sighting.detected_at) }}
              </div>
            </div>

            <v-icon size="16" class="chevron-icon">mdi-chevron-right</v-icon>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="mdi-bird" message="No recent sightings" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useStatisticsStore } from '@/stores/statistics.store';
import EmptyState from '@/components/common/EmptyState.vue';
import { formatDistanceToNow } from 'date-fns';

const statisticsStore = useStatisticsStore();
const router = useRouter();

function formatRelativeTime(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

function navigateToSighting(id: number) {
  router.push({ name: 'sighting-detail', params: { id } });
}
</script>

<style scoped>
.sightings-card {
  border-radius: 24px !important;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(27, 67, 50, 0.08);
}

.v-theme--dark .card-header {
  border-bottom-color: rgba(116, 198, 157, 0.1);
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(64, 145, 108, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-theme--dark .header-icon {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.15) 0%, rgba(116, 198, 157, 0.15) 100%);
}

.header-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
}

.sightings-timeline {
  padding: 16px 20px;
}

.timeline-item {
  display: flex;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeline-item:hover .timeline-content {
  background: rgba(27, 67, 50, 0.04);
  transform: translateX(4px);
}

.v-theme--dark .timeline-item:hover .timeline-content {
  background: rgba(116, 198, 157, 0.06);
}

.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  flex-shrink: 0;
  padding-top: 18px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(27, 67, 50, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.1);
  z-index: 1;
}

.v-theme--dark .timeline-dot {
  background: rgba(116, 198, 157, 0.4);
  border-color: rgba(26, 47, 35, 0.8);
  box-shadow: 0 0 0 3px rgba(116, 198, 157, 0.1);
}

.timeline-dot--first {
  background: #E85D04;
  box-shadow: 0 0 0 3px rgba(232, 93, 4, 0.2);
}

.v-theme--dark .timeline-dot--first {
  background: #F48C06;
  box-shadow: 0 0 0 3px rgba(244, 140, 6, 0.2);
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, rgba(27, 67, 50, 0.2) 0%, rgba(27, 67, 50, 0.05) 100%);
  margin-top: 4px;
}

.v-theme--dark .timeline-line {
  background: linear-gradient(180deg, rgba(116, 198, 157, 0.2) 0%, rgba(116, 198, 157, 0.05) 100%);
}

.timeline-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  margin-left: 8px;
  margin-bottom: 8px;
  border-radius: 14px;
  transition: all 0.3s ease;
}

.sighting-image-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sighting-image {
  width: 100%;
  height: 100%;
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

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.3));
}

.sighting-info {
  flex: 1;
  min-width: 0;
}

.sighting-species {
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.species-common-name {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.species-latin-name {
  font-style: italic;
  font-size: 0.75rem;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sighting-time {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  opacity: 0.6;
}

.chevron-icon {
  opacity: 0.3;
  transition: all 0.3s ease;
}

.timeline-item:hover .chevron-icon {
  opacity: 0.7;
  transform: translateX(2px);
}
</style>
