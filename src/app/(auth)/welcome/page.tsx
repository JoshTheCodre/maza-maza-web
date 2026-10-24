"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthStep, PillButton } from "@/components/auth/auth-parts";
import { takeNext } from "@/lib/next-path";
import { useStore } from "@/lib/store";

const input =
  "min-h-14 w-full rounded-xl border-2 border-transparent bg-surface-2 px-4 text-[1.05rem] font-semibold outline-none placeholder:font-normal placeholder:text-muted focus:border-brand focus:bg-surface";

export default function NamePage() {
  const router = useRouter();
  const s = useStore();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const ok = first.trim().length > 0 && last.trim().length > 0 && (!email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

  useEffect(() => {
    if (!s.signedIn) router.replace("/signup");
  }, [s.signedIn, router]);

  const save = () => {
    if (!ok) return;
    s.setProfile({ name: `${first.trim()} ${last.trim()}`, email: email.trim() });
    router.push(s.locationAsked ? takeNext() : "/welcome/location");
  };

  return (
    <AuthStep
      title="What's your name?"
      footer={
        <PillButton disabled={!ok} onClick={save}>
          Continue
        </PillButton>
      }
    >
      <p className="text-[1.02rem] text-muted">Drivers see your first name when you book.</p>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label htmlFor="first" className="sr-only">
          First name
        </label>
        <input id="first" autoFocus autoComplete="given-name" placeholder="First name" value={first} onChange={(e) => setFirst(e.target.value)} className={input} />
        <label htmlFor="last" className="sr-only">
          Last name
        </label>
        <input id="last" autoComplete="family-name" placeholder="Last name" value={last} onChange={(e) => setLast(e.target.value)} className={input} />
        <label htmlFor="email" className="sr-only">
          Email (optional)
        </label>
        <input id="email" type="email" autoComplete="email" placeholder="Email (optional, for receipts)" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <button type="submit" className="sr-only">
          Continue
        </button>
      </form>
    </AuthStep>
  );
}
