"use client";

import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect } from "react";

export default function CapacitorInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
    document.documentElement.classList.add("capacitor-native");
  }, []);

  return null;
}
