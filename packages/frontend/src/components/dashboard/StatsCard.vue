<template>
  <v-card
    class="stats-card glass-card"
    :class="`stats-card--${colorVariant}`"
  >
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-space-between">
        <div class="stat-content">
          <div class="stat-label">{{ title }}</div>
          <div class="stat-value">{{ formatNumber(value) }}</div>
        </div>
        <div class="icon-wrapper" :class="`icon-wrapper--${colorVariant}`">
          <v-icon size="32" class="stat-icon">
            {{ icon }}
          </v-icon>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: number;
  icon: string;
  color: string;
}>();

// Map old color names to new nature variants
const colorVariant = computed(() => {
  const colorMap: Record<string, string> = {
    primary: 'forest',
    success: 'moss',
    info: 'earth',
    warning: 'sunset',
  };
  return colorMap[props.color] || 'forest';
});

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}
</script>

<style scoped>
.stats-card {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 20px !important;
}

.stats-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 24px 48px rgba(27, 67, 50, 0.18) !important;
}

.v-theme--dark .stats-card:hover {
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4) !important;
}

/* Color Variants - Top Border */
.stats-card--forest {
  border-top: 4px solid #1B4332;
}

.stats-card--sunset {
  border-top: 4px solid #E85D04;
}

.stats-card--earth {
  border-top: 4px solid #5C4033;
}

.stats-card--moss {
  border-top: 4px solid #52796F;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.6;
  margin-bottom: 8px;
}

.stat-value {
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 2.25rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, rgba(var(--v-theme-on-surface), 1) 0%, rgba(var(--v-theme-on-surface), 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.stats-card:hover .icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

/* Icon wrapper color variants */
.icon-wrapper--forest {
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.12) 0%, rgba(64, 145, 108, 0.12) 100%);
}

.icon-wrapper--forest .stat-icon {
  color: #1B4332;
}

.v-theme--dark .icon-wrapper--forest {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.15) 0%, rgba(116, 198, 157, 0.15) 100%);
}

.v-theme--dark .icon-wrapper--forest .stat-icon {
  color: #74C69D;
}

.icon-wrapper--sunset {
  background: linear-gradient(135deg, rgba(232, 93, 4, 0.12) 0%, rgba(250, 163, 7, 0.12) 100%);
}

.icon-wrapper--sunset .stat-icon {
  color: #E85D04;
}

.v-theme--dark .icon-wrapper--sunset {
  background: linear-gradient(135deg, rgba(244, 140, 6, 0.15) 0%, rgba(250, 163, 7, 0.15) 100%);
}

.v-theme--dark .icon-wrapper--sunset .stat-icon {
  color: #F48C06;
}

.icon-wrapper--earth {
  background: linear-gradient(135deg, rgba(92, 64, 51, 0.12) 0%, rgba(155, 123, 107, 0.12) 100%);
}

.icon-wrapper--earth .stat-icon {
  color: #5C4033;
}

.v-theme--dark .icon-wrapper--earth {
  background: linear-gradient(135deg, rgba(155, 123, 107, 0.15) 0%, rgba(184, 155, 139, 0.15) 100%);
}

.v-theme--dark .icon-wrapper--earth .stat-icon {
  color: #9B7B6B;
}

.icon-wrapper--moss {
  background: linear-gradient(135deg, rgba(82, 121, 111, 0.12) 0%, rgba(116, 198, 157, 0.12) 100%);
}

.icon-wrapper--moss .stat-icon {
  color: #52796F;
}

.v-theme--dark .icon-wrapper--moss {
  background: linear-gradient(135deg, rgba(116, 198, 157, 0.15) 0%, rgba(149, 213, 178, 0.15) 100%);
}

.v-theme--dark .icon-wrapper--moss .stat-icon {
  color: #74C69D;
}
</style>
