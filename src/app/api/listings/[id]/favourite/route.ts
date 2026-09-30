import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { favourites, listings } from "@/db/schema";
import { handle, HttpError, requireUser } from "@/lib/api";

// POST toggles the heart and returns the new state.
export const POST = handle<{ id: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const listing = await db.query.listings.findFirst({ where: eq(listings.id, id), columns: { id: true } });
  if (!listing) throw new HttpError(404, "Listing not found");
  const where = and(eq(favourites.userId, user.id), eq(favourites.listingId, id));
  const existing = await db.select().from(favourites).where(where).limit(1);
  if (existing.length) {
    await db.delete(favourites).where(where);
    return Response.json({ saved: false });
  }
  await db.insert(favourites).values({ userId: user.id, listingId: id });
  return Response.json({ saved: true });
});
