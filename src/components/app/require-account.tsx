"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { rememberNext } from "@/lib/next-path";
import { useStore } from "@/lib/store";

/** Sends people who aren't logged in through log in (or sign up, if this device has never had an account) first. */
export function RequireAccount({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const signedIn = useStore((s) => s.signedIn);
  const named = useStore((s) => !!s.customer.profile.name);

  useEffect(() => {
    if (!signedIn) {
      rememberNext(path);
      router.replace(named ? "/login" : "/signup");
    } else if (!named) {
      rememberNext(path);
      router.replace("/welcome");
    }
  }, [signedIn, named, path, router]);

  if (!signedIn || !named) return null;
  return <>{children}</>;
}
