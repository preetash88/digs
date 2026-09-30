import type { ListingKind } from "@/db/schema";

export const money = (cents: number) =>
  "$" + Math.round(cents / 100).toLocaleString("en-AU");

export const unitFor = (kind: ListingKind) => (kind === "short" ? "night" : "week");

export function timeAgo(d: Date) {
  const s = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
