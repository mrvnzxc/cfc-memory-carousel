import type { FolderRecord, ImageRecord } from "~/types/db";

export function useApi() {
  async function getFolders() {
    return await $fetch<{ folders: FolderRecord[] }>("/api/folders");
  }

  async function getImages(folderId?: string) {
    return await $fetch<{ images: ImageRecord[] }>("/api/images", {
      query: folderId ? { folder_id: folderId } : {}
    });
  }

  async function createFolder(name: string, adminPassword: string) {
    return await $fetch<{ folder: FolderRecord }>("/api/create-folder", {
      method: "POST",
      body: { name },
      headers: { "x-admin-password": adminPassword }
    });
  }

  async function deleteFolder(folderId: string, adminPassword: string) {
    return await $fetch<{ success: boolean }>("/api/delete-folder", {
      method: "DELETE",
      body: { folderId },
      headers: { "x-admin-password": adminPassword }
    });
  }

  async function verifyAdminPassword(adminPassword: string) {
    return await $fetch<{ success: boolean }>("/api/admin-verify", {
      method: "POST",
      headers: { "x-admin-password": adminPassword }
    });
  }

  async function getUploadUrl(payload: {
    fileName: string;
    mimeType: string;
    size: number;
    folderId: string;
  }) {
    return await $fetch<{
      uploadUrl: string;
      fileKey: string;
      fileUrl: string;
    }>("/api/upload-url", { method: "POST", body: payload });
  }

  async function saveImage(payload: {
    folderId: string;
    fileUrl: string;
    fileName: string;
    storageKey: string;
  }) {
    return await $fetch<{ image: ImageRecord }>("/api/save-image", {
      method: "POST",
      body: payload
    });
  }

  async function deleteImages(imageIds: string[], adminPassword: string) {
    return await $fetch<{ success: boolean }>("/api/delete-image", {
      method: "DELETE",
      body: { imageIds },
      headers: { "x-admin-password": adminPassword }
    });
  }

  return {
    getFolders,
    getImages,
    createFolder,
    deleteFolder,
    verifyAdminPassword,
    getUploadUrl,
    saveImage,
    deleteImages
  };
}
