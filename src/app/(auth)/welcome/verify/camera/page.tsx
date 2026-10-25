import { RequireAccount } from "@/components/app/require-account";
import { SelfieCamera } from "@/components/auth/selfie-camera";

export default function SelfiePage() {
  return (
    <RequireAccount>
      <SelfieCamera />
    </RequireAccount>
  );
}
