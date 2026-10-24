import { RequireAccount } from "@/components/app/require-account";
import { CodeStep } from "@/components/auth/code-step";

export default function AddPhoneVerifyPage() {
  return (
    <RequireAccount>
      <CodeStep intent="add" />
    </RequireAccount>
  );
}
