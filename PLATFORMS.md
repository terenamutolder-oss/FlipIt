# Running FlipIt

FlipIt is a **web application**. You can run it in **Windows** (desktop or browser) or build for **Android** if you want a native app.

---

## Web (recommended)

Run locally in your browser:

```bash
npm install
npm run web
```

Then open **http://localhost:3000** (or the port shown). Data is stored in the browser (IndexedDB).

To deploy online, see **VERCEL.md** or **WEB_APP.md**.

---

## Windows

### Option A: Desktop app (Electron)

```bash
npm install
npm start
```

Opens FlipIt in a desktop window.

### Option B: In your browser

Same as **Web** above: `npm run web` → open localhost.

---

## Android (optional)

If you want a native Android app:

1. `npm install` then `npm run build:mobile`
2. `npm run cap:android` to open the project in Android Studio
3. Run on a device or emulator

For Play Store submission, see **APP_STORE.md**.

---

## Quick reference

| How to run | Command |
|------------|---------|
| **Web (browser)** | `npm run web` → open http://localhost:3000 |
| **Windows desktop** | `npm start` |
| **Android** | `npm run build:mobile` then `npm run cap:android` |
