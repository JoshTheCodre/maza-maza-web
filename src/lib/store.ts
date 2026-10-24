"use client";

// Client-side data store. It stands in for the API and database until the backend
// exists: every action maps to a future API route and the state mirrors the tables.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_SETTINGS, MODE_FOR_VEHICLE } from "./config";
import { place, roadKm } from "./data/places";
import { shortName } from "./data/people";
import { daysAgo, firstName, lagosDate, naira } from "./format";
import { toast } from "./toasts";
import type {
  AppNotification,
  Bid,
  BidKind,
  ChatMessage,
  DayTicket,
  DriverApplication,
  DriverPublic,
  DriverStatus,
  EmergencyContact,
  Guarantor,
  Mode,
  PayMethod,
  Payout,
  Person,
  Report,
  ReportKind,
  RideRequest,
  SavedPlace,
  Settings,
  Side,
  TopUpMethod,
  Trip,
  VehicleType,
  WalletEntry,
} from "./types";

export const STORAGE_KEY = "maza-maza-v2";

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 12)
    : Math.random().toString(36).slice(2, 14);

export interface Draft {
  /** Which route field the place search is filling in. */
  editing: "pickup" | "drop";
  mode: Mode;
  pickupId: string;
  dropId: string | null;
  offer: number;
  payMethod: PayMethod;
  notes: string[];
  parcel: string;
  receiver: string;
}

export interface DriverState {
  status: DriverStatus;
  profile: DriverPublic;
  online: boolean;
  tickets: DayTicket[];
  wallet: WalletEntry[];
  skipped: string[];
}

export type AuthMethod = "phone" | "google";

export interface CustomerState {
  profile: Person;
  email: string;
  phone: string;
  /** How they log in. Missing on data saved before Google sign-in existed, which was always phone. */
  authMethod?: AuthMethod;
  draft: Draft;
  savedPlaces: SavedPlace[];
  contacts: EmergencyContact[];
  lastOffers: Record<string, number>;
}

