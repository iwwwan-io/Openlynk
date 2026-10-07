"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "openlynk_theme";

// Aman untuk SSR: di server jadi useEffect biasa (tidak dieksekusi).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function readTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: "dark" | "light") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

/** Toggle gelap/terang terpusat (satu sumber: localStorage + class di <html>). */
export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Sinkronisasi satu-kali dari <html> (sudah dipasang ThemeProvider pre-paint)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(readTheme());
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, isDark: theme === "dark", ready, toggle };
}

/**
 * Diterapkan sekali di layout: membaca tema tersimpan dan memasang class
 * di <html> sebelum paint pertama (tanpa <script>, ramah App Router).
 */
export function ThemeProvider() {
  useIsomorphicLayoutEffect(() => {
    try {
      applyTheme(readTheme());
    } catch {
      // localStorage tak tersedia (mode privat ketat) — biarkan light
    }
  }, []);
  return null;
}
