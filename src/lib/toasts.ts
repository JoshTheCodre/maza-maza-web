"use client";

import { create } from "zustand";
import type { ToastMessage } from "./types";

interface ToastStore {
  items: ToastMessage[];
  push: (audience: ToastMessage["audience"], text: string) => void;
  dismiss: (id: string) => void;
}

export const useToasts = create<ToastStore>()((set, get) => ({
  items: [],
  push: (audience, text) => {
    const id = Math.random().toString(36).slice(2, 10);
    set({ items: [...get().items.slice(-2), { id, audience, text }] });
    setTimeout(() => get().dismiss(id), 3200);
  },
  dismiss: (id) => set({ items: get().items.filter((t) => t.id !== id) }),
}));

export const toast = (audience: ToastMessage["audience"], text: string) => useToasts.getState().push(audience, text);
