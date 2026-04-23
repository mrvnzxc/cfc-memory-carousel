# Nuxt Image Upload Portal

Public image upload portal with admin image management.

## Stack

- Nuxt 3 + TypeScript
- Tailwind CSS
- Supabase (Postgres metadata)
- Cloudflare R2 or AWS S3 (object storage)

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Run SQL from `supabase/schema.sql` in Supabase SQL editor.
3. Install dependencies:

```bash
npm install
```

4. Start development server:

```bash
npm run dev
```

## API Endpoints

- `POST /api/upload-url`
- `POST /api/save-image`
- `DELETE /api/delete-image`
- `POST /api/create-folder`
- `DELETE /api/delete-folder`
- `GET /api/folders`
- `GET /api/images?folder_id=...`
- `POST /api/admin-verify`

## Notes

- Admin area is `/admin` and uses env password header.
- Public uploader is `/`.
- File size limit is 3MB after browser compression.
