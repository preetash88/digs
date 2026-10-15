"use client";

import { useEffect, useRef } from "react";

// One small client component that powers every interaction on the site:
//  - sets --sy (scroll) and data-scrolled on <html> (header + parallax)
//  - reveals [data-reveal] elements as they enter the viewport
//  - draws the soft "aurora" that trails the cursor (fine pointers only)
// Everything degrades to a plain static page if JS or motion is unavailable.
export function Motion() {
  const aura = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // ── scroll state ─────────────────────────────────────────────
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (!reduce) root.style.setProperty("--sy", String(Math.min(y, 1400)));
        if (y > 40) root.setAttribute("data-scrolled", "");
        else root.removeAttribute("data-scrolled");
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── reveal on scroll ─────────────────────────────────────────
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => io.observe(el));
    scan();
    // Listing grids re-render on filter/sort/page changes; pick up new nodes.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    // ── aurora cursor trail ──────────────────────────────────────
    let raf = 0;
    let cleanupPointer = () => {};
    if (finePointer && !reduce && aura.current) {
      const el = aura.current;
      const blobs = Array.from(el.querySelectorAll<HTMLElement>("i"));
      const k = [0.2, 0.1, 0.05]; // each blob trails a little further behind
      const pos = blobs.map(() => ({ x: -999, y: -999 }));
      const target = { x: -999, y: -999 };
      let primed = false;

      const tick = () => {
        let moving = false;
        blobs.forEach((b, i) => {
          const p = pos[i];
          p.x += (target.x - p.x) * k[i];
          p.y += (target.y - p.y) * k[i];
          if (Math.abs(target.x - p.x) > 0.4 || Math.abs(target.y - p.y) > 0.4) moving = true;
          b.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        });
        raf = moving ? requestAnimationFrame(tick) : 0;
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        target.x = e.clientX;
        target.y = e.clientY;
        if (!primed) {
          pos.forEach((p) => { p.x = e.clientX; p.y = e.clientY; });
          primed = true;
        }
        root.style.setProperty("--mx", `${e.clientX}px`);
        root.style.setProperty("--my", `${e.clientY}px`);
        root.style.setProperty("--mxn", String((e.clientX / window.innerWidth - 0.5) * 2));
        root.style.setProperty("--myn", String((e.clientY / window.innerHeight - 0.5) * 2));
        el.classList.add("on");
        if (!raf) raf = requestAnimationFrame(tick);
      };
      const onLeave = () => el.classList.remove("on");
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
      cleanupPointer = () => {
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("mouseleave", onLeave);
      };
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      mo.disconnect();
      cleanupPointer();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="aura" ref={aura} aria-hidden="true">
      <i style={{ ["--s" as string]: "460px", ["--c" as string]: "rgba(214,172,104,.34)" }} />
      <i style={{ ["--s" as string]: "340px", ["--c" as string]: "rgba(62,150,128,.30)" }} />
      <i style={{ ["--s" as string]: "240px", ["--c" as string]: "rgba(196,98,58,.22)" }} />
    </div>
  );
}
