"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MapPin } from "@/lib/listings";
import { Scene } from "./Scene";

export default function LeafletMap({ pins }: { pins: MapPin[] }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const [selected, setSelected] = useState<string | null>(null);

  // Create the map once.
  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: true }).setView([-33.87, 151.2], 10);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on("click", () => setSelected(null));
    map.current = m;
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
    };
  }, []);

  // Redraw pins whenever the search results change.
  useEffect(() => {
    const m = map.current;
    const group = layer.current;
    if (!m || !group) return;
    group.clearLayers();
    markers.current.clear();
    for (const p of pins) {
      const icon = L.divIcon({
        className: "pin-holder",
        html: `<span class="pin" data-id="${p.id}">$${p.price}</span>`,
        iconSize: [0, 0],
      });
      const marker = L.marker([p.lat, p.lng], { icon, keyboard: true, title: `${p.place}, $${p.price} per ${p.unit}` });
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelected(p.id);
      });
      marker.addTo(group);
      markers.current.set(p.id, marker);
    }
    setSelected(null);
    if (pins.length) m.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])), { padding: [60, 60], maxZoom: 14 });
  }, [pins]);

  // Highlight the selected pin.
  useEffect(() => {
    markers.current.forEach((marker, id) => {
      marker.getElement()?.querySelector(".pin")?.classList.toggle("on", id === selected);
      marker.setZIndexOffset(id === selected ? 1000 : 0);
    });
  }, [selected, pins]);

  const pin = pins.find((p) => p.id === selected);
  return (
    <div className="mapbox">
      <div ref={el} className="leaflet-host" role="application" aria-label="Map of results" />
      {pins.length === 0 && <div className="mapnote">No places to show on the map</div>}
      {pin && (
        <Link href={`/listings/${pin.id}`} className="mapprev">
          <div className="thumb">
            {pin.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pin.photo} alt="" />
            ) : (
              <Scene seed={pin.id} />
            )}
          </div>
          <div className="t">
            <h3>{pin.place}</h3>
            <div className="meta">{pin.title}</div>
            <div className="price"><b>${pin.price}</b> <small>per {pin.unit}</small></div>
          </div>
        </Link>
      )}
    </div>
  );
}
