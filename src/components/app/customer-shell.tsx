"use client";

import { House, List, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Avatar, Logo } from "@/components/ui/display";
import { Toaster } from "@/components/ui/toaster";
import { rememberNext } from "@/lib/next-path";
import { useStore } from "@/lib/store";
import { BellLink } from "./common";
import { BottomNav, TopNavLinks, type NavItem } from "./layout-parts";

const NAV: NavItem[] = [
  { href: "/ride", label: "Ride", icon: House, match: (p) => p === "/ride" || p.startsWith("/ride/") },
  { href: "/activity", label: "Activity", icon: List },
  { href: "/account", label: "Account", icon: User },
];

const TOP_LEVEL = (p: string) => p === "/ride" || p === "/activity" || p === "/account";

export function CustomerShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const signedIn = useStore((s) => s.signedIn);
  const named = useStore((s) => !!s.customer.profile.name);
  const name = useStore((s) => s.customer.profile.name);

  useEffect(() => {
    if (!signedIn) {
      rememberNext(path);
      router.replace(named ? "/login" : "/signup");
    } else if (!named) router.replace("/welcome");
  }, [signedIn, named, path, router]);

  if (!signedIn || !named) return null;

  return (
    <div className="flex h-dvh flex-col">
      <header className="on-hero hidden flex-none border-b border-hero-line bg-hero text-on-hero lg:block">
        <div className="flex min-h-16 items-center gap-6 px-6">
          <Link href="/ride" aria-label="Maza-Maza home">
            <Logo />
          </Link>
          <TopNavLinks items={NAV} />
          <div className="ml-auto flex items-center gap-2">
            <BellLink audience="customer" dark />
            <Link href="/account" aria-label="Account" className="rounded-full">
              <Avatar name={name} size="sm" dark />
            </Link>
          </div>
        </div>
      </header>
      <main className="relative flex min-h-0 flex-1 flex-col pt-[env(safe-area-inset-top)] lg:pt-0">{children}</main>
      {TOP_LEVEL(path) && <BottomNav items={NAV} />}
      <Toaster audience="customer" />
    </div>
  );
}
