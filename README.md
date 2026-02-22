# TV Tracker (Shared Across Devices)

This app tracks TV sessions across devices using Supabase.

## Features

- Dashboard: lifetime total hours, average daily, average weekly
- Sessions page: add sessions (`date`, `start`, `end`) and view/delete all entries

## 1) Create a free Supabase project

1. Create a project at https://supabase.com.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In `Project Settings -> API`, copy:
   - Project URL
   - `anon` public key

## 2) Configure local env vars

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env`:

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 3) Build (injects env vars into `dist/config.js`)

```bash
npm run build
```

This creates `dist/` with static files + generated `dist/config.js` using `.env`.

## 4) Test locally

```bash
npm run build
cd dist
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## 5) Deploy for free

### Option A: Netlify

1. Push repo to GitHub.
2. In Netlify, import the repo.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. In Site settings -> Environment variables, add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
6. Redeploy.

### Option B: Vercel

1. Push repo to GitHub.
2. Import repo in Vercel.
3. Framework preset: `Other`.
4. Build command: `npm run build`
5. Output directory: `dist`
6. In Project Settings -> Environment Variables, add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
7. Redeploy.

## Security note

- This app currently uses a table with RLS disabled for simplest sharing.
- Anyone with your app URL can potentially write data.
- For private access, next step is Supabase Auth + RLS policies.
