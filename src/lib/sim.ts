"use client";

// Stand-in for everyone else on the platform until the backend exists: other drivers
// reply to the customer's offers, other customers send offers to the driver, their
// trips move along, and they answer chat messages. Replace with the API and live sockets.

import { place, PLACES } from "./data/places";
import { BOT_CUSTOMERS, BOT_DRIVERS } from "./data/people";
import { minutesAway } from "./pricing";
import { runReminders } from "./reminders";
import { classOf } from "./ride-classes";
import { quoteFor } from "./quotes";
import { knownRoute, requestRoute } from "./routing";
import { activeDriverTrip, driverCanReceive, driverMode, queuedDriverTrip, uid, useStore } from "./store";
import type { Bid, NextJob, RideRequest, Trip } from "./types";

interface BotPlan {
  driverIndex: number;
  min: number;
  replyAt: number;
  replied: boolean;
  waitingForRaise: boolean;
  /** A rider finishing a delivery nearby, offering to take this as their next job. */
  nextJob?: NextJob;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const round50 = (n: number) => Math.round(n / 50) * 50;
const round100 = (n: number) => Math.round(n / 100) * 100;

const plans = new Map<string, BotPlan[]>();
const decideAt = new Map<string, number>();
let nextSpawnAt = 0;
let couldReceive = false;

const TRIP_STEP_MS = { to_pickup: 9000, at_pickup: 6000, on_trip: 12000 } as const;

/** Drivers who can take a request: the right vehicle and, for cars, the class the customer chose. */
const poolFor = (r: RideRequest) => BOT_DRIVERS[r.mode === "ride" ? "car" : "bike"].filter((d) => r.mode !== "ride" || classOf(d.vehicle) === classOf(r));

function planFor(r: RideRequest, now: number, bids: Bid[]): BotPlan[] {
  const pool = poolFor(r);
  const order = pool.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 4);
  // After a page reload the plan is rebuilt, so drivers who already replied stay replied.
  const already = new Set(bids.filter((b) => b.requestId === r.id && b.source === "bot").map((b) => b.driver.id));
  // Drivers weigh offers against the recommended fare, each with their own idea of what's fair.
  const quote = quoteFor(place(r.pickupId), place(r.dropId), r.mode, r.scheduledFor ?? now, useStore.getState().settings, r.rideClass);
  const p: BotPlan[] = order.map((driverIndex, i) => ({
    driverIndex,
    min: round50(quote.recommended * rand(0.88, 1.2)),
    replyAt: now + 2200 + i * 1500 + rand(0, 700),
    replied: already.has(pool[driverIndex].id),
    waitingForRaise: false,
    nextJob: r.mode === "send" && i === 1 && Math.random() < 0.7 ? { freeInMin: Math.round(rand(2, 5)) } : undefined,
  }));
  // A fair offer always finds someone.
  if (p.length && !already.size && r.firstOffer >= quote.low && !p.some((b) => b.min <= r.firstOffer)) p[Math.min(2, p.length - 1)].min = r.firstOffer;
  return p;
}

function driversReply(now: number) {
  const s = useStore.getState();
  for (const r of s.requests) {
    if (r.source !== "me" || r.status !== "open") continue;
    let plan = plans.get(r.id);
    if (!plan) {
      plan = planFor(r, now, s.bids);
      plans.set(r.id, plan);
    }
    for (const b of plan) {
      if (b.replied) continue;
      if (b.waitingForRaise) {
        if (b.min <= r.offer * 1.25) {
          b.waitingForRaise = false;
          b.replyAt = now + rand(900, 2200);
        }
        continue;
      }
      if (now < b.replyAt) continue;
      const kind = b.min <= r.offer ? "accept" : b.min <= r.offer * 1.25 ? "counter" : null;
      if (!kind) {
        b.waitingForRaise = true;
        continue;
      }
      b.replied = true;
      const driver = poolFor(r)[b.driverIndex];
      if (useStore.getState().bids.some((x) => x.requestId === r.id && x.driver.id === driver.id)) continue;
      useStore.getState().addBid({
        id: uid(),
        requestId: r.id,
        source: "bot",
        driver,
        kind,
        amount: kind === "accept" ? r.offer : b.min,
        etaMin: (b.nextJob?.freeInMin ?? 0) + minutesAway(rand(0.5, 3.2), r.mode, now),
        nextJob: b.nextJob,
        status: "active",
        createdAt: now,
      });
    }
  }
}

