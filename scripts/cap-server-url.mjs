import os from "node:os";

const port = process.env.PORT ?? process.env.CAPACITOR_DEV_PORT ?? "3000";

/** First non-internal IPv4 on this machine (Wi‑Fi / Ethernet). */
export function getLanIp() {
  const nets = os.networkInterfaces();
  for (const ifaces of Object.values(nets)) {
    for (const net of ifaces ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

/**
 * @param {"device" | "emulator" | "ios-simulator" | "usb" | "device-ip"} target
 */
export function resolveCapServerUrl(target = "device") {
  if (target === "device-ip") {
    return getLanIp() ?? "127.0.0.1";
  }

  if (target === "usb") {
    // Requires: adb reverse tcp:PORT tcp:PORT — then the phone reaches your PC via 127.0.0.1
    return `http://127.0.0.1:${port}`;
  }

  if (target === "emulator") {
    // Android emulator: 10.0.2.2 is the host machine from inside the emulator.
    return `http://10.0.2.2:${port}`;
  }

  if (target === "ios-simulator") {
    // iOS Simulator runs on the Mac and can reach the host via localhost.
    return `http://127.0.0.1:${port}`;
  }

  // Physical phone / tablet on the same Wi‑Fi as the dev PC.
  const ip = getLanIp();
  if (!ip) {
    console.warn("[cap-server-url] No LAN IP found. Connect Wi‑Fi or set CAPACITOR_SERVER_URL manually.");
    return `http://127.0.0.1:${port}`;
  }
  return `http://${ip}:${port}`;
}

const isCli = process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/cap-server-url.mjs");
if (isCli) {
  const target = process.argv[2] ?? "device";
  console.log(resolveCapServerUrl(target));
}
