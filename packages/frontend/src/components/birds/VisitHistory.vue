<template>
  <v-card class="visit-history-card glass-card">
    <div class="card-header">
      <div class="header-icon">
        <v-icon size="20" color="primary">mdi-history</v-icon>
      </div>
      <h3 class="header-title">Visit History</h3>
      <v-chip v-if="history.length" size="small" color="primary" variant="tonal" class="ml-auto">
        {{ history.length }} {{ history.length === 1 ? 'visit' : 'visits' }}
      </v-chip>
    </div>

    <div class="card-content">
      <div v-if="history.length" class="timeline">
        <div
          v-for="(sighting, index) in history"
          :key="sighting.id"
          class="timeline-item"
          :style="{ '--stagger-delay': `${index * 80}ms` }"
        >
          <div class="timeline-connector">
            <div class="timeline-dot" :class="`timeline-dot--${getConfidenceLevel(sighting.confidence_score)}`"></div>
            <div v-if="index < history.length - 1" class="timeline-line"></div>
          </div>

          <div class="timeline-content">
            <router-link
              :to="{ name: 'sighting-detail', params: { id: sighting.id } }"
              class="visit-card glass-card"
            >
              <div class="visit-image">
                <v-img
                  :src="`/api/files/${sighting.frame_path}`"
                  width="90"
                  height="90"
                  cover
                  class="rounded-lg"
                >
                  <template #placeholder>
                    <div class="image-placeholder">
                      <v-icon size="24">mdi-bird</v-icon>
                    </div>
                  </template>
                </v-img>
              </div>

              <div class="visit-info">
                <div class="visit-species">{{ sighting.species }}</div>
                <div class="visit-meta">
                  <span class="visit-date">
                    <v-icon size="12" class="mr-1">mdi-clock-outline</v-icon>
                    {{ formatDate(sighting.detected_at) }}
                  </span>
                </div>
                <div class="visit-confidence">
                  <div class="confidence-bar">
                    <div
                      class="confidence-fill"
                      :class="`confidence-fill--${getConfidenceLevel(sighting.confidence_score)}`"
                      :style="{ width: `${sighting.confidence_score}%` }"
                    ></div>
                  </div>
                  <span class="confidence-text">{{ Math.round(sighting.confidence_score) }}%</span>
                </div>
              </div>

              <div class="visit-arrow">
                <v-icon size="18">mdi-chevron-right</v-icon>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        icon="mdi-history"
        title="No Visits Yet"
        message="This bird hasn't been spotted yet. Check back later!"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import EmptyState from '@/components/common/EmptyState.vue';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

defineProps<{
  history: any[];
}>();

function formatDate(date: string) {
  const d = new Date(date);
  if (isToday(d)) {
    return `Today at ${format(d, 'p')}`;
  }
  if (isYesterday(d)) {
    return `Yesterday at ${format(d, 'p')}`;
  }
  const distance = formatDistanceToNow(d, { addSuffix: true });
  return distance;
}

function getConfidenceLevel(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}
</script>

<style scoped>
.visit-history-card {
  border-radius: 20px !important;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(27, 67, 50, 0.08);
}

.v-theme--dark .card-header {
  border-bottom-color: rgba(116, 198, 157, 0.1);
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(64, 145, 108, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
}

.v-theme--dark .header-icon {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.15) 0%, rgba(116, 198, 157, 0.15) 100%);
}

.header-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
}

.card-content {
  padding: 20px 24px;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 16px;
  animation: stagger-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--stagger-delay, 0ms);
  opacity: 0;
}

@keyframes stagger-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .timeline-item {
    animation: none;
    opacity: 1;
  }
}

.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 12px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(27, 67, 50, 0.1);
}

.v-theme--dark .timeline-dot {
  box-shadow: 0 0 0 4px rgba(116, 198, 157, 0.1);
}

.timeline-dot--high {
  background: #2D6A4F;
}

.timeline-dot--medium {
  background: #E85D04;
}

.timeline-dot--low {
  background: #9B2226;
}

.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background: rgba(27, 67, 50, 0.1);
  margin-top: 8px;
}

.v-theme--dark .timeline-line {
  background: rgba(116, 198, 157, 0.15);
}

.timeline-content {
  flex: 1;
  padding-bottom: 16px;
}

/* Visit Card */
.visit-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 16px !important;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.visit-card:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 24px rgba(27, 67, 50, 0.12);
}

.v-theme--dark .visit-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.visit-image {
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
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
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.15) 0%, rgba(116, 198, 157, 0.15) 100%);
}

.visit-info {
  flex: 1;
  min-width: 0;
}

.visit-species {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.visit-meta {
  margin-bottom: 8px;
}

.visit-date {
  display: inline-flex;
  align-items: center;
  font-family: 'Poppins', sans-serif;
  font-size: 0.75rem;
  opacity: 0.6;
}

.visit-confidence {
  display: flex;
  align-items: center;
  gap: 10px;
}

.confidence-bar {
  flex: 1;
  height: 6px;
  background: rgba(27, 67, 50, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.v-theme--dark .confidence-bar {
  background: rgba(116, 198, 157, 0.15);
}

.confidence-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.confidence-fill--high {
  background: linear-gradient(90deg, #2D6A4F, #40916C);
}

.confidence-fill--medium {
  background: linear-gradient(90deg, #E85D04, #F48C06);
}

.confidence-fill--low {
  background: linear-gradient(90deg, #9B2226, #CA3A31);
}

.confidence-text {
  font-family: 'Poppins', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 32px;
  text-align: right;
}

.visit-arrow {
  flex-shrink: 0;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.visit-card:hover .visit-arrow {
  opacity: 0.8;
  transform: translateX(4px);
}
</style>
