"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppProvider } from "@/components/app/providers";
import { Logo } from "@/components/ui/display";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { mapXY } from "@/lib/data/places";
import { clock, firstName, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";

/**
 * The page a live-location link opens: where the person is, how fresh it is, and until when they're sharing.
 * Until the backend relays positions between phones, it follows a share made on this same device.
 */
export default function LiveLocationPage() {
  return (
    <AppProvider>
      <LiveLocation />
    </AppProvider>
  );
}

function LiveLocation() {
  const { id } = useParams<{ id: string }>();
  const share = useStore((s) => s.liveShares.find((x) => x.id === id));
  const now = useNow(5000);

  if (!share) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="grid gap-3">
          <h1 className="font-display text-xl font-bold">This link has expired</h1>
          <p className="text-muted">Live locations stop when the person ends sharing.</p>
          <Link href="/" className="font-bold text-brand">
            Go to Maza-Maza
          </Link>
        </div>
      </div>
    );
  }

  const name = firstName(share.name);
  const ended = share.stopped || share.until < now;
  const pos = share.last;
  const spot = pos ? { lat: pos.lat, lng: pos.lng, ...mapXY(pos.lat, pos.lng) } : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="on-hero flex flex-none items-center justify-between bg-hero px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 text-on-hero">
        <Logo />
        <span className="text-[0.8rem] text-on-hero-muted">Live location</span>
      </header>
      <div className="relative h-[50dvh] flex-none">
        <MapView pickup={!ended ? spot : undefined} pulse />
      </div>
      <div className="mx-auto grid w-full max-w-xl gap-3 px-4 py-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <p className="kicker flex items-center gap-2">
          {!ended && <span className="size-2 animate-blink rounded-full bg-accept" aria-hidden />}
          {ended ? "Sharing ended" : `Live · until ${clock(share.until)}`}
        </p>
        <h1 className="font-display text-[1.3rem] font-bold tracking-tight">{ended ? `${name} stopped sharing` : `${name}'s live location`}</h1>
        {!ended && <p className="text-[0.92rem]">{pos ? `Updated ${relativeTime(pos.at, now)}, accurate to about ${Math.round(pos.accuracy)} m.` : `Waiting for ${name}'s phone to send a position…`}</p>}
        {!ended && pos && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${pos.lat},${pos.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 justify-self-start rounded-full border-[1.5px] border-line px-4 py-2 text-[0.88rem] font-bold hover:border-ink"
          >
            <ExternalLink size={16} aria-hidden /> Open in Google Maps
          </a>
        )}
        <p className="text-[0.84rem] text-muted">
          If you&apos;re worried, call {name} first. In an emergency, call{" "}
          <a href="tel:112" className="font-bold text-danger">
            112
          </a>
          .
        </p>
      </div>
    </div>
  );
}
