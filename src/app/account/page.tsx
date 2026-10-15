import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingActions } from "@/components/ListingActions";
import { getCurrentUser } from "@/lib/auth";
import { money, unitFor } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ review?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const { review } = await searchParams;
  const mine = await db.select().from(listings).where(eq(listings.ownerId, user.id)).orderBy(desc(listings.createdAt));
  return (
    <>
      <Header />
      <main className="wrap narrow-page">
        <h1>Hi {(user.name ?? "there").split(" ")[0]}</h1>
        {review && <p className="notice">Thanks! Your ad is with our team for a quick check. It will go live as soon as it is approved.</p>}
        <div className="head"><h2>Your ads</h2><Link className="btn primary small" href="/post">Post a new ad</Link></div>
        <div className="profile-links">
          <Link className="btn ghost-dark small" href="/account/profile">Edit your profile</Link>
          <Link className="btn ghost-dark small" href={`/users/${user.id}`}>View your public profile</Link>
        </div>
        {mine.length ? (
          <ul className="mylist">
            {mine.map((l) => (
              <li key={l.id}>
                <div>
                  <Link href={`/listings/${l.id}`}><b>{l.title}</b></Link>
                  <div className="muted">{l.suburb}, {l.city} · {money(l.rentCents)} per {unitFor(l.kind)} · <span className={`status ${l.status}`}>{l.status}</span></div>
                </div>
                <ListingActions id={l.id} status={l.status} />
              </li>
            ))}
          </ul>
        ) : <p className="muted">You haven't posted anything yet.</p>}
      </main>
      <Footer />
    </>
  );
}
