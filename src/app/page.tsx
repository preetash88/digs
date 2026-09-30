import Link from "next/link";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { ListingCard } from "@/components/ListingCard";
import { Street } from "@/components/Street";
import { getCurrentUser } from "@/lib/auth";
import { getSavedIds, searchListings, searchMapPins } from "@/lib/listings";
import { CITIES, COUNTRIES, FEATURES, FLAG_CATEGORIES, KINDS } from "@/lib/places";
import { FiltersDialog } from "@/components/FiltersDialog";
import { MapPanel } from "@/components/MapPanel";
import { activeFilterCount, paramsToObject, searchSchema, searchToQuery } from "@/lib/validators";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const raw = await searchParams;
  const p = searchSchema.parse(paramsToObject(raw));
  const user = await getCurrentUser();
  const { items, total, pageSize } = await searchListings(p);
  const saved = await getSavedIds(user?.id);
  const pins = p.view === "map" ? await searchMapPins(p) : [];

  const href = (changes: Record<string, string | undefined>) => `/?${searchToQuery(p, changes)}`;
  const activeCount = activeFilterCount(p);
  const isMap = p.view === "map";
  const keep: Record<string, string> = {};
  for (const [k, v] of Object.entries({
    country: p.country, kind: p.kind, city: p.city, q: p.q, guests: p.guests?.toString(), cat: p.cat,
    sort: p.sort === "new" ? undefined : p.sort, view: isMap ? "map" : undefined,
  })) if (v) keep[k] = v;

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const unit = p.kind === "short" ? "night" : "week";
  const titles = { room: "Rooms open right now", whole: "Whole places for groups", short: "Short stays", wanted: "People looking for a place" };

  return (
    <>
      <Header country={p.country} />
      <main>
        <section className="hero">
          <div className="wrap">
            <h1>Find your people. Then the room.</h1>
            <p className="lede">
              Share houses, whole places and short stays across {COUNTRIES[p.country].name}, with clear weekly rent and people who've been checked.
            </p>

            <div className="tabs" role="tablist" aria-label="What are you looking for">
              {KINDS.map(([k, label]) => (
                <Link key={k} role="tab" aria-selected={p.kind === k} scroll={false} href={`/?country=${p.country}&kind=${k}`}>{label}</Link>
              ))}
            </div>
            <form className="pill" action="/" method="get" role="search">
              <input type="hidden" name="country" value={p.country} />
              <input type="hidden" name="kind" value={p.kind} />
              {p.cat && <input type="hidden" name="cat" value={p.cat} />}
              {p.min != null && <input type="hidden" name="min" value={p.min} />}
              {p.beds != null && <input type="hidden" name="beds" value={p.beds} />}
              {p.baths != null && <input type="hidden" name="baths" value={p.baths} />}
              {p.am.length > 0 && <input type="hidden" name="am" value={p.am.join(",")} />}
              {p.bills && <input type="hidden" name="bills" value="1" />}
              {p.furnished && <input type="hidden" name="furnished" value="1" />}
              {p.pets && <input type="hidden" name="pets" value="1" />}
              {p.verified && <input type="hidden" name="verified" value="1" />}
              {isMap && <input type="hidden" name="view" value="map" />}
              <div className="seg">
                <label htmlFor="q">Where</label>
                <input id="q" name="q" defaultValue={p.q} placeholder="Suburb or city" list="places" autoComplete="off" />
                <datalist id="places">{CITIES[p.country].map((c) => <option key={c.name} value={c.name} />)}</datalist>
              </div>
              <div className="seg">
                <label htmlFor="max">Max per {unit}</label>
                <select id="max" name="max" defaultValue={p.max?.toString() ?? ""}>
                  <option value="">Any</option>
                  {(p.kind === "short" ? [150, 200, 300, 400] : p.kind === "whole" ? [800, 1200, 1600, 2400] : [200, 250, 300, 350, 400, 500]).map((v) => (
                    <option key={v} value={v}>Up to ${v}</option>
                  ))}
                </select>
              </div>
              <div className="seg">
                <label htmlFor="guests">Who</label>
                <select id="guests" name="guests" defaultValue={p.guests?.toString() ?? ""}>
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 6].map((v) => <option key={v} value={v}>{v} {v === 1 ? "person" : "people"}</option>)}
                </select>
              </div>
              <button className="go" type="submit"><Icon name="search" size={20} /><span>Search</span></button>
            </form>
          </div>
          <div className="street-wrap"><Street /></div>
        </section>

        <nav className="catbar" aria-label="Browse by feature">
          <div className="wrap catin">
            <div className="cats">
              {[...FEATURES, ...FLAG_CATEGORIES].map(([id, label]) => (
                <Link key={id} className="cat" aria-pressed={p.cat === id} scroll={false} href={href({ cat: p.cat === id ? undefined : id, page: undefined })}>
                  <Icon name={id} size={26} /><span>{label}</span>
                </Link>
              ))}
            </div>
            <div className="tools">
              <FiltersDialog kind={p.kind} currency={COUNTRIES[p.country].currency} activeCount={activeCount} total={total} keep={keep} values={{ min: p.min, max: p.max, beds: p.beds, baths: p.baths, am: p.am, bills: p.bills, furnished: p.furnished, pets: p.pets, verified: p.verified }} />
              <Link className="tool" aria-pressed={isMap} scroll={false} href={href({ view: isMap ? undefined : "map", page: undefined })}>
                <Icon name={isMap ? "list" : "map"} size={18} /><span className="t">{isMap ? "List" : "Map"}</span>
              </Link>
            </div>
          </div>
        </nav>

        <section className="block" id="results">
          <div className="wrap">
            <div className="head">
              <div>
                <h2>{titles[p.kind]}</h2>
                <div className="count">{total} {total === 1 ? "result" : "results"}, prices in {COUNTRIES[p.country].currency} per {unit}</div>
              </div>
              <div className="sortlinks">
                Sort:{" "}
                <Link aria-current={p.sort === "new"} scroll={false} href={href({ sort: undefined })}>Newest</Link>
                <Link aria-current={p.sort === "lo"} scroll={false} href={href({ sort: "lo" })}>Price, low to high</Link>
                <Link aria-current={p.sort === "hi"} scroll={false} href={href({ sort: "hi" })}>Price, high to low</Link>
              </div>
            </div>
            <div className="chips" role="group" aria-label="Filter by city">
              <Link className="chip" aria-pressed={!p.city} scroll={false} href={href({ city: undefined, q: undefined })}>All of {COUNTRIES[p.country].name}</Link>
              {CITIES[p.country].map((c) => (
                <Link key={c.name} className="chip" aria-pressed={p.city === c.name} scroll={false} href={href({ city: c.name, q: undefined })}>{c.name}</Link>
              ))}
            </div>

            <div className={`layout${isMap ? " withmap" : ""}`}>
              <div className="results">
                {items.length ? (
                  <div className="grid">
                    {items.map((item) => (
                      <ListingCard key={item.listing.id} item={item} saved={saved.has(item.listing.id)} loggedIn={!!user} />
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <h3>Nothing matches yet</h3>
                    <p>Try a higher price, another city, or clear a filter.</p>
                    <Link className="btn primary" scroll={false} href={`/?country=${p.country}&kind=${p.kind}`}>Clear filters</Link>
                  </div>
                )}
              </div>
              {isMap && <aside className="mapcol" aria-label="Map"><MapPanel pins={pins} /></aside>}
            </div>

            {pages > 1 && (
              <div className="pager">
                {p.page > 1 && <Link className="btn ghost-dark" scroll={false} href={href({ page: String(p.page - 1) })}>Previous</Link>}
                <span>Page {p.page} of {pages}</span>
                {p.page < pages && <Link className="btn ghost-dark" scroll={false} href={href({ page: String(p.page + 1) })}>Next</Link>}
              </div>
            )}
          </div>
        </section>

        <section className="cta">
          <div className="wrap two">
            <div className="pane a"><div><h2>Got a spare room?</h2><p>List it free with photos, weekly rent and the kind of flatmate you're after.</p></div><Link className="btn" scroll={false} href="/post">Post a free ad</Link></div>
            <div className="pane b"><div><h2>Need a room?</h2><p>Post a free "looking for a place" ad. People with rooms will come to you.</p></div><Link className="btn" scroll={false} href="/post">Post a wanted ad</Link></div>
          </div>
        </section>
      </main>
      <footer><div className="wrap"><p className="fine">Digs is a working name. Sample listings are for development only.</p></div></footer>
    </>
  );
}