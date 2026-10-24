"use client";

// Stand-in for everyone else on the platform until the backend exists: other drivers
// reply to the customer's offers, other customers send offers to the driver, their
// trips move along, and they answer chat messages. Replace with the API and live sockets.

import { PLACES, roadKm } from "./data/places";
import { BOT_CUSTOMERS, BOT_DRIVERS } from "./data/people";
import { activeDriverTrip, driverCanReceive, driverMode, uid, useStore } from "./store";
import type { Bid, RideRequest, Trip } from "./types";

interface BotPlan {
  driverIndex: number;
  min: number;
  replyAt: number;
  replied: boolean;
  waitingForRaise: boolean;
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

function planFor(r: RideRequest, now: number, bids: Bid[]): BotPlan[] {
  const pool = BOT_DRIVERS[r.mode === "ride" ? "car" : "bike"];
  const order = pool.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 4);
  // After a page reload the plan is rebuilt, so drivers who already replied stay replied.
  const already = new Set(bids.filter((b) => b.requestId === r.id && b.source === "bot").map((b) => b.driver.id));
  const p = order.map((driverIndex, i) => ({
    driverIndex,
    min: round50(r.firstOffer * rand(0.9, 1.45)),
    replyAt: now + 2200 + i * 1500 + rand(0, 700),
    replied: already.has(pool[driverIndex].id),
    waitingForRaise: false,
  }));
  if (!already.size && !p.some((b) => b.min <= r.firstOffer)) p[2].min = r.firstOffer;
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
      const driver = BOT_DRIVERS[r.mode === "ride" ? "car" : "bike"][b.driverIndex];
      if (useStore.getState().bids.some((x) => x.requestId === r.id && x.driver.id === driver.id)) continue;
      useStore.getState().addBid({
        id: uid(),
        requestId: r.id,
        source: "bot",
        driver,
        kind,
        amount: kind === "accept" ? r.offer : b.min,
        etaMin: Math.round(rand(2, 9)),
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
    useStore.getState().botCustomerDecides(bid.id, Math.random() < chance && !activeDriverTrip(useStore.getState()));
  }
}

function tripsMove(now: number) {
  for (const t of useStore.getState().trips) {
    if (t.driverSource !== "bot") continue;
    if (t.stage === "to_pickup" || t.stage === "at_pickup" || t.stage === "on_trip") {
      if (now - t.stageAt >= TRIP_STEP_MS[t.stage]) useStore.getState().advanceTrip(t.id);
    }
  }
}

const DRIVER_REPLIES: Record<string, string[]> = {
  to_pickup: ["I'm on my way. I go reach soon.", "Okay, I dey come.", "Traffic small, I'm almost there."],
  at_pickup: ["I'm at the pickup now.", "I'm here. Please come out.", "I'm waiting by the gate."],
  on_trip: ["No problem.", "Okay.", "We're close."],
  payment: ["Thank you!", "Okay, thank you.", "No wahala."],
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
    if (!live(t) || (t.driverSource === "me") === (t.customerSource === "me")) continue;
    const mine = t.customerSource === "me" ? "customer" : "driver";
    const thread = s.messages.filter((m) => m.tripId === t.id);
    const last = thread[thread.length - 1];
    if (!last || last.from !== mine || now - last.createdAt < 2500) continue;
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
  while (b.id === a.id || roadKm(a, b) < 3) b = pick(PLACES);
  const km = roadKm(a, b);
  const offer = Math.max(500, round100((mode === "ride" ? 600 + km * 150 : 450 + km * 95) * rand(0.8, 1.12)));
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
    status: "open",
    createdAt: now,
    expiresAt: now + 45_000,
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
