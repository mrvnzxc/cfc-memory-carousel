import { assertAdminPassword } from "../utils/admin";
import { enforceRateLimit } from "../utils/rateLimit";
import { deleteFromStorage } from "../utils/storage";
import { getSupabaseServerClient } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  enforceRateLimit(event);
  assertAdminPassword(event);
  const body = await readBody<{ imageIds?: string[] }>(event);
  const imageIds = body.imageIds || [];

  if (!imageIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "No images selected for deletion"
    });
  }

  const supabase = getSupabaseServerClient();
  const { data: images, error: readError } = await supabase
    .from("images")
    .select("id,storage_key")
    .in("id", imageIds);

  if (readError) {
    throw createError({
      statusCode: 500,
      statusMessage: readError.message
    });
  }

  await Promise.all((images || []).map((image) => deleteFromStorage(image.storage_key)));

  const { error: deleteError } = await supabase.from("images").delete().in("id", imageIds);

  if (deleteError) {
    throw createError({
      statusCode: 500,
      statusMessage: deleteError.message
    });
  }

  return { success: true };
});
