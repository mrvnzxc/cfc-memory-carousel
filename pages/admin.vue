<template>
  <div class="flex min-h-screen flex-col">
    <main class="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center px-4 py-6 sm:py-8 md:py-10">
      <section class="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h1 class="text-center text-xl font-bold text-slate-900 sm:text-2xl">Admin Dashboard</h1>
        <p class="mt-2 text-center text-sm text-slate-600">
          Manage departments and image downloads.
        </p>

      <div v-if="!isAuthorized" class="mx-auto mt-6 max-w-md space-y-3">
        <input
          v-model="passwordInput"
          type="password"
          class="w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Admin password"
        />
        <button
          class="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white sm:w-auto"
          @click="login"
        >
          Enter Admin
        </button>
      </div>

      <div v-else class="mx-auto mt-6 w-full max-w-5xl space-y-6">
        <div class="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            v-model="newFolderName"
            class="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="New department name"
          />
          <button
            class="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white sm:w-auto"
            @click="onCreateFolder"
          >
            Create Department
          </button>
          <button class="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm sm:w-auto" @click="logout">
            Logout
          </button>
        </div>

        <FolderSelect
          v-model="selectedFolderId"
          :folders="folders"
          label-text="Select department"
          placeholder-text="Choose a department"
        />
        <div class="flex flex-wrap gap-2">
          <button
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto"
            @click="refreshImages"
          >
            Refresh
          </button>
          <button
            class="w-full rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700 disabled:opacity-50 sm:w-auto"
            :disabled="!selectedFolderId"
            @click="onDeleteFolder"
          >
            Delete Selected Department
          </button>
          <button
            class="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50 sm:w-auto"
            :disabled="!selectedImages.length"
            @click="downloadZip"
          >
            Download Selected ZIP
          </button>
          <button
            class="w-full rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700 disabled:opacity-50 sm:w-auto"
            :disabled="!selectedImages.length"
            @click="deleteSelectedImages"
          >
            Delete Selected Images
          </button>
        </div>

        <div v-if="selectedFolderId" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ImageCard
            v-for="image in filteredImages"
            :key="image.id"
            :image="image"
            :selectable="true"
            :selected="selectedImages.includes(image.id)"
            @toggle="toggleSelection"
            @preview="openPreview"
          />
        </div>

        <div v-else class="space-y-6">
          <div v-for="group in groupedImages" :key="group.folderId">
            <h3 class="mb-3 text-sm font-semibold text-slate-700">{{ group.folderName }}</h3>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ImageCard
                v-for="image in group.images"
                :key="image.id"
                :image="image"
                :selectable="true"
                :selected="selectedImages.includes(image.id)"
                @toggle="toggleSelection"
                @preview="openPreview"
              />
            </div>
          </div>
        </div>
      </div>
      </section>
    </main>
    <div
      v-if="currentPreviewImage"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
      @click.self="closePreview"
    >
      <button
        type="button"
        class="absolute right-3 top-3 rounded-full bg-white/20 px-3 py-1 text-white hover:bg-white/30"
        @click="closePreview"
      >
        ✕
      </button>
      <button
        type="button"
        class="absolute left-2 rounded-full bg-white/20 px-3 py-2 text-xl text-white hover:bg-white/30 sm:left-4"
        @click="previewPrevious"
      >
        &lt;
      </button>
      <button
        type="button"
        class="absolute right-2 rounded-full bg-white/20 px-3 py-2 text-xl text-white hover:bg-white/30 sm:right-4"
        @click="previewNext"
      >
        &gt;
      </button>
      <div class="w-full max-w-5xl rounded-2xl bg-slate-900 p-3 sm:p-5">
        <img
          :src="currentPreviewImage.file_url"
          :alt="currentPreviewImage.file_name"
          class="max-h-[70vh] w-full rounded-lg object-contain"
        />
        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p class="truncate text-sm text-slate-100">{{ currentPreviewImage.file_name }}</p>
          <button
            type="button"
            class="rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-200 hover:bg-rose-900/30"
            @click="deletePreviewImage"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    <footer class="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500 sm:text-sm">
      All rights reserved. Developed by John Marvin Bautista.
    </footer>
  </div>
</template>

<script setup lang="ts">
import JSZip from "jszip";
import type { FolderRecord, ImageRecord } from "~/types/db";

const api = useApi();
const { showToast } = useToast();
const { password, setPassword, clearPassword } = useAdmin();

const passwordInput = ref(password.value);
const isAuthorized = ref(false);
const folders = ref<FolderRecord[]>([]);
const images = ref<ImageRecord[]>([]);
const selectedFolderId = ref("");
const selectedImages = ref<string[]>([]);
const newFolderName = ref("");
const previewImageId = ref<string | null>(null);

