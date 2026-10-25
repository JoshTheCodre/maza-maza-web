"use client";

import { Banknote, Check, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequireAccount } from "@/components/app/require-account";
import { PillButton } from "@/components/auth/auth-parts";
import { PayArt } from "@/components/auth/illustrations";
import { nextWelcomeStep } from "@/components/auth/onboarding";
import { WelcomeScreen } from "@/components/auth/welcome-screen";
import { useStore } from "@/lib/store";
import type { PayMethod } from "@/lib/types";

const OPTIONS: { value: PayMethod; label: string; text: string; icon: typeof Banknote }[] = [
  { value: "cash", label: "Cash", text: "Pay your driver when you arrive.", icon: Banknote },
  { value: "transfer", label: "Bank transfer", text: "Send it to your driver's account.", icon: Landmark },
];

function PayStep() {
  const router = useRouter();
  const setDraft = useStore((s) => s.setDraft);
  const [method, setMethod] = useState<PayMethod>(() => useStore.getState().customer.draft.payMethod);

  return (
    <WelcomeScreen centered title="How do you like to pay?" subtitle="You always pay your driver directly. Change it any time." art={<PayArt />}>
      <div role="radiogroup" aria-label="How you pay" className="grid gap-2">
        {OPTIONS.map(({ value, label, text, icon: Icon }) => {
          const on = method === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setMethod(value)}
              className={`flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 text-left transition-colors ${on ? "border-ink bg-surface" : "border-line bg-surface hover:border-muted"}`}
            >
              <span className={`grid size-10 flex-none place-items-center rounded-full ${on ? "bg-danfo text-on-danfo" : "bg-surface-2 text-ink"}`}>
                <Icon size={20} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block">{label}</b>
                <small className="text-[0.84rem] text-muted">{text}</small>
              </span>
              <span className={`grid size-6 flex-none place-items-center rounded-full border-2 ${on ? "border-ink bg-ink text-surface" : "border-line"}`}>
                {on && <Check size={14} strokeWidth={3} aria-hidden />}
              </span>
            </button>
          );
        })}
      </div>
      <PillButton
        onClick={() => {
          setDraft({ payMethod: method });
          router.push(nextWelcomeStep("pay"));
        }}
      >
        Continue
      </PillButton>
    </WelcomeScreen>
  );
}

export default function PayPage() {
  return (
    <RequireAccount>
      <PayStep />
    </RequireAccount>
  );
}
