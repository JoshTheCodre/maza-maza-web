/** Maza-Maza starts in one city. Everything city-specific (places, map, service area, copy) reads from here. */
export const CITY = {
  name: "Port Harcourt",
  state: "Rivers",
  /** Roughly the middle of the city's spread, between Diobu, GRA and Rumuokoro. */
  center: { lat: 4.83, lng: 7.0 },
  /** Pickups further than this from the centre are outside the service area (the airport is about 21 km out). */
  radiusKm: 40,
  /** Where the app puts your pickup until you choose one or share your location. */
  defaultPickupId: "gra2",
} as const;
