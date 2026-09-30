"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AMENITIES } from "@/lib/places";
import { Icon } from "./Icon";

type Props = {
  kind: string;
  currency: string;
  activeCount: number;
  total: number;
  // Values that must survive when filters are applied (country, kind, city, search text...).
  keep: Record<string, string>;
  values: { min?: number; max?: number; beds?: number; baths?: number; am: string[]; bills: boolean; furnished: boolean; pets: boolean; verified: boolean };
};

function toQuery(form: HTMLFormElement) {
  const data = new FormData(form);
  const q = new URLSearchParams();
  const am: string[] = [];
  for (const [k, v] of data.entries()) {
    const val = String(v);
    if (!val) continue;
    if (k === "am") am.push(val);
    else q.set(k, val);
  }
  if (am.length) q.set("am", am.join(","));
  return q;
}

export function FiltersDialog({ kind, currency, activeCount, total, keep, values }: Props) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [count, setCount] = useState(total);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const unit = kind === "short" ? "night" : "week";
  const showRooms = kind === "whole" || kind === "short";

  useEffect(() => () => clearTimeout(timer.current), []);

  function refreshCount() {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (!form.current) return;
      const q = toQuery(form.current);
      q.set("countOnly", "1");
      const res = await fetch(`/api/listings?${q}`);
      if (res.ok) setCount((await res.json()).total);
    }, 250);
  }

  function apply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dialog.current?.close();
    router.push(`/?${toQuery(e.currentTarget)}#results`);
  }

  function clearAll() {
    dialog.current?.close();
    router.push(`/?${new URLSearchParams(keep)}#results`);
  }

  return (
    <>
      <button type="button" className="tool" onClick={() => { setCount(total); dialog.current?.showModal(); }} aria-haspopup="dialog">
        <Icon name="sliders" size={18} /><span className="t">Filters</span>
        {activeCount > 0 && <span className="n">{activeCount}</span>}
      </button>
      <dialog ref={dialog} className="filters" aria-label="Filters" onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}>
        <form ref={form} onSubmit={apply} onChange={refreshCount}>
          <div className="dhead">
            <h2>Filters</h2>
            <button type="button" className="iconx" aria-label="Close filters" onClick={() => dialog.current?.close()}><Icon name="close" size={18} /></button>
          </div>
          <div className="dbody">
            {Object.entries(keep).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}

            <section>
              <h3>Price range</h3>
              <p className="hint">Per {unit}, in {currency}</p>
              <div className="pr">
                <label>Minimum<input name="min" type="number" inputMode="numeric" min={0} defaultValue={values.min ?? ""} placeholder="No min" /></label>
                <label>Maximum<input name="max" type="number" inputMode="numeric" min={0} defaultValue={values.max ?? ""} placeholder="No max" /></label>
              </div>
            </section>

            {showRooms && (
              <section>
                <h3>Bedrooms and bathrooms</h3>
                <div className="pr">
                  <label>Bedrooms
                    <select name="beds" defaultValue={values.beds ?? ""}>
                      <option value="">Any</option>
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
                    </select>
                  </label>
                  <label>Bathrooms
                    <select name="baths" defaultValue={values.baths ?? ""}>
                      <option value="">Any</option>
                      {[1, 2, 3].map((n) => <option key={n} value={n}>{n}+</option>)}
                    </select>
                  </label>
                </div>
              </section>
            )}

            <section>
              <h3>What the place offers</h3>
              <div className="amgrid">
                {AMENITIES.map(([id, label]) => (
                  <label key={id} className="amchip">
                    <input type="checkbox" name="am" value={id} defaultChecked={values.am.includes(id)} />
                    <span><Icon name={id} size={20} />{label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3>Good to know</h3>
              <div className="optlist">
                <label>Bills included<input type="checkbox" name="bills" value="1" defaultChecked={values.bills} /></label>
                <label>Furnished<input type="checkbox" name="furnished" value="1" defaultChecked={values.furnished} /></label>
                <label>Pets allowed<input type="checkbox" name="pets" value="1" defaultChecked={values.pets} /></label>
                <label>ID-verified hosts only<input type="checkbox" name="verified" value="1" defaultChecked={values.verified} /></label>
              </div>
            </section>
          </div>
          <div className="dfoot">
            <button type="button" className="linklike" onClick={clearAll}>Clear all</button>
            <button type="submit" className="btn dark">Show {count} {count === 1 ? "place" : "places"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
