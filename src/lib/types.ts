// Domain types shared by every screen. Amounts are whole naira in the UI;
// the database will store kobo and convert at the API boundary.

export type Mode = "ride" | "send";
export type VehicleType = "car" | "bike";
export type PayMethod = "cash" | "transfer";
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
  status: BidStatus;
  createdAt: number;
}

export type TripStage = "to_pickup" | "at_pickup" | "on_trip" | "payment" | "completed" | "cancelled";

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
  cancelledBy?: "customer" | "driver";
  cancelReason?: string;
}

export type Side = "customer" | "driver";

export interface ChatMessage {
  id: string;
  tripId: string;
  from: Side;
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
}

export interface DayTicket {
  id: string;
  number: string;
  /** Lagos calendar date, YYYY-MM-DD. */
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

export interface ToastMessage {
  id: string;
  audience: "customer" | "driver" | "admin";
  text: string;
}
