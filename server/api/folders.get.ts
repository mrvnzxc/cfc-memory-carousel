import type { FolderRecord } from "~/types/db";
import { enforceRateLimit } from "../utils/rateLimit";
import { getSupabaseServerClient } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  enforceRateLimit(event);
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }

  return {
    folders: (data || []) as FolderRecord[]
  };
});
