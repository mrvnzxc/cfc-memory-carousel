export function requireEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing required environment variable: ${key}`
    });
  }

  return value;
}