function customersDecide(now: number) {
  const s = useStore.getState();
  for (const bid of s.bids) {
    if (bid.source !== "me" || bid.status !== "active") continue;
    const req = s.requests.find((r) => r.id === bid.requestId);
    if (!req || req.source !== "bot" || req.status !== "open") continue;
    if (!decideAt.has(bid.id)) decideAt.set(bid.id, now + rand(1800, 3400));
    if (now < (decideAt.get(bid.id) ?? 0)) continue;
    decideAt.delete(bid.id);
    const ratio = bid.amount / req.offer;
    const chance = ratio <= 1 ? 0.9 : ratio <= 1.1 ? 0.75 : ratio <= 1.25 ? 0.45 : ratio <= 1.4 ? 0.2 : 0.05;
    const st = useStore.getState();
    const free = !activeDriverTrip(st) || (!!bid.nextJob && !queuedDriverTrip(st));
    useStore.getState().botCustomerDecides(bid.id, Math.random() < chance && free);
  }
}

function tripsMove(now: number) {
  for (const t of useStore.getState().trips) {
    if (t.driverSource !== "bot") continue;
    if (t.stage === "to_pickup" || t.stage === "at_pickup" || t.stage === "on_trip") {
      // A rider booked as a next job finishes their other delivery first.
      const wait = t.stage === "to_pickup" && t.nextJob ? TRIP_STEP_MS.to_pickup + 6000 : TRIP_STEP_MS[t.stage];
      if (now - t.stageAt >= wait) useStore.getState().advanceTrip(t.id);
    }
  }
}

const DRIVER_REPLIES: Record<string, string[]> = {
  to_pickup: ["I'm on my way. I go reach soon.", "Okay, I dey come.", "Traffic small, I'm almost there."],
  at_pickup: ["I'm at the pickup now.", "I'm here. Please come out.", "I'm waiting by the gate."],
  on_trip: ["No problem.", "Okay.", "We're close."],
  payment: ["Thank you!", "Okay, thank you.", "No wahala."],
};
const RECIPIENT_REPLIES: Record<string, string[]> = {
  to_pickup: ["I'm picking it up now, then coming to you.", "I'll call you when I'm close."],
  at_pickup: ["I have the package. Coming to you now.", "Collected. On my way."],
  on_trip: ["I'm on my way to you.", "I go reach you soon. Please be ready to collect.", "Traffic small, but I'm close."],
  payment: ["Delivered. Thank you!"],
};
const CUSTOMER_REPLIES: Record<string, string[]> = {
  to_pickup: ["Okay, I'm waiting.", "Please call when you're close.", "Thank you."],
  at_pickup: ["I'm coming out now.", "Give me 2 minutes please.", "I'm by the gate."],
  on_trip: ["Okay.", "Thank you."],
  payment: ["Sending it now.", "Thank you!"],
};

function chatReplies(now: number) {
  const s = useStore.getState();
  const live = (t: Trip) => t.stage !== "completed" && t.stage !== "cancelled";
  for (const t of s.trips) {
    if (!live(t)) continue;
    const thread = s.messages.filter((m) => m.tripId === t.id);
    const last = thread[thread.length - 1];
    if (!last || now - last.createdAt < 2500) continue;
    // The receiver of a delivery chats from the tracking link; a bot rider answers them.
    if (last.from === "recipient") {
      if (t.driverSource === "bot") s.sendMessage(t.id, "driver", pick(RECIPIENT_REPLIES[t.stage] ?? ["Okay."]));
      continue;
    }
    if ((t.driverSource === "me") === (t.customerSource === "me")) continue;
    const mine = t.customerSource === "me" ? "customer" : "driver";
    if (last.from !== mine) continue;
    const pool = (mine === "customer" ? DRIVER_REPLIES : CUSTOMER_REPLIES)[t.stage] ?? ["Okay."];
    s.sendMessage(t.id, mine === "customer" ? "driver" : "customer", pick(pool));
  }
}

