import { AppProvider } from "@/components/app/providers";
import { Toaster } from "@/components/ui/toaster";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      {children}
      <Toaster audience="customer" />
    </AppProvider>
  );
}
