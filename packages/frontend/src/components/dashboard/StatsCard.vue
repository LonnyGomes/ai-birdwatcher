<template>
  <v-card>
    <v-card-text>
      <div class="d-flex align-center">
        <v-icon :color="color" size="40" class="mr-4">
          {{ icon }}
        </v-icon>
        <div>
          <div class="text-h4">{{ value }}</div>
          <div class="text-subtitle-2 text-medium-emphasis">{{ title }}</div>
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
</script>
