import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "dark" | "ghost" | "danfo" | "line" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] font-bold leading-none whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary: "border-transparent bg-brand text-on-brand enabled:hover:bg-brand-strong [&:is(a)]:hover:bg-brand-strong",
  dark: "border-transparent bg-ink text-bg",
  ghost: "border-line bg-transparent text-ink enabled:hover:border-ink [&:is(a)]:hover:border-ink",
  danfo: "border-transparent bg-danfo text-on-danfo hover:brightness-95",
  line: "border-hero-line bg-transparent text-on-hero hover:border-on-hero",
  danger: "border-line bg-transparent text-danger hover:border-danger",
  soft: "border-transparent bg-surface-2 text-ink hover:bg-line",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3.5 text-[0.84rem]",
  md: "min-h-11 px-[18px] text-[0.94rem]",
  lg: "min-h-[52px] px-5 text-base",
};

interface Look {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export const buttonClass = ({ variant = "primary", size = "md", block = false }: Look, extra = "") =>
  [base, variants[variant], sizes[size], block ? "w-full" : "", extra].filter(Boolean).join(" ");

export function Button({ variant, size, block, className = "", type = "button", ...props }: ComponentProps<"button"> & Look) {
  return <button type={type} className={buttonClass({ variant, size, block }, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant,
  size,
  block,
  className = "",
  children,
}: Look & { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass({ variant, size, block }, className)}>
      {children}
    </Link>
  );
}

export function IconButton({ label, className = "", children, ...props }: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid size-10 flex-none place-items-center rounded-full border-[1.5px] border-line bg-surface text-ink hover:border-ink ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
