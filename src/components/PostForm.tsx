"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AMENITIES, CITIES, FEATURES, KINDS } from "@/lib/places";
import type { Country } from "@/db/schema";

export function PostForm({ defaultCountry }: { defaultCountry: Country }) {
  const router = useRouter();
  const [country, setCountry] = useState<Country>(defaultCountry);
  const [kind, setKind] = useState("room");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const unit = kind === "short" ? "night" : "week";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/listings", { method: "POST", body: new FormData(e.currentTarget) });
    const json = await res.json();
    if (res.ok) {
      router.push(json.status === "pending" ? "/account?review=1" : `/listings/${json.id}`);
      router.refresh();
    } else {
      setError(json.error ?? "Something went wrong");
      setBusy(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <form className="post" onSubmit={submit}>
      {error && <p className="error" role="alert">{error}</p>}

      <fieldset>
        <legend>What are you posting?</legend>
        <div className="radios">
          {KINDS.map(([k, label]) => (
            <label key={k} className="radio">
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} /> {label === "Looking for a place" ? "I'm looking for a place" : label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Where?</legend>
        <div className="grid2">
          <label>Country
            <select name="country" value={country} onChange={(e) => setCountry(e.target.value as Country)}>
              <option value="AU">Australia</option>
              <option value="NZ">New Zealand</option>
            </select>
          </label>
          <label>City
            <select name="city" required key={country}>
              {CITIES[country].map((c) => <option key={c.name}>{c.name}</option>)}
            </select>
          </label>
          <label>Suburb<input name="suburb" required placeholder="e.g. Newtown" maxLength={60} /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend>The details</legend>
        <label>Ad title<input name="title" required minLength={8} maxLength={90} placeholder={kind === "wanted" ? "Tidy professional looking for a room near the city" : "Sunny double near the train"} /></label>
        <label>Description
          <textarea name="description" required minLength={30} maxLength={3000} rows={6} placeholder="Describe the place, the household, and what you're looking for." />
        </label>
        <div className="grid2">
          <label>{kind === "wanted" ? `Budget per ${unit}` : `Rent per ${unit}`} (${country === "AU" ? "AUD" : "NZD"})
            <input name="rent" type="number" min={1} max={50000} required />
          </label>
          {kind !== "wanted" && <label>Available from<input name="availableFrom" type="date" /></label>}
          {kind !== "wanted" && kind !== "room" && <label>Bedrooms<input name="bedrooms" type="number" min={0} max={20} defaultValue={1} /></label>}
          {kind !== "wanted" && kind !== "room" && <label>Bathrooms<input name="bathrooms" type="number" min={0} max={20} defaultValue={1} /></label>}
          {kind === "room" && <label>Current housemates<input name="housemates" type="number" min={0} max={20} defaultValue={2} /></label>}
          {(kind === "short" || kind === "whole") && <label>Max guests<input name="maxGuests" type="number" min={1} max={30} defaultValue={2} /></label>}
        </div>
        {kind !== "wanted" && (
          <div className="checks">
            <label><input type="checkbox" name="billsIncluded" /> Bills included</label>
            <label><input type="checkbox" name="furnished" /> Furnished</label>
            <label><input type="checkbox" name="petsOk" /> Pets allowed</label>
          </div>
        )}
      </fieldset>

      {kind !== "wanted" && (
        <>
          <fieldset>
            <legend>What it offers</legend>
            <div className="checks">
              {AMENITIES.map(([k, l]) => <label key={k}><input type="checkbox" name="amenities" value={k} /> {l}</label>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>Good to know</legend>
            <div className="checks">
              {FEATURES.map(([k, l]) => <label key={k}><input type="checkbox" name="features" value={k} /> {l}</label>)}
            </div>
          </fieldset>
        </>
      )}

      <fieldset>
        <legend>Photos {kind === "wanted" ? "(optional)" : "(up to 6)"}</legend>
        <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple />
        <p className="fine2" style={{ textAlign: "left" }}>JPG, PNG or WebP, up to 6 MB each.</p>
      </fieldset>

      <button className="btn primary wide" disabled={busy}>{busy ? "Posting..." : "Post my ad, it's free"}</button>
    </form>
  );
}
