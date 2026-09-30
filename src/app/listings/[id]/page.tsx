import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { Scene } from "@/components/Scene";
import { ContactForm } from "@/components/ContactForm";
import { FavouriteButton } from "@/components/FavouriteButton";
import { ReportButton } from "@/components/ReportButton";
import { getCurrentUser } from "@/lib/auth";
import { getListingDetail, getSavedIds } from "@/lib/listings";
import { money, unitFor } from "@/lib/format";
import { AMENITIES, FEATURES } from "@/lib/places";

export const dynamic = "force-dynamic";

const KIND_LABEL = { room: "Room in a share house", whole: "Whole place", short: "Short stay", wanted: "Looking for a place" } as const;

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, user] = await Promise.all([getListingDetail(id), getCurrentUser()]);
  if (!data) notFound();
  const { listing: l, photos, owner, reviews, rating } = data;
  const isOwner = user?.id === l.ownerId;
  if (l.status !== "active" && !isOwner) notFound();
  const saved = (await getSavedIds(user?.id)).has(l.id);
  const unit = unitFor(l.kind);

  const gallery = photos.length ? photos.map((p) => p.url) : null;
  const labelFor = (k: string) => [...AMENITIES, ...FEATURES].find((x) => x[0] === k)?.[1] ?? k;

  return (
    <>
      <Header country={l.country} />
      <main className="wrap detail">
        {l.status !== "active" && (
          <p className="notice">This ad is <b>{l.status}</b>{l.status === "pending" ? " and is waiting for a quick review. Only you can see it for now." : ". Only you can see it."}</p>
        )}
        <Link className="back" href={`/?country=${l.country}&kind=${l.kind}`}>Back to results</Link>
        <h1 className="dtitle">{l.title}</h1>
        <div className="dsub">
          {rating != null && <span className="rate"><Icon name="star" size={15} />{rating.toFixed(2)} ({reviews.length} review{reviews.length === 1 ? "" : "s"})</span>}
          <span>{l.suburb}, {l.city}</span>
          <span>{KIND_LABEL[l.kind]}</span>
          {l.kind !== "wanted" && !isOwner && <FavouriteButton listingId={l.id} initial={saved} loggedIn={!!user} variant="text" />}
        </div>

        <div className={`gallery${gallery && gallery.length > 1 ? "" : " single"}`}>
          {gallery ? (
            gallery.slice(0, 5).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={src}><img src={src} alt={`${l.title}, photo ${i + 1}`} /></div>
            ))
          ) : (
            [0, 1, 2, 3, 4].slice(0, l.kind === "wanted" ? 1 : 5).map((v) => <div key={v}><Scene seed={l.id} variant={v} /></div>)
          )}
        </div>

        <div className="dcols">
          <div className="dmain">
            <section>
              <div className="hostrow">
                <div>
                  <h2>{KIND_LABEL[l.kind]} with {owner.name}</h2>
                  <p className="meta">
                    {l.kind === "room" && `${l.housemates} housemate${l.housemates === 1 ? "" : "s"}`}
                    {(l.kind === "whole" || l.kind === "short") && `${l.bedrooms} bed, ${l.bathrooms} bath, up to ${l.maxGuests} guests`}
                    {l.kind === "wanted" && "Budget shown is the most they can pay"}
                  </p>
                </div>
                <div className="avatar-wrap">
                  <div className="avatar">{owner.name[0]}</div>
                  <Link href={`/users/${owner.id}`} className="profile-link">View profile</Link>
                </div>
              </div>
              <ul className="trustlist">
                <li><Icon name="shield" size={20} /> {owner.idVerified ? "ID verified" : "ID not verified yet"}</li>
                <li><Icon name="mail" size={20} /> Member since {owner.createdAt.toLocaleDateString("en-AU", { month: "long", year: "numeric" })}</li>
                {l.availableFrom && <li><Icon name="pin" size={20} /> Available from {new Date(l.availableFrom + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</li>}
              </ul>
            </section>

            <section><h2>About this {l.kind === "wanted" ? "request" : "place"}</h2><p className="desc">{l.description}</p></section>

            {l.kind !== "wanted" && (
              <section>
                <h2>What this place offers</h2>
                <ul className="amen">
                  {[...l.amenities, ...l.features].map((k) => <li key={k}><Icon name={k} size={24} />{labelFor(k)}</li>)}
                  {l.furnished && <li><Icon name="furn" size={24} />Furnished</li>}
                  {l.billsIncluded && <li><Icon name="bills" size={24} />Bills included</li>}
                  {l.petsOk && <li><Icon name="pets" size={24} />Pets allowed</li>}
                </ul>
              </section>
            )}

            <section>
              <h2>Reviews</h2>
              {reviews.length ? (
                <div className="revs">
                  {reviews.map((r) => (
                    <div key={r.id} className="rev">
                      <b>{r.author}</b> <span className="muted">{r.createdAt.toLocaleDateString("en-AU", { month: "long", year: "numeric" })}</span>
                      <div className="rate"><Icon name="star" size={13} />{r.rating}</div>
                      <p>{r.body}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="muted">No reviews yet.</p>}
            </section>

            <section>
              <h2>Stay safe</h2>
              <p className="muted">Never pay a deposit or send ID before you have inspected the place in person or on a live video call. Keep chatting here on Digs so we can help if something goes wrong.</p>
              {!isOwner && <ReportButton listingId={l.id} loggedIn={!!user} />}
            </section>
          </div>

          <aside className="book">
            <div className="bprice"><b>{l.kind === "wanted" ? "Up to " : ""}{money(l.rentCents)}</b> per {unit}{l.kind === "whole" ? " for the home" : ""}</div>
            {isOwner ? (
              <p className="muted">This is your ad. <Link href="/account">Manage your ads</Link></p>
            ) : l.status === "active" ? (
              <ContactForm listingId={l.id} loggedIn={!!user} hostName={owner.name.split(" ")[0]} />
            ) : null}
          </aside>
        </div>
      </main>
    </>
  );
}
