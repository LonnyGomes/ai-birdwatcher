<template>
  <v-card class="empty-state text-center pa-12" elevation="0" variant="flat">
    <div class="empty-state-content">
      <div class="icon-wrapper mb-6">
        <v-icon :size="iconSize" :color="iconColor">
          {{ icon }}
        </v-icon>
      </div>
      <h3 class="text-h5 font-weight-bold mb-3">{{ title }}</h3>
      <p class="text-body-1 text-medium-emphasis mb-6" style="max-width: 400px; margin: 0 auto;">
        {{ message }}
      </p>
      <slot name="action"></slot>
    </div>
  </v-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    iconSize?: number;
    iconColor?: string;
    title?: string;
    message: string;
  }>(),
  {
    icon: 'mdi-inbox',
    iconSize: 96,
    iconColor: 'grey-lighten-1',
    title: 'No Data',
  }
);
</script>

<style scoped>
.empty-state {
  background: transparent !important;
}

.empty-state-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 48px 24px;
}

.icon-wrapper {
  display: inline-flex;
  padding: 24px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 50%;
}
</style>
