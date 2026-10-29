"use client";

import { Radio, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { clock, firstName, relativeTime } from "@/lib/format";
import { startWatching, useMyLocation } from "@/lib/location";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";

const LENGTHS = [
  { hours: 1, label: "1 hour" },
  { hours: 8, label: "8 hours" },
  { hours: 24, label: "24 hours" },
];

/** Share your live position with friends or family through a link, with or without a trip. */
export function LiveShareCard() {
  const s = useStore();
  const now = useNow(15_000);
  const location = useMyLocation();
  const active = s.liveShares.find((x) => !x.stopped && x.until > now);

  const send = async (id: string) => {
    const url = `${window.location.origin}/live/${id}`;
    const text = `${firstName(s.customer.profile.name)} is sharing their live location with you on Maza-Maza:`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My live location", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast("customer", "Link copied. Send it on WhatsApp or SMS.");
    } catch {
      /* the person closed the share sheet */
    }
  };

  const start = (hours: number) => {
    startWatching();
    const id = s.startLiveShare(hours);
    void send(id);
  };

  const problem =
    location.status === "insecure"
      ? "Your browser only shares location on secure (https) pages, so the link can't update from here."
      : location.status === "denied"
        ? "Location is blocked for Maza-Maza, so the link can't update. Allow location in your browser settings."
        : location.status === "unavailable"
          ? "We can't get your location right now, so the link won't update until we can."
          : null;

  return (
    <section id="live" className="grid scroll-mt-20 gap-2">
      <h2 className="flex items-center gap-2 font-bold">
        <Radio size={18} aria-hidden /> Share my live location
      </h2>
      <p className="text-[0.86rem] text-muted">Send a link to family or a friend. They see where you are on a map, updating as you move, until it ends or you stop it.</p>
      {problem && <p className="rounded-xl bg-lost-bg px-3 py-2 text-[0.84rem] text-lost">{problem}</p>}
      {active ? (
        <div className="grid gap-3 rounded-2xl border-[1.5px] border-ink bg-surface p-3.5">
          <p className="flex items-center gap-2 font-bold">
            <span className="size-2.5 animate-blink rounded-full bg-accept" aria-hidden />
            Sharing until {clock(active.until)}
          </p>
          <p className="text-[0.84rem] text-muted">{active.last ? `Last position sent ${relativeTime(active.last.at, now)}.` : "Waiting for your first position…"}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => void send(active.id)}>
              <Share2 size={16} aria-hidden /> Send link
            </Button>
            <Button variant="danger" onClick={() => s.stopLiveShare(active.id)}>
              Stop sharing
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {LENGTHS.map((l) => (
            <Button key={l.hours} variant="soft" onClick={() => start(l.hours)}>
              {l.label}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
