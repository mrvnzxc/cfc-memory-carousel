import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

let cachedClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseServerClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = useRuntimeConfig();
  const supabaseUrl = requireEnv(config.supabaseUrl, "SUPABASE_URL");
  const serviceRoleKey = requireEnv(
    config.supabaseServiceRoleKey,
    "SUPABASE_SERVICE_ROLE_KEY"
  );

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });

  return cachedClient;
}
