"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

export function FavouriteButton({
  listingId,
  initial,
  loggedIn,
  variant = "card",
}: {
  listingId: string;
  initial: boolean;
  loggedIn: boolean;
  variant?: "card" | "text";
}) {
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) return router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    if (busy) return;
    setBusy(true);
    setSaved((s) => !s); // optimistic
    const res = await fetch(`/api/listings/${listingId}/favourite`, { method: "POST" });
    if (res.ok) setSaved((await res.json()).saved);
    else setSaved((s) => !s);
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      className={variant === "card" ? "heart" : "btn ghost-dark"}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save this place"}
      onClick={toggle}
    >
      <Icon name="heart" size={variant === "card" ? 26 : 18} />
      {variant === "text" && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
