import type { FareSettings } from "./pricing";

// Domain types shared by every screen. Amounts are whole naira in the UI;
// the database will store kobo and convert at the API boundary.

export type Mode = "ride" | "send";
export type VehicleType = "car" | "bike";
export type PayMethod = "cash" | "transfer";
/** Car classes: see lib/ride-classes.ts. Dispatch bikes have no class. */
export type RideClass = "economy" | "comfort" | "suv" | "group";
export type TopUpMethod = "card" | "transfer" | "ussd";
/** Whether a person is the signed-in user ("me") or someone else on the platform. */
export type Source = "me" | "bot";

export interface Place {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  /** Position on the fallback street map (0–400 × 0–280). */
  x: number;
  y: number;
}

export interface Person {
  id: string;
  name: string;
  short: string;
  rating: number;
}

export interface Vehicle {
  type: VehicleType;
  description: string;
  plate: string;
  /** Cars only. */
  rideClass?: RideClass;
}

export interface Payout {
  bank: string;
  accountNumber: string;
  accountName: string;
}

export interface DriverPublic extends Person {
  vehicle: Vehicle;
  /** Where customers send transfers. Fares go straight to the driver. */
  payout?: Payout;
}

export type RequestStatus = "open" | "matched" | "cancelled" | "expired";

/** A flight an airport ride is built around. */
export interface FlightInfo {
  /** "departure": you're catching it, so we work back from take-off. "arrival": you're landing, so we pick you up after. */
  kind: "departure" | "arrival";
  number?: string;
  /** Take-off time for departures, landing time for arrivals. */
  time: number;
  international: boolean;
}

export interface RideRequest {
  id: string;
  source: Source;
  customer: Person;
  mode: Mode;
  pickupId: string;
  dropId: string;
  offer: number;
  firstOffer: number;
  payMethod: PayMethod;
  notes: string[];
  parcel?: string;
  receiver?: string;
  status: RequestStatus;
  createdAt: number;
  expiresAt: number;
  /** Shown to drivers; the real app works this out from live GPS. */
  kmToPickup: number;
  reach: number;
  rideClass?: RideClass;
  /** Booked in advance: when the pickup is. */
  scheduledFor?: number;
  flight?: FlightInfo;
}

/**
 * A dispatch rider about to finish a delivery nearby can take the next job. The customer waits a few minutes
 * longer and pays less than the bargained price (Settings → fare → nextJobPct, 10% by default).
 */
export interface NextJob {
  /** Minutes until the rider drops off their current package. */
  freeInMin: number;
}

export type BidKind = "accept" | "counter";
export type BidStatus = "active" | "declined" | "won" | "lost";

export interface Bid {
  id: string;
  requestId: string;
  source: Source;
  driver: DriverPublic;
  kind: BidKind;
  amount: number;
  etaMin: number;
  nextJob?: NextJob;
  status: BidStatus;
  createdAt: number;
}

/** "scheduled" trips are booked for later and become "to_pickup" when the driver sets off. */
export type TripStage = "scheduled" | "to_pickup" | "at_pickup" | "on_trip" | "payment" | "completed" | "cancelled";

export interface Trip {
  id: string;
  requestId: string;
  mode: Mode;
  customer: Person;
  customerSource: Source;
  driver: DriverPublic;
  driverSource: Source;
  pickupId: string;
  dropId: string;
  price: number;
  /** Set when the rider was booked while finishing another delivery: the bargained price before the discount. */
  nextJob?: NextJob & { fullPrice: number };
  /** Who's receiving a delivery, from the booking. They can follow it and chat from the tracking link. */
  receiver?: string;
  payMethod: PayMethod;
  notes: string[];
  stage: TripStage;
  stageAt: number;
  createdAt: number;
  etaMin: number;
  customerPaid: boolean;
  driverConfirmedPaid: boolean;
  rating?: number;
  tags?: string[];
  /** What the customer wrote about the driver, if anything. */
  review?: string;
  rideClass?: RideClass;
  scheduledFor?: number;
  flight?: FlightInfo;
  /** Reminders and alerts already sent for this trip, so each goes out once. */
  alerts?: string[];
  cancelledBy?: "customer" | "driver";
  cancelReason?: string;
}

export type Side = "customer" | "driver";
/** Deliveries add the receiver to the chat, from the tracking link. */
export type ChatFrom = Side | "recipient";

export interface ChatMessage {
  id: string;
  tripId: string;
  from: ChatFrom;
  body: string;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  audience: Side;
  title: string;
  href?: string;
  createdAt: number;
  read: boolean;
}

export interface Settings {
  ticketCar: number;
  ticketBike: number;
  minOffer: number;
  raiseStep: number;
  requestTtlMin: number;
  /** Fare rates. Missing on data saved before fares existed; read through fareSettings(). */
  fare?: FareSettings;
}

export interface DayTicket {
  id: string;
  number: string;
  /** Nigerian calendar date, YYYY-MM-DD. */
  serviceDate: string;
  vehicleType: VehicleType;
  price: number;
  boughtAt: number;
}

export type WalletEntryKind = "top_up" | "ticket" | "refund";

export interface WalletEntry {
  id: string;
  kind: WalletEntryKind;
  /** Positive adds to the balance, negative takes from it. */
  amount: number;
  method?: TopUpMethod;
  note: string;
  createdAt: number;
}

export type DriverStatus = "none" | "pending" | "approved" | "rejected";

export type DocStatus = "missing" | "uploaded" | "verified" | "rejected";

export interface DriverDocument {
  key: "nin" | "licence" | "vehicle_papers" | "selfie" | "vehicle_photo";
  label: string;
  status: DocStatus;
  fileName?: string;
}

export interface Guarantor {
  name: string;
  phone: string;
  relationship: string;
}

export interface DriverApplication {
  id: string;
  isMe?: boolean;
  name: string;
  phone: string;
  city: string;
  vehicleType: VehicleType;
  vehicle: string;
  plate: string;
  documents: DriverDocument[];
  guarantor: Guarantor;
  status: "pending" | "approved" | "rejected";
  submittedAt: number;
  note?: string;
}

export type ReportKind = "overcharge" | "safety" | "sos" | "lost_item" | "conduct" | "other";

export interface Report {
  id: string;
  kind: ReportKind;
  tripId?: string;
  from: string;
  against: string;
  message: string;
  createdAt: number;
  status: "open" | "resolved";
}

export interface SavedPlace {
  label: string;
  placeId: string;
  icon: "home" | "work" | "star";
  note?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

/** A link someone can open to follow your live position for a while, no trip needed. */
export interface LiveShare {
  id: string;
  name: string;
  startedAt: number;
  /** When it stops on its own. */
  until: number;
  stopped?: boolean;
  last?: { lat: number; lng: number; accuracy: number; at: number };
}

export interface ToastMessage {
  id: string;
  audience: "customer" | "driver" | "admin";
  text: string;
}
