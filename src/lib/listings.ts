import { and, asc, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { favourites, listingPhotos, listings, reviews, users, type Listing } from "@/db/schema";
import type { SearchInput } from "./validators";

export const PAGE_SIZE = 24;

export type ListingSummary = {
  listing: Listing;
  photos: string[];
  rating: number | null;
  reviewCount: number;
};

const esc = (s: string) => s.replace(/[%_\\]/g, "");

function buildWhere(p: SearchInput) {
  const conds = [
    eq(listings.status, "active"),
    eq(listings.country, p.country),
    eq(listings.kind, p.kind),
  ];
  if (p.city) conds.push(eq(listings.city, p.city));
  if (p.q) {
    const q = `%${esc(p.q)}%`;
    conds.push(or(like(listings.suburb, q), like(listings.city, q), like(listings.title, q))!);
  }
  if (p.min != null) conds.push(gte(listings.rentCents, p.min * 100));
  if (p.max != null) conds.push(lte(listings.rentCents, p.max * 100));
  if (p.guests) conds.push(gte(listings.maxGuests, p.guests));
  if (p.beds && p.kind !== "room") conds.push(gte(listings.bedrooms, p.beds));
  if (p.baths && p.kind !== "room") conds.push(gte(listings.bathrooms, p.baths));
  if (p.bills) conds.push(eq(listings.billsIncluded, true));
  if (p.furnished) conds.push(eq(listings.furnished, true));
  if (p.pets) conds.push(eq(listings.petsOk, true));
  if (p.verified) {
    conds.push(inArray(listings.ownerId, db.select({ id: users.id }).from(users).where(eq(users.idVerified, true))));
  }
  for (const a of p.am) conds.push(like(listings.amenities, `%"${a}"%`));
  if (p.cat === "furn") conds.push(eq(listings.furnished, true));
  else if (p.cat === "bills") conds.push(eq(listings.billsIncluded, true));
  else if (p.cat === "pets") conds.push(eq(listings.petsOk, true));
  else if (p.cat) conds.push(like(listings.features, `%"${p.cat}"%`));
  return and(...conds);
}

export async function searchListings(p: SearchInput) {
  const order =
    p.sort === "lo" ? asc(listings.rentCents) : p.sort === "hi" ? desc(listings.rentCents) : desc(listings.createdAt);
  const where = buildWhere(p);
  const rows = await db.select().from(listings).where(where).orderBy(order).limit(PAGE_SIZE).offset((p.page - 1) * PAGE_SIZE);
  const total = await countListings(p);
  return { items: await attachExtras(rows), total, pageSize: PAGE_SIZE };
}

export async function countListings(p: SearchInput) {
  const [row] = await db.select({ total: sql<number>`count(*)` }).from(listings).where(buildWhere(p));
  return row.total;
}

export type MapPin = {
  id: string; lat: number; lng: number; price: number; unit: string;
  title: string; place: string; photo: string | null;
};

// Every match (up to 300) with just enough data to draw a pin and a preview card.
export async function searchMapPins(p: SearchInput): Promise<MapPin[]> {
  const rows = await db.select().from(listings).where(buildWhere(p)).limit(300);
  const withCoords = rows.filter((r) => r.lat != null && r.lng != null);
  const photos = withCoords.length
    ? await db.select().from(listingPhotos).where(inArray(listingPhotos.listingId, withCoords.map((r) => r.id))).orderBy(asc(listingPhotos.position))
    : [];
  const first = new Map<string, string>();
  for (const ph of photos) if (!first.has(ph.listingId)) first.set(ph.listingId, ph.url);
  return withCoords.map((r) => ({
    id: r.id, lat: r.lat!, lng: r.lng!, price: Math.round(r.rentCents / 100),
    unit: r.kind === "short" ? "night" : "week", title: r.title, place: `${r.suburb}, ${r.city}`,
    photo: first.get(r.id) ?? null,
  }));
}

export async function attachExtras(rows: Listing[]): Promise<ListingSummary[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const photos = await db.select().from(listingPhotos).where(inArray(listingPhotos.listingId, ids)).orderBy(asc(listingPhotos.position));
  const ratings = await db
    .select({ listingId: reviews.listingId, avg: sql<number>`avg(${reviews.rating})`, n: sql<number>`count(*)` })
    .from(reviews)
    .where(inArray(reviews.listingId, ids))
    .groupBy(reviews.listingId);
  const byListing = new Map<string, string[]>();
  for (const ph of photos) byListing.set(ph.listingId, [...(byListing.get(ph.listingId) ?? []), ph.url]);
  const rate = new Map(ratings.map((r) => [r.listingId, r]));
  return rows.map((listing) => ({
    listing,
    photos: byListing.get(listing.id) ?? [],
    rating: rate.get(listing.id)?.avg ?? null,
    reviewCount: rate.get(listing.id)?.n ?? 0,
  }));
}

export async function getListingDetail(id: string) {
  const listing = await db.query.listings.findFirst({ where: eq(listings.id, id) });
  if (!listing) return null;
  const photos = await db.select().from(listingPhotos).where(eq(listingPhotos.listingId, id)).orderBy(asc(listingPhotos.position));
  const owner = await db.query.users.findFirst({
    where: eq(users.id, listing.ownerId),
    columns: { id: true, name: true, idVerified: true, phoneVerified: true, createdAt: true },
  });
  const revs = await db
    .select({ id: reviews.id, rating: reviews.rating, body: reviews.body, createdAt: reviews.createdAt, author: users.name })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.authorId))
    .where(eq(reviews.listingId, id))
    .orderBy(desc(reviews.createdAt));
  const avg = revs.length ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : null;
  return { listing, photos, owner: owner!, reviews: revs, rating: avg };
}

export async function getSavedListings(userId: string) {
  const rows = await db
    .select({ l: listings })
    .from(favourites)
    .innerJoin(listings, eq(listings.id, favourites.listingId))
    .where(and(eq(favourites.userId, userId), eq(listings.status, "active")))
    .orderBy(desc(favourites.createdAt));
  return attachExtras(rows.map((r) => r.l));
}

export async function getSavedIds(userId: string | undefined) {
  if (!userId) return new Set<string>();
  const rows = await db.select({ id: favourites.listingId }).from(favourites).where(eq(favourites.userId, userId));
  return new Set(rows.map((r) => r.id));
}
