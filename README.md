# TV Tracker

Track TV watching sessions across devices with a simple dashboard and shared cloud data.

## Features

- Add TV sessions with date, start time, and end time
- Automatic per-session hour calculation (including overnight sessions)
- Dashboard with:
  - lifetime total hours
  - average daily hours
  - average weekly hours
  - total session count
- View and delete sessions from a table

## Live App

Add your deployed URL here:

`https://your-app-url.netlify.app`

## Tech Stack

- HTML, CSS, vanilla JavaScript
- Supabase Postgres
- Netlify/Vercel static deployment

## Notes

- Data is shared across devices via Supabase.
- Current version is intentionally simple and does not include login.

## Development

For full local setup, Supabase schema setup, env vars, and deploy configuration:

See `docs/DEVELOPMENT.md`.
