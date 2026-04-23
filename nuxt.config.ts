export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    adminPassword: process.env.ADMIN_PASSWORD,
    storage: {
      endpoint: process.env.STORAGE_ENDPOINT,
      region: process.env.STORAGE_REGION,
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
      bucketName: process.env.STORAGE_BUCKET_NAME,
      publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL
    },
    rateLimit: {
      maxRequestsPerMinute: Number(process.env.RATE_LIMIT_MAX_PER_MINUTE || 120)
    }
  },
  typescript: {
    strict: true
  },
  modules: []
});
