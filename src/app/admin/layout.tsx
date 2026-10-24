import { AdminShell } from "@/components/admin/admin-shell";
import { AppProvider } from "@/components/app/providers";
import { RequireAccount } from "@/components/app/require-account";

export const metadata = { title: "Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <RequireAccount>
        <AdminShell>{children}</AdminShell>
      </RequireAccount>
    </AppProvider>
  );
}
