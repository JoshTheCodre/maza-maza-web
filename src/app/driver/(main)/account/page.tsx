"use client";

import { Bell, ChevronRight, CircleCheck, CircleHelp, Landmark, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeSwitchCard } from "@/components/app/common";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { Avatar, Plate } from "@/components/ui/display";
import { VEHICLE_LABEL } from "@/lib/config";
import { capitalise } from "@/lib/format";
import { unreadCount, useStore } from "@/lib/store";

export default function DriverAccount() {
  const s = useStore();
  const router = useRouter();
  const p = s.driver.profile;
  const app = s.applications.find((a) => a.isMe);
  const approved = s.driver.status === "approved";
  const unread = unreadCount(s, "driver");
  const rows = [
    { href: "/driver/account/payout", icon: Landmark, label: "Bank account", sub: p.payout ? `${p.payout.bank} · ••••${p.payout.accountNumber.slice(-4)}` : "Add where customers send transfers" },
    { href: "/driver/account/profile", icon: UserRound, label: "Profile", sub: "Name, email and phone number" },
    { href: "/driver/notifications", icon: Bell, label: "Notifications", sub: unread ? `${unread} unread` : "Offers, trips and wallet" },
    { href: "/driver/help", icon: CircleHelp, label: "Help", sub: "Tickets, payments and support" },
  ];
  return (
    <Page>
      <PageHeader title="Account" />
      <div className="flex items-center gap-3 rounded-2xl bg-surface p-3.5 shadow-soft">
        <Avatar name={p.name || s.customer.profile.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{p.name || s.customer.profile.name}</p>
          <p className="text-[0.84rem] text-muted">{approved ? `${VEHICLE_LABEL[p.vehicle.type]} · ★ ${p.rating.toFixed(1)}` : s.driver.status === "pending" ? "Application being checked" : "Not a driver yet"}</p>
          {approved && <p className="text-[0.84rem] text-muted">{capitalise(p.vehicle.description)}</p>}
        </div>
        {approved && <Plate>{p.vehicle.plate}</Plate>}
      </div>
      <ModeSwitchCard current="driver" />
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
      {app && (
        <section className="grid gap-2">
          <h2 className="font-bold">Documents</h2>
          <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
            {app.documents.map((d) => (
              <li key={d.key} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <span className="text-[0.9rem]">{d.label}</span>
                <span className={`inline-flex items-center gap-1.5 text-[0.8rem] font-bold ${d.status === "verified" ? "text-accept" : d.status === "rejected" ? "text-lost" : "text-counter"}`}>
                  {d.status === "verified" && <CircleCheck size={16} aria-hidden />}
                  {d.status === "uploaded" ? "Being checked" : capitalise(d.status)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
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