if (password.value) {
  await attemptAuth(password.value);
}

if (isAuthorized.value) {
  await refreshFolders();
  await refreshImages();
}

const filteredImages = computed(() => {
  if (!selectedFolderId.value) {
    return images.value;
  }
  return images.value.filter((image) => image.folder_id === selectedFolderId.value);
});

const groupedImages = computed(() => {
  const byFolder = new Map<string, ImageRecord[]>();
  for (const image of images.value) {
    const current = byFolder.get(image.folder_id) || [];
    current.push(image);
    byFolder.set(image.folder_id, current);
  }

  return folders.value.map((folder) => ({
    folderId: folder.id,
    folderName: folder.name,
    images: byFolder.get(folder.id) || []
  }));
});

const previewImages = computed(() =>
  selectedFolderId.value ? filteredImages.value : images.value
);

const currentPreviewIndex = computed(() =>
  previewImages.value.findIndex((image) => image.id === previewImageId.value)
);

const currentPreviewImage = computed(() => {
  if (currentPreviewIndex.value < 0) {
    return null;
  }
  return previewImages.value[currentPreviewIndex.value] || null;
});

async function login() {
  await attemptAuth(passwordInput.value);
}

async function attemptAuth(input: string) {
  try {
    await api.verifyAdminPassword(input);
    setPassword(input);
    isAuthorized.value = true;
    showToast("Admin authenticated", "success");
    await refreshFolders();
    await refreshImages();
  } catch {
    isAuthorized.value = false;
    showToast("Invalid admin password", "error");
  }
}

function logout() {
  clearPassword();
  passwordInput.value = "";
  isAuthorized.value = false;
}

async function refreshFolders() {
  const { folders: data } = await api.getFolders();
  folders.value = data;
}

async function refreshImages() {
  const { images: data } = await api.getImages();
  images.value = data;
}

function toggleSelection(id: string) {
  if (selectedImages.value.includes(id)) {
    selectedImages.value = selectedImages.value.filter((value) => value !== id);
    return;
  }
  selectedImages.value = [...selectedImages.value, id];
}

function openPreview(id: string) {
  previewImageId.value = id;
}

function closePreview() {
  previewImageId.value = null;
}

function previewNext() {
  if (!previewImages.value.length || currentPreviewIndex.value < 0) {
    return;
  }
  const nextIndex = (currentPreviewIndex.value + 1) % previewImages.value.length;
  previewImageId.value = previewImages.value[nextIndex].id;
}

function previewPrevious() {
  if (!previewImages.value.length || currentPreviewIndex.value < 0) {
    return;
  }
  const previousIndex =
    (currentPreviewIndex.value - 1 + previewImages.value.length) % previewImages.value.length;
  previewImageId.value = previewImages.value[previousIndex].id;
}

async function onCreateFolder() {
  if (!newFolderName.value.trim()) {
    showToast("Department name is required", "error");
    return;
  }
  await api.createFolder(newFolderName.value, password.value);
  newFolderName.value = "";
  await refreshFolders();
  showToast("Department created", "success");
}

async function onDeleteFolder() {
  if (!selectedFolderId.value) {
    return;
  }
  await api.deleteFolder(selectedFolderId.value, password.value);
  selectedFolderId.value = "";
  await refreshFolders();
  await refreshImages();
  showToast("Department deleted", "success");
}

async function downloadZip() {
  const zip = new JSZip();
  const selected = images.value.filter((image) => selectedImages.value.includes(image.id));

  await Promise.all(
    selected.map(async (image) => {
      const response = await fetch(image.file_url);
      const blob = await response.blob();
      zip.file(image.file_name, blob);
    })
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `images-${Date.now()}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}

async function deleteSelectedImages() {
  await api.deleteImages(selectedImages.value, password.value);
  selectedImages.value = [];
  await refreshImages();
  showToast("Selected images deleted", "success");
}

async function deletePreviewImage() {
  if (!currentPreviewImage.value) {
    return;
  }
  const deletingId = currentPreviewImage.value.id;
  await api.deleteImages([deletingId], password.value);
  selectedImages.value = selectedImages.value.filter((id) => id !== deletingId);
  await refreshImages();
  if (!previewImages.value.length) {
    closePreview();
    return;
  }
  const fallbackIndex = Math.min(currentPreviewIndex.value, previewImages.value.length - 1);
  previewImageId.value = previewImages.value[fallbackIndex]?.id || null;
  showToast("Image deleted", "success");
}

function onKeydown(event: KeyboardEvent) {
  if (!currentPreviewImage.value) {
    return;
  }
  if (event.key === "Escape") {
    closePreview();
  } else if (event.key === "ArrowRight") {
    previewNext();
  } else if (event.key === "ArrowLeft") {
    previewPrevious();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>
