<template>
  <v-alert v-if="error" type="error" closable @click:close="emit('close')">
    {{ error }}
  </v-alert>
</template>

<script setup lang="ts">
defineProps<{
  error: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>
