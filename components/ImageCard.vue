<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div class="relative aspect-square bg-slate-100">
      <img
        :src="image.file_url"
        :alt="image.file_name"
        loading="lazy"
        class="h-full w-full cursor-zoom-in object-cover"
        @click="emit('preview', image.id)"
      />
      <label
        v-if="selectable"
        class="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs text-white"
      >
        <input type="checkbox" :checked="selected" @click.stop @change="emit('toggle', image.id)" />
        Select
      </label>
    </div>
    <div class="p-3">
      <p class="truncate text-sm font-medium text-slate-700">{{ image.file_name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageRecord } from "~/types/db";

defineProps<{
  image: ImageRecord;
  selected?: boolean;
  selectable?: boolean;
}>();

const emit = defineEmits<{
  toggle: [id: string];
  preview: [id: string];
}>();
</script>
