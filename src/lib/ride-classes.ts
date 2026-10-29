import type { RideClass } from "./types";

/** Car classes customers choose between. Each prices up from Economy by a percentage set in Admin → Settings. */
export const RIDE_CLASSES: Record<RideClass, { label: string; seats: string; blurb: string }> = {
  economy: { label: "Economy", seats: "4 seats", blurb: "Everyday saloon cars" },
  comfort: { label: "Comfort", seats: "4 seats", blurb: "Newer cars, more legroom, cold AC" },
  suv: { label: "SUV", seats: "6 seats", blurb: "Room for luggage. Good for the airport" },
  group: { label: "Group", seats: "7–14 seats", blurb: "Minivans and buses for groups" },
};

export const RIDE_CLASS_ORDER: RideClass[] = ["economy", "comfort", "suv", "group"];

/** Older bookings and cars from before classes existed count as Economy. */
export const classOf = (x?: { rideClass?: RideClass }) => x?.rideClass ?? "economy";
