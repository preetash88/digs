import { hash } from "@/lib/format";

const PAL = [
  ["#CFE8DF", "#1F6F78", "#FFC93C"],
  ["#FBE7B8", "#0F2A33", "#3A7F87"],
  ["#D6E4F0", "#2A6670", "#FFC93C"],
  ["#E6DCEF", "#3A7F87", "#FFC93C"],
];

// Placeholder "photo" used when a listing has no uploaded pictures yet.
export function Scene({ seed, variant }: { seed: string; variant?: number }) {
  const h = hash(seed);
  const [bg, fg, ac] = PAL[h % 4];
  const v = variant ?? (h >> 3) % 5;
  const floor = <rect y="220" width="400" height="80" fill={fg} opacity=".16" />;
  const scenes = [
    <g key="0">
      <rect x="250" y="50" width="100" height="120" rx="4" fill="#fff" opacity=".85" />
      <path d="M300 50v120M250 110h100" stroke={fg} strokeWidth="4" opacity=".5" />
      <rect x="40" y="150" width="190" height="70" rx="8" fill={fg} />
      <rect x="40" y="130" width="34" height="90" rx="6" fill={fg} opacity=".85" />
      <rect x="80" y="140" width="140" height="34" rx="8" fill={ac} />
      <rect x="300" y="200" width="30" height="46" rx="4" fill={ac} />
      <path d="M315 200c-22-10-24-44 0-56 22 12 22 46 0 56z" fill={fg} opacity=".75" />
    </g>,
    <g key="1">
      <rect x="40" y="140" width="220" height="80" rx="14" fill={fg} />
      <rect x="50" y="120" width="200" height="50" rx="14" fill={fg} opacity=".85" />
      <rect x="70" y="150" width="80" height="40" rx="8" fill={ac} />
      <rect x="290" y="70" width="6" height="150" fill={fg} />
      <path d="M270 80h50l-10-30h-30z" fill={ac} />
      <rect x="60" y="40" width="120" height="60" rx="4" fill="none" stroke={fg} strokeWidth="5" opacity=".5" />
    </g>,
    <g key="2">
      <rect x="30" y="90" width="120" height="70" rx="4" fill={fg} opacity=".85" />
      <rect x="170" y="90" width="120" height="70" rx="4" fill={fg} opacity=".85" />
      <rect y="170" width="400" height="20" fill="#fff" opacity=".8" />
      <rect y="190" width="400" height="110" fill={fg} />
      <rect x="320" y="110" width="50" height="60" rx="6" fill={ac} />
    </g>,
    <g key="3">
      <rect x="60" y="150" width="200" height="70" rx="30" fill="#fff" opacity=".9" />
      <rect x="300" y="60" width="60" height="90" rx="30" fill={ac} />
      <circle cx="330" cy="105" r="16" fill="#fff" opacity=".7" />
    </g>,
    <g key="4">
      <rect x="90" y="120" width="220" height="118" fill={fg} />
      <polygon points="70,122 200,50 330,122" fill={fg} opacity=".8" />
      <rect x="124" y="150" width="46" height="46" rx="3" fill={ac} />
      <rect x="230" y="150" width="46" height="46" rx="3" fill={ac} />
      <rect x="184" y="180" width="32" height="58" fill={bg} />
    </g>,
  ];
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="400" height="300" fill={bg} />
      {floor}
      {scenes[v % 5]}
    </svg>
  );
}
