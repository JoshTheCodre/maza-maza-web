"use client";

import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A welcome step in the style of other ride apps: a big title, one illustration and the choices pinned to the bottom.
 * "centered" puts the title above the picture (questions); otherwise the picture leads and the text sits under it.
 */
export function WelcomeScreen({
  title,
  subtitle,
  art,
  back,
  onClose,
  centered = false,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  art: ReactNode;
  back?: string;
  onClose?: () => void;
  centered?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-[env(safe-area-inset-top)] text-ink">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
        <div className={`flex h-14 flex-none items-center ${onClose ? "justify-end" : ""}`}>
          {back && (
            <button type="button" aria-label="Back" onClick={() => router.push(back)} className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-surface-2">
              <ArrowLeft size={26} />
            </button>
          )}
          {onClose && (
            <button type="button" aria-label="Not now" onClick={onClose} className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-surface-2">
              <X size={26} />
            </button>
          )}
        </div>
        {centered ? (
          <>
            <h1 className="balance mt-4 text-center text-[1.8rem] leading-tight font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-3 text-center text-[1.05rem] text-muted">{subtitle}</p>}
            <div className="grid flex-1 animate-enter place-items-center py-8">{art}</div>
          </>
        ) : (
          <>
            <div className="grid flex-1 animate-enter place-items-center py-8">{art}</div>
            <h1 className="text-[1.8rem] leading-tight font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-3 mb-2 text-[1.05rem] leading-relaxed">{subtitle}</p>}
          </>
        )}
      </div>
      <div className="sticky bottom-0 bg-surface pb-[calc(16px+env(safe-area-inset-bottom))]">
        <div className="mx-auto grid w-full max-w-md gap-3 px-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
