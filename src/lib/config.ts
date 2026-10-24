import type { Mode, Settings, VehicleType } from "./types";

/** Platform defaults. Admins change these in Admin → Settings. */
export const DEFAULT_SETTINGS: Settings = {
  ticketCar: 3000,
  ticketBike: 1500,
  minOffer: 300,
  raiseStep: 200,
  requestTtlMin: 5,
};

export const MIN_TOP_UP = 1000;
/** A driver can cancel for a no-show after waiting this long at pickup. */
export const NO_SHOW_WAIT_MS = 5 * 60 * 1000;

export const VEHICLE_FOR_MODE: Record<Mode, VehicleType> = { ride: "car", send: "bike" };
export const MODE_FOR_VEHICLE: Record<VehicleType, Mode> = { car: "ride", bike: "send" };

export const VEHICLE_LABEL: Record<VehicleType, string> = { car: "Car driver", bike: "Dispatch rider" };

export const RIDE_NOTES: Record<Mode, string[]> = {
  ride: ["AC please", "I have luggage", "Call when you arrive"],
  send: ["Fragile", "Keep it upright", "Call the receiver"],
};

export const PARCEL_TYPES = ["Documents", "Small parcel", "Food", "Medium box"];

export const RATING_TAGS: Record<Mode, string[]> = {
  ride: ["Polite", "Clean car", "Safe driving", "Knew the route"],
  send: ["Fast", "Careful with the item", "Polite", "Kept me updated"],
};

export const CUSTOMER_CANCEL_REASONS = [
  "Driver is taking too long",
  "Driver asked me to cancel",
  "Driver asked for more money",
  "I changed my plans",
  "Booked by mistake",
];

export const DRIVER_CANCEL_REASONS = ["Customer asked me to cancel", "I can't reach the pickup", "Problem with my vehicle", "Safety concern"];

export const NIGERIAN_BANKS = [
  "Access Bank",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Guaranty Trust Bank (GTBank)",
  "Kuda Microfinance Bank",
  "Moniepoint Microfinance Bank",
  "OPay",
  "PalmPay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Sterling Bank",
  "Union Bank",
  "United Bank for Africa (UBA)",
  "Wema Bank",
  "Zenith Bank",
];

export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
export const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID ?? "DEMO_MAP_ID";
