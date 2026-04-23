import { requireEnv } from "./env";

export function assertAdminPassword(event: Parameters<typeof getHeader>[0]) {
  const config = useRuntimeConfig();
  const expectedPassword = requireEnv(config.adminPassword, "ADMIN_PASSWORD");
  const providedPassword = getHeader(event, "x-admin-password");

  if (!providedPassword || providedPassword !== expectedPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid admin password"
    });
  }
}
