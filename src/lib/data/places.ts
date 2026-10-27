import { CITY } from "../city";
import type { Place } from "../types";

/** Spot on the drawn fallback map (0–400 × 0–280) for a position in the city. */
export const mapXY = (lat: number, lng: number) => ({ x: Math.round((lng - 6.88) * 1818), y: Math.round((5.04 - lat) * 933) });

const at = (id: string, name: string, area: string, lat: number, lng: number): Place => ({ id, name, area, lat, lng, ...mapXY(lat, lng) });

// Landmarks around Port Harcourt, positioned from OpenStreetMap. Google Places Autocomplete replaces this list
// once the backend exists; picked places get saved in the database.
// Distances and times come from road routes (lib/routing.ts), fares from lib/pricing.ts.
export const PLACES: Place[] = [
  at("gra2", "GRA Phase 2, Tombia Street", "GRA", 4.8213, 7.0045),
  at("mile1", "Mile 1 Market", "Diobu", 4.7925, 6.9979),
  at("phmall", "Port Harcourt Mall", "Old GRA", 4.7754, 7.0134),
  at("rumuokoro", "Rumuokoro Flyover", "Rumuokoro", 4.867, 6.9978),
  at("airport", "Port Harcourt International Airport", "Omagwa", 5.0165, 6.9518),
  at("uniport", "UNIPORT Abuja Campus", "Choba", 4.9019, 6.9196),
  at("rsu", "Rivers State University", "Nkpolu", 4.797, 6.9807),
  at("pleasure", "Port Harcourt Pleasure Park", "Rumuomasi", 4.8375, 7.0115),
  at("rumuola", "Rumuola Junction", "Rumuola", 4.8328, 6.9979),
  at("adageorge", "Ada George Road", "Ada George", 4.8397, 6.976),
  at("transamadi", "Trans-Amadi Industrial Layout", "Trans-Amadi", 4.8207, 7.0401),
  at("peterodili", "Peter Odili Road", "Golf Estate", 4.8062, 7.0482),
  at("woji", "Woji Road", "Woji", 4.8248, 7.0507),
  at("oilmill", "Oil Mill Market", "Elelenwo", 4.8577, 7.0654),
  at("shellra", "Shell Residential Area (RA)", "Rumuibekwe", 4.8528, 7.046),
  at("creekroad", "Creek Road Market", "Borokiri", 4.7581, 7.0238),
];

/** Where pickups start before you choose one. */
export const DEFAULT_PICKUP = CITY.defaultPickupId;

const byId = new Map(PLACES.map((p) => [p.id, p]));
/** Places found at run time, like a GPS pickup. Saved with the account and registered again on load. */
const extra = new Map<string, Place>();
export const place = (id: string): Place => byId.get(id) ?? extra.get(id) ?? byId.get(DEFAULT_PICKUP) ?? PLACES[0];
export const registerPlace = (p: Place) => void extra.set(p.id, p);



export const nearestPlace = (lat: number, lng: number) =>
  PLACES.reduce((best, p) => (Math.hypot(p.lat - lat, p.lng - lng) < Math.hypot(best.lat - lat, best.lng - lng) ? p : best), PLACES[0]);

export const searchPlaces = (query: string, exclude?: string) => {
  const q = query.trim().toLowerCase();
  return PLACES.filter(
    (p) => p.id !== exclude && (!q || p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)),
  );
};
