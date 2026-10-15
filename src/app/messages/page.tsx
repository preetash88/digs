import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { inbox } from "@/lib/messaging";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/messages");
  const rows = await inbox(user.id);
  return (
    <>
      <Header />
      <main className="wrap narrow-page">
        <h1>Messages</h1>
        {rows.length ? (
          <ul className="inbox">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/messages/${r.id}`}>
                  <div className="row"><b>{r.otherName}</b><span className="muted">{timeAgo(r.lastAt)}</span></div>
                  <div className="muted">{r.listingTitle}</div>
                  <div className={r.unread ? "unread" : ""}>{r.last}</div>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="muted">No messages yet. Find a place you like and say hello.</p>}
      </main>
      <Footer />
    </>
  );
}
