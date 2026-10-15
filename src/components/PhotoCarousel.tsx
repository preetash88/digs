"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { Scene } from "./Scene";
import { hash } from "@/lib/format";

// Swipeable on phones (native scroll-snap), arrows and dots on desktop.
export function PhotoCarousel({ href, title, photos, seed, offset = 0 }: { href: string; title: string; photos: string[]; seed: string; offset?: number }) {
  const slides = photos.length ? photos.slice(0, 6) : [0, 1, 2, 3];
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function go(dir: number) {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: (index + dir) * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  }
  // Desktop: sweep the pointer across the photo to flick through the gallery.
  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (e.pointerType !== "mouse" || !el || slides.length < 2) return;
    const r = el.getBoundingClientRect();
    const i = Math.min(slides.length - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * slides.length)));
    if (i !== index) el.scrollTo({ left: i * el.clientWidth, behavior: "auto" });
  }
  function onLeave(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && ref.current && index !== 0) ref.current.scrollTo({ left: 0, behavior: "auto" });
  }
  function onScroll() {
    const el = ref.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <>
      <div className="track" ref={ref} onScroll={onScroll} onPointerMove={onMove} onPointerLeave={onLeave}>
        {slides.map((s, i) => (
          <Link key={i} href={href} className="slide" tabIndex={i === 0 ? 0 : -1} aria-label={i === 0 ? title : `${title}, photo ${i + 1}`}>
            {typeof s === "string" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s} alt={i === 0 ? title : ""} loading="lazy" draggable={false} />
            ) : (
              <Scene seed={seed} variant={(s + offset + ((hash(seed) >>> 3) % 5)) % 5} />
            )}
          </Link>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          {index > 0 && <button type="button" className="nav prev" aria-label="Previous photo" onClick={() => go(-1)}><Icon name="left" size={16} /></button>}
          {index < slides.length - 1 && <button type="button" className="nav next" aria-label="Next photo" onClick={() => go(1)}><Icon name="right" size={16} /></button>}
          <div className="dots" aria-hidden="true">
            {slides.map((_, i) => <i key={i} className={i === index ? "on" : ""} />)}
          </div>
        </>
      )}
    </>
  );
}
