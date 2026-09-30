"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  // Simple polling for now; real-time (WebSockets) comes later on AWS.
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 6000);
    return () => clearInterval(t);
  }, [router]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = String(new FormData(e.currentTarget).get("body") ?? "");
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      ref.current?.reset();
      router.refresh();
    } else setError((await res.json()).error ?? "Could not send");
    setBusy(false);
  }

  return (
    <form ref={ref} onSubmit={submit} className="composer">
      <input name="body" placeholder="Write a message" required maxLength={2000} autoComplete="off" aria-label="Message" />
      <button className="btn primary" disabled={busy}>Send</button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
