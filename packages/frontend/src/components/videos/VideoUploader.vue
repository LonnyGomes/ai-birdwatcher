<template>
  <div>
    <v-file-input
      v-model="selectedFile"
      label="Select Video File"
      accept="video/*"
      prepend-icon="mdi-video"
      show-size
      :rules="[rules.required, rules.fileType]"
    />

    <v-btn
      :disabled="!selectedFile || loading"
      :loading="loading"
      color="primary"
      block
      class="mt-4"
      @click="handleUpload"
    >
      Upload Video
    </v-btn>

    <v-alert v-if="error" type="error" class="mt-4">
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  upload: [file: File];
}>();

const selectedFile = ref<File[]>([]);
const error = ref<string | null>(null);

const rules = {
  required: (v: File[]) => v.length > 0 || 'Required',
  fileType: (v: File[]) => {
    if (!v.length) return true;
    const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'];
    return allowedTypes.includes(v[0].type) || 'Only video files are allowed';
  },
};

function handleUpload() {
  if (!selectedFile.value.length) return;

  error.value = null;
  emit('upload', selectedFile.value[0]);
}
</script>
