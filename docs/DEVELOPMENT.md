# Development Setup

This document contains full setup and deployment details for TV Tracker.

## 1) Supabase setup

1. Create a free project at https://supabase.com.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In `Project Settings -> API`, copy:
   - Project URL
   - `anon` public key

## 2) Environment variables

Create a `.env` file:

```bash
cp .env.example .env
```

Set values in `.env`:

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 3) Build

```bash
npm run build
```

Build output is written to `dist/`. During build, `dist/config.js` is generated from env vars.

## 4) Run locally

```bash
cd /Users/shyamramesh/Desktop/tvTracker
npm run build
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`.

## 5) Deploy (free)

### Netlify

1. Import repo from GitHub.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Redeploy.

### Vercel

1. Import repo from GitHub.
2. Framework preset: `Other`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
6. Redeploy.

## Troubleshooting

- `Identifier 'supabase' has already been declared`:
  ensure the app uses `supabaseClient` variable in `app.js`, then rebuild.
- `FileNotFoundError` when running `http.server` from inside `dist`:
  run from repo root with `--directory dist`.
- `Missing required env vars` during build:
  ensure `.env` exists and contains both required keys.

## Security note

Current setup keeps sharing simple (no login, RLS disabled on table).
Anyone with the app URL can potentially write data.

For private access, next step is Supabase Auth + RLS policies.
