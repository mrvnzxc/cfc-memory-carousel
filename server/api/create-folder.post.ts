import { assertAdminPassword } from "../utils/admin";
import { enforceRateLimit } from "../utils/rateLimit";
import { getSupabaseServerClient } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  enforceRateLimit(event);
  assertAdminPassword(event);
  const body = await readBody<{ name?: string }>(event);

  if (!body.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Folder name is required"
    });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("folders")
    .insert({ name: body.name.trim() })
    .select("*")
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }

  return { folder: data };
});
