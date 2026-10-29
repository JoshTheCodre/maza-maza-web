"use client";

import { CircleCheck, Lock, ScanFace, Share2, ShieldCheck, Siren, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { writeSession } from "@/components/auth/auth-parts";
import { VERIFY_RETURN_KEY } from "@/components/auth/onboarding";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { LiveShareCard } from "@/components/app/live-share";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/controls";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";

const TOOLS = [
  { icon: ShieldCheck, title: "Verified drivers", text: "Every driver and rider is checked: ID, licence, vehicle papers and a guarantor." },
  { icon: Lock, title: "Locked fares", text: "Once you agree a price it can't change on the road. Report anyone who asks for more." },
  { icon: Share2, title: "Trip sharing", text: "Send your live trip to your contacts from the trip screen." },
  { icon: Siren, title: "SOS", text: "One tap sends your location and the driver's details to your contacts and our support team." },
];

export default function SafetyPage() {
  const s = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  return (
    <Page>
      <PageHeader title="Safety" back="/account" />
      <section className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line bg-surface p-3.5">
        <span className={`grid size-11 flex-none place-items-center rounded-full ${s.customer.faceVerifiedAt ? "bg-accept-bg text-accept" : "bg-danfo text-on-danfo"}`}>
          {s.customer.faceVerifiedAt ? <CircleCheck size={22} aria-hidden /> : <ScanFace size={22} aria-hidden />}
        </span>
        <span className="min-w-0 flex-1">
          <b className="block">Face check</b>
          <small className="text-[0.84rem] text-muted">{s.customer.faceVerifiedAt ? "You're verified." : "A quick selfie so drivers know it's really you."}</small>
        </span>
        {!s.customer.faceVerifiedAt && (
          <Link href="/welcome/verify" onClick={() => writeSession(VERIFY_RETURN_KEY, "/account/safety")} className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-[0.9rem] font-bold text-surface">
            Verify
          </Link>
        )}
      </section>
      <LiveShareCard />
      <section className="grid gap-2">
        <h2 className="font-bold">Emergency contacts</h2>
        <p className="text-[0.86rem] text-muted">They get your live location when you share a trip or press SOS.</p>
        <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
          {s.customer.contacts.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-3.5 py-3">
              <span className="min-w-0 flex-1">
                <b className="block">{c.name}</b>
                <small className="tabular text-[0.8rem] text-muted">{c.phone}</small>
              </span>
              <button type="button" aria-label={`Remove ${c.name}`} onClick={() => s.removeContact(c.id)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2">
                <X size={18} />
              </button>
            </li>
          ))}
          {!s.customer.contacts.length && <li className="px-3.5 py-3 text-muted">No contacts yet. Add at least one.</li>}
        </ul>
        <form
          className="grid gap-3 rounded-2xl border-[1.5px] border-line bg-surface p-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !phoneOk) return;
            s.addContact(name.trim(), phone.trim());
            toast("customer", `${name.trim()} added.`);
            setName("");
            setPhone("");
          }}
        >
          <Field id="contact-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chioma (sister)" />
          <Field id="contact-phone" label="Phone number" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0802 000 0000" error={phone && !phoneOk ? "Enter a full Nigerian phone number." : undefined} />
          <Button type="submit" disabled={!name.trim() || !phoneOk}>
            Add contact
          </Button>
        </form>
      </section>
      <section className="grid gap-2">
        <h2 className="font-bold">On every trip</h2>
        <ul className="grid gap-2">
          {TOOLS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3 rounded-2xl border-[1.5px] border-line bg-surface p-3">
              <span className="grid size-10 flex-none place-items-center rounded-xl bg-brand-soft text-brand-strong">
                <Icon size={20} aria-hidden />
              </span>
              <span>
                <b className="block">{title}</b>
                <small className="text-[0.84rem] text-muted">{text}</small>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
