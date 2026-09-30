import { and, eq, isNull, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { conversations, listings, messages, users } from "@/db/schema";

export async function unreadCount(userId: string) {
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .where(
      and(
        isNull(messages.readAt),
        ne(messages.senderId, userId),
        or(eq(conversations.seekerId, userId), eq(conversations.hostId, userId)),
      ),
    );
  return row?.n ?? 0;
}

export async function inbox(userId: string) {
  const seeker = alias(users, "seeker");
  const host = alias(users, "host");
  const rows = await db
    .select({
      id: conversations.id,
      listingTitle: listings.title,
      seekerId: conversations.seekerId,
      seekerName: seeker.name,
      hostName: host.name,
      last: sql<string>`(select body from messages m where m.conversation_id = ${conversations.id} order by m.created_at desc limit 1)`,
      lastAt: sql<number>`(select max(created_at) from messages m where m.conversation_id = ${conversations.id})`,
      unread: sql<number>`(select count(*) from messages m where m.conversation_id = ${conversations.id} and m.read_at is null and m.sender_id != ${userId})`,
    })
    .from(conversations)
    .innerJoin(listings, eq(listings.id, conversations.listingId))
    .innerJoin(seeker, eq(seeker.id, conversations.seekerId))
    .innerJoin(host, eq(host.id, conversations.hostId))
    .where(or(eq(conversations.seekerId, userId), eq(conversations.hostId, userId)))
;
  return rows
    .map((r) => ({
      ...r,
      otherName: r.seekerId === userId ? r.hostName : r.seekerName,
      lastAt: new Date(r.lastAt * 1000),
    }))
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}
