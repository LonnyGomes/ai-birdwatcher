<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.species"
            label="Species"
            clearable
            density="compact"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.date_from"
            label="From Date"
            type="date"
            clearable
            density="compact"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.date_to"
            label="To Date"
            type="date"
            clearable
            density="compact"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn color="primary" @click="applyFilters">Apply Filters</v-btn>
          <v-btn class="ml-2" @click="resetFilters">Reset</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  filter: [filters: any];
}>();

const filters = ref({
  species: '',
  date_from: '',
  date_to: '',
});

function applyFilters() {
  emit('filter', { ...filters.value });
}

function resetFilters() {
  filters.value = {
    species: '',
    date_from: '',
    date_to: '',
  };
  applyFilters();
}
</script>
