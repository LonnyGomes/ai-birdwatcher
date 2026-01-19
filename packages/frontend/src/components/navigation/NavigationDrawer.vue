<template>
  <v-navigation-drawer
    v-model="model"
    permanent
  >
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        :to="{ name: 'dashboard' }"
      />
      <v-list-item
        prepend-icon="mdi-bird"
        title="Sightings"
        :to="{ name: 'sightings' }"
      />
      <v-list-item
        prepend-icon="mdi-book-open-variant"
        title="Birds Directory"
        :to="{ name: 'birds' }"
      />
      <v-list-item
        prepend-icon="mdi-video"
        title="Videos"
        :to="{ name: 'videos' }"
      />
    </v-list>

    <template #append>
      <v-list density="compact">
        <v-list-item>
          <ThemeToggle />
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ThemeToggle from './ThemeToggle.vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const model = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  model.value = val;
});

watch(model, (val) => {
  emit('update:modelValue', val);
});
</script>
