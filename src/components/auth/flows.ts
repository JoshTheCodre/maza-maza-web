"use client";

import { takeNext } from "@/lib/next-path";
import { toast } from "@/lib/toasts";

/** Log in and sign up are separate journeys. "add" is a signed-in Google user adding a phone number. */
export type AuthIntent = "login" | "signup" | "add";

export const FLOWS: Record<AuthIntent, { start: string; phone: string; verify: string }> = {
  login: { start: "/login", phone: "/login/phone", verify: "/login/verify" },
  signup: { start: "/signup", phone: "/signup/phone", verify: "/signup/verify" },
  add: { start: "/account/profile", phone: "/add-phone", verify: "/add-phone/verify" },
};

/** Where someone goes once they're signed in. An account "exists" once it has a name. */
export function pathAfterSignIn(intent: "login" | "signup", account: { named: boolean; locationAsked: boolean }) {
  if (!account.named) {
    if (intent === "login") toast("customer", "No account yet, so let's create one.");
    return "/welcome";
  }
  if (intent === "signup") toast("customer", "You already have an account, so we logged you in.");
  return account.locationAsked ? takeNext() : "/welcome/location";
}
