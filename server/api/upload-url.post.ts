import { randomUUID } from "node:crypto";
import { enforceRateLimit } from "../utils/rateLimit";
import { getPresignedUploadUrl } from "../utils/storage";
import { getSupabaseServerClient } from "../utils/supabase";
import { sanitizeFileName, validateImagePayload } from "../utils/validation";

export default defineEventHandler(async (event) => {
  enforceRateLimit(event);
  const body = await readBody<{
    fileName?: string;
    mimeType?: string;
    size?: number;
    folderId?: string;
  }>(event);

  if (!body.fileName || !body.mimeType || !body.size || !body.folderId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required upload payload fields"
    });
  }

  validateImagePayload(body.mimeType, body.size);
  const supabase = getSupabaseServerClient();
  const { data: folderExists } = await supabase
    .from("folders")
    .select("id")
    .eq("id", body.folderId)
    .maybeSingle();

  if (!folderExists) {
    throw createError({
      statusCode: 400,
      statusMessage: "Selected folder does not exist."
    });
  }

  const cleanedName = sanitizeFileName(body.fileName);
  const fileKey = `${body.folderId}/${Date.now()}-${randomUUID()}-${cleanedName}`;
  const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
    fileKey,
    mimeType: body.mimeType
  });

  return {
    uploadUrl,
    fileKey,
    fileUrl: publicUrl
  };
});
