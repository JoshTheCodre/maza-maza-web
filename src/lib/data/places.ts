import type { Place } from "../types";

// Places around Lagos with approximate coordinates. Google Places Autocomplete
// replaces this list once the backend exists; picked places get saved in the database.
export const PLACES: Place[] = [
  { id: "yaba", name: "Yaba Bus Stop", area: "Yaba", lat: 6.5097, lng: 3.3768, x: 185, y: 150 },
  { id: "lekki1", name: "Lekki Phase 1 Gate", area: "Lekki", lat: 6.4476, lng: 3.465, x: 292, y: 226 },
  { id: "icm", name: "Ikeja City Mall", area: "Ikeja", lat: 6.6141, lng: 3.3578, x: 118, y: 46 },
  { id: "mma", name: "Murtala Muhammed Airport (MMA2)", area: "Ikeja", lat: 6.5786, lng: 3.3219, x: 72, y: 58 },
  { id: "adeola", name: "Adeola Odeku, Victoria Island", area: "Victoria Island", lat: 6.43, lng: 3.421, x: 228, y: 238 },
  { id: "stadium", name: "National Stadium, Surulere", area: "Surulere", lat: 6.4991, lng: 3.3654, x: 150, y: 170 },
  { id: "falomo", name: "Falomo Roundabout, Ikoyi", area: "Ikoyi", lat: 6.444, lng: 3.432, x: 242, y: 218 },
  { id: "ajah", name: "Ajah Roundabout", area: "Ajah", lat: 6.469, lng: 3.571, x: 384, y: 236 },
  { id: "oshodi", name: "Oshodi Interchange", area: "Oshodi", lat: 6.556, lng: 3.346, x: 98, y: 96 },
  { id: "maryland", name: "Maryland Mall", area: "Maryland", lat: 6.571, lng: 3.367, x: 142, y: 88 },
  { id: "unilag", name: "UNILAG Main Gate", area: "Akoka", lat: 6.516, lng: 3.388, x: 202, y: 134 },
  { id: "allen", name: "Allen Avenue, Ikeja", area: "Ikeja", lat: 6.604, lng: 3.353, x: 132, y: 60 },
  { id: "gbagada", name: "Gbagada Phase 2", area: "Gbagada", lat: 6.554, lng: 3.39, x: 172, y: 98 },
  { id: "festac", name: "Festac Town, 2nd Avenue", area: "Festac", lat: 6.47, lng: 3.284, x: 46, y: 204 },
  { id: "cms", name: "CMS Bus Stop, Lagos Island", area: "Lagos Island", lat: 6.452, lng: 3.392, x: 206, y: 222 },
];

const byId = new Map(PLACES.map((p) => [p.id, p]));
export const place = (id: string): Place => byId.get(id) ?? PLACES[0];

/** Straight-line distance × 1.3 as a rough road distance, in km. */
export const roadKm = (a: Place, b: Place) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.3 * 10) / 10;
};

export const nearestPlace = (lat: number, lng: number) =>
  PLACES.reduce((best, p) => (Math.hypot(p.lat - lat, p.lng - lng) < Math.hypot(best.lat - lat, best.lng - lng) ? p : best), PLACES[0]);

export const trafficMinutes = (km: number) => `${Math.round(km * 2.2)}–${Math.round(km * 3.3)} min`;

export const searchPlaces = (query: string, exclude?: string) => {
  const q = query.trim().toLowerCase();
  return PLACES.filter(
    (p) => p.id !== exclude && (!q || p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)),
  );
};
