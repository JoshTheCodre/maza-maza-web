"use client";

import { useRouter } from "next/navigation";
import { RequireAccount } from "@/components/app/require-account";
import { PillButton } from "@/components/auth/auth-parts";
import { FaceCheckArt } from "@/components/auth/illustrations";
import { nextWelcomeStep } from "@/components/auth/onboarding";
import { WelcomeScreen } from "@/components/auth/welcome-screen";

export default function VerifyIntroPage() {
  const router = useRouter();
  return (
    <RequireAccount>
      <WelcomeScreen
        onClose={() => router.push(nextWelcomeStep("verify"))}
        title="We need to verify it's you"
        subtitle="To keep everyone safe, we check passengers and drivers with a quick selfie."
        art={<FaceCheckArt />}
      >
        <PillButton onClick={() => router.push("/welcome/verify/camera")}>Continue</PillButton>
      </WelcomeScreen>
    </RequireAccount>
  );
}
