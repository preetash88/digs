import Link from "next/link";
import type { ListingSummary } from "@/lib/listings";
import { money, unitFor } from "@/lib/format";
import { FavouriteButton } from "./FavouriteButton";
import { Icon } from "./Icon";
import { PhotoCarousel } from "./PhotoCarousel";

function line(l: ListingSummary["listing"]) {
  if (l.kind === "room") return `${l.housemates} housemate${l.housemates === 1 ? "" : "s"}, ${l.billsIncluded ? "bills included" : "bills extra"}`;
  if (l.kind === "whole") return `${l.bedrooms} bed, ${l.bathrooms} bath, whole place`;
  if (l.kind === "short") return `${l.bedrooms} bed, up to ${l.maxGuests} guests`;
  return `Looking in ${l.suburb}`;
}

export function ListingCard({ item, saved, loggedIn, i = 0 }: { item: ListingSummary; saved: boolean; loggedIn: boolean; i?: number }) {
  const { listing: l, photos, rating, reviewCount } = item;
  return (
    <article className="listing" data-reveal style={{ ["--i" as string]: i % 4 }}>
      <div className="pic">
        <PhotoCarousel href={`/listings/${l.id}`} title={l.title} photos={photos} seed={l.id} offset={i} />
        {l.billsIncluded && l.kind !== "wanted" && <span className="badge">Bills included</span>}
        {l.kind !== "wanted" && <FavouriteButton listingId={l.id} initial={saved} loggedIn={loggedIn} />}
      </div>
      <div className="lbody">
        <div className="lrow">
          <h3><Link href={`/listings/${l.id}`}>{l.suburb}<span className="city">, {l.city}</span></Link></h3>
          {rating != null && (
            <span className="rate"><Icon name="star" size={13} />{rating.toFixed(2)}<span className="muted"> ({reviewCount})</span></span>
          )}
        </div>
        <div className="meta">{l.title}</div>
        <div className="meta">{line(l)}</div>
        <div className="price">
          <b>{l.kind === "wanted" ? "Up to " : ""}{money(l.rentCents)}</b>{" "}
          <small>per {unitFor(l.kind)}{l.kind === "whole" ? " for the home" : ""}</small>
        </div>
      </div>
    </article>
  );
}
