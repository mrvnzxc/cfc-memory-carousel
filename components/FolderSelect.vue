<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-slate-700">{{ labelText }}</label>
    <div class="relative">
      <select
        class="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 md:py-2.5 md:text-sm"
        :value="modelValue"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ placeholderText }}</option>
        <option v-for="folder in folders" :key="folder.id" :value="folder.id">
          {{ folder.name }}
        </option>
      </select>
      <span
        class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500"
        aria-hidden="true"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </div>
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
