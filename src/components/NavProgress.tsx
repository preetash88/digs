"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavProgress() {
    const bar = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const el = bar.current;
        if (!el) return;
        // Snap to full and fade out on navigation complete
        el.style.transition = "none";
        el.style.width = "0%";
        el.style.opacity = "1";
        requestAnimationFrame(() => {
            el.style.transition = "width 0.3s ease";
            el.style.width = "100%";
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                el.style.transition = "opacity 0.4s ease";
                el.style.opacity = "0";
            }, 350);
        });
    }, [pathname, searchParams]);

    return (
        <div className="nav-progress-wrap" aria-hidden="true">
            <div className="nav-progress-bar" ref={bar} />
        </div>
    );
}