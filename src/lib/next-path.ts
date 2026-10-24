"use client";

// Remembers where to send someone after they log in.
const KEY = "maza-next";

export const rememberNext = (path: string) => {
  try {
    sessionStorage.setItem(KEY, path);
  } catch {}
};

export const takeNext = (fallback = "/ride") => {
  try {
    const p = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return p && p.startsWith("/") ? p : fallback;
  } catch {
    return fallback;
  }
};
