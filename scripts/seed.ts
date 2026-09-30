// Fills the local database with sample data so the site isn't empty.
// Safe to re-run: it wipes and recreates everything (development only!).
import bcrypt from "bcryptjs";
import { db } from "../src/db";
import { listings, reviews, users, listingPhotos, favourites, conversations, messages, reports, savedSearches } from "../src/db/schema";
import { cityCentre } from "../src/lib/places";
import { hash } from "../src/lib/format";

type Seed = {
  k: "room" | "whole" | "short" | "wanted"; c: "AU" | "NZ"; city: string; sub: string; t: string; rent: number;
  bills?: 1; furn?: 1; pets?: 1; hm?: number; bd?: number; ba?: number; g?: number; f?: string[]; a?: string; d?: string;
};

const DESC = {
  room: "A comfortable room in a friendly, tidy house. Shared kitchen and living area, and housemates who respect each other's space. Happy to show you around before you decide.",
  whole: "A great place for a group to rent together. Everyone on the lease shares the rent, and the owner is easy to deal with. Inspections available most evenings.",
  short: "A comfortable place for a few nights or a few weeks, with no lease. Linen and towels are provided, and the host shares local tips when you arrive.",
  wanted: "Working full time, non-smoker, tidy and friendly. Looking for a long-term room with good housemates and easy transport. Happy to provide references.",
};

const DATA: Seed[] = [
  { k: "room", c: "AU", city: "Sydney", sub: "Newtown", t: "Sunny double near King St", rent: 340, bills: 1, furn: 1, hm: 2, f: ["uni", "transit"], a: "wifi kitchen washer heat work" },
  { k: "room", c: "AU", city: "Sydney", sub: "Marrickville", t: "Large room in a creative house", rent: 295, pets: 1, hm: 3, f: ["garden", "bike"], a: "wifi kitchen washer" },
  { k: "room", c: "AU", city: "Sydney", sub: "Bondi Junction", t: "Single room, 6 min to the beach", rent: 410, bills: 1, furn: 1, hm: 1, f: ["beach", "city"], a: "wifi kitchen washer aircon" },
  { k: "room", c: "AU", city: "Melbourne", sub: "Fitzroy", t: "Light-filled room, tram at the door", rent: 285, bills: 1, hm: 3, f: ["transit", "garden", "uni"], a: "wifi kitchen washer heat" },
  { k: "room", c: "AU", city: "Melbourne", sub: "Brunswick", t: "Double with built-in wardrobes", rent: 250, furn: 1, pets: 1, hm: 2, f: ["bike", "quiet"], a: "wifi kitchen washer heat work" },
  { k: "room", c: "AU", city: "Melbourne", sub: "St Kilda", t: "Room in an art deco flat", rent: 310, bills: 1, furn: 1, hm: 1, f: ["beach", "quiet"], a: "wifi kitchen washer" },
  { k: "room", c: "AU", city: "Brisbane", sub: "West End", t: "Queenslander room with a deck", rent: 265, pets: 1, hm: 3, f: ["garden", "uni"], a: "wifi kitchen washer aircon" },
  { k: "room", c: "AU", city: "Brisbane", sub: "Paddington", t: "Big room with private bathroom", rent: 275, bills: 1, furn: 1, hm: 2, f: ["ensuite", "quiet"], a: "wifi kitchen washer aircon parking" },
  { k: "room", c: "AU", city: "Perth", sub: "Fremantle", t: "Cosy room near the markets", rent: 240, bills: 1, pets: 1, hm: 2, f: ["pool", "beach"], a: "wifi kitchen washer" },
  { k: "room", c: "AU", city: "Adelaide", sub: "Norwood", t: "Ensuite room on The Parade", rent: 230, furn: 1, hm: 2, f: ["ensuite", "quiet"], a: "wifi kitchen washer aircon" },
  { k: "whole", c: "AU", city: "Sydney", sub: "Petersham", t: "Four bedroom house for a group", rent: 1450, pets: 1, bd: 4, ba: 2, g: 8, f: ["garden", "transit"], a: "wifi kitchen washer heat parking" },
  { k: "whole", c: "AU", city: "Melbourne", sub: "Collingwood", t: "Three bedroom terrace with courtyard", rent: 1050, bd: 3, ba: 1, g: 6, f: ["city", "transit"], a: "wifi kitchen washer heat" },
  { k: "short", c: "AU", city: "Sydney", sub: "Bondi Beach", t: "Studio steps from the sand", rent: 210, bills: 1, furn: 1, bd: 1, ba: 1, g: 4, f: ["beach", "city"], a: "wifi kitchen aircon" },
  { k: "short", c: "AU", city: "Melbourne", sub: "CBD", t: "Laneway loft in the city", rent: 175, bills: 1, furn: 1, bd: 1, ba: 1, g: 4, f: ["city", "transit"], a: "wifi kitchen washer aircon work" },
  { k: "short", c: "AU", city: "Brisbane", sub: "South Bank", t: "Riverside apartment with a pool", rent: 190, bills: 1, furn: 1, pets: 1, bd: 2, ba: 2, g: 4, f: ["pool", "city"], a: "wifi kitchen washer aircon parking" },
  { k: "wanted", c: "AU", city: "Sydney", sub: "Inner West", t: "Designer looking for a room in the Inner West", rent: 300 },
  { k: "wanted", c: "AU", city: "Melbourne", sub: "Northcote", t: "Nurse on shifts, looking for a quiet house", rent: 260 },
  { k: "room", c: "NZ", city: "Auckland", sub: "Ponsonby", t: "Villa room with a sunny bay window", rent: 330, bills: 1, furn: 1, hm: 3, f: ["transit", "city"], a: "wifi kitchen washer heat" },
  { k: "room", c: "NZ", city: "Auckland", sub: "Mt Eden", t: "Double near the village", rent: 295, pets: 1, hm: 2, f: ["garden", "quiet"], a: "wifi kitchen washer parking" },
  { k: "room", c: "NZ", city: "Auckland", sub: "Grey Lynn", t: "Quiet room, friendly professionals", rent: 310, bills: 1, hm: 2, f: ["quiet", "bike"], a: "wifi kitchen washer heat" },
  { k: "room", c: "NZ", city: "Wellington", sub: "Te Aro", t: "Central room, walk to work", rent: 265, furn: 1, hm: 3, f: ["city", "transit"], a: "wifi kitchen washer heat work" },
  { k: "room", c: "NZ", city: "Wellington", sub: "Newtown", t: "Warm, dry room near the zoo", rent: 235, bills: 1, pets: 1, hm: 2, f: ["uni", "bike"], a: "wifi kitchen washer heat" },
  { k: "room", c: "NZ", city: "Christchurch", sub: "Riccarton", t: "Double, 10 min by bike to uni", rent: 205, bills: 1, furn: 1, hm: 3, f: ["uni", "bike"], a: "wifi kitchen washer heat work" },
  { k: "room", c: "NZ", city: "Dunedin", sub: "North Dunedin", t: "Character flat room near campus", rent: 190, hm: 4, f: ["uni"], a: "wifi kitchen washer heat" },
  { k: "whole", c: "NZ", city: "Auckland", sub: "Kingsland", t: "Three bedroom villa for a group", rent: 1050, pets: 1, bd: 3, ba: 1, g: 6, f: ["garden", "transit"], a: "wifi kitchen washer heat" },
  { k: "short", c: "NZ", city: "Queenstown", sub: "Frankton", t: "Lake view cabin for a few nights", rent: 260, bills: 1, furn: 1, pets: 1, bd: 1, ba: 1, g: 4, f: ["quiet"], a: "wifi kitchen heat parking" },
  { k: "short", c: "NZ", city: "Wellington", sub: "Waterfront", t: "Harbourside studio", rent: 180, bills: 1, furn: 1, bd: 1, ba: 1, g: 4, f: ["beach", "city"], a: "wifi kitchen heat work" },
  { k: "wanted", c: "NZ", city: "Wellington", sub: "Central", t: "Software tester looking for a calm flat", rent: 280 },
];

