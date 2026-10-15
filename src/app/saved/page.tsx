import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { getCurrentUser } from "@/lib/auth";
import { getSavedListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/saved");
  const items = await getSavedListings(user.id);
  return (
    <>
      <Header />
      <main className="wrap block">
        <h1>Your saved places</h1>
        {items.length ? (
          <div className="grid">{items.map((i) => <ListingCard key={i.listing.id} item={i} saved loggedIn />)}</div>
        ) : (
          <div className="empty"><h3>Nothing saved yet</h3><p>Tap the heart on any place to keep it here.</p><Link className="btn primary" href="/">Browse places</Link></div>
        )}
      </main>
      <Footer />
    </>
  );
}
