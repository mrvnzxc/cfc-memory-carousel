const buckets = new Map<string, { count: number; resetAt: number }>();

export function enforceRateLimit(event: Parameters<typeof getRequestIP>[0]) {
  const config = useRuntimeConfig();
  const maxRequests = config.rateLimit.maxRequestsPerMinute;
  const now = Date.now();
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const key = `${event.path}:${ip}`;

  const currentBucket = buckets.get(key);

  if (!currentBucket || currentBucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }

  if (currentBucket.count >= maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: "Rate limit exceeded. Please try again soon."
    });
  }

  currentBucket.count += 1;
  buckets.set(key, currentBucket);
}
