"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export const PHONE_KEY = "maza-login-phone";

export const readSession = (key: string) => {
  try {
    return sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};
export const writeSession = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {}
};

/** Plain white step screen: back arrow, big title, content, and a button pinned to the bottom. */
export function AuthStep({ title, back, children, footer }: { title: string; back?: string; children: ReactNode; footer: ReactNode }) {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
        <div className="flex h-14 items-center">
          {back && (
            <button type="button" aria-label="Back" onClick={() => router.push(back)} className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-surface-2">
              <ArrowLeft size={26} />
            </button>
          )}
        </div>
        <h1 className="mt-4 text-[1.85rem] leading-tight font-bold tracking-tight">{title}</h1>
        <div className="mt-5 grid gap-5">{children}</div>
      </div>
      <div className="sticky bottom-0 bg-surface pb-[calc(16px+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-md px-6 pt-3">{footer}</div>
      </div>
    </div>
  );
}

export function PillButton({ children, disabled, onClick, type = "button" }: { children: ReactNode; disabled?: boolean; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="min-h-14 w-full rounded-full bg-brand text-[1.05rem] font-bold text-on-brand transition-opacity enabled:hover:bg-brand-strong disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function NigeriaFlag({ size = 22 }: { size?: number }) {
  return (
    <svg width={size * 1.4} height={size} viewBox="0 0 28 20" aria-hidden className="flex-none overflow-hidden rounded-[3px]">
      <rect width="28" height="20" fill="#ffffff" />
      <rect width="9.33" height="20" fill="#008751" />
      <rect x="18.67" width="9.33" height="20" fill="#008751" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="flex-none">
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path
        fill="#ffffff"
        d="M23.3 8.7A10.2 10.2 0 0 0 7.2 21l-1.4 5.1 5.3-1.4A10.2 10.2 0 0 0 23.3 8.7Zm-7.2 15.7a8.5 8.5 0 0 1-4.3-1.2l-.3-.2-3.2.8.9-3.1-.2-.3a8.5 8.5 0 1 1 7.1 4Zm4.7-6.4c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a7 7 0 0 1-3.5-3c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.3-.6-.4Z"
      />
    </svg>
  );
}

export function GoogleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="flex-none">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** The welcome illustration: a car, a customer's offer and the driver's yes. */
export function DealIllustration() {
  return (
    <svg viewBox="0 0 300 190" className="h-auto w-full max-w-[300px]" aria-hidden>
      {[
        [30, 30, "#ffc72c", 0],
        [262, 22, "#ffffff", 20],
        [250, 120, "#ffc72c", -30],
        [40, 132, "#ffffff", 45],
        [150, 12, "#5cdc9e", 10],
        [280, 70, "#5cdc9e", 60],
      ].map(([x, y, c, r], i) => (
        <rect key={i} x={x as number} y={y as number} width="10" height="4" rx="2" fill={c as string} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <ellipse cx="150" cy="172" rx="108" ry="8" fill="#000000" opacity="0.18" />
      <path d="M52 150v-18c0-9 6-15 15-16l46-5 22-24c4-4 9-6 15-6h56c7 0 13 2 17 7l22 23 33 5c10 2 16 9 16 19v15c0 3-3 6-6 6H58c-3 0-6-3-6-6z" fill="#ffc72c" />
      <path d="M121 110l18-20c3-2 6-4 9-4h23v24zM179 86h24c5 0 9 2 12 6l17 18h-53z" fill="#063a28" opacity="0.85" />
      <path d="M170 113v34" stroke="#c99a12" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="96" cy="156" r="18" fill="#10201a" />
      <circle cx="96" cy="156" r="7" fill="#e4ebe2" />
      <circle cx="232" cy="156" r="18" fill="#10201a" />
      <circle cx="232" cy="156" r="7" fill="#e4ebe2" />
      <g>
        <rect x="18" y="44" width="108" height="40" rx="14" fill="#ffffff" />
        <path d="M44 84l-6 12 18-12z" fill="#ffffff" />
        <text x="72" y="70" textAnchor="middle" fontFamily="var(--font-martian), monospace" fontWeight="700" fontSize="15" fill="#10201a">
          ₦2,500?
        </text>
      </g>
      <g>
        <rect x="178" y="30" width="104" height="40" rx="14" fill="#0a7f4e" />
        <path d="M246 70l8 12-18-12z" fill="#0a7f4e" />
        <text x="230" y="56" textAnchor="middle" fontFamily="var(--font-figtree), sans-serif" fontWeight="800" fontSize="15" fill="#ffffff">
          Deal ✓
        </text>
      </g>
    </svg>
  );
}
