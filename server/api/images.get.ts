import type { ImageRecord } from "~/types/db";
import { enforceRateLimit } from "../utils/rateLimit";
import { getSupabaseServerClient } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  enforceRateLimit(event);
  const query = getQuery(event);
  const folderId = String(query.folder_id || "");
  const supabase = getSupabaseServerClient();

  let request = supabase
    .from("images")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (folderId) {
    request = request.eq("folder_id", folderId);
  }

  const { data, error } = await request;

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }

  return {
    images: (data || []) as ImageRecord[]
  };
});
