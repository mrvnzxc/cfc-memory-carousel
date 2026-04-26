import JSZip from "jszip";
import { assertAdminPassword } from "../utils/admin";
import { enforceRateLimit } from "../utils/rateLimit";
import { getObjectBuffer } from "../utils/storage";
import { getSupabaseServerClient } from "../utils/supabase";
import { sanitizeFileName } from "../utils/validation";

const MAX_IMAGES_PER_ZIP = 400;
/** Avoid hundreds of parallel R2/S3 connections (browser + Node can hit ERR_INSUFFICIENT_RESOURCES). */
const ZIP_DOWNLOAD_CONCURRENCY = 4;

export default defineEventHandler(async (event) => {
  enforceRateLimit(event);
  assertAdminPassword(event);

  const body = await readBody<{ imageIds?: string[] }>(event);
  const imageIds = body.imageIds || [];

  if (!imageIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "No images selected"
    });
  }

  if (imageIds.length > MAX_IMAGES_PER_ZIP) {
    throw createError({
      statusCode: 400,
      statusMessage: `At most ${MAX_IMAGES_PER_ZIP} images per download`
    });
  }

  const supabase = getSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("images")
    .select("id,file_name,storage_key")
    .in("id", imageIds);

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }

  if (!rows?.length) {
    throw createError({
      statusCode: 404,
      statusMessage: "No matching images found"
    });
  }

  const zip = new JSZip();
  const queue = [...rows];

  async function worker() {
    while (queue.length) {
      const image = queue.shift();
      if (!image) {
        return;
      }
      try {
        const buf = await getObjectBuffer(image.storage_key);
        const base = sanitizeFileName(image.file_name) || "image";
        const entryName = `${String(image.id).slice(0, 8)}-${base}`;
        zip.file(entryName, buf);
      } catch (cause) {
        throw createError({
          statusCode: 502,
          statusMessage: `Could not read ${image.file_name} from storage`,
          cause
        });
      }
    }
  }

  const workers = Math.min(ZIP_DOWNLOAD_CONCURRENCY, rows.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));

  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  setHeader(event, "Content-Type", "application/zip");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="images-${Date.now()}.zip"`
  );

  return buffer;
});
