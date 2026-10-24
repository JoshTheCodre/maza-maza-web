"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { AuthStep, NigeriaFlag, PHONE_KEY, PillButton, WhatsAppIcon, writeSession } from "./auth-parts";
import { FLOWS, type AuthIntent } from "./flows";

/** Accepts 0803 000 0000, 803 000 0000 or +234 803 000 0000 and returns the 10 digits after +234. */
const localDigits = (v: string) => v.replace(/\D/g, "").replace(/^234/, "").replace(/^0/, "").slice(0, 10);
const pretty = (d: string) => [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join(" ");

export function PhoneStep({ intent }: { intent: AuthIntent }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [learn, setLearn] = useState(false);
  const [country, setCountry] = useState(false);
  const digits = localDigits(value);
  const ok = digits.length === 10 && /^[789]/.test(digits);
  const flow = FLOWS[intent];

  const submit = () => {
    if (!ok) return;
    writeSession(PHONE_KEY, `+234 ${pretty(digits)}`);
    router.push(flow.verify);
  };

  return (
    <AuthStep
      title={intent === "add" ? "Add your number" : "Enter your number"}
      back={flow.start}
      footer={
        <PillButton disabled={!ok} onClick={submit}>
          Continue
        </PillButton>
      }
    >
      <p className="flex items-start gap-3 text-[1.02rem] leading-snug text-muted">
        <WhatsAppIcon size={24} />
        <span>
          {intent === "add" ? "Drivers can call you on this number. " : ""}We&apos;ll send a code to your WhatsApp.{" "}
          <button type="button" onClick={() => setLearn(true)} className="font-semibold text-brand">
            Learn more
          </button>
        </span>
      </p>
      <form
        className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <button type="button" onClick={() => setCountry(true)} className="flex min-h-14 items-center gap-2.5 rounded-xl bg-surface-2 px-4 text-[1.05rem]" aria-label="Country code: Nigeria +234">
          <NigeriaFlag />
          +234
          <ChevronDown size={18} className="text-muted" aria-hidden />
        </button>
        <label htmlFor="phone" className="sr-only">
          Phone number
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus
          value={pretty(digits)}
          onChange={(e) => setValue(e.target.value)}
          placeholder="803 000 0000"
          className="tabular min-h-14 min-w-0 rounded-xl border-2 border-brand bg-surface px-4 text-[1.1rem] font-semibold outline-none placeholder:font-normal placeholder:text-muted"
        />
      </form>
      {digits.length === 10 && !ok && <p className="text-[0.88rem] font-semibold text-danger">Nigerian mobile numbers start with 7, 8 or 9 after +234.</p>}

      <Sheet open={learn} onClose={() => setLearn(false)} title="Why WhatsApp?">
        <p className="text-[0.95rem]">
          WhatsApp codes arrive faster than SMS and don&apos;t depend on network DND settings. We only use it to send your code. If WhatsApp isn&apos;t on this number, we&apos;ll send an SMS instead.
        </p>
      </Sheet>
      <Sheet open={country} onClose={() => setCountry(false)} title="Country">
        <button type="button" onClick={() => setCountry(false)} className="flex items-center gap-3 rounded-xl bg-brand-soft p-3 text-left font-semibold">
          <NigeriaFlag /> Nigeria <span className="ml-auto text-muted">+234</span>
        </button>
        <p className="text-[0.86rem] text-muted">Maza-Maza is available in Nigeria. More countries soon.</p>
      </Sheet>
    </AuthStep>
  );
}
