import { CITIES } from "@/lib/places";

// Slow, endless line of place names between the hero and the results.
export function Ticker() {
  const names = [...CITIES.AU, ...CITIES.NZ].map((c) => c.name);
  const group = (key: string) => (
    <div className="tgroup" key={key} aria-hidden={key === "b"}>
      {names.map((n) => (
        <span key={n}>{n}<b className="sep" /></span>
      ))}
    </div>
  );
  return (
    <div className="ticker" role="presentation">
      <div className="ttrack">{group("a")}{group("b")}</div>
    </div>
  );
}
