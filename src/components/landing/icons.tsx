import type { ReactNode } from "react";

type IconProps = { size?: number; strokeWidth?: number };

function StrokeIcon({ size, strokeWidth, children }: Required<IconProps> & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function CheckIcon({ size = 18, strokeWidth = 2.6 }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </StrokeIcon>
  );
}

export function LockIcon({ size = 18, strokeWidth = 2 }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </StrokeIcon>
  );
}

export function CarIcon({ size = 20, strokeWidth = 2 }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth}>
      <path d="M4 16.5v-4l2.1-4.9A2 2 0 0 1 8 6.5h8a2 2 0 0 1 1.9 1.1L20 12.5v4" />
      <path d="M3.5 16.5h17M4 12.5h16" />
      <circle cx="7.5" cy="16.5" r="1.8" />
      <circle cx="16.5" cy="16.5" r="1.8" />
    </StrokeIcon>
  );
}

export function BikeIcon({ size = 20, strokeWidth = 2 }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth}>
      <circle cx="5.5" cy="16.5" r="3" />
      <circle cx="18.5" cy="16.5" r="3" />
      <path d="M5.5 16.5l4-5.5h5l4 5.5M15 6h2.5l1.5 4.5" />
      <rect x="3" y="6" width="5" height="4" rx="1" />
    </StrokeIcon>
  );
}

export function SearchIcon({ size = 22, strokeWidth = 2.2 }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </StrokeIcon>
  );
}

export function ChevronRightIcon({ size = 20, strokeWidth = 2.2 }: IconProps) {
  return (
    <StrokeIcon size={size} strokeWidth={strokeWidth}>
      <path d="M9 5.5l6.5 6.5L9 18.5" />
    </StrokeIcon>
  );
}
