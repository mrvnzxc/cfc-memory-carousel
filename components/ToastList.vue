<template>
  <div class="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
    <div
      v-for="toast in items"
      :key="toast.id"
      class="rounded-lg border px-4 py-3 text-sm shadow-lg"
      :class="toastClass(toast.type)"
    >
      <div class="flex items-center justify-between gap-4">
        <p>{{ toast.message }}</p>
        <button class="text-xs opacity-75 hover:opacity-100" @click="dismissToast(toast.id)">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, dismissToast } = useToast();

function toastClass(type: "success" | "error" | "info") {
  if (type === "success") {
    return "border-emerald-300 bg-emerald-50 text-emerald-800";
  }
  if (type === "error") {
    return "border-rose-300 bg-rose-50 text-rose-800";
  }
  return "border-blue-300 bg-blue-50 text-blue-800";
}
</script>
