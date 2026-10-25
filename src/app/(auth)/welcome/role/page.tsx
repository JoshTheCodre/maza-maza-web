"use client";

import { useRouter } from "next/navigation";
import { RequireAccount } from "@/components/app/require-account";
import { PillButton, writeSession } from "@/components/auth/auth-parts";
import { RideTogetherArt } from "@/components/auth/illustrations";
import { nextWelcomeStep, ROLE_KEY, type Role } from "@/components/auth/onboarding";
import { WelcomeScreen } from "@/components/auth/welcome-screen";

export default function RolePage() {
  const router = useRouter();
  const pick = (role: Role) => {
    writeSession(ROLE_KEY, role);
    router.push(nextWelcomeStep("role"));
  };
  return (
    <RequireAccount>
      <WelcomeScreen centered back="/welcome" title="Are you a passenger or a driver?" subtitle="You can switch any time in Account." art={<RideTogetherArt />}>
        <PillButton onClick={() => pick("passenger")}>Passenger</PillButton>
        <PillButton tone="soft" onClick={() => pick("driver")}>
          Driver
        </PillButton>
      </WelcomeScreen>
    </RequireAccount>
  );
}
