import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";
import { Scene } from "@/components/Scene";
import { UserReviewForm } from "@/components/UserReviewForm";
import { getCurrentUser } from "@/lib/auth";
import { money, unitFor, timeAgo } from "@/lib/format";
import { getPublicProfile } from "@/lib/profiles";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, viewer] = await Promise.all([getPublicProfile(id), getCurrentUser()]);
  if (!data) notFound();
  const { user, listings, reviews, avgRating } = data;
  const isOwn = viewer?.id === user.id;
  const memberSince = user.createdAt.toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  return (
    <>
      <Header />
      <main className="wrap profile-page">

        {/* ── Profile card ── */}
        <div className="profile-hero">
          <div className="profile-avatar large">{(user.name ?? "?")[0]}</div>
          <div className="profile-meta">
            <h1>{user.name}</h1>
            <div className="badges">
              {user.idVerified && (
                <span className="badge-pill verified"><Icon name="shield" size={15} /> ID verified</span>
              )}
              {user.phoneVerified && (
                <span className="badge-pill"><Icon name="mail" size={15} /> Phone verified</span>
              )}
              {avgRating != null && (
                <span className="badge-pill"><Icon name="star" size={15} /> {avgRating.toFixed(2)} ({reviews.length} review{reviews.length === 1 ? "" : "s"})</span>
              )}
            </div>
            <p className="muted member-since">Member since {memberSince}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
            {isOwn && <Link className="btn ghost-dark small" href="/account/profile">Edit your profile</Link>}
          </div>
        </div>

        <div className="profile-cols">
          {/* ── Their listings ── */}
          <section className="profile-listings">
            <h2>{isOwn ? "Your active ads" : `${(user.name ?? "Member").split(" ")[0]}'s places`}</h2>
            {listings.length ? (
              <div className="grid grid-sm">
                {listings.map(l => (
                  <article key={l.id} className="listing">
                    <div className="pic">
                      <Link href={`/listings/${l.id}`} className="pic-link">
                        {l.photo
                          ? <img src={l.photo} alt={l.title} loading="lazy" />
                          : <Scene seed={l.id} />}
                      </Link>
                    </div>
                    <div className="lbody">
                      <div className="lrow"><h3><Link href={`/listings/${l.id}`}>{l.suburb}, {l.city}</Link></h3></div>
                      <div className="meta">{l.title}</div>
                      <div className="price"><b>{money(l.rentCents)}</b> <small>per {unitFor(l.kind)}</small></div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">{isOwn ? "You don't have any active ads." : "No active ads right now."}</p>
            )}
          </section>

          {/* ── Reviews received ── */}
          <section className="profile-reviews">
            <h2>Reviews</h2>
            {reviews.length ? (
              <div className="rev-list">
                {reviews.map(r => (
                  <div key={r.id} className="rev">
                    <div className="rev-top">
                      <div className="rate"><Icon name="star" size={13} />{r.rating}</div>
                      <span className="muted">{timeAgo(r.createdAt)}</span>
                    </div>
                    <p className="rev-body">{r.body}</p>
                    <div className="rev-footer">
                      <b>{r.reviewerName}</b>
                      <span className="badge-sm">{r.role === "host" ? "Was their host" : "Rented from them"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No reviews yet.</p>
            )}

            {!isOwn && (
              <div style={{ marginTop: 24 }}>
                <UserReviewForm revieweeId={user.id} revieweeName={user.name ?? "this member"} loggedIn={!!viewer} />
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
