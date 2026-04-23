<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-slate-700">{{ labelText }}</label>
    <select
      class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-brand-500"
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">{{ placeholderText }}</option>
      <option v-for="folder in folders" :key="folder.id" :value="folder.id">
        {{ folder.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { FolderRecord } from "~/types/db";

withDefaults(
  defineProps<{
    modelValue: string;
    folders: FolderRecord[];
    labelText?: string;
    placeholderText?: string;
  }>(),
  {
    labelText: "Select department",
    placeholderText: "Choose a department"
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>
