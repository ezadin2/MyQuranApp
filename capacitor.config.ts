import type { CapacitorConfig } from "@capacitor/cli";
import { execSync } from "node:child_process";
import path from "node:path";

const capUrlScript = path.join(process.cwd(), "scripts", "cap-server-url.mjs");

/**
 * Capacitor WebView loads your Next.js app from a live URL (not bundled static files).
 *
 * IMPORTANT — "localhost" on mobile:
 * - Physical phone: localhost = the phone itself → your PC is NOT reachable.
 *   Use your PC's LAN IP, e.g. http://192.168.1.10:3000
 * - Android emulator: use http://10.0.2.2:3000 (alias for the host machine)
 * - iOS Simulator (Mac): http://127.0.0.1:3000 works
 *
 * Quick sync:
 *   npm run cap:dev:device      # real phone on Wi‑Fi
 *   npm run cap:dev:emulator    # Android emulator
 *
 * Or set CAPACITOR_SERVER_URL explicitly before cap sync.
 */
type CapTarget = "device" | "emulator" | "ios-simulator";

function runCapUrlScript(target: CapTarget): string {
  return execSync(`node "${capUrlScript}" ${target}`, { encoding: "utf8" }).trim();
}

function replaceLocalhost(url: string, target: CapTarget): string {
  if (!/localhost|127\.0\.0\.1/i.test(url)) return url;

  if (target === "emulator") {
    return url.replace(/localhost|127\.0\.0\.1/i, "10.0.2.2");
  }

  if (target === "ios-simulator") {
    return url.replace(/localhost/i, "127.0.0.1");
  }

  const ip = execSync(`node "${capUrlScript}" device-ip`, { encoding: "utf8" }).trim();
  return url.replace(/localhost|127\.0\.0\.1/i, ip);
}

function resolveServerUrl(): string {
  const target = process.env.CAPACITOR_TARGET as CapTarget | undefined;

  if (process.env.CAPACITOR_SERVER_URL) {
    const url = process.env.CAPACITOR_SERVER_URL;
    return target ? replaceLocalhost(url, target) : url;
  }

  if (target) {
    return runCapUrlScript(target);
  }

  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) {
    if (/localhost|127\.0\.0\.1/i.test(fromEnv)) {
      console.warn(
        `[capacitor] NEXT_PUBLIC_APP_URL is "${fromEnv}" — localhost does not work on a physical phone.\n` +
          `  Run: npm run cap:dev:device   (Wi‑Fi phone)\n` +
          `   or: npm run cap:dev:emulator (Android emulator)\n` +
          `  Falling back to LAN IP for device target.`
      );
      return replaceLocalhost(fromEnv, "device");
    }
    return fromEnv;
  }

  return `https://quraany-app.vercel.app`;
}

const serverUrl = resolveServerUrl();

if (/localhost|127\.0\.0\.1/i.test(serverUrl) && process.env.CAPACITOR_TARGET === "device") {
  console.warn(
    `[capacitor] Server URL is still "${serverUrl}". On a real device this will fail — use npm run cap:dev:device.`
  );
}

const config: CapacitorConfig = {
  appId: "com.qurany.app",
  appName: "Al-Qur'an Al-Kareem",
  webDir: "capacitor-www",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
    androidScheme: "https",
  },
  android: {
    allowMixedContent: serverUrl.startsWith("http://"),
  },
};

console.log(`[capacitor] WebView server URL → ${serverUrl}`);

export default config;
