"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useNow } from "@/hooks/use-now";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import { AuthStep, PHONE_KEY, PillButton, readSession } from "./auth-parts";
import { FLOWS, pathAfterSignIn, type AuthIntent } from "./flows";

const LENGTH = 6;

export function CodeStep({ intent }: { intent: AuthIntent }) {
  const router = useRouter();
  const signIn = useStore((s) => s.signIn);
  const addPhone = useStore((s) => s.addPhone);
  const [phone] = useState(() => readSession(PHONE_KEY));
  const [code, setCode] = useState<string[]>(Array(LENGTH).fill(""));
  const [sentAt, setSentAt] = useState(() => Date.now());
  const [viaSms, setViaSms] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const now = useNow(1000);
  const wait = Math.max(0, 30 - Math.floor((now - sentAt) / 1000));
  const value = code.join("");
  const flow = FLOWS[intent];

  useEffect(() => {
    if (!phone) router.replace(flow.phone);
  }, [phone, router, flow.phone]);

  const setFrom = (start: number, text: string) => {
    const chars = text.replace(/\D/g, "").slice(0, LENGTH - start).split("");
    if (!chars.length) return;
    const next = [...code];
    chars.forEach((c, i) => (next[start + i] = c));
    setCode(next);
    boxes.current[Math.min(LENGTH - 1, start + chars.length)]?.focus();
  };

  const verify = () => {
    if (value.length !== LENGTH) return;
    if (intent === "add") {
      addPhone(phone);
      toast("customer", "Number added.");
      router.push(flow.start);
      return;
    }
    signIn({ method: "phone", phone });
    const { customer, locationAsked } = useStore.getState();
    router.push(pathAfterSignIn(intent, { named: !!customer.profile.name, locationAsked }));
  };

  return (
    <AuthStep
      title="Enter the code"
      back={flow.phone}
      footer={
        <PillButton disabled={value.length !== LENGTH} onClick={verify}>
          Continue
        </PillButton>
      }
    >
      <p className="text-[1.02rem] leading-snug text-muted">
        We sent a {LENGTH}-digit code to your {viaSms ? "phone by SMS" : "WhatsApp"} at <b className="tabular text-ink">{phone}</b>.
      </p>
      <form
        className="grid grid-cols-6 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          verify();
        }}
      >
        {code.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              boxes.current[i] = el;
            }}
            aria-label={`Digit ${i + 1}`}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            autoFocus={i === 0}
            maxLength={LENGTH}
            value={c}
            onChange={(e) => setFrom(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !code[i] && i > 0) {
                const next = [...code];
                next[i - 1] = "";
                setCode(next);
                boxes.current[i - 1]?.focus();
              }
              if (e.key === "Backspace" && code[i]) {
                const next = [...code];
                next[i] = "";
                setCode(next);
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              setFrom(0, e.clipboardData.getData("text"));
            }}
            className={`tabular aspect-[4/5] w-full min-w-0 rounded-xl text-center text-[1.5rem] font-bold outline-none ${c ? "border-2 border-brand bg-surface" : "border-2 border-transparent bg-surface-2 focus:border-brand focus:bg-surface"}`}
          />
        ))}
        <button type="submit" className="sr-only">
          Continue
        </button>
      </form>
      <div className="grid gap-2 text-[0.95rem]">
        {wait > 0 ? (
          <p className="text-muted">
            Resend code in <span className="tabular font-semibold text-ink">0:{String(wait).padStart(2, "0")}</span>
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <button
              type="button"
              className="font-semibold text-brand"
              onClick={() => {
                setViaSms(false);
                setSentAt(Date.now());
                toast("customer", "New code sent on WhatsApp.");
              }}
            >
              Resend on WhatsApp
            </button>
            <button
              type="button"
              className="font-semibold text-brand"
              onClick={() => {
                setViaSms(true);
                setSentAt(Date.now());
                toast("customer", "New code sent by SMS.");
              }}
            >
              Get code by SMS
            </button>
          </div>
        )}
        <button type="button" onClick={() => router.push(flow.phone)} className="justify-self-start font-semibold text-muted">
          Wrong number? Change it
        </button>
      </div>
    </AuthStep>
  );
}
