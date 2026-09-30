# Digs (working name)

Share houses, whole places and short stays for Australia and New Zealand.
This is the **foundation**: it runs entirely on your own computer, with a local database. No AWS needed yet.

## Run it

You need Node.js 20 or newer.

```bash
npm install
npm run setup     # creates the local database and fills it with sample listings
npm run dev       # then open http://localhost:3000
```

Sample logins (password for all: `password123`):

- `renter@example.com` (a renter)
- `host1@example.com` (a host with listings)

No C++ tools or Visual Studio are needed: the database library ships ready-made for Windows, Mac and Linux.

If `npm install` shows `EPERM` (Windows file lock) errors, close VS Code and any running dev server,
delete the `node_modules` folder, and run `npm install` again.

## What works today

- Sign up, log in, log out (passwords hashed, session in a secure cookie)
- Post an ad (room, whole place, short stay, or "looking for a place") with up to 6 photos
- Search and filter by country, city, suburb, price, guests, feature category, sort, pages
- **Filters panel**: price range, bedrooms and bathrooms, amenities, bills included, furnished, pets, ID-verified hosts, with a live "Show N places" count
- **Map view** (Leaflet): price pins for every match, tap a pin for a preview card
- **Photo carousels** on every card: swipe on phones, arrows and dots on desktop
- Save places (heart), see them on the Saved page
- Message the person who posted an ad; inbox, unread count, threads
- Pause, resume or delete your own ads
- Report an ad
- Simple scam check: ads that look suspicious go to "pending" instead of live

## Where things live

| Folder | What it is |
|---|---|
| `src/db/schema.ts` | Every database table (users, listings, photos, messages, reviews...) |
| `src/app/api/` | The backend API (JSON over HTTP) |
| `src/app/` | The pages people see |
| `src/lib/` | Shared logic: search, login, validation, photo storage, scam check |
| `src/components/` | Reusable page pieces |
| `scripts/seed.ts` | Sample data |

## When we move to AWS

- Database: change the SQLite connection in `src/db/index.ts` to PostgreSQL (Aurora). The table design carries over.
- Photos: only `src/lib/storage.ts` changes (local disk -> Amazon S3).
- `/api/health` is ready for the load balancer.
- Set a real `SESSION_SECRET` in production (the app refuses to start without one).

## Map tiles

The map uses free OpenStreetMap tiles, which is fine for development. Before launch, switch to a
paid tile provider (for example Amazon Location Service, MapTiler or Mapbox): OpenStreetMap's public
servers are not meant for production traffic. Only `tileLayer(...)` in `src/components/LeafletMap.tsx` changes.

## Not built yet

Admin/moderation screen for flagged ads and reports, ID verification, review form, payments,
short-stay booking and calendars, email/SMS notifications, saved searches and alerts, automated tests.
