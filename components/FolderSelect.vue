<template>
  <div ref="rootRef" class="space-y-2">
    <label class="text-sm font-medium text-slate-700">{{ props.labelText }}</label>
    <div class="relative">
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-base outline-none transition hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 md:py-2.5 md:text-sm"
        @click="toggleOpen"
      >
        <span class="truncate">{{ selectedLabel || props.placeholderText }}</span>
        <svg viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 text-slate-500">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <div
        v-if="isOpen"
        class="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
      >
        <button
          type="button"
          class="block w-full truncate px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
          @click="selectValue('')"
        >
          {{ props.placeholderText }}
        </button>
        <button
          v-for="folder in props.folders"
          :key="folder.id"
          type="button"
          class="block w-full truncate px-4 py-2 text-left text-sm hover:bg-slate-100"
          :class="props.modelValue === folder.id ? 'bg-brand-50 text-brand-700' : 'text-slate-700'"
          @click="selectValue(folder.id)"
        >
          {{ folder.name }}
        </button>
      </div>
      <span
        class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500"
        aria-hidden="true"
      >
        <span class="sr-only">Dropdown indicator</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FolderRecord } from "~/types/db";

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const props = withDefaults(
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

const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const selectedLabel = computed(
  () => props.folders.find((folder) => folder.id === props.modelValue)?.name || ""
);

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

function selectValue(value: string) {
  emit("update:modelValue", value);
  isOpen.value = false;
}

function onDocumentClick(event: MouseEvent) {
  if (!rootRef.value) {
    return;
  }
  const target = event.target as Node | null;
  if (target && !rootRef.value.contains(target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
});
</script>
