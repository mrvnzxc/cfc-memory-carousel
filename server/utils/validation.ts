const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

export function validateImagePayload(mimeType: string, size: number) {
  if (!ACCEPTED_MIME_TYPES.has(mimeType)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unsupported image type. Use jpg, png, or webp."
    });
  }

  if (size > MAX_IMAGE_SIZE_BYTES) {
    throw createError({
      statusCode: 400,
      statusMessage: "Image exceeds 3MB size limit."
    });
  }
}

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
}
