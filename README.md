# Maza-Maza web app

Ride hailing and dispatch where the customer and driver agree the fare. Launching in **Port Harcourt** only:
the city, its service area and its landmarks live in `src/lib/city.ts` and `src/lib/data/places.ts`.
Customers make an offer, drivers accept or counter, and drivers pay a **day ticket**
instead of commission. Ticket prices and limits are set in Admin → Settings.

This is the **full UI**. There's no backend yet: data lives in the browser
(`localStorage`), and a stand-in for other users (`src/lib/sim.ts`) plays the other
drivers and customers, so every flow works end to end.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. A new visitor goes through sign up with phone or Google (any 6-digit
code works until SMS/WhatsApp is connected), sets their name, and lands on the rider home screen.

- **Become a driver:** Account → *Drive or ride with Maza-Maza* → sign up. Approve the
  application at `/admin/drivers`, then switch to driver mode from the Account tab.
- **Switch back:** Driver Account → *Switch to rider mode*.
- **Admin:** `/admin` (any logged-in account for now). Fare rates and the fuel price are in Admin → Settings.

**Testing on a phone:** browsers only share location and the camera on secure pages, so plain
`http://192.168…` won't work. Run `npm run dev:phone` (HTTPS with a self-signed certificate on your
network), open `https://<your-computer's-IP>:3100` on the phone and accept the certificate warning.

**Booking options:** car classes (Economy, Comfort, SUV, Group, priced as a percentage over Economy in
Admin → Settings), rides now or scheduled up to a week ahead, and airport rides that work out the pickup time
from the flight. Scheduled trips send reminders (day before, hour before, time to leave, driver 2 minutes away)
from `src/lib/reminders.ts`, and reach the phone through the browser's notifications when it's allowed
(`src/lib/push.ts`). The backend should move these to a scheduled job with web push.

**Maps, routes and fares** work without any keys:
- Street maps are OpenStreetMap via [OpenFreeMap](https://openfreemap.org) tiles and MapLibre. Its web
  worker is copied to `public/maplibre/` after `npm install` (`scripts/copy-map-worker.mjs`).
- Road distances and times come from the public [OSRM](https://project-osrm.org) demo server and are cached
  on the device (`src/lib/routing.ts`). It's for light use only; the backend should use Google Routes or Mapbox.
- "Use my location" names your spot with [Photon](https://photon.komoot.io) (OpenStreetMap search).
- The recommended fare is in `src/lib/pricing.ts`: base + fuel (km ÷ km/L × pump price) + upkeep per km +
  driver's time per minute in today's traffic, plus rush hour, late night, an airport fee and a minimum fare.

## Screens

| Area | Routes |
| --- | --- |
| Landing | `/` |
| Sign up | `/signup` (phone or Google) → `/signup/phone` → `/signup/verify` → `/welcome` (name) → `/welcome/role` (passenger or driver) → `/welcome/verify` (+ `/camera` selfie) → `/welcome/location` → `/welcome/notifications` → `/welcome/pay` (passengers) · drivers then go to `/driver/signup` |
| Log in | `/login` (phone or Google) → `/login/phone` → `/login/verify` · Google users add a number at `/add-phone` |
| Rider | `/ride` · `/ride/search` · `/ride/offer` · `/ride/request/[id]` · `/ride/trip/[id]` (+ `/chat`) · `/activity` (+ `/[id]`) · `/account` (+ `/profile`, `/places`, `/safety`) · `/notifications` · `/help` · `/ride/airport` (book around a flight) |
| Driver | `/driver/signup` · `/driver` offers · `/driver/trip/[id]` (+ `/chat`) · `/driver/ticket` · `/driver/wallet` · `/driver/earnings` · `/driver/account` (+ `/payout`, `/profile`) · `/driver/notifications` · `/driver/help` |
| Admin | `/admin` · `/admin/drivers` (+ `/[id]`) · `/admin/customers` · `/admin/trips` · `/admin/tickets` · `/admin/reports` · `/admin/settings` |
| Public | `/share/[id]` trip link: family follow a ride; a delivery's receiver sees when it arrives · `/share/[id]/chat` receiver's group chat with the rider and sender · `/live/[id]` someone's live location (shared from Account → Safety) · not-found page |

## Where things live

- `src/lib/types.ts`: domain types, shaped like the planned SQLite tables.
- `src/lib/store.ts`: client store (Zustand). Every action is a future API route:
  `sendOffer`, `placeBid`, `acceptBid`, `cancelTrip`, `sendMessage`, `buyTicket`, `topUp`,
  `setPayout`, `reviewApplication`, `updateSettings`…
- `src/lib/sim.ts`: the other people on the platform. Delete it once the API and live sockets exist.
- `src/lib/config.ts`: default settings, cancel reasons, bank list, map keys.
- `src/components/map/`: `MapView` uses Google Maps when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  is set (plus `NEXT_PUBLIC_GOOGLE_MAP_ID` for markers), otherwise the OpenStreetMap map (`real-map.tsx`),
  falling back to a simple drawn map of the city if the browser can't run it. Both draw the road route and your live position.
- `src/lib/pricing.ts`, `routing.ts`, `eta.ts`, `location.ts`: recommended fares, road routes, trip times,
  and the device's live position.
- `src/components/auth/`, `src/components/app/`: login screens and shared pieces
  (chat, notifications, help, profile, cancel/SOS sheets).
- `src/app/globals.css`: colour and type tokens (light and dark).

## Next: the backend

1. SQLite + Drizzle schema from `src/lib/types.ts` (money in kobo).
2. Replace store actions with API routes and server actions; keep the same names.
3. Live offers, bids, chat and trip updates over WebSockets or SSE (replaces `sim.ts`), including each
   driver's GPS every few seconds, so riders, receivers and family see the real vehicle move.
4. Paystack checkout and webhooks for wallet top-ups; resolve bank accounts on the payout page.
5. Google Places Autocomplete in `/ride/search`; Google Routes (or Mapbox) with live traffic instead of the OSRM demo.
6. Phone login with WhatsApp/SMS codes (e.g. Termii), Google sign-in (OAuth), and admin-only access to `/admin`.
