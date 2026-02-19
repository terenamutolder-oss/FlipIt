# Deploy FlipIt to Vercel (Web Application)

FlipIt is set up to run as a **static web application** on Vercel. No build step; Vercel serves your files and the SPA rewrite sends all routes to `index.html`.

---

## Deploy in a few steps

### 1. Push the project to GitHub

If you haven’t already:

```bash
git add .
git commit -m "FlipIt web app for Vercel"
git remote add origin https://github.com/YOUR_USERNAME/FlipIt.git
git push -u origin main
```

(Use your repo URL and branch name.)

### 2. Import the project on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in (GitHub is easiest).
2. Click **Add New… → Project**.
3. **Import** the repository that contains FlipIt (e.g. `YOUR_USERNAME/FlipIt`).
4. Leave the defaults:
   - **Framework Preset:** Other (or leave as detected).
   - **Root Directory:** `./` (project root).
   - **Build Command:** empty (the repo’s `vercel.json` sets `buildCommand: null`).
   - **Output Directory:** `.` (handled by `vercel.json`).
5. Click **Deploy**.

### 3. Use your live app

When the deployment finishes, Vercel gives you a URL like:

**https://flipit-xxxx.vercel.app**

Open it in a browser. You can log in, create cards, and use the app. Data is stored in the browser (IndexedDB) per device.

---

## What the repo’s `vercel.json` does

- **buildCommand: null** – No build; Vercel serves the repo as static files.
- **outputDirectory: "."** – Root directory is the “output” (where `index.html`, `css/`, `js/`, etc. live).
- **rewrites** – Any path (e.g. `/settings`, `/review`) is served with `index.html` so the single-page app routing works.
- **headers** – Adds basic security headers (e.g. `X-Content-Type-Options`, `X-Frame-Options`).

---

## Custom domain (optional)

In the Vercel project: **Settings → Domains** → add your domain and follow the DNS instructions.

---

## After you change the app

Push to the same branch (e.g. `main`). Vercel will redeploy automatically and your web application will update.

---

**Summary:** Push FlipIt to GitHub, import the repo in Vercel, deploy. The app runs as a web application on Vercel with no extra build step.
