"use client";

import { useState } from "react";

export function ReportButton({ listingId, loggedIn }: { listingId: string; loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const reason = String(new FormData(e.currentTarget).get("reason") ?? "");
    const res = await fetch(`/api/listings/${listingId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setMsg(res.ok ? "Thanks. Our team will take a look." : (await res.json()).error);
    if (res.ok) setOpen(false);
  }

  if (!loggedIn) return <p className="fine2"><a href="/login">Log in</a> to report this ad.</p>;
  return (
    <div>
      {!open && <button className="linklike" onClick={() => setOpen(true)}>Report this ad</button>}
      {open && (
        <form onSubmit={submit} className="contact">
          <label htmlFor="reason">What is wrong with this ad?</label>
          <textarea id="reason" name="reason" required minLength={5} />
          <button className="btn dark">Send report</button>
        </form>
      )}
      {msg && <p className="fine2" role="status">{msg}</p>}
    </div>
  );
}
