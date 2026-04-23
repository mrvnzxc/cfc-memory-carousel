import { assertAdminPassword } from "../utils/admin";
import { enforceRateLimit } from "../utils/rateLimit";

export default defineEventHandler(async (event) => {
  enforceRateLimit(event);
  assertAdminPassword(event);
  return { success: true };
});
