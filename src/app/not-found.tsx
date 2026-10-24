import Link from "next/link";
import { LogoMark } from "@/components/ui/display";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div className="grid max-w-sm justify-items-center gap-4">
        <LogoMark size={48} />
        <h1 className="font-display text-[1.5rem] font-bold tracking-tight">We can&apos;t find that page</h1>
        <p className="text-muted">The link may be old, or the trip it pointed to has ended.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/ride" className="inline-flex min-h-12 items-center rounded-full bg-brand px-5 font-bold text-on-brand">
            Book a ride
          </Link>
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-line px-5 font-bold">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
