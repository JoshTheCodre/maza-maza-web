# Maza-Maza web app

Ride hailing and dispatch for Lagos where the customer and driver agree the fare.
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
- **Admin:** `/admin` (any logged-in account for now).

## Screens

| Area | Routes |
| --- | --- |
| Landing | `/` |
| Sign up | `/signup` (phone or Google) → `/signup/phone` → `/signup/verify` → `/welcome` (name) → `/welcome/role` (passenger or driver) → `/welcome/verify` (+ `/camera` selfie) → `/welcome/location` → `/welcome/notifications` → `/welcome/pay` (passengers) · drivers then go to `/driver/signup` |
| Log in | `/login` (phone or Google) → `/login/phone` → `/login/verify` · Google users add a number at `/add-phone` |
| Rider | `/ride` · `/ride/search` · `/ride/offer` · `/ride/request/[id]` · `/ride/trip/[id]` (+ `/chat`) · `/activity` (+ `/[id]`) · `/account` (+ `/profile`, `/places`, `/safety`) · `/notifications` · `/help` |
| Driver | `/driver/signup` · `/driver` offers · `/driver/trip/[id]` (+ `/chat`) · `/driver/ticket` · `/driver/wallet` · `/driver/earnings` · `/driver/account` (+ `/payout`, `/profile`) · `/driver/notifications` · `/driver/help` |
| Admin | `/admin` · `/admin/drivers` (+ `/[id]`) · `/admin/customers` · `/admin/trips` · `/admin/tickets` · `/admin/reports` · `/admin/settings` |
| Public | `/share/[id]` shared trip · not-found page |

## Where things live

- `src/lib/types.ts`: domain types, shaped like the planned SQLite tables.
- `src/lib/store.ts`: client store (Zustand). Every action is a future API route:
  `sendOffer`, `placeBid`, `acceptBid`, `cancelTrip`, `sendMessage`, `buyTicket`, `topUp`,
  `setPayout`, `reviewApplication`, `updateSettings`…
- `src/lib/sim.ts`: the other people on the platform. Delete it once the API and live sockets exist.
- `src/lib/config.ts`: default settings, cancel reasons, bank list, map keys.
- `src/components/map/`: `MapView` uses Google Maps when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  is set (plus `NEXT_PUBLIC_GOOGLE_MAP_ID` for markers), otherwise a drawn Lagos map.
- `src/components/auth/`, `src/components/app/`: login screens and shared pieces
  (chat, notifications, help, profile, cancel/SOS sheets).
- `src/app/globals.css`: colour and type tokens (light and dark).

## Next: the backend

1. SQLite + Drizzle schema from `src/lib/types.ts` (money in kobo).
2. Replace store actions with API routes and server actions; keep the same names.
3. Live offers, bids, chat and trip updates over WebSockets or SSE (replaces `sim.ts`).
4. Paystack checkout and webhooks for wallet top-ups; resolve bank accounts on the payout page.
5. Google Places Autocomplete in `/ride/search`; Routes API for distance.
6. Phone login with WhatsApp/SMS codes (e.g. Termii), Google sign-in (OAuth), and admin-only access to `/admin`.
