import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { handle, HttpError, requireUser } from "@/lib/api";
import { messageSchema } from "@/lib/validators";

async function participantConversation(id: string, userId: string) {
  const conv = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  // 404 (not 403) so people can't probe which conversation ids exist.
  if (!conv || (conv.seekerId !== userId && conv.hostId !== userId)) throw new HttpError(404, "Conversation not found");
  return conv;
}

export const GET = handle<{ id: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await participantConversation(id, user.id);
  const rows = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
  return Response.json({ items: rows });
});

export const POST = handle<{ id: string }>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await participantConversation(id, user.id);
  const { body } = messageSchema.parse(await req.json().catch(() => ({})));
  await db.insert(messages).values({ conversationId: id, senderId: user.id, body });
  return Response.json({ ok: true }, { status: 201 });
});
