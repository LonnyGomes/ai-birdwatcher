<template>
  <v-card class="visitors-card glass-card-prominent">
    <div class="card-header">
      <div class="header-icon">
        <v-icon size="20" color="golden-hour">mdi-trophy</v-icon>
      </div>
      <span class="header-title">Top Visitors</span>
    </div>

    <v-card-text class="pa-0">
      <div v-if="statisticsStore.overview?.top_visitors?.length" class="visitors-list">
        <div
          v-for="(bird, index) in statisticsStore.overview.top_visitors"
          :key="bird.id"
          class="visitor-item stagger-item"
          :class="{ 'visitor-item--champion': index === 0 }"
          @click="navigateToBird(bird.id)"
        >
          <div class="visitor-rank">
            <v-icon v-if="index === 0" color="amber-darken-1" size="24">mdi-medal</v-icon>
            <v-icon v-else-if="index === 1" color="grey-lighten-1" size="20">mdi-medal-outline</v-icon>
            <v-icon v-else-if="index === 2" color="deep-orange-lighten-2" size="20">mdi-medal-outline</v-icon>
            <span v-else class="rank-number">{{ index + 1 }}</span>
          </div>

          <v-avatar size="48" class="visitor-avatar">
            <v-img
              v-if="bird.representative_image_path"
              :src="`/api/files/${bird.representative_image_path}`"
              cover
            />
            <v-icon v-else color="primary" size="24">mdi-bird</v-icon>
          </v-avatar>

          <div class="visitor-info">
            <div class="visitor-name">{{ bird.common_name || bird.species }}</div>
            <div class="visitor-species">{{ bird.species }}</div>
            <div class="visitor-bar-container">
              <div
                class="visitor-bar"
                :style="{ width: getBarWidth(bird.total_visits) }"
              ></div>
            </div>
          </div>

          <div class="visitor-count">
            <span class="count-number">{{ bird.total_visits }}</span>
            <span class="count-label">visits</span>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="mdi-bird" message="No bird visits yet" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStatisticsStore } from '@/stores/statistics.store';
import EmptyState from '@/components/common/EmptyState.vue';

const statisticsStore = useStatisticsStore();
const router = useRouter();

const maxVisits = computed(() => {
  const visitors = statisticsStore.overview?.top_visitors || [];
  return Math.max(...visitors.map(b => b.total_visits), 1);
});

function getBarWidth(visits: number): string {
  return `${(visits / maxVisits.value) * 100}%`;
}

function navigateToBird(id: number) {
  router.push({ name: 'bird-profile', params: { id } });
}
</script>

<style scoped>
.visitors-card {
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
  background: linear-gradient(135deg, rgba(255, 186, 8, 0.15) 0%, rgba(250, 163, 7, 0.15) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
}

.visitors-list {
  padding: 12px 16px;
}

.visitor-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  margin: 6px 0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.visitor-item:hover {
  background: rgba(27, 67, 50, 0.05);
  transform: translateX(4px);
}

.v-theme--dark .visitor-item:hover {
  background: rgba(116, 198, 157, 0.08);
}

.visitor-item--champion {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%);
  border: 1px solid rgba(255, 193, 7, 0.15);
}

.visitor-item--champion:hover {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.12) 0%, rgba(255, 152, 0, 0.12) 100%);
}

.visitor-rank {
  width: 32px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.rank-number {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  opacity: 0.4;
}

.visitor-avatar {
  border: 2px solid rgba(27, 67, 50, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.v-theme--dark .visitor-avatar {
  border-color: rgba(116, 198, 157, 0.15);
}

.visitor-info {
  flex: 1;
  min-width: 0;
}

.visitor-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.visitor-species {
  font-size: 0.75rem;
  opacity: 0.5;
  font-style: italic;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.visitor-bar-container {
  height: 4px;
  background: rgba(27, 67, 50, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.v-theme--dark .visitor-bar-container {
  background: rgba(116, 198, 157, 0.1);
}

.visitor-bar {
  height: 100%;
  background: linear-gradient(90deg, #1B4332 0%, #40916C 100%);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-theme--dark .visitor-bar {
  background: linear-gradient(90deg, #40916C 0%, #74C69D 100%);
}

.visitor-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  min-width: 50px;
}

.count-number {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: rgb(var(--v-theme-primary));
  line-height: 1.2;
}

.count-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.5;
}
</style>
