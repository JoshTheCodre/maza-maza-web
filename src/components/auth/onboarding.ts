"use client";

import { takeNext } from "@/lib/next-path";
import { useStore } from "@/lib/store";
import { readSession, removeSession } from "./auth-parts";

/** Which side someone picked on the welcome screen. It only steers the welcome steps, so it lives in the session. */
export const ROLE_KEY = "maza-role";
/** Set when the face check is opened from Account, so it returns there instead of carrying on with the welcome steps. */
export const VERIFY_RETURN_KEY = "maza-verify-return";

export type Role = "passenger" | "driver";
export const chosenRole = (): Role => (readSession(ROLE_KEY) === "driver" ? "driver" : "passenger");

type Step = "role" | "verify" | "location" | "notifications" | "pay";

/**
 * The welcome steps after someone names their account, like other ride apps:
 * passenger or driver → face check → location → notifications → how you pay (passengers only).
 * Drivers then go on to the driver application; passengers to where they were heading.
 */
export function nextWelcomeStep(after: Step): string {
  if (after === "verify") {
    const back = readSession(VERIFY_RETURN_KEY);
    if (back) {
      removeSession(VERIFY_RETURN_KEY);
      return back;
    }
  }
  const role = chosenRole();
  if (after === "role") return "/welcome/verify";
  if (after === "verify") return useStore.getState().locationAsked ? "/welcome/notifications" : "/welcome/location";
  if (after === "location") return "/welcome/notifications";
  if (after === "notifications" && role === "passenger") return "/welcome/pay";
  removeSession(ROLE_KEY);
  return role === "driver" ? "/driver/signup" : takeNext();
}
