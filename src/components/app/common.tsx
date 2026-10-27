"use client";

import { Bell, Car, ChevronRight, MapPin, Phone, Share2, Siren } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/controls";
import { Sheet } from "@/components/ui/sheet";
import { useNow } from "@/hooks/use-now";
import { place } from "@/lib/data/places";
import { firstName, relativeTime } from "@/lib/format";
import { unreadCount, useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { Side, Trip } from "@/lib/types";

/**
 * Bell for the customer and driver headers: an unread dot there, or as a "chip" floating over the map,
 * a white button with an unread count. It swings a little whenever the count changes.
 */
export function BellLink({ audience, dark = false, chip = false }: { audience: Side; dark?: boolean; chip?: boolean }) {
  const n = useStore((s) => unreadCount(s, audience));
  const tone = chip ? "size-[52px] bg-surface text-ink shadow-soft hover:bg-surface-2" : `size-10 ${dark ? "text-on-hero hover:bg-hero-2" : "text-ink hover:bg-surface-2"}`;
  return (
    <Link
      href={audience === "customer" ? "/notifications" : "/driver/notifications"}
      aria-label={n ? `Notifications, ${n} unread` : "Notifications"}
      className={`relative grid flex-none place-items-center rounded-full transition-colors ${tone}`}
    >
      <Bell key={n} size={chip ? 22 : 20} strokeWidth={chip ? 1.8 : 2} className={n > 0 ? "bell-swing" : undefined} aria-hidden />
      {n > 0 &&
        (chip ? (
          <span className="tabular absolute -top-1 -right-1 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-hero px-1.5 text-[0.7rem] font-extrabold text-danfo ring-[2.5px] ring-surface">
            {n > 9 ? "9+" : n}
          </span>
        ) : (
          <span className={`absolute top-2 right-2 size-2.5 rounded-full bg-danfo ring-2 ${dark ? "ring-[var(--hero)]" : "ring-[var(--surface)]"}`} />
        ))}
    </Link>
  );
}

/** Top of both Account tabs: which mode you're in, and the way to the other one. */
export function ModeSwitchCard({ current }: { current: Side }) {
  const status = useStore((s) => s.driver.status);
  const router = useRouter();
  if (current === "driver") {
    return (
      <button type="button" onClick={() => router.push("/ride")} className="on-hero flex items-center gap-3 rounded-2xl bg-hero p-4 text-left text-on-hero">
        <span className="grid size-11 flex-none place-items-center rounded-xl bg-hero-2">
          <MapPin size={22} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block">Switch to rider mode</b>
          <small className="text-[0.84rem] text-on-hero-muted">Book rides and deliveries for yourself</small>
        </span>
        <ChevronRight size={20} aria-hidden />
      </button>
    );
  }
  const sub =
    status === "approved"
      ? "Go online, see offers and keep every fare"
      : status === "pending"
        ? "Your application is being checked"
        : status === "rejected"
          ? "Your application needs changes"
          : "Buy a day ticket on the days you work. Keep every fare.";
  return (
    <button
      type="button"
      onClick={() => router.push(status === "none" ? "/driver/signup" : "/driver")}
      className="on-hero flex items-center gap-3 rounded-2xl bg-hero p-4 text-left text-on-hero"
    >
      <span className="grid size-11 flex-none place-items-center rounded-xl bg-danfo text-on-danfo">
        <Car size={22} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <b className="block">{status === "none" ? "Drive or ride with Maza-Maza" : "Switch to driver mode"}</b>
        <small className="text-[0.84rem] text-on-hero-muted">{sub}</small>
      </span>
      <ChevronRight size={20} aria-hidden />
    </button>
  );
}

export function NotificationsList({ audience }: { audience: Side }) {
  const s = useStore();
  const now = useNow(30_000);
  const items = s.notifications.filter((n) => n.audience === audience);
  if (!items.length) return <p className="text-muted">Nothing yet. Offers, trip updates and wallet activity show up here.</p>;
  return (
    <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
      {items.map((n) => {
        const body = (
          <>
            <span className={`mt-1.5 size-2 flex-none rounded-full ${n.read ? "bg-transparent" : "bg-brand"}`} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className={`block text-[0.92rem] ${n.read ? "" : "font-semibold"}`}>{n.title}</span>
              <small className="text-[0.76rem] text-muted">{relativeTime(n.createdAt, now)}</small>
            </span>
          </>
        );
        return (
          <li key={n.id}>
            {n.href ? (
              <Link href={n.href} className="flex gap-3 px-3.5 py-3 hover:bg-surface-2">
                {body}
              </Link>
            ) : (
              <div className="flex gap-3 px-3.5 py-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function CancelTripSheet({ open, onClose, trip, by, reasons }: { open: boolean; onClose: () => void; trip: Trip; by: Side; reasons: string[] }) {
  const cancel = useStore((s) => s.cancelTrip);
  const [reason, setReason] = useState("");
  const other = by === "customer" ? firstName(trip.driver.name) : firstName(trip.customer.name);
  return (
    <Sheet open={open} onClose={onClose} title="Cancel this trip?">
      <p className="text-[0.9rem] text-muted">Tell us why. {other} will be told the trip is cancelled.</p>
      <div className="flex flex-wrap gap-2">
        {reasons.map((r) => (
          <Chip key={r} on={reason === r} onClick={() => setReason(r)}>
            {r}
          </Chip>
        ))}
      </div>
      {reason === "Driver asked for more money" && (
        <p className="rounded-xl bg-danfo-soft p-3 text-[0.84rem]">You only ever pay the fare you agreed. We&apos;ll send this to our safety team.</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={onClose}>
          Keep trip
        </Button>
        <Button variant="danger" disabled={!reason} onClick={() => (cancel(trip.id, by, reason), onClose())}>
          Cancel trip
        </Button>
      </div>
    </Sheet>
  );
}

export function SosSheet({ open, onClose, trip, by }: { open: boolean; onClose: () => void; trip: Trip; by: Side }) {
  const s = useStore();
  const names = s.customer.contacts.map((c) => firstName(c.name)).join(" and ");
  return (
    <Sheet open={open} onClose={onClose} title="Emergency">
      <a href="tel:112" className="flex items-center gap-3 rounded-2xl bg-danger p-4 font-bold text-white">
        <Phone size={22} aria-hidden /> Call 112 (police and emergency)
      </a>
      <p className="text-[0.9rem]">
        Or alert Maza-Maza support{by === "customer" && names ? ` and ${names}` : ""} with your live location, the trip and the {by === "customer" ? "driver's plate number" : "customer's details"}.
      </p>
      <Button
        size="lg"
        block
        variant="dark"
        onClick={() => {
          s.report("sos", `SOS on trip ${place(trip.pickupId).name} → ${place(trip.dropId).name} (${trip.driver.vehicle.plate})`, by, trip.id);
          toast(by, "Safety team alerted. Stay on the line if they call you.");
          onClose();
        }}
      >
        <Siren size={18} aria-hidden /> Alert the safety team
      </Button>
    </Sheet>
  );
}

export function ShareTripButton({ trip }: { trip: Trip }) {
  const send = trip.mode === "send";
  const share = async () => {
    const url = `${window.location.origin}/share/${trip.id}`;
    // Deliveries go to the receiver: they see when it arrives and can chat with the rider and the sender.
    const text = send
      ? `${firstName(trip.customer.name)} sent you a package with Maza-Maza. See when it arrives and chat with the rider:`
      : `I'm on a Maza-Maza trip with ${trip.driver.short} (${trip.driver.vehicle.plate}). Follow it live:`;
    try {
      if (navigator.share) {
        await navigator.share({ title: send ? "Your Maza-Maza delivery" : "My Maza-Maza trip", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast("customer", send ? `Tracking link copied. Send it to ${trip.receiver || "the receiver"} on WhatsApp or SMS.` : "Trip link copied. Paste it into WhatsApp or SMS.");
    } catch {
      /* the person closed the share sheet */
    }
  };
  return (
    <button type="button" onClick={share} className="grid justify-items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface px-1 py-2.5 text-[0.72rem] font-bold hover:border-ink">
      <Share2 size={20} aria-hidden />
      {send ? "Send to receiver" : "Share trip"}
    </button>
  );
}
