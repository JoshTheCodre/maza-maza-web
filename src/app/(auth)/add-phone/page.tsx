import { RequireAccount } from "@/components/app/require-account";
import { PhoneStep } from "@/components/auth/phone-step";

export default function AddPhonePage() {
  return (
    <RequireAccount>
      <PhoneStep intent="add" />
    </RequireAccount>
  );
}