export interface AppData {
  signedIn: boolean;
  locationAsked: boolean;
  customer: CustomerState;
  driver: DriverState;
  requests: RideRequest[];
  bids: Bid[];
  trips: Trip[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  applications: DriverApplication[];
  reports: Report[];
  settings: Settings;
  suspended: string[];
}

interface ApplicationInput {
  name: string;
  phone: string;
  city: string;
  vehicleType: VehicleType;
  vehicle: string;
  plate: string;
  guarantor: Guarantor;
  files: Record<string, string>;
}

interface Actions {
  // session
  signIn: (via: { method: "phone"; phone: string } | { method: "google" }) => void;
  addPhone: (phone: string) => void;
  signOut: () => void;
  setProfile: (p: { name: string; email?: string }) => void;
  setLocationAsked: () => void;
  // customer
  setDraft: (patch: Partial<Draft>) => void;
  chooseDrop: (placeId: string) => boolean;
  sendOffer: () => string | null;
  raiseOffer: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  declineBid: (bidId: string) => void;
  acceptBid: (bidId: string) => string | null;
  customerPay: (tripId: string, method: PayMethod) => void;
  rateTrip: (tripId: string, stars: number, tags: string[]) => void;
  cancelTrip: (tripId: string, by: Side, reason: string) => void;
  sendMessage: (tripId: string, from: Side, body: string) => void;
  report: (kind: ReportKind, message: string, from: Side, tripId?: string) => void;
  addContact: (name: string, phone: string) => void;
  removeContact: (id: string) => void;
  savePlace: (p: SavedPlace) => void;
  removeSavedPlace: (label: string) => void;
  markRead: (audience: Side) => void;
  // driver
  submitApplication: (a: ApplicationInput) => void;
  setPayout: (p: Payout) => void;
  topUp: (amount: number, method: TopUpMethod) => void;
  buyTicket: () => boolean;
  setOnline: (online: boolean) => void;
  skipRequest: (requestId: string) => void;
  placeBid: (requestId: string, kind: BidKind, amount: number) => boolean;
  advanceTrip: (tripId: string) => void;
  confirmPaid: (tripId: string) => void;
  // admin
  reviewApplication: (id: string, decision: "approved" | "rejected", note?: string) => void;
  resolveReport: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setSuspended: (personId: string, suspended: boolean) => void;
  // used by the stand-in for other people (sim.ts)
  addRequest: (r: RideRequest) => void;
  addBid: (b: Bid) => void;
  botCustomerDecides: (bidId: string, accept: boolean) => void;
  expireRequests: (now: number) => void;
}

export type Store = AppData & Actions;

/* ---------- Starting data ---------- */

const NEW_DRIVER: DriverPublic = { id: "drv-me", name: "", short: "", rating: 5, vehicle: { type: "car", description: "", plate: "" } };

function initialData(now = Date.now()): AppData {
  const at = (days: number, h: number, m = 0) => {
    const dt = new Date(daysAgo(days, now));
    dt.setUTCHours(h - 1, m, 0, 0); // Lagos is UTC+1
    return dt.getTime();
  };
  return {
    signedIn: false,
    locationAsked: false,
    customer: {
      profile: { id: "cust-me", name: "", short: "", rating: 5 },
      email: "",
      phone: "",
      draft: { editing: "drop", mode: "ride", pickupId: "yaba", dropId: null, offer: 0, payMethod: "cash", notes: [], parcel: "Small parcel", receiver: "" },
      savedPlaces: [],
      contacts: [],
      lastOffers: {},
    },
    driver: { status: "none", profile: NEW_DRIVER, online: false, tickets: [], wallet: [], skipped: [] },
    requests: [],
    bids: [],
    trips: [],
    messages: [],
    notifications: [],
    applications: [
      app("a-1", "Yusuf Adamu", "+234 806 000 2231", "bike", "Bajaj Boxer", "KJA 119 QB", at(0, 8, 14), "pending", ["uploaded", "uploaded", "uploaded", "uploaded", "uploaded"]),
      app("a-2", "Grace Okoro", "+234 809 000 7702", "car", "white Toyota Corolla 2012", "LSR 734 BC", at(0, 7, 2), "pending", ["verified", "uploaded", "uploaded", "uploaded", "uploaded"]),
      app("a-3", "Peter Ekanem", "+234 812 000 4459", "car", "grey Honda Civic 2010", "EPE 221 KD", at(1, 16, 40), "pending", ["uploaded", "uploaded", "missing", "uploaded", "uploaded"]),
      app("a-4", "Kemi Alade", "+234 803 000 9915", "car", "black Toyota Camry 2014", "AGL 508 FA", at(2, 11, 5), "approved", ["verified", "verified", "verified", "verified", "verified"]),
      app("a-5", "Uche Obi", "+234 805 000 3380", "bike", "TVS Apache", "MUS 640 XA", at(3, 14, 22), "rejected", ["verified", "rejected", "uploaded", "verified", "uploaded"], "Licence photo is blurred. Ask for a clear photo."),
    ],
    reports: [
      { id: "r-1", kind: "overcharge", tripId: "t-x1", from: "Tolu A. (customer)", against: "Driver KTU 388 BD", message: "Driver asked for ₦500 more at the drop-off because of traffic. We agreed ₦2,400.", createdAt: at(0, 9, 12), status: "open" },
      { id: "r-2", kind: "conduct", tripId: "t-x2", from: "Segun F. (driver)", against: "Customer Kunle B.", message: "Customer was rude and slammed the door. No damage.", createdAt: at(0, 7, 48), status: "open" },
      { id: "r-3", kind: "lost_item", tripId: "t-x3", from: "Ifeoma C. (customer)", against: "Driver APP 115 KJ", message: "Left a black umbrella in the back seat.", createdAt: at(1, 19, 5), status: "resolved" },
    ],
    settings: DEFAULT_SETTINGS,
    suspended: [],
  };
}

function app(
  id: string,
  name: string,
  phone: string,
  vehicleType: VehicleType,
  vehicle: string,
  plate: string,
  submittedAt: number,
  status: DriverApplication["status"],
  docs: DriverApplication["documents"][number]["status"][],
  note?: string,
): DriverApplication {
  const labels: [DriverApplication["documents"][number]["key"], string][] = [
    ["nin", "NIN slip"],
    ["licence", "Driver's licence"],
    ["vehicle_papers", "Vehicle papers"],
    ["selfie", "Selfie"],
    ["vehicle_photo", "Vehicle photo"],
  ];
  return {
    id,
    name,
    phone,
    city: "Lagos",
    vehicleType,
    vehicle,
    plate,
    submittedAt,
    status,
    note,
    documents: labels.map(([key, label], i) => ({ key, label, status: docs[i], fileName: docs[i] === "missing" ? undefined : `${key}.jpg` })),
    guarantor: { name: "Mrs. Adebayo", phone: "+234 802 000 5521", relationship: "Aunt" },
  };
}

/* ---------- Selectors ---------- */

export const ticketPrice = (s: AppData, type: VehicleType) => (type === "car" ? s.settings.ticketCar : s.settings.ticketBike);

export const walletBalance = (s: AppData) => s.driver.wallet.reduce((sum, e) => sum + e.amount, 0);

/** Today's ticket for the driver's current vehicle type (a car ticket doesn't cover a bike). */
export const todayTicket = (s: AppData, now = Date.now()) =>
  s.driver.tickets.find((t) => t.serviceDate === lagosDate(now) && t.vehicleType === s.driver.profile.vehicle.type) ?? null;

export const driverMode = (s: AppData): Mode => MODE_FOR_VEHICLE[s.driver.profile.vehicle.type];

export const activeDriverTrip = (s: AppData) =>
  s.trips.find((t) => t.driverSource === "me" && t.stage !== "completed" && t.stage !== "cancelled") ?? null;

/** The customer's trip that still needs them: riding, paying or rating. */
export const activeCustomerTrip = (s: AppData) =>
  s.trips.find((t) => t.customerSource === "me" && t.stage !== "cancelled" && t.rating === undefined) ?? null;

export const openCustomerRequest = (s: AppData) => s.requests.find((r) => r.source === "me" && r.status === "open") ?? null;

export const driverCanReceive = (s: AppData, now = Date.now()) =>
  s.driver.status === "approved" && s.driver.online && !!todayTicket(s, now) && !activeDriverTrip(s);

export const myBidFor = (s: AppData, requestId: string) =>
  s.bids.find((b) => b.requestId === requestId && b.source === "me") ?? null;

/** Requests the driver can see: open ones nearby from other people, plus recent ones they bid on. */
export const driverFeed = (s: AppData, now = Date.now()) => {
  if (!driverCanReceive(s, now)) return [];
  const mode = driverMode(s);
  return s.requests
    .filter((r) => r.source !== "me" && r.mode === mode && !s.driver.skipped.includes(r.id))
    .filter((r) => {
      if (r.status === "open") return true;
      const bid = myBidFor(s, r.id);
      return !!bid && now - Math.max(r.createdAt, bid.createdAt) < 60_000;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const todaysDriverTrips = (s: AppData, now = Date.now()) =>
  s.trips.filter((t) => t.driverSource === "me" && t.stage === "completed" && lagosDate(t.stageAt) === lagosDate(now));

export const customerHistory = (s: AppData) =>
  s.trips.filter((t) => t.customerSource === "me" && (t.stage === "completed" || t.stage === "cancelled" || (t.stage === "payment" && t.rating !== undefined))).sort((a, b) => b.createdAt - a.createdAt);

export const driverHistory = (s: AppData) =>
  s.trips.filter((t) => t.driverSource === "me" && (t.stage === "completed" || t.stage === "cancelled")).sort((a, b) => b.createdAt - a.createdAt);

export const unreadCount = (s: AppData, audience: Side) => s.notifications.filter((n) => n.audience === audience && !n.read).length;

export const tripMessages = (s: AppData, tripId: string) => s.messages.filter((m) => m.tripId === tripId);

/* ---------- Store ---------- */

const offerKey = (a: string, b: string) => `${a}>${b}`;

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const patchTrip = (id: string, patch: Partial<Trip>) =>
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

      /** Shows a toast now and keeps it in the notifications list. */
      const notify = (audience: Side, title: string, href?: string) => {
        toast(audience, title);
        set((s) => ({ notifications: [{ id: uid(), audience, title, href, createdAt: Date.now(), read: false }, ...s.notifications].slice(0, 60) }));
      };

      const finishIfSettled = (id: string) => {
        const t = get().trips.find((x) => x.id === id);
        if (t && t.stage === "payment" && t.customerPaid && t.driverConfirmedPaid) patchTrip(id, { stage: "completed", stageAt: Date.now() });
      };

      return {
        ...initialData(),

        signIn: (via) =>
          set((s) => ({
            signedIn: true,
            customer: { ...s.customer, authMethod: via.method, phone: via.method === "phone" ? via.phone : s.customer.phone },
          })),
        addPhone: (phone) => set((s) => ({ customer: { ...s.customer, phone } })),
        signOut: () => set((s) => ({ signedIn: false, driver: { ...s.driver, online: false } })),
        setProfile: ({ name, email }) =>
          set((s) => ({ customer: { ...s.customer, email: email ?? s.customer.email, profile: { ...s.customer.profile, name, short: shortName(name) } } })),
        setLocationAsked: () => set({ locationAsked: true }),

        setDraft: (patch) => set((s) => ({ customer: { ...s.customer, draft: { ...s.customer.draft, ...patch } } })),

        chooseDrop: (placeId) => {
          const { draft, lastOffers } = get().customer;
          if (placeId === draft.pickupId) {
            toast("customer", "Pick a drop-off that's different from your pickup.");
            return false;
          }
          get().setDraft({ dropId: placeId, offer: lastOffers[offerKey(draft.pickupId, placeId)] ?? 0 });
          return true;
        },

        sendOffer: () => {
          const s = get();
          const d = s.customer.draft;
          if (!d.dropId || d.offer < s.settings.minOffer || d.dropId === d.pickupId) return null;
          if (s.suspended.includes(s.customer.profile.id)) {
            toast("customer", "Your account is on hold, so you can't book right now. Contact support from Help.");
            return null;
          }
          const now = Date.now();
          const req: RideRequest = {
            id: uid(),
            source: "me",
            customer: s.customer.profile,
            mode: d.mode,
            pickupId: d.pickupId,
            dropId: d.dropId,
            offer: d.offer,
            firstOffer: d.offer,
            payMethod: d.payMethod,
            notes: d.notes,
            parcel: d.mode === "send" ? d.parcel : undefined,
            receiver: d.mode === "send" ? d.receiver : undefined,
            status: "open",
            createdAt: now,
            expiresAt: now + s.settings.requestTtlMin * 60_000,
            kmToPickup: 0,
            reach: 6 + Math.floor(Math.random() * 7),
          };
          set({ requests: [req, ...s.requests] });
          return req.id;
        },

        raiseOffer: (requestId) => {
          const s = get();
          const r = s.requests.find((x) => x.id === requestId);
          if (!r || r.status !== "open") return;
          const offer = r.offer + s.settings.raiseStep;
          set((st) => ({ requests: st.requests.map((x) => (x.id === requestId ? { ...x, offer, expiresAt: Date.now() + st.settings.requestTtlMin * 60_000 } : x)) }));
          get().setDraft({ offer });
        },

        cancelRequest: (requestId) =>
          set((s) => ({
            requests: s.requests.map((x) => (x.id === requestId ? { ...x, status: "cancelled" } : x)),
            bids: s.bids.map((b) => (b.requestId === requestId && b.status === "active" ? { ...b, status: "lost" } : b)),
          })),

        declineBid: (bidId) => set((s) => ({ bids: s.bids.map((b) => (b.id === bidId ? { ...b, status: "declined" } : b)) })),

        acceptBid: (bidId) => {
          const s = get();
          const bid = s.bids.find((b) => b.id === bidId);
          const req = bid && s.requests.find((r) => r.id === bid.requestId);
          if (!bid || !req || req.status !== "open" || bid.status !== "active") return null;
          if (bid.source === "me" && activeDriverTrip(s)) return null;
          const now = Date.now();
          const trip: Trip = {
            id: uid(),
            requestId: req.id,
            mode: req.mode,
            customer: req.customer,
            customerSource: req.source,
            driver: bid.driver,
            driverSource: bid.source,
            pickupId: req.pickupId,
            dropId: req.dropId,
            price: bid.amount,
            payMethod: req.payMethod,
            notes: [req.parcel, ...req.notes].filter(Boolean) as string[],
            stage: "to_pickup",
            stageAt: now,
            createdAt: now,
            etaMin: bid.etaMin,
            customerPaid: false,
            driverConfirmedPaid: false,
          };
          set({
            trips: [trip, ...s.trips],
            requests: s.requests.map((r) => (r.id === req.id ? { ...r, status: "matched" } : r)),
            bids: s.bids.map((b) => (b.requestId === req.id ? { ...b, status: b.id === bidId ? "won" : b.status === "active" ? "lost" : b.status } : b)),
            customer: req.source === "me" ? { ...s.customer, lastOffers: { ...s.customer.lastOffers, [offerKey(req.pickupId, req.dropId)]: req.offer } } : s.customer,
          });
          if (bid.source === "me") notify("driver", `${firstName(req.customer.name)} chose you at ${naira(bid.amount)}. Head to pickup.`, `/driver/trip/${trip.id}`);
          return trip.id;
        },

        botCustomerDecides: (bidId, accept) => {
          if (accept) {
            get().acceptBid(bidId);
            return;
          }
          const bid = get().bids.find((b) => b.id === bidId);
          const r = bid && get().requests.find((x) => x.id === bid.requestId);
          set((s) => ({
            bids: s.bids.map((b) => (b.id === bidId ? { ...b, status: "lost" } : b)),
            requests: r ? s.requests.map((x) => (x.id === r.id ? { ...x, status: "matched" } : x)) : s.requests,
          }));
          if (r) toast("driver", `${firstName(r.customer.name)} chose another driver.`);
        },

        customerPay: (tripId, method) => {
          const t = get().trips.find((x) => x.id === tripId);
          if (!t) return;
          patchTrip(tripId, { customerPaid: true, payMethod: method, driverConfirmedPaid: t.driverSource === "bot" ? true : t.driverConfirmedPaid });
          finishIfSettled(tripId);
        },

        rateTrip: (tripId, stars, tags) => {
          patchTrip(tripId, { rating: stars, tags });
          finishIfSettled(tripId);
        },

        cancelTrip: (tripId, by, reason) => {
          const t = get().trips.find((x) => x.id === tripId);
          if (!t || t.stage === "completed" || t.stage === "cancelled" || t.stage === "on_trip" || t.stage === "payment") return;
          patchTrip(tripId, { stage: "cancelled", stageAt: Date.now(), cancelledBy: by, cancelReason: reason });
          if (by === "customer" && reason === "Driver asked for more money") {
            get().report("overcharge", `Cancelled because the driver asked for more than the agreed ${naira(t.price)}.`, "customer", tripId);
          }
          if (by === "customer" && t.driverSource === "me") notify("driver", `${firstName(t.customer.name)} cancelled the trip.`);
          if (by === "driver" && t.customerSource === "me") notify("customer", `${firstName(t.driver.name)} cancelled the trip. Send your offer again.`, "/ride");
        },

        sendMessage: (tripId, from, body) => {
          const text = body.trim();
          if (!text) return;
          set((s) => ({ messages: [...s.messages, { id: uid(), tripId, from, body: text, createdAt: Date.now() }] }));
        },

        report: (kind, message, from, tripId) =>
          set((s) => ({
            reports: [
              {
                id: uid(),
                kind,
                tripId,
                message,
                from: from === "customer" ? `${s.customer.profile.short || "Customer"} (customer)` : `${s.driver.profile.short || "Driver"} (driver)`,
                against: tripId ? `Trip ${tripId.slice(0, 6).toUpperCase()}` : "—",
                createdAt: Date.now(),
                status: "open",
              },
              ...s.reports,
            ],
          })),

        addContact: (name, phone) => set((s) => ({ customer: { ...s.customer, contacts: [...s.customer.contacts, { id: uid(), name, phone }] } })),
        removeContact: (id) => set((s) => ({ customer: { ...s.customer, contacts: s.customer.contacts.filter((c) => c.id !== id) } })),
        savePlace: (p) => set((s) => ({ customer: { ...s.customer, savedPlaces: [...s.customer.savedPlaces.filter((x) => x.label !== p.label), p] } })),
        removeSavedPlace: (label) => set((s) => ({ customer: { ...s.customer, savedPlaces: s.customer.savedPlaces.filter((x) => x.label !== label) } })),
        markRead: (audience) => set((s) => ({ notifications: s.notifications.map((n) => (n.audience === audience ? { ...n, read: true } : n)) })),

        submitApplication: (a) => {
          const docs = app("me", a.name, a.phone, a.vehicleType, a.vehicle, a.plate, Date.now(), "pending", ["uploaded", "uploaded", "uploaded", "uploaded", "uploaded"]).documents.map((d) => ({ ...d, fileName: a.files[d.key] ?? d.fileName }));
          const application: DriverApplication = {
            id: `a-${uid()}`,
            isMe: true,
            name: a.name,
            phone: a.phone,
            city: a.city,
            vehicleType: a.vehicleType,
            vehicle: a.vehicle,
            plate: a.plate.toUpperCase(),
            documents: docs,
            guarantor: a.guarantor,
            status: "pending",
            submittedAt: Date.now(),
          };
          set((s) => ({
            applications: [application, ...s.applications.filter((x) => !x.isMe)],
            driver: {
              ...s.driver,
              status: "pending",
              online: false,
              profile: { ...s.driver.profile, name: a.name, short: shortName(a.name), vehicle: { type: a.vehicleType, description: a.vehicle, plate: a.plate.toUpperCase() } },
            },
          }));
        },

        setPayout: (p) => set((s) => ({ driver: { ...s.driver, profile: { ...s.driver.profile, payout: p } } })),

        topUp: (amount, method) => {
          set((s) => ({
            driver: {
              ...s.driver,
              wallet: [{ id: uid(), kind: "top_up", amount, method, note: `Top-up by ${method === "ussd" ? "USSD" : method === "card" ? "card" : "bank transfer"}`, createdAt: Date.now() }, ...s.driver.wallet],
            },
          }));
          notify("driver", `${naira(amount)} added to your wallet.`, "/driver/wallet");
        },

        buyTicket: () => {
          const s = get();
          const now = Date.now();
          const type = s.driver.profile.vehicle.type;
          const price = ticketPrice(s, type);
          if (todayTicket(s, now) || walletBalance(s) < price || s.driver.status !== "approved") return false;
          const ticket: DayTicket = { id: uid(), number: `MZ-${Math.floor(4000 + Math.random() * 5000)}`, serviceDate: lagosDate(now), vehicleType: type, price, boughtAt: now };
          set({
            driver: {
              ...s.driver,
              online: true,
              tickets: [ticket, ...s.driver.tickets],
              wallet: [{ id: uid(), kind: "ticket", amount: -price, note: "Day ticket", createdAt: now }, ...s.driver.wallet],
            },
          });
          return true;
        },

        setOnline: (online) => {
          const s = get();
          if (online && !todayTicket(s)) return;
          set({ driver: { ...s.driver, online } });
        },

        skipRequest: (requestId) => set((s) => ({ driver: { ...s.driver, skipped: [...s.driver.skipped, requestId] } })),

        placeBid: (requestId, kind, amount) => {
          const s = get();
          const req = s.requests.find((r) => r.id === requestId);
          if (!req || req.status !== "open" || !driverCanReceive(s)) return false;
          if (kind === "counter" && amount <= req.offer) return false;
          const bid: Bid = {
            id: uid(),
            requestId,
            source: "me",
            driver: s.driver.profile,
            kind,
            amount: kind === "accept" ? req.offer : amount,
            etaMin: Math.max(2, Math.round(req.kmToPickup * 2.5)),
            status: "active",
            createdAt: Date.now(),
          };
          set({ bids: [...s.bids.filter((b) => !(b.requestId === requestId && b.source === "me")), bid] });
          return true;
        },

        advanceTrip: (tripId) => {
          const t = get().trips.find((x) => x.id === tripId);
          if (!t) return;
          const next = { to_pickup: "at_pickup", at_pickup: "on_trip", on_trip: "payment" } as const;
          const stage = next[t.stage as keyof typeof next];
          if (!stage) return;
          patchTrip(tripId, { stage, stageAt: Date.now() });
          if (t.customerSource === "me") {
            const words = {
              at_pickup: `${firstName(t.driver.name)} has arrived. Look for ${t.driver.vehicle.plate}.`,
              on_trip: "Your trip has started.",
              payment: `You've arrived. Pay ${firstName(t.driver.name)} ${naira(t.price)}.`,
            };
            notify("customer", words[stage], `/ride/trip/${t.id}`);
          }
        },

        confirmPaid: (tripId) => {
          const t = get().trips.find((x) => x.id === tripId);
          if (!t) return;
          patchTrip(tripId, { driverConfirmedPaid: true, customerPaid: t.customerSource === "bot" ? true : t.customerPaid });
          if (t.customerSource === "bot") patchTrip(tripId, { stage: "completed", stageAt: Date.now() });
          else finishIfSettled(tripId);
        },

        reviewApplication: (id, decision, note) => {
          const a = get().applications.find((x) => x.id === id);
          set((s) => ({
            applications: s.applications.map((x) =>
              x.id === id ? { ...x, status: decision, note, documents: x.documents.map((d) => ({ ...d, status: decision === "approved" && d.status !== "missing" ? "verified" : d.status })) } : x,
            ),
            driver: a?.isMe ? { ...s.driver, status: decision } : s.driver,
          }));
          if (a?.isMe) notify("driver", decision === "approved" ? "You're approved. Top up and buy your first day ticket." : "Your application needs changes.", "/driver");
        },

        resolveReport: (id) => set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)) })),
        updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
        setSuspended: (personId, suspended) => set((s) => ({ suspended: suspended ? [...new Set([...s.suspended, personId])] : s.suspended.filter((x) => x !== personId) })),

        addRequest: (r) => {
          set((s) => ({ requests: [r, ...s.requests].slice(0, 60) }));
          if (r.source === "bot") toast("driver", `New offer from ${firstName(r.customer.name)}: ${naira(r.offer)}`);
        },
        addBid: (b) => {
          set((s) => ({ bids: [...s.bids, b] }));
          const r = get().requests.find((x) => x.id === b.requestId);
          if (r?.source === "me") notify("customer", `${b.driver.short} ${b.kind === "accept" ? "accepted" : "countered"} ${naira(b.amount)}`, `/ride/request/${r.id}`);
        },
        expireRequests: (now) => {
          const expired = get().requests.filter((r) => r.status === "open" && r.expiresAt < now);
          if (!expired.length) return;
          const ids = new Set(expired.map((r) => r.id));
          set((s) => ({
            requests: s.requests.map((r) => (ids.has(r.id) ? { ...r, status: "expired" } : r)),
            bids: s.bids.map((b) => (ids.has(b.requestId) && b.status === "active" ? { ...b, status: "lost" } : b)),
          }));
          if (expired.some((r) => r.source === "me")) notify("customer", "Your request expired. Send it again or raise your offer.", "/ride");
        },
      };
    },
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 2,
    },
  ),
);

export const placeName = (id: string) => place(id).name;
export const tripKm = (t: { pickupId: string; dropId: string }) => roadKm(place(t.pickupId), place(t.dropId));
