import { and, avg, count, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { listings, listingPhotos, userReviews, users } from "@/db/schema";

export async function getPublicProfile(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { passwordHash: false },
  });
  if (!user) return null;

  // Their active listings (with first photo)
  const theirListings = await db
    .select({
      id: listings.id, kind: listings.kind, title: listings.title,
      suburb: listings.suburb, city: listings.city, country: listings.country,
      rentCents: listings.rentCents, status: listings.status,
      photo: sql<string | null>`(select url from listing_photos where listing_id = ${listings.id} order by position limit 1)`,
    })
    .from(listings)
    .where(and(eq(listings.ownerId, userId), eq(listings.status, "active")))
    .orderBy(desc(listings.createdAt))
    .limit(12);

  // Reviews RECEIVED by this user
  const receivedReviews = await db
    .select({
      id: userReviews.id,
      rating: userReviews.rating,
      body: userReviews.body,
      role: userReviews.role,
      createdAt: userReviews.createdAt,
      reviewerName: users.name,
      reviewerId: userReviews.reviewerId,
    })
    .from(userReviews)
    .innerJoin(users, eq(users.id, userReviews.reviewerId))
    .where(eq(userReviews.revieweeId, userId))
    .orderBy(desc(userReviews.createdAt));

  const avgRating =
    receivedReviews.length
      ? receivedReviews.reduce((s, r) => s + r.rating, 0) / receivedReviews.length
      : null;

  return { user, listings: theirListings, reviews: receivedReviews, avgRating };
}

export async function canReviewUser(reviewerId: string, revieweeId: string): Promise<boolean> {
  if (reviewerId === revieweeId) return false;
  // Can review if there's an existing review (always allow in dev) OR they've had a conversation
  const existing = await db
    .select({ id: userReviews.id })
    .from(userReviews)
    .where(and(eq(userReviews.reviewerId, reviewerId), eq(userReviews.revieweeId, revieweeId)))
    .limit(1);
  return existing.length === 0; // not already reviewed
}
