import Link from "next/link";
import { and, asc, eq, isNull, ne } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { conversations, listings, messages, users } from "@/db/schema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MessageComposer } from "@/components/MessageComposer";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Thread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/messages/${id}`);
  const conv = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  if (!conv || (conv.seekerId !== user.id && conv.hostId !== user.id)) notFound();

  const otherId = conv.seekerId === user.id ? conv.hostId : conv.seekerId;
  const [other, listing, rows] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, otherId), columns: { name: true } }),
    db.query.listings.findFirst({ where: eq(listings.id, conv.listingId), columns: { id: true, title: true } }),
    db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt)),
  ]);
  // Opening the conversation marks the other person's messages as read.
  await db.update(messages).set({ readAt: new Date() }).where(and(eq(messages.conversationId, id), ne(messages.senderId, user.id), isNull(messages.readAt)));

  return (
    <>
      <Header />
      <main className="wrap narrow-page">
        <Link className="back" href="/messages">All messages</Link>
        <h1>{other?.name}</h1>
        {listing && <p className="muted">About <Link href={`/listings/${listing.id}`}>{listing.title}</Link></p>}
        <div className="thread" aria-live="polite">
          {rows.map((m) => (
            <div key={m.id} className={`bubble ${m.senderId === user.id ? "me" : "them"}`}>
              <p>{m.body}</p>
              <small>{timeAgo(m.createdAt)}</small>
            </div>
          ))}
        </div>
        <MessageComposer conversationId={id} />
        <p className="fine2">Keep the conversation on Digs. Never pay before you have inspected the place.</p>
      </main>
      <Footer />
    </>
  );
}
