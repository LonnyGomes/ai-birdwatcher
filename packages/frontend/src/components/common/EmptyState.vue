<template>
  <v-card class="text-center pa-8">
    <v-icon size="80" color="grey-lighten-1">
      mdi-inbox
    </v-icon>
    <div class="text-h6 mt-4 text-grey">{{ message }}</div>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>
