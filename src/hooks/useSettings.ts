"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_SETTINGS, STORAGE_KEY } from "@/lib/studio/constants";
import type { AppSettings, UpdateSetting } from "@/lib/studio/types";

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

/**
 * Owns the persisted {@link AppSettings}. Loads from localStorage on mount and
 * writes back on every change, exposing a type-safe `updateSetting` helper.
 */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Hydrate from localStorage on the client only (avoids SSR mismatch).
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSetting = useCallback<UpdateSetting>((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { settings, setSettings, updateSetting };
}