const HOSTS = ["Sam Taylor", "Aroha Ngata", "Jess Chen", "Liam Walsh", "Nadia Rahman", "Ben Foster", "Mere Tamati", "Chloe Nguyen"];
const REVIEWS = [
  "Exactly as described. Clean, quiet and the host replied within minutes.",
  "Loved the location. Transport, cafes and a supermarket are all a short walk away.",
  "Great housemates who respect shared spaces. No surprises with bills.",
  "The bed was comfy and the place felt safe. Would happily stay again.",
  "Plenty of natural light and a proper desk, which made working from home easy.",
];

async function main() {
  for (const t of [messages, conversations, reports, savedSearches, reviews, favourites, listingPhotos, listings, users]) {
    await db.delete(t);
  }
  const passwordHash = await bcrypt.hash("password123", 10);
  const hosts = await db
    .insert(users)
    .values(HOSTS.map((name, i) => ({ name, email: `host${i + 1}@example.com`, passwordHash, idVerified: i % 3 !== 2, phoneVerified: true })))
    .returning();
  const [renter] = await db
    .insert(users)
    .values({ name: "Riley Renter", email: "renter@example.com", passwordHash, phoneVerified: true })
    .returning();

  let n = 0;
  for (const s of DATA) {
    const owner = hosts[n++ % hosts.length];
    const centre = cityCentre(s.c, s.city)!;
    const h = hash(s.sub.toLowerCase() + s.city);
    const [row] = await db
      .insert(listings)
      .values({
        ownerId: owner.id, kind: s.k, country: s.c, city: s.city, suburb: s.sub, title: s.t, description: DESC[s.k],
        rentCents: s.rent * 100, bedrooms: s.bd ?? 1, bathrooms: s.ba ?? 1, housemates: s.hm ?? 0, maxGuests: s.g ?? 2,
        billsIncluded: !!s.bills, furnished: !!s.furn, petsOk: !!s.pets,
        availableFrom: new Date(Date.now() + ((h % 30) + 3) * 864e5).toISOString().slice(0, 10),
        amenities: (s.a ?? "").split(" ").filter(Boolean), features: s.f ?? [],
        lat: centre.lat + (((h % 1000) / 1000) - 0.5) * 0.12, lng: centre.lng + ((((h >> 10) % 1000) / 1000) - 0.5) * 0.14,
        status: "active",
        createdAt: new Date(Date.now() - n * 3600 * 1000 * 5),
      })
      .returning({ id: listings.id });
    if (s.k !== "wanted" && n % 2 === 0) {
      await db.insert(reviews).values([0, 1].map((i) => ({
        listingId: row.id, authorId: renter.id, rating: 4 + ((h >> i) % 2), body: REVIEWS[(h + i) % REVIEWS.length],
      })));
    }
  }
  console.log(`Seeded ${DATA.length} listings.`);
  console.log("Demo logins (password: password123): renter@example.com, host1@example.com");
}

main().catch((e) => { console.error(e); process.exit(1); });
