"use client";

import { Bell, ChevronRight, CircleHelp, LogOut, MapPin, ShieldCheck, UserRound, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeSwitchCard } from "@/components/app/common";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { Segmented } from "@/components/ui/controls";
import { Avatar } from "@/components/ui/display";
import { customerHistory, unreadCount, useStore } from "@/lib/store";
import type { PayMethod } from "@/lib/types";

export default function AccountPage() {
  const s = useStore();
  const router = useRouter();
  const p = s.customer.profile;
  const trips = customerHistory(s).filter((t) => t.stage !== "cancelled").length;
  const unread = unreadCount(s, "customer");
  const rows = [
    { href: "/account/profile", icon: UserRound, label: "Profile", sub: "Name, email and phone number" },
    { href: "/account/places", icon: MapPin, label: "Saved places", sub: s.customer.savedPlaces.length ? `${s.customer.savedPlaces.length} saved` : "Add home, work and favourites" },
    { href: "/account/safety", icon: ShieldCheck, label: "Safety", sub: s.customer.contacts.length ? `${s.customer.contacts.length} emergency ${s.customer.contacts.length === 1 ? "contact" : "contacts"}` : "Add an emergency contact" },
    { href: "/notifications", icon: Bell, label: "Notifications", sub: unread ? `${unread} unread` : "Offers and trip updates" },
    { href: "/help", icon: CircleHelp, label: "Help", sub: "Questions, lost items and support" },
  ];
  return (
    <Page>
      <PageHeader title="Account" />
      <Link href="/account/profile" className="flex items-center gap-3 rounded-2xl bg-surface p-3.5 shadow-soft">
        <Avatar name={p.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{p.name}</p>
          <p className="text-[0.84rem] text-muted">
            {s.customer.phone || "Google account"} · {trips ? `★ ${p.rating.toFixed(1)} · ${trips} ${trips === 1 ? "trip" : "trips"}` : "New rider"}
          </p>
        </div>
        <ChevronRight size={18} className="text-muted" aria-hidden />
      </Link>
      <ModeSwitchCard current="customer" />
      <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
        {rows.map(({ href, icon: Icon, label, sub }) => (
          <li key={href}>
            <Link href={href} className="flex items-center gap-3 px-3.5 py-3 hover:bg-surface-2">
              <span className="grid size-10 flex-none place-items-center rounded-xl bg-brand-soft text-brand-strong">
                <Icon size={20} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-[0.94rem]">{label}</b>
                <small className="block text-[0.78rem] text-muted">{sub}</small>
              </span>
              <ChevronRight size={18} className="text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <div className="grid gap-2 rounded-2xl border-[1.5px] border-line bg-surface p-3.5">
        <p className="flex items-center gap-2 font-bold">
          <Wallet size={18} aria-hidden /> How you usually pay drivers
        </p>
        <Segmented<PayMethod>
          label="Default payment"
          value={s.customer.draft.payMethod}
          onChange={(m) => s.setDraft({ payMethod: m })}
          options={[
            { value: "cash", label: "Cash" },
            { value: "transfer", label: "Transfer" },
          ]}
        />
        <p className="text-[0.8rem] text-muted">You always pay the driver directly. Maza-Maza never holds your fare.</p>
      </div>
      <button
        type="button"
        onClick={() => {
          s.signOut();
          router.push("/login");
        }}
        className="inline-flex items-center gap-2 justify-self-start py-2 font-bold text-danger"
      >
        <LogOut size={18} aria-hidden /> Log out
      </button>
    </Page>
  );
}
