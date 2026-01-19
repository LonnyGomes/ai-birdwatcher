<template>
  <v-card :to="{ name: 'bird-profile', params: { id: bird.id } }">
    <v-img
      :src="bird.representative_image_path ? `/api/files/${bird.representative_image_path}` : '/placeholder.png'"
      height="200"
      cover
    >
      <template #placeholder>
        <v-row class="fill-height" align="center" justify="center">
          <v-icon size="100">mdi-bird</v-icon>
        </v-row>
      </template>
    </v-img>
    <v-card-title>{{ bird.common_name || bird.species }}</v-card-title>
    <v-card-subtitle>{{ bird.species }}</v-card-subtitle>
    <v-card-text>
      <v-chip size="small" color="primary">
        {{ bird.total_visits }} visits
      </v-chip>
      <v-chip size="small" class="ml-2">
        ID: {{ bird.unique_identifier }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  bird: any;
}>();
</script>
