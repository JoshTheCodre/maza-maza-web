import { DriverShell } from "@/components/driver/driver-shell";

export default function DriverMainLayout({ children }: { children: React.ReactNode }) {
  return <DriverShell>{children}</DriverShell>;
}
