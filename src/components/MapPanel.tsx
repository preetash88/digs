"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "@/lib/listings";

// Leaflet needs the browser, so it is loaded on the client only.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="mapbox"><div className="mapnote">Loading map...</div></div>,
});

export function MapPanel({ pins }: { pins: MapPin[] }) {
  return <LeafletMap pins={pins} />;
}
