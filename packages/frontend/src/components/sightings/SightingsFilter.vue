<template>
  <v-card class="filter-card glass-card">
    <div class="filter-header" @click="expanded = !expanded">
      <div class="header-left">
        <div class="header-icon">
          <v-icon size="18" color="primary">mdi-filter-variant</v-icon>
        </div>
        <span class="header-title">Filters</span>
        <v-chip
          v-if="activeFilterCount > 0"
          size="small"
          color="primary"
          variant="tonal"
          class="ml-3"
        >
          {{ activeFilterCount }} active
        </v-chip>
      </div>
      <v-icon
        class="expand-icon"
        :class="{ 'expand-icon--rotated': expanded }"
      >
        mdi-chevron-down
      </v-icon>
    </div>

    <v-expand-transition>
      <div v-show="expanded" class="filter-content">
        <v-row>
          <v-col cols="12" md="4">
            <div class="field-wrapper">
              <label class="field-label">Species</label>
              <v-text-field
                v-model="filters.species"
                placeholder="e.g., Cardinal"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-bird"
                clearable
                hide-details
                class="nature-input"
              />
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="field-wrapper">
              <label class="field-label">From Date</label>
              <v-text-field
                v-model="filters.date_from"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-start"
                clearable
                hide-details
                class="nature-input"
              />
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="field-wrapper">
              <label class="field-label">To Date</label>
              <v-text-field
                v-model="filters.date_to"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-end"
                clearable
                hide-details
                class="nature-input"
              />
            </div>
          </v-col>
        </v-row>

        <div class="filter-actions">
          <v-btn
            color="primary"
            variant="elevated"
            class="action-btn action-btn--primary"
            @click="applyFilters"
          >
            <v-icon start size="18">mdi-magnify</v-icon>
            Apply Filters
          </v-btn>
          <v-btn
            variant="text"
            class="action-btn action-btn--secondary"
            @click="resetFilters"
          >
            <v-icon start size="18">mdi-refresh</v-icon>
            Clear All
          </v-btn>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits<{
  filter: [filters: any];
}>();

const expanded = ref(false);

const filters = ref({
  species: '',
  date_from: '',
  date_to: '',
});

const activeFilterCount = computed(() => {
  return Object.values(filters.value).filter(v => v && v.toString().trim() !== '').length;
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

<style scoped>
.filter-card {
  border-radius: 20px !important;
  overflow: hidden;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.filter-header:hover {
  background: rgba(27, 67, 50, 0.03);
}

.v-theme--dark .filter-header:hover {
  background: rgba(116, 198, 157, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(64, 145, 108, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.v-theme--dark .header-icon {
  background: linear-gradient(135deg, rgba(64, 145, 108, 0.15) 0%, rgba(116, 198, 157, 0.15) 100%);
}

.header-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
}

.expand-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.5;
}

.expand-icon--rotated {
  transform: rotate(180deg);
}

.filter-content {
  padding: 8px 20px 24px;
  border-top: 1px solid rgba(27, 67, 50, 0.08);
}

.v-theme--dark .filter-content {
  border-top-color: rgba(116, 198, 157, 0.1);
}

.field-wrapper {
  margin-bottom: 4px;
}

.field-label {
  display: block;
  font-family: 'Poppins', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
  margin-bottom: 8px;
}

.nature-input :deep(.v-field) {
  border-radius: 12px;
}

.nature-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.1);
}

.v-theme--dark .nature-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(116, 198, 157, 0.15);
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(27, 67, 50, 0.06);
}

.v-theme--dark .filter-actions {
  border-top-color: rgba(116, 198, 157, 0.08);
}

.action-btn {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.action-btn--primary {
  border-radius: 12px;
  padding: 0 24px;
}

.action-btn--secondary {
  opacity: 0.7;
}

.action-btn--secondary:hover {
  opacity: 1;
}
</style>
