"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

type Props = { revieweeId: string; revieweeName: string; loggedIn: boolean };

export function UserReviewForm({ revieweeId, revieweeName, loggedIn }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [role, setRole] = useState<"host" | "seeker">("host");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!loggedIn) return <p className="fine2"><a href="/login">Log in</a> to leave a review.</p>;
  if (done) return <p className="notice">✓ Your review has been submitted. Thanks!</p>;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const body = String(new FormData(e.currentTarget).get("body") ?? "");
    const res = await fetch(`/api/users/${revieweeId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, body, role }),
    });
    const j = await res.json();
    if (res.ok) { setDone(true); router.refresh(); }
    else { setError(j.error ?? "Something went wrong"); setBusy(false); }
  }

  return (
    <div>
      {!open && <button className="btn ghost-dark small" onClick={() => setOpen(true)}>Leave a review</button>}
      {open && (
        <form onSubmit={submit} className="contact" style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Review {revieweeName.split(" ")[0]}</h3>
          <div className="star-picker" aria-label="Rating">
            {[1,2,3,4,5].map(n => (
              <button type="button" key={n} aria-pressed={rating === n} onClick={() => setRating(n)}>
                <Icon name="star" size={26} />
              </button>
            ))}
          </div>
          <div className="radios" style={{ margin: "10px 0" }}>
            <label className="radio">
              <input type="radio" checked={role === "host"} onChange={() => setRole("host")} /> They were my host
            </label>
            <label className="radio">
              <input type="radio" checked={role === "seeker"} onChange={() => setRole("seeker")} /> They rented from me
            </label>
          </div>
          <label htmlFor="body">Your review</label>
          <textarea id="body" name="body" required minLength={10} maxLength={1000}
            placeholder="What was it like living with or hosting this person?" />
          {error && <p className="error" role="alert">{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn primary" disabled={busy}>{busy ? "Sending..." : "Submit review"}</button>
            <button type="button" className="btn ghost-dark" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
