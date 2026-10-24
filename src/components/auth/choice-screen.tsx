"use client";

import { ChevronRight, LoaderCircle, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/ui/display";
import { takeNext } from "@/lib/next-path";
import { useStore } from "@/lib/store";
import { DealIllustration, GoogleIcon } from "./auth-parts";
import { FLOWS, pathAfterSignIn } from "./flows";

const COPY = {
  login: {
    blurb: "Good to see you again.",
    title: "Log in",
    phone: "Log in with phone",
    google: "Log in with Google",
    switchText: "New to Maza-Maza?",
    switchLabel: "Sign up",
    switchHref: "/signup",
  },
  signup: {
    blurb: "Name your price on every ride.",
    title: "Create your account",
    phone: "Sign up with phone",
    google: "Sign up with Google",
    switchText: "Already have an account?",
    switchLabel: "Log in",
    switchHref: "/login",
  },
};

function Choice({ icon, label, busy, onClick }: { icon: ReactNode; label: string; busy?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex min-h-16 items-center gap-4 rounded-2xl border-[1.5px] border-line bg-surface px-4 text-left text-[1.05rem] font-semibold transition-colors hover:border-ink disabled:border-brand"
    >
      <span className="grid size-11 flex-none place-items-center rounded-full bg-surface-2">{icon}</span>
      <span className="flex-1">{label}</span>
      {busy ? <LoaderCircle size={20} className="animate-spin text-brand" aria-hidden /> : <ChevronRight size={20} className="text-muted" aria-hidden />}
    </button>
  );
}

/** The first screen of log in and of sign up: pick phone or Google. */
export function ChoiceScreen({ intent }: { intent: "login" | "signup" }) {
  const router = useRouter();
  const signIn = useStore((s) => s.signIn);
  const signedIn = useStore((s) => s.signedIn);
  const named = useStore((s) => !!s.customer.profile.name);
  const [connecting, setConnecting] = useState(false);
  const started = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copy = COPY[intent];

  // Already logged in: skip straight to where they were going.
  useEffect(() => {
    if (signedIn && named && !started.current) router.replace(takeNext());
  }, [signedIn, named, router]);

  // Next keeps visited pages alive in the background, so start fresh whenever this one is hidden.
  useEffect(
    () => () => {
      started.current = false;
      clearTimeout(timer.current);
      setConnecting(false);
    },
    [],
  );

  // UI only for now: the backend will send this through Google's own sign-in and back.
  const continueWithGoogle = () => {
    started.current = true;
    setConnecting(true);
    timer.current = setTimeout(() => {
      signIn({ method: "google" });
      const { customer, locationAsked } = useStore.getState();
      router.push(pathAfterSignIn(intent, { named: !!customer.profile.name, locationAsked }));
    }, 900);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:grid lg:grid-cols-2">
      <section className="on-hero relative flex flex-none flex-col items-center justify-end gap-5 bg-brand px-6 pt-[calc(env(safe-area-inset-top)+64px)] pb-8 text-on-brand lg:justify-center lg:bg-hero lg:text-on-hero">
        <Link href="/" aria-label="Maza-Maza home" className="absolute top-[calc(env(safe-area-inset-top)+16px)] left-5">
          <LogoMark size={34} />
        </Link>
        <DealIllustration />
        <p className="text-center text-[1.15rem] font-semibold lg:text-[1.3rem]">{copy.blurb}</p>
      </section>

      <section className="flex flex-1 flex-col px-6 pt-8 pb-[calc(20px+env(safe-area-inset-bottom))] lg:justify-center">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <h1 className="text-[1.85rem] leading-tight font-bold tracking-tight">{copy.title}</h1>
          <div className="grid gap-3">
            <Choice
              icon={<Smartphone size={22} className="text-brand" aria-hidden />}
              label={copy.phone}
              onClick={() => {
                started.current = true;
                router.push(FLOWS[intent].phone);
              }}
            />
            <Choice
              icon={<GoogleIcon />}
              label={connecting ? "Connecting to Google…" : copy.google}
              busy={connecting}
              onClick={continueWithGoogle}
            />
          </div>
          <p className="text-[1rem] text-muted">
            {copy.switchText}{" "}
            <Link href={copy.switchHref} className="font-bold text-brand">
              {copy.switchLabel}
            </Link>
          </p>
        </div>
        <p className="mx-auto mt-auto w-full max-w-md pt-10 text-[0.82rem] leading-relaxed text-muted">
          By continuing, you agree to our{" "}
          <Link href="/help" className="text-brand underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/help" className="text-brand underline">
            Privacy Policy
          </Link>
          , and confirm you&apos;re over 18.
        </p>
      </section>
    </div>
  );
}
