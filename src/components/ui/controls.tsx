"use client";

import { Minus, Plus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { digitsOnly, plainNumber } from "@/lib/format";

export function Chip({ on, className = "", ...props }: ComponentProps<"button"> & { on: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={`min-h-[34px] rounded-full border-[1.5px] px-[13px] text-[0.84rem] font-semibold transition-colors ${
        on ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:border-ink"
      } ${className}`}
      {...props}
    />
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  dark = false,
}: {
  value: T;
  options: { value: T; label: ReactNode; disabled?: boolean }[];
  onChange: (v: T) => void;
  label: string;
  dark?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className={`grid auto-cols-fr grid-flow-col gap-1 rounded-[14px] p-1 ${dark ? "bg-hero-2" : "bg-surface-2"}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={`flex min-h-10 items-center justify-center gap-2 rounded-[10px] px-2 text-[0.9rem] font-bold transition-colors disabled:opacity-50 ${
            value === o.value
              ? dark
                ? "bg-danfo text-on-danfo"
                : "bg-surface text-ink shadow-soft"
              : dark
                ? "text-on-hero-muted"
                : "text-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function NairaStepper({
  id,
  value,
  onChange,
  step = 100,
  small = false,
  max = 999_000,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  small?: boolean;
  max?: number;
}) {
  const btn =
    "grid size-11 flex-none place-items-center rounded-full border-[1.5px] border-line bg-surface text-ink hover:border-ink";
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
      <button type="button" className={btn} aria-label={`Lower by ${step} naira`} onClick={() => onChange(Math.max(0, value - step))}>
        <Minus size={20} />
      </button>
      <div
        className={`flex min-w-0 items-baseline justify-center gap-0.5 border-b-2 border-transparent font-display font-bold tracking-tight focus-within:border-brand ${
          small ? "text-[1.35rem]" : "text-[1.9rem]"
        }`}
      >
        <span aria-hidden>₦</span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={value ? plainNumber(value) : ""}
          onChange={(e) => onChange(Math.min(max, digitsOnly(e.target.value)))}
          className="tabular w-[5.6ch] min-w-0 border-0 bg-transparent p-0 text-center outline-none placeholder:text-line"
        />
      </div>
      <button type="button" className={btn} aria-label={`Raise by ${step} naira`} onClick={() => onChange(Math.min(max, value + step))}>
        <Plus size={20} />
      </button>
    </div>
  );
}

export function Field({
  label,
  id,
  hint,
  error,
  className = "",
  ...props
}: ComponentProps<"input"> & { label: string; id: string; hint?: string; error?: string }) {
  return (
    <div className={`grid gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[0.85rem] font-bold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${id}-hint` : undefined}
        className={`min-h-11 w-full rounded-xl border-[1.5px] bg-surface px-3 font-semibold outline-none focus:border-brand ${
          error ? "border-danger" : "border-line"
        }`}
        {...props}
      />
      {(hint || error) && (
        <p id={`${id}-hint`} className={`text-[0.78rem] ${error ? "font-semibold text-danger" : "text-muted"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function Toggle({ on, onChange, label, dark = false }: { on: boolean; onChange: (v: boolean) => void; label: string; dark?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border-[1.5px] py-0 pr-3 pl-1.5 text-[0.8rem] font-bold ${
        dark ? "border-hero-line text-on-hero" : "border-line text-ink"
      }`}
    >
      <span className={`relative h-5 w-[34px] rounded-full transition-colors ${on ? "bg-danfo" : dark ? "bg-hero-2" : "bg-surface-2"}`}>
        <span
          className={`absolute top-[3px] left-[3px] size-3.5 rounded-full transition-transform ${
            on ? "translate-x-3.5 bg-on-danfo" : dark ? "bg-on-hero-muted" : "bg-muted"
          }`}
        />
      </span>
      {label}
    </button>
  );
}
