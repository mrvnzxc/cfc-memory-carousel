<template>
  <div
    class="rounded-xl border-2 border-dashed p-8 text-center transition"
    :class="dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white'"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="inputRef"
      type="file"
      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
      multiple
      class="hidden"
      @change="onFileInput"
    />
    <p class="text-lg font-semibold text-slate-800">Drop images here</p>
    <p class="mt-1 text-sm text-slate-500">or click to browse (jpg, png, webp - max 3MB)</p>
    <button
      class="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      @click="inputRef?.click()"
    >
      Choose files
    </button>
  </div>
</template>

<script setup lang="ts">
const inputRef = ref<HTMLInputElement | null>(null);
const dragging = ref(false);

const emit = defineEmits<{
  select: [files: File[]];
}>();

function onDrop(event: DragEvent) {
  dragging.value = false;
  const files = Array.from(event.dataTransfer?.files || []);
  emit("select", files);
}

function onFileInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  emit("select", files);
  target.value = "";
}
</script>
