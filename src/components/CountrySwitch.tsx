"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { beginSwitch, getPendingCountry, subscribeCountry } from "@/lib/countryStore";

type Country = "AU" | "NZ";

export function CountrySwitch({ country }: { country: Country }) {
    const pending = useSyncExternalStore(subscribeCountry, getPendingCountry, () => null);
    const active = pending ?? country;
    const item = (code: Country, full: string, abbr: string, label: string) => (
        <Link
            href={`/?country=${code}`}
            aria-current={active === code}
            aria-label={label}
            onClick={() => { if (code !== active) beginSwitch(code); }}
        >
            <span className="full">{full}</span><span className="abbr">{abbr}</span>
        </Link>
    );
    return (
        <div className="region" role="group" aria-label="Country">
            {item("AU", "Australia", "AU", "Australia")}
            <i aria-hidden="true" />
            {item("NZ", "Aotearoa", "NZ", "Aotearoa New Zealand")}
        </div>
    );
}