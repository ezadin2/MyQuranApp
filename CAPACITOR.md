# Mobile app (Capacitor)

This project uses [Capacitor](https://capacitorjs.com/) to wrap the **same Next.js app** in a native shell (Android / iOS).

Because the app uses **Next.js server routes**, Auth.js, and Neon, the WebView loads your app from a **live URL** (not a static export).

## Prerequisites

- **Node.js 18+**
- **Deployed HTTPS URL** (e.g. Vercel) for production builds, **or** local dev server for testing
- **Android:** [Android Studio](https://developer.android.com/studio) + SDK
- **iOS:** Mac + Xcode (optional on Linux)

## One-time setup

```bash
npm install --legacy-peer-deps
npm run cap:sync
```

Uses **Capacitor 6** (works with Node 18). Capacitor 8+ requires Node 22.

Default app URL in `capacitor.config.ts`:

1. `CAPACITOR_SERVER_URL` (env, for local testing)
2. else `NEXT_PUBLIC_APP_URL` from `.env.local`
3. else `https://quraany-app.vercel.app`

Point production at **your** deployment:

```bash
# .env.local
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Run on Android (local dev)

**Why not `localhost`?** On a phone, `localhost` means the phone itself — not your PC. The WebView cannot reach your dev server unless you use the correct host:

| Target | URL Capacitor should load |
|--------|---------------------------|
| Physical phone (same Wi‑Fi) | `http://YOUR_PC_LAN_IP:3000` (e.g. `192.168.1.10`) |
| Android emulator | `http://10.0.2.2:3000` (special alias for your PC) |
| iOS Simulator (Mac) | `http://127.0.0.1:3000` |

1. Start Next.js so other devices can connect:

   ```bash
   npm run dev:mobile
   ```

2. Sync Capacitor (picks the right URL automatically):

   ```bash
   # Real phone on Wi‑Fi
   npm run cap:dev:device

   # Android emulator
   npm run cap:dev:emulator
   ```

3. Open Android Studio and run:

   ```bash
   npm run cap:open:android
   ```

Manual override: `CAPACITOR_SERVER_URL=http://192.168.1.10:3000 npm run cap:sync`

## Production mobile build

The phone app loads a **live HTTPS site** (not your PC). Default: `https://quraany-app.vercel.app`.

Do this from the repo root (`nextjs-quran-app` folder that contains this file’s parent `package.json`):

```bash
npm run cap:prod:android
```

That runs `cap sync` with the production URL (ignores `.env.local` localhost), then opens Android Studio.

To point at **your own** Vercel URL instead:

```bash
# PowerShell
$env:CAPACITOR_SERVER_URL="https://your-app.vercel.app"
npm run cap:sync
npm run cap:open:android
```

Then in **Android Studio**:

1. Wait for Gradle to finish.
2. Choose your phone (USB) or an emulator.
3. **Run ▶** to install a debug APK.
4. For Play Store: **Build → Generate Signed App Bundle / APK**.

The phone needs internet. Bookmarks/favorites stay on the device; Quran pages come from the HTTPS site.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run cap:sync` | Copy web assets + update native projects |
| `npm run cap:prod` | Sync Capacitor to `https://quraany-app.vercel.app` |
| `npm run cap:prod:android` | Production sync + open Android Studio |
| `npm run cap:open:android` | Open Android Studio |
| `npm run cap:open:ios` | Open Xcode (macOS only) |

## Notes

- Bookmarks, favorites, and stats are stored on the device (local storage / Capacitor Preferences).
- For store review, use a **stable HTTPS** deployment, not `localhost`.
- To change app id / name, edit `capacitor.config.ts` (`appId`, `appName`).
