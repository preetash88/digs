"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ContactForm({ listingId, loggedIn, hostName }: { listingId: string; loggedIn: boolean; hostName: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!loggedIn) return router.push(`/login?next=${encodeURIComponent(`/listings/${listingId}`)}`);
    setBusy(true);
    setError("");
    const body = String(new FormData(e.currentTarget).get("body") ?? "");
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, body }),
    });
    const json = await res.json();
    if (res.ok) router.push(`/messages/${json.id}`);
    else {
      setError(json.error ?? "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="contact">
      <label htmlFor="body">Message {hostName}</label>
      <textarea id="body" name="body" required maxLength={2000} placeholder="Say hello and tell them a bit about yourself" />
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn primary wide" disabled={busy}>{loggedIn ? (busy ? "Sending..." : "Send message") : "Log in to message"}</button>
      <p className="fine2">Never pay or send ID before you have inspected the place.</p>
    </form>
  );
}
