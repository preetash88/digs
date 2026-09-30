import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { handle, HttpError, requireUser } from "@/lib/api";

async function ownedListing(id: string, userId: string) {
  const l = await db.query.listings.findFirst({ where: and(eq(listings.id, id), eq(listings.ownerId, userId)) });
  if (!l) throw new HttpError(404, "Listing not found");
  return l;
}

export const PATCH = handle<{ id: string }>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const l = await ownedListing(id, user.id);
  const { status } = z.object({ status: z.enum(["active", "paused"]) }).parse(await req.json().catch(() => ({})));
  if (l.status === "pending" || l.status === "rejected") {
    throw new HttpError(400, "This ad is waiting for review");
  }
  await db.update(listings).set({ status, updatedAt: new Date() }).where(eq(listings.id, id));
  return Response.json({ ok: true });
});

export const DELETE = handle<{ id: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await ownedListing(id, user.id);
  await db.delete(listings).where(eq(listings.id, id));
  return Response.json({ ok: true });
});
