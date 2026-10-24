import type { Metadata, Viewport } from "next";
import { Figtree, Martian_Mono, Unbounded } from "next/font/google";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin"] });
const martian = Martian_Mono({ variable: "--font-martian", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Maza-Maza", template: "%s · Maza-Maza" },
  description:
    "Rides and deliveries at the price you agree. Customers make an offer, drivers accept or counter, and drivers pay a day ticket instead of commission.",
  applicationName: "Maza-Maza",
  appleWebApp: { capable: true, title: "Maza-Maza", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/maza-maza.svg", apple: "/icons/maza-maza.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#063a28" },
    { media: "(prefers-color-scheme: dark)", color: "#04261a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" data-scroll-behavior="smooth" className={`${figtree.variable} ${unbounded.variable} ${martian.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
