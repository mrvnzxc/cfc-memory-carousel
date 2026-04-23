import { enforceRateLimit } from "../utils/rateLimit";
import { getSupabaseServerClient } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  enforceRateLimit(event);
  const body = await readBody<{
    folderId?: string;
    fileUrl?: string;
    fileName?: string;
    storageKey?: string;
  }>(event);

  if (!body.folderId || !body.fileUrl || !body.fileName || !body.storageKey) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing metadata fields"
    });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("images")
    .insert({
      folder_id: body.folderId,
      file_url: body.fileUrl,
      file_name: body.fileName,
      storage_key: body.storageKey
    })
    .select("*")
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }

  return { image: data };
});
