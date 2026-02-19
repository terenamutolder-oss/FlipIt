# FlipIt as a Web Application

FlipIt is a **web application**: open it in any modern browser. No install required when you use the hosted version. You can also run it locally or deploy it yourself.

---

## Run locally (this computer)

From the project folder:

```bash
npm install
npm run web
```

Then open **http://localhost:3000** (or the port shown) in your browser. Data is stored in the browser (IndexedDB).

---

## Use as a PWA (install in browser)

When the app is served over **HTTPS** (e.g. after deployment or with a local HTTPS tunnel):

- **Chrome / Edge:** Use the “Install” icon in the address bar or **⋮ → Install FlipIt**.
- **Safari (mobile):** **Share → Add to Home Screen**.

The app will open in a standalone window and work offline (cached assets).

---

## Deploy to the web (host it yourself)

The app is static (HTML, CSS, JS). Deploy the **project root** (the folder that contains `index.html`, `css/`, `js/`, `images/`, `manifest.json`, `sw.js`) to any static host.

### Netlify

1. Push the project to **GitHub** (or GitLab/Bitbucket).
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import an existing project**.
3. Connect the repo; Netlify will use the included `netlify.toml` (publish: `.`, SPA redirect).
4. Deploy. Your site will be at `https://your-site-name.netlify.app`.

### Vercel

1. Push the project to **GitHub**.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** and import the repo.
3. Vercel will use the included `vercel.json` (all routes → `index.html`).
4. Deploy. Your site will be at `https://your-project.vercel.app`.

### GitHub Pages

1. Push the project to a **GitHub** repository.
2. **Settings → Pages** → Source: **Deploy from a branch**.
3. Branch: `main` (or your default), folder: **/ (root)**.
4. Save. The site will be at `https://your-username.github.io/your-repo-name/`.

   If the site is in a **subpath** (e.g. `/FlipIt/`), add a `<base href="/FlipIt/">` in `index.html` inside `<head>` so assets load correctly. For a **user/org site** (e.g. `username.github.io`), the repo is usually named `username.github.io` and the site is at the root, so no base tag is needed.

---

## What’s included for the web

- **Single-page app** – All views (auth, home, create, review, settings) in one HTML file; no server-side routing needed.
- **PWA** – `manifest.json` and `sw.js` for install prompt and offline caching.
- **Static** – No backend required; auth and data are local (IndexedDB). Optional Firebase can be configured in `js/firebase-config.js`.

You can use FlipIt as a web application by running it locally with `npm run web` or by deploying the project to Netlify, Vercel, or GitHub Pages as above.