function spawnRequests(now: number) {
  const s = useStore.getState();
  const can = driverCanReceive(s, now);
  if (can && !couldReceive) nextSpawnAt = now + 3000;
  couldReceive = can;
  if (!can || now < nextSpawnAt) return;
  nextSpawnAt = now + rand(15000, 24000);
  const mode = driverMode(s);
  if (s.requests.filter((r) => r.source === "bot" && r.status === "open" && r.mode === mode).length >= 2) return;
  const a = pick(PLACES);
  let b = pick(PLACES);
  while (b.id === a.id || knownRoute(a, b).km < 3) b = pick(PLACES);
  requestRoute(a, b);
  // Car requests are for the driver's class. About a quarter are booked ahead, airport trips more often.
  const rideClass = mode === "ride" ? classOf(s.driver.profile.vehicle) : undefined;
  const airport = a.id === "airport" || b.id === "airport";
  const scheduledFor = mode === "ride" && Math.random() < (airport ? 0.6 : 0.25) ? Math.round((now + rand(40, 240) * 60_000) / 300_000) * 300_000 : undefined;
  // Customers offer around the recommended fare: some a bit under, some a bit over.
  const fair = quoteFor(a, b, mode, scheduledFor ?? now, s.settings, rideClass).recommended;
  const offer = Math.max(s.settings.minOffer, round100(fair * rand(0.85, 1.08)));
  useStore.getState().addRequest({
    id: uid(),
    source: "bot",
    customer: pick(BOT_CUSTOMERS),
    mode,
    pickupId: a.id,
    dropId: b.id,
    offer,
    firstOffer: offer,
    payMethod: pick(["cash", "transfer"] as const),
    notes: mode === "ride" ? (Math.random() < 0.4 ? [pick(["AC please", "I have luggage"])] : []) : [],
    parcel: mode === "send" ? pick(["Documents", "Small parcel", "Food", "Medium box"]) : undefined,
    rideClass,
    scheduledFor,
    flight: scheduledFor && b.id === "airport" ? { kind: "departure", number: `P4 ${Math.round(rand(7100, 7199))}`, time: scheduledFor + 150 * 60_000, international: false } : undefined,
    status: "open",
    createdAt: now,
    expiresAt: now + (scheduledFor ? 90_000 : 45_000),
    kmToPickup: Math.round(rand(0.6, 3.4) * 10) / 10,
    reach: 0,
  });
}

function tick() {
  const now = Date.now();
  useStore.getState().expireRequests(now);
  driversReply(now);
  customersDecide(now);
  tripsMove(now);
  chatReplies(now);
  spawnRequests(now);
  runReminders(now);
}

let running = false;

/** Runs in one browser tab at a time. Returns a stop function. */
export function startSimulation(): () => void {
  if (running) return () => {};
  running = true;
  let interval: ReturnType<typeof setInterval> | undefined;
  let release: (() => void) | undefined;
  let cancelled = false;
  const begin = () => {
    interval = setInterval(tick, 1000);
  };
  if (typeof navigator !== "undefined" && navigator.locks) {
    navigator.locks.request("maza-maza-simulation", () =>
      new Promise<void>((resolve) => {
        if (cancelled) return resolve();
        release = resolve;
        begin();
      }),
    );
  } else {
    begin();
  }
  return () => {
    cancelled = true;
    if (interval) clearInterval(interval);
    release?.();
    running = false;
  };
}
