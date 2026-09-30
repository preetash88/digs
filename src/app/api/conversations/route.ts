import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, listings, messages } from "@/db/schema";
import { handle, HttpError, requireUser } from "@/lib/api";
import { startConversationSchema } from "@/lib/validators";

// Start (or continue) a conversation with the person who posted an ad.
export const POST = handle(async (req) => {
  const user = await requireUser();
  const input = startConversationSchema.parse(await req.json().catch(() => ({})));
  const listing = await db.query.listings.findFirst({ where: eq(listings.id, input.listingId) });
  if (!listing || listing.status !== "active") throw new HttpError(404, "Listing not found");
  if (listing.ownerId === user.id) throw new HttpError(400, "This is your own ad");

  let conv = await db.query.conversations.findFirst({
    where: and(eq(conversations.listingId, listing.id), eq(conversations.seekerId, user.id)),
  });
  if (!conv) {
    [conv] = await db
      .insert(conversations)
      .values({ listingId: listing.id, seekerId: user.id, hostId: listing.ownerId })
      .returning();
  }
  await db.insert(messages).values({ conversationId: conv.id, senderId: user.id, body: input.body });
  return Response.json({ id: conv.id }, { status: 201 });
});
