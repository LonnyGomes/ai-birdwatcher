<template>
  <v-row>
    <v-col
      v-for="bird in birds"
      :key="bird.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <BirdCard :bird="bird" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import BirdCard from './BirdCard.vue';

defineProps<{
  birds: any[];
}>();
</script>
