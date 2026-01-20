<template>
  <v-card
    class="stats-card"
    :class="`stats-card--${color}`"
    elevation="2"
    hover
  >
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-subtitle-2 text-uppercase mb-2 stat-label">{{ title }}</div>
          <div class="text-h3 font-weight-bold stat-value">{{ formatNumber(value) }}</div>
        </div>
        <div class="icon-wrapper">
          <v-icon :color="color" size="48">
            {{ icon }}
          </v-icon>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  value: number;
  icon: string;
  color: string;
}>();

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}
</script>

<style scoped>
.stats-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border-radius: 12px !important;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: height 0.3s ease;
}

.stats-card--primary::before {
  background: linear-gradient(90deg, #1976D2 0%, #2196F3 100%);
}

.stats-card--success::before {
  background: linear-gradient(90deg, #388E3C 0%, #4CAF50 100%);
}

.stats-card--warning::before {
  background: linear-gradient(90deg, #F57C00 0%, #FF9800 100%);
}

.stats-card--info::before {
  background: linear-gradient(90deg, #0288D1 0%, #03A9F4 100%);
}

.stats-card:hover::before {
  height: 100%;
  opacity: 0.05;
}

.stat-label {
  letter-spacing: 0.5px;
  opacity: 0.7;
}

.stat-value {
  line-height: 1.2;
}

.icon-wrapper {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
