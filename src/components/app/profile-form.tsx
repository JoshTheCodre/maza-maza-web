"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/controls";
import { Avatar } from "@/components/ui/display";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { Side } from "@/lib/types";

const emailOk = (e: string) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/** Name, email and phone. Drivers' names come from their approved application, so they can't edit them here. */
export function ProfileForm({ audience }: { audience: Side }) {
  const s = useStore();
  const [first, ...rest] = s.customer.profile.name.split(" ");
  const [firstName, setFirst] = useState(first ?? "");
  const [lastName, setLast] = useState(rest.join(" "));
  const [email, setEmail] = useState(s.customer.email);
  const driverName = s.driver.profile.name;
  const locked = audience === "driver";
  const ok = locked ? emailOk(email) : firstName.trim().length > 0 && lastName.trim().length > 0 && emailOk(email);
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ok) return;
        s.setProfile({ name: locked ? s.customer.profile.name : `${firstName.trim()} ${lastName.trim()}`, email: email.trim() });
        toast(audience, "Profile saved.");
      }}
    >
      <div className="flex items-center gap-3">
        <Avatar name={locked ? driverName : `${firstName} ${lastName}`} size="lg" />
        <p className="text-[0.86rem] text-muted">
          {locked ? "Customers see your first name, photo and rating." : "Drivers see your first name and rating."}
        </p>
      </div>
      {locked ? (
        <div className="grid gap-1.5">
          <p className="text-[0.85rem] font-bold">Name</p>
          <p className="min-h-11 rounded-xl bg-surface-2 px-3 py-2.5 font-semibold">{driverName}</p>
          <p className="text-[0.78rem] text-muted">This matches your ID. Contact support to change it.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="first-name" label="First name" value={firstName} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" />
          <Field id="last-name" label="Last name" value={lastName} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" />
        </div>
      )}
      <Field id="email" type="email" label="Email (optional)" hint="We send receipts here." value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" error={emailOk(email) ? undefined : "Enter a valid email address."} />
      <div className="grid gap-1.5">
        <p className="text-[0.85rem] font-bold">Phone number</p>
        {s.customer.phone ? (
          <p className="tabular min-h-11 rounded-xl bg-surface-2 px-3 py-2.5 font-semibold">{s.customer.phone}</p>
        ) : (
          <Link href="/add-phone" className="flex min-h-11 items-center rounded-xl border-[1.5px] border-dashed border-line px-3 py-2.5 font-semibold text-brand hover:border-brand">
            Add your number
          </Link>
        )}
        <p className="text-[0.78rem] text-muted">
          {s.customer.authMethod === "google"
            ? "You log in with Google. Drivers can call you on this number."
            : "You log in with this number. Contact support to change it."}
        </p>
      </div>
      <Button type="submit" size="lg" block disabled={!ok}>
        Save changes
      </Button>
    </form>
  );
}
