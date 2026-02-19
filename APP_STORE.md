# Publishing FlipIt to Google Play (Android)

FlipIt can be built as a native **Android** app with Capacitor and published to the Google Play Store. The main way to use FlipIt is as a **web application** (see **VERCEL.md** / **WEB_APP.md**).

## Prerequisites

- [Android Studio](https://developer.android.com/studio) and JDK 17+
- [Google Play Developer](https://play.google.com/console) account ($25 one-time)

## Build the Android app

From the project root:

```bash
npm run build:mobile
```

This copies the web app into `www/` and syncs it to the `android/` project. Run this whenever you change HTML, CSS, or JS.

## Open in Android Studio

```bash
npm run cap:android
```

In Android Studio:

- Wait for Gradle sync to finish.
- **Build → Generate Signed Bundle / APK** and create a keystore (or use an existing one).
- Build an **Android App Bundle** (.aab) for release.

## Submit to Google Play

1. In [Google Play Console](https://play.google.com/console), create an app and fill in the store listing (description, screenshots, icon).
2. Upload the .aab under **Release → Production** (or a testing track first).
3. Complete content rating and privacy policy if required, then submit for review.

## App ID

The Application ID is set in `android/app/build.gradle` (default `com.flipit.app`). Change it to your own (e.g. `com.yourcompany.flipit`) before publishing.

## Useful commands

| Command | Description |
|--------|-------------|
| `npm run build:mobile` | Copy web app to `www/` and sync to Android |
| `npm run cap:sync` | Same as above |
| `npm run cap:android` | Open Android project in Android Studio |
