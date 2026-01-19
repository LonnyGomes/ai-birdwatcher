<template>
  <div>
    <v-chip
      :color="statusColor"
      :prepend-icon="statusIcon"
      size="small"
    >
      {{ statusText }}
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  video: any;
}>();

const statusColor = computed(() => {
  const colors: Record<string, string> = {
    pending: 'grey',
    processing: 'info',
    completed: 'success',
    failed: 'error',
  };
  return colors[props.video.status] || 'grey';
});

const statusIcon = computed(() => {
  const icons: Record<string, string> = {
    pending: 'mdi-clock-outline',
    processing: 'mdi-cog',
    completed: 'mdi-check-circle',
    failed: 'mdi-alert-circle',
  };
  return icons[props.video.status] || 'mdi-help';
});

const statusText = computed(() => {
  return props.video.status.charAt(0).toUpperCase() + props.video.status.slice(1);
});
</script>
