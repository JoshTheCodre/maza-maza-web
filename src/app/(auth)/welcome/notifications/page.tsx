"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequireAccount } from "@/components/app/require-account";
import { PillButton } from "@/components/auth/auth-parts";
import { NotifyArt } from "@/components/auth/illustrations";
import { chosenRole, nextWelcomeStep } from "@/components/auth/onboarding";
import { WelcomeScreen } from "@/components/auth/welcome-screen";

function NotificationsStep() {
  const router = useRouter();
  const [role] = useState(chosenRole);
  const [asking, setAsking] = useState(false);
  const next = () => router.push(nextWelcomeStep("notifications"));

  const allow = async () => {
    setAsking(true);
    try {
      if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    } catch {}
    next();
  };

  return (
    <WelcomeScreen
      centered
      title={role === "driver" ? "Hear about every offer" : "Don't miss an offer"}
      subtitle={
        role === "driver"
          ? "We'll let you know when customers near you name a price, and when they accept yours."
          : "We'll let you know when drivers reply, when your ride arrives and when it's time to pay."
      }
      art={<NotifyArt />}
    >
      <PillButton disabled={asking} onClick={allow}>
        {asking ? "Waiting for your browser…" : "Turn on notifications"}
      </PillButton>
      <PillButton tone="soft" disabled={asking} onClick={next}>
        Not now
      </PillButton>
    </WelcomeScreen>
  );
}

export default function NotificationsPage() {
  return (
    <RequireAccount>
      <NotificationsStep />
    </RequireAccount>
  );
}
