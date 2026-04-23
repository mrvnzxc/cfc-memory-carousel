<template>
  <div class="flex min-h-screen flex-col">
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8 md:py-10">
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
        <div class="mb-4 flex items-center gap-3">
          <img :src="logoSrc" alt="CFC Logo" class="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12" />
          <h1 class="text-lg font-bold text-slate-900 sm:text-2xl">CFC Memory Carousel</h1>
        </div>
      <p class="mt-2 text-sm text-slate-600">
        Cronasians, please select your department first, then upload your images.
      </p>
      <p class="mt-3 rounded-lg bg-slate-50 p-3 text-xs italic text-slate-600 sm:text-sm">
        "Built for graduating Cronasians to share memories for our year-end collage and carousel."
      </p>

      <div class="mt-6">
        <FolderSelect
          v-model="selectedFolderId"
          :folders="folders"
          label-text="Select department"
          placeholder-text="Choose your department"
        />
      </div>

      <div class="mt-4">
        <UploadDropzone @select="onFilesSelected" />
      </div>

      <div v-if="queued.length" class="mt-6 space-y-3">
        <h2 class="text-sm font-semibold text-slate-700">Queued images</h2>
        <div
          v-for="item in queued"
          :key="item.id"
          class="rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <div class="mb-2 h-28 overflow-hidden rounded-md bg-slate-200">
            <img :src="item.previewUrl" :alt="item.file.name" class="h-full w-full object-cover" />
          </div>
          <div class="flex items-center justify-between text-sm">
            <p class="truncate font-medium text-slate-700">{{ item.file.name }}</p>
            <p class="text-xs text-slate-500">{{ item.status }}</p>
          </div>
          <div class="mt-2 h-2 rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-brand-500" :style="{ width: `${item.progress}%` }" />
          </div>
        </div>
        <button
          class="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 sm:w-auto"
          :disabled="uploading"
          @click="uploadAll"
        >
          {{ uploading ? "Uploading..." : "Upload all" }}
        </button>
      </div>
      </section>
    </main>
    <footer class="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500 sm:text-sm">
      All rights reserved. Developed by John Marvin Bautista.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { compressImage } from "~/utils/imageCompression";
import type { FolderRecord } from "~/types/db";

type QueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "queued" | "compressing" | "uploading" | "saved" | "failed";
};

const api = useApi();
const { showToast } = useToast();
const folders = ref<FolderRecord[]>([]);
const selectedFolderId = ref("");
const queued = ref<QueueItem[]>([]);
const uploading = ref(false);
const logoSrc = "/cfc.jpg";

await refreshFolders();

async function refreshFolders() {
  const { folders: fetchedFolders } = await api.getFolders();
  folders.value = fetchedFolders;
}

function onFilesSelected(files: File[]) {
  const accepted = files.filter((file) =>
    ["image/jpeg", "image/png", "image/webp"].includes(file.type)
  );

  const mapped = accepted.map((file) => ({
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    progress: 0,
    status: "queued" as const
  }));

  queued.value = [...queued.value, ...mapped];

  if (accepted.length !== files.length) {
    showToast("Some files were skipped. Only jpg/png/webp are allowed.", "error");
  }
}

async function uploadAll() {
  if (!selectedFolderId.value) {
    showToast("Please select a department before uploading.", "error");
    return;
  }

  uploading.value = true;
  for (const item of queued.value) {
    if (item.status === "saved") {
      continue;
    }
    try {
      item.status = "compressing";
      item.progress = 10;
      const compressed = await compressImage(item.file);

      item.status = "uploading";
      item.progress = 35;
      const signed = await api.getUploadUrl({
        fileName: compressed.name,
        mimeType: compressed.type,
        size: compressed.size,
        folderId: selectedFolderId.value
      });

      await uploadToSignedUrl(signed.uploadUrl, compressed, (progress) => {
        item.progress = Math.max(35, progress);
      });

      await api.saveImage({
        folderId: selectedFolderId.value,
        fileName: compressed.name,
        fileUrl: signed.fileUrl,
        storageKey: signed.fileKey
      });

      item.progress = 100;
      item.status = "saved";
    } catch (error: any) {
      item.status = "failed";
      showToast(error?.data?.statusMessage || error?.message || "Upload failed", "error");
    }
  }

  uploading.value = false;
  queued.value = queued.value.filter((item) => item.status !== "saved");
  showToast("Upload process finished.", "success");
}

function uploadToSignedUrl(
  url: string,
  file: File,
  onProgress: (value: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.setRequestHeader("Content-Type", file.type);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress(progress);
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }
      reject(
        new Error(
          `Storage upload failed (${request.status}): ${request.responseText || "No details"}`
        )
      );
    };

    request.onerror = () => reject(new Error("Network upload error"));
    request.send(file);
  });
}
</script>
