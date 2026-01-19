<template>
  <v-card>
    <v-row no-gutters>
      <v-col cols="12" md="4">
        <v-img
          :src="bird.representative_image_path ? `/api/files/${bird.representative_image_path}` : '/placeholder.png'"
          height="300"
          cover
        />
      </v-col>
      <v-col cols="12" md="8">
        <v-card-title class="text-h4">
          {{ bird.common_name || bird.species }}
        </v-card-title>
        <v-card-subtitle class="text-h6">
          {{ bird.species }}
        </v-card-subtitle>
        <v-card-text>
          <v-chip color="primary" class="mr-2">
            ID: {{ bird.unique_identifier }}
          </v-chip>
          <v-chip v-if="bird.confidence_score" class="mr-2">
            {{ Math.round(bird.confidence_score * 100) }}% confidence
          </v-chip>
        </v-card-text>
        <v-card-text v-if="bird.notes">
          <strong>Notes:</strong> {{ bird.notes }}
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  bird: any;
}>();
</script>
