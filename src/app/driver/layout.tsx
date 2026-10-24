import { AppProvider } from "@/components/app/providers";
import { RequireAccount } from "@/components/app/require-account";

export const metadata = { title: "Driver" };

export default function DriverRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <RequireAccount>{children}</RequireAccount>
    </AppProvider>
  );
}
