"use client";

import { useEffect, useSyncExternalStore } from "react";
import { endSwitch, getPendingCountry, subscribeCountry } from "@/lib/countryStore";

type Country = "AU" | "NZ";

// Both photos are in the page from the start, so a switch is just a
// cross-fade between two images that are already downloaded.
export function HeroPhotos({ country }: { country: Country }) {
    const pending = useSyncExternalStore(subscribeCountry, getPendingCountry, () => null);
    const active = pending ?? country;

    // The server has caught up with what the visitor clicked: finish the loader.
    useEffect(() => {
        if (getPendingCountry() === country) endSwitch();
    }, [country]);

    return (
        <>
            {/* eslint-disable @next/next/no-img-element */}
            <img className={`hero-photo${active === "AU" ? " on" : ""}`} src="/hero/au.avif" alt="" decoding="async" fetchPriority={country === "AU" ? "high" : "low"} />
            <img className={`hero-photo${active === "NZ" ? " on" : ""}`} src="/hero/nz.avif" alt="" decoding="async" fetchPriority={country === "NZ" ? "high" : "low"} />
            {/* eslint-enable @next/next/no-img-element */}
        </>
    );
}