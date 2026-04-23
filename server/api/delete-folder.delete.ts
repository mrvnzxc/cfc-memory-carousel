import { assertAdminPassword } from "../utils/admin";
import { enforceRateLimit } from "../utils/rateLimit";
import { getSupabaseServerClient } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  enforceRateLimit(event);
  assertAdminPassword(event);
  const body = await readBody<{ folderId?: string }>(event);

  if (!body.folderId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing folder id"
    });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("folders").delete().eq("id", body.folderId);

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }

  return { success: true };
});
