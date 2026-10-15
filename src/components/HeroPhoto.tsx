"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function HeroPhoto() {
    const searchParams = useSearchParams();
    const country = (searchParams.get("country") ?? "AU") as "AU" | "NZ";
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const el = imgRef.current;
        if (!el) return;
        const next = country === "NZ" ? "/hero/nz.avif" : "/hero/au.avif";
        if (el.src.endsWith(next)) return;
        el.style.opacity = "0";
        const img = new Image();
        img.src = next;
        img.onload = () => {
            el.src = next;
            el.style.opacity = "1";
        };
    }, [country]);

    const initial = country === "NZ" ? "/hero/nz.avif" : "/hero/au.avif";

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={imgRef}
            src={initial}
            alt=""
            className="hero-photo"
            fetchPriority="high"
            decoding="async"
        />
    );
}