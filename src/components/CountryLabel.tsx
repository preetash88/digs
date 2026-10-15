"use client";

import { useSyncExternalStore } from "react";
import { getPendingCountry, subscribeCountry } from "@/lib/countryStore";

export function CountryLabel({ country, long = false }: { country: "AU" | "NZ"; long?: boolean }) {
    const pending = useSyncExternalStore(subscribeCountry, getPendingCountry, () => null);
    const c = pending ?? country;
    const text = c === "NZ" ? (long ? "Aotearoa New Zealand" : "New Zealand") : "Australia";
    return <span key={c} className="swap">{text}</span>;
}