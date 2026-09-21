#!/usr/bin/env node
/**
 * One command: start Next.js (if needed) + sync Capacitor + open Android Studio.
 *
 * Modes (npm run mobile:android -- [mode]):
 *   auto      — USB adb reverse if phone plugged in, else emulator, else Wi‑Fi [default]
 *   usb       — phone over USB (adb reverse → localhost works on device)
 *   emulator  — Android emulator (10.0.2.2)
 *   wifi      — phone on same Wi‑Fi (LAN IP)
 */
import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCapServerUrl } from "./cap-server-url.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PORT ?? process.env.CAPACITOR_DEV_PORT ?? "3000";

function findAdb() {
  if (process.env.ANDROID_HOME) {
    const adb = path.join(process.env.ANDROID_HOME, "platform-tools", process.platform === "win32" ? "adb.exe" : "adb");
    if (fs.existsSync(adb)) return adb;
  }
  const local = process.env.LOCALAPPDATA ?? "";
  const candidates = [
    path.join(local, "Android", "Sdk", "platform-tools", "adb.exe"),
    path.join(process.env.USERPROFILE ?? "", "AppData", "Local", "Android", "Sdk", "platform-tools", "adb.exe"),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

function adbDevices(adb) {
  try {
    const out = execSync(`"${adb}" devices`, { encoding: "utf8" });
    return out
      .split("\n")
      .slice(1)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("*"))
      .map((l) => {
        const [id, state] = l.split(/\s+/);
        return { id, state };
      })
      .filter((d) => d.state === "device");
  } catch {
    return [];
  }
}

function setupAdbReverse(adb) {
  execSync(`"${adb}" reverse tcp:${port} tcp:${port}`, { stdio: "inherit" });
  console.log(`\n✓ adb reverse tcp:${port} tcp:${port} — phone can use http://127.0.0.1:${port}\n`);
}

function isPortOpen(p) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${p}/`, (res) => {
      res.resume();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function waitForServer(p, maxMs = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      if (await isPortOpen(p)) return resolve();
      if (Date.now() - start > maxMs) return reject(new Error(`Dev server did not start on port ${p} within ${maxMs / 1000}s`));
      setTimeout(tick, 1500);
    };
    tick();
  });
}

function startDevServer() {
  console.log(`Starting Next.js on 0.0.0.0:${port} ...`);
  const child = spawn("npm", ["run", "dev:mobile", "--", "-p", port], {
    cwd: root,
    shell: true,
    detached: true,
    stdio: "ignore",
    env: { ...process.env, PORT: port },
  });
  child.unref();
}

function capSync(url) {
  console.log(`Capacitor WebView URL → ${url}\n`);
  execSync("npx cap sync", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, CAPACITOR_SERVER_URL: url },
  });
}

function openAndroid() {
  execSync("npx cap open android", { cwd: root, stdio: "inherit" });
}

function resolveMode(requested) {
  const adb = findAdb();
  const devices = adb ? adbDevices(adb) : [];

  if (requested !== "auto") {
    return { mode: requested, adb, devices };
  }

  const hasUsb = devices.some((d) => !d.id.includes("emulator"));
  const hasEmulator = devices.some((d) => d.id.includes("emulator"));

  if (hasUsb) return { mode: "usb", adb, devices };
  if (hasEmulator) return { mode: "emulator", adb, devices };
  return { mode: "wifi", adb, devices };
}

async function main() {
  process.chdir(root);
  const requested = process.argv[2] ?? "auto";
  const { mode, adb, devices } = resolveMode(requested);

  console.log(`\n📱 Android dev mode: ${mode}`);
  if (devices.length) console.log(`   Devices: ${devices.map((d) => d.id).join(", ")}`);
  else console.log("   No adb device — using Wi‑Fi URL (phone must be on same network)");

  let url;
  if (mode === "usb") {
    if (!adb) {
      console.error("\n❌ adb not found. Install Android Studio SDK platform-tools or set ANDROID_HOME.");
      process.exit(1);
    }
    if (!devices.some((d) => !d.id.includes("emulator"))) {
      console.error("\n❌ No USB phone detected. Plug in phone, enable USB debugging, or run: npm run mobile:android -- wifi");
      process.exit(1);
    }
    setupAdbReverse(adb);
    url = resolveCapServerUrl("usb");
  } else if (mode === "emulator") {
    url = resolveCapServerUrl("emulator");
  } else {
    url = resolveCapServerUrl("device");
  }

  if (!(await isPortOpen(port))) {
    startDevServer();
    console.log("Waiting for dev server...");
    await waitForServer(port);
    console.log("✓ Dev server ready\n");
  } else {
    console.log(`✓ Dev server already running on port ${port}\n`);
  }

  capSync(url);
  openAndroid();

  console.log("\n✅ Done. In Android Studio click Run ▶");
  console.log(`   App loads: ${url}`);
  if (mode === "usb") console.log("   USB mode: keep phone plugged in; adb reverse is active.");
  if (mode === "wifi") console.log("   Wi‑Fi mode: phone + PC must be on the same network.");
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});
