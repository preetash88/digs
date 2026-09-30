const PATHS: Record<string, string> = {
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r=".8"/>',
  kitchen: '<path d="M5 10h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM3 10h18M9 6c0-2 2-2 2-4M14 6c0-2 2-2 2-4"/>',
  washer: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6.5h1M11 6.5h1"/>',
  aircon: '<rect x="3" y="5" width="18" height="8" rx="2"/><path d="M7 17c0 1.5-1 2-1 3M12 17c0 1.5-1 2-1 3M17 17c0 1.5-1 2-1 3"/>',
  heat: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-9z"/>',
  parking: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
  work: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>',
  pool: '<path d="M8 4v11M16 4v11M8 8h8M8 12h8M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  pets: '<circle cx="7" cy="10" r="1.7"/><circle cx="11" cy="6.5" r="1.7"/><circle cx="16" cy="7" r="1.7"/><circle cx="19" cy="11.5" r="1.7"/><path d="M8 18c0-3 3-6 5-6s5 3 4 6c-1 2-3 1-4.5 1S9 20 8 18z"/>',
  beach: '<path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M13 3a7 7 0 0 1 7 7H6a7 7 0 0 1 7-7zM13 10v3"/>',
  uni: '<path d="M2 9l10-5 10 5-10 5zM6 11.5V16c3 2.5 9 2.5 12 0v-4.5"/>',
  city: '<path d="M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 10h4a1 1 0 0 1 1 1v10M3 21h18M9 8h2M9 12h2M9 16h2"/>',
  garden: '<path d="M12 21v-9M12 12c-4 0-6-3-6-7 4 0 6 3 6 7zM12 15c4 0 6-3 6-6-4 0-6 2-6 6z"/>',
  furn: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v4H3zM6 17v2M18 17v2"/>',
  bills: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  ensuite: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>',
  transit: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 20l2-3M15 20l-2-3"/><circle cx="9" cy="14" r=".8"/><circle cx="15" cy="14" r=".8"/>',
  bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8l3 8M9 5h3"/>',
  quiet: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  heart: '<path d="M12 20.5s-8-4.8-9.5-10C1.6 7 3.8 4.5 6.8 4.5c2 0 3.7 1 5.2 3 1.5-2 3.2-3 5.2-3 3 0 5.2 2.5 4.3 6-1.5 5.2-9.5 10-9.5 10z"/>',
  star: '<path fill="currentColor" stroke="none" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  close: '<path d="M5 5l14 14M19 5L5 19"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
};

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none", display: "block" }}
      dangerouslySetInnerHTML={{ __html: PATHS[name] ?? "" }}
    />
  );
}
