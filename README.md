# Paper Checker

A portal for submitting and reviewing test answer sheets.

- **Students** log in with a login ID + password (created by the admin), open a
  test link, and take/upload a photo of their answer sheet.
- **Admin** logs in, manages the student roster, creates tests, and gets a
  shareable link per test. Submissions can be reviewed in a gallery per test.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind, Prisma + Postgres (via Vercel's
Storage integration), Vercel Blob for photos, custom cookie-based auth
(bcrypt + JWT).

## One-time setup (outside of code)

1. Push this project to a GitHub repo.
2. Create a free account at [vercel.com](https://vercel.com) (GitHub sign-in
   is easiest) and **import the repo** as a new project. Let the first deploy
   run even though it will fail (no database yet) — that's expected, and just
   creates the project.
3. In that Vercel project, go to the **Storage** tab:
   - **Create Database → Postgres** (this connects a free Postgres database,
     currently powered by Neon, to your project)
   - **Create Database → Blob** → set access to **Private** (this is where
     student photos get stored)
   Both automatically get connected to your project's environment variables.
4. Still in the Storage tab, open each store and find its **".env.local"**
   tab — copy the connection strings/token shown there. You'll need:
   - A pooled Postgres connection string → this becomes `DATABASE_URL`
   - A direct (non-pooled) Postgres connection string → this becomes
     `DIRECT_URL`
   - The Blob **read-write token** → this becomes `BLOB_READ_WRITE_TOKEN`
   (Exact variable names shown by Vercel may differ slightly from ours —
   just match pooled → `DATABASE_URL`, direct → `DIRECT_URL`.)
5. Copy `.env.example` to `.env.local` and fill in the values from step 4,
   plus:
   - `AUTH_SECRET` — any long random string (e.g. run
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
   - `ADMIN_USERS` — your admin login(s), format `loginId:password`,
     comma-separated for more than one admin
6. Install dependencies and set up the database:
   ```bash
   npm install
   npx prisma migrate dev --name init
   npm run db:seed   # optional: adds 2 demo student logins for local testing
   ```
7. Run it locally:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000, log in with your `ADMIN_USERS` credentials,
   and start adding students and creating tests.

   Note: photo uploads work locally, but the `onUploadCompleted` callback
   Vercel Blob sends after an upload only reaches a publicly reachable URL —
   it never fires on `localhost`. This app doesn't depend on it (the browser
   confirms the submission directly), so this is just for your awareness, not
   something to fix.

## Deploying (so students can access it from their phones)

1. In your Vercel project's **Settings → Environment Variables**, add
   `AUTH_SECRET` and `ADMIN_USERS` (the Postgres and Blob variables are
   already there from step 3 above).
2. Set the **Build Command** (Settings → Build & Development) to:
   ```
   prisma generate && prisma migrate deploy && next build
   ```
3. Push to GitHub (or click **Redeploy** in Vercel) to trigger a fresh
   deploy — it should succeed now that the database and Blob store are
   connected. Log in at your `*.vercel.app` URL with your admin credentials.

## Notes

- Each test = one shareable link = one chapter. Students don't pick a
  chapter — opening the link is enough context.
- Student passwords are only ever shown once (at creation or reset) — there's
  a "Reset password" action per student if one is forgotten.
- Deleting a student also deletes their submitted photos.
- Free tier limits: ~0.5 GB database, 5 GB Blob storage, 100 GB/month Blob
  data transfer — far more than 80 students submitting compressed photos will
  use.
