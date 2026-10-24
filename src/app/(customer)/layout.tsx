import { CustomerShell } from "@/components/app/customer-shell";
import { AppProvider } from "@/components/app/providers";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <CustomerShell>{children}</CustomerShell>
    </AppProvider>
  );
}
