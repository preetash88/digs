"use client";

import { useRouter } from "next/navigation";

export function ListingActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function toggle() {
    await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "active" ? "paused" : "active" }),
    });
    router.refresh();
  }
  async function remove() {
    if (!confirm("Delete this ad? This cannot be undone.")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="actions">
      {(status === "active" || status === "paused") && (
        <button className="btn ghost-dark small" onClick={toggle}>{status === "active" ? "Pause" : "Resume"}</button>
      )}
      <button className="btn ghost-dark small" onClick={remove}>Delete</button>
    </div>
  );
}
