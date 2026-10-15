import { useId } from "react";
import { hash } from "@/lib/format";

// [skyTop, skyBottom, far, mid, near, glow, wall, roof]
const PAL = [
  ["#d8c8b0", "#f4dcb6", "#b9a88f", "#6f8272", "#2b4237", "#f6c76e", "#efe6d3", "#4a3a30"], // dawn
  ["#27394a", "#dc9d69", "#5f6c6b", "#34504a", "#14241d", "#ffd48a", "#d9cbb4", "#2b221e"], // dusk
  ["#b7cdcf", "#eff0e4", "#9db6ae", "#5e8075", "#2c493e", "#f2d29b", "#f3eee2", "#55463a"], // haze
  ["#1a2935", "#71838a", "#3d535a", "#233b3c", "#0f1c1a", "#f0b968", "#c9bfae", "#1f1a17"], // twilight
];

function peaks(seed: number, base: number, amp: number, n: number) {
  let s = seed || 1;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let d = `M-10 300 L-10 ${base}`;
  for (let i = 0; i <= n; i++) d += ` L${((i / n) * 420).toFixed(0)} ${(base - (i % 2 ? r() * amp : r() * amp * 0.3)).toFixed(0)}`;
  return d + " L420 300 Z";
}

// Placeholder "photo" used when a listing has no uploaded pictures yet.
export function Scene({ seed, variant }: { seed: string; variant?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const h = hash(seed);
  const [top, bot, far, mid, near, glow, wall, roof] = PAL[h % 4];
  const v = ((((variant ?? (h >>> 3)) % 5) + 5) % 5);
  const sky = `sky${uid}`;
  const lamp = `lamp${uid}`;

  const win = (x: number, y: number, w: number, hh: number, lit = true, arch = false) => (
    <path
      d={arch ? `M${x} ${y + hh}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + hh}Z` : `M${x} ${y}h${w}v${hh}h${-w}Z`}
      fill={lit ? glow : "#0d1714"} opacity={lit ? 0.95 : 0.8}
    />
  );

  const scenes = [
    // 0 — weatherboard villa with verandah
    <g key="0">
      <path d={peaks(4, 200, 60, 9)} fill={far} />
      <path d="M-10 300V214C80 196 160 214 260 206S380 200 420 210V300Z" fill={mid} />
      <path d="M-10 300V240C100 228 200 246 420 232V300Z" fill={near} />
      <rect x="132" y="150" width="156" height="84" fill={wall} />
      <path d="M120 152L210 96L300 152Z" fill={roof} />
      <rect x="124" y="190" width="172" height="5" fill={roof} opacity=".85" />
      {[140, 200, 258].map((x) => <rect key={x} x={x} y="195" width="3" height="39" fill={roof} opacity=".75" />)}
      {win(148, 160, 26, 24)}{win(246, 160, 26, 24)}
      <rect x="196" y="200" width="28" height="34" fill={roof} opacity=".92" />
      <path d="M60 234h300" stroke={wall} strokeWidth="2" opacity=".5" />
      <ellipse cx="104" cy="196" rx="30" ry="40" fill={near} /><rect x="101" y="214" width="6" height="26" fill={roof} />
    </g>,
    // 1 — terrace row with iron-lace verandahs
    <g key="1">
      <rect y="232" width="420" height="68" fill={near} />
      {[0, 1, 2].map((i) => {
        const x = 83 + i * 78;
        const top2 = 96 + i * 12;
        return (
          <g key={i}>
            <rect x={x} y={top2} width="75" height={232 - top2} fill={i === 1 ? wall : mid} />
            <path d={`M${x - 2} ${top2}h79l-39.5 -22Z`} fill={roof} />
            {win(x + 10, top2 + 20, 18, 30, i !== 2, true)}{win(x + 47, top2 + 20, 18, 30, i !== 0, true)}
            <rect x={x} y="190" width="75" height="4" fill={roof} opacity=".9" />
            {[6, 19, 32, 45, 58, 70].map((dx) => <rect key={dx} x={x + dx} y="194" width="2" height="38" fill={roof} opacity=".7" />)}
            <rect x={x + 29} y="200" width="17" height="32" fill={roof} opacity=".95" />
          </g>
        );
      })}
      <rect y="232" width="420" height="3" fill={glow} opacity=".35" />
    </g>,
    // 2 — cabin on an alpine lake
    <g key="2">
      <path d={peaks(21, 170, 120, 8)} fill={far} />
      <path d={peaks(33, 200, 70, 11)} fill={mid} />
      <rect y="214" width="420" height="86" fill={mid} opacity=".55" />
      <path d={`${peaks(21, 170, 120, 8)}`} fill={far} opacity=".25" transform="translate(0 428) scale(1 -1)" />
      <path d="M-10 300V252C90 238 180 256 260 248S380 240 420 250V300Z" fill={near} />
      <rect x="168" y="204" width="70" height="40" fill={roof} />
      <path d="M160 206L203 170L246 206Z" fill={near} />
      {win(180, 216, 16, 18)}
      <rect x="214" y="222" width="14" height="22" fill="#0d1714" opacity=".7" />
      {[96, 112, 300, 322, 340].map((x, i) => <path key={x} d={`M${x} 250L${x + 10} ${206 - i * 6}L${x + 20} 250Z`} fill="#0a1411" />)}
    </g>,
    // 3 — interior with arched window and lamp
    <g key="3">
      <defs><radialGradient id={lamp}><stop offset="0" stopColor={glow} stopOpacity=".75" /><stop offset="1" stopColor={glow} stopOpacity="0" /></radialGradient></defs>
      <rect width="400" height="300" fill={wall} />
      <rect y="226" width="400" height="74" fill={roof} opacity=".88" />
      <path d="M118 226V110a82 82 0 0 1 164 0V226Z" fill={roof} opacity=".9" />
      <path d="M126 226V112a74 74 0 0 1 148 0V226Z" fill={`url(#${sky})`} />
      <path d="M126 226V190C160 176 190 192 220 184S256 178 274 186V226Z" fill={mid} />
      <path d="M200 38V226M126 150H274" stroke={roof} strokeWidth="4" opacity=".85" />
      <ellipse cx="318" cy="170" rx="78" ry="74" fill={`url(#${lamp})`} />
      <rect x="314" y="170" width="4" height="62" fill={roof} /><path d="M298 170l8-26h24l8 26Z" fill={glow} />
      <path d="M52 232v-36q0-18 18-18h46q18 0 18 18v36z" fill={near} /><rect x="46" y="206" width="14" height="30" rx="5" fill={near} />
      <ellipse cx="206" cy="262" rx="140" ry="14" fill={near} opacity=".4" />
    </g>,
    // 4 — Queenslander on stilts with palms
    <g key="4">
      <path d={peaks(8, 190, 70, 10)} fill={far} />
      <path d="M-10 300V220C120 204 250 224 420 210V300Z" fill={mid} />
      <rect y="248" width="420" height="52" fill={near} />
      {[142, 172, 202, 232, 262].map((x) => <rect key={x} x={x} y="198" width="4" height="50" fill={roof} opacity=".8" />)}
      <rect x="132" y="146" width="142" height="52" fill={wall} />
      <path d="M118 148L203 102L288 148Z" fill={roof} />
      <rect x="132" y="170" width="142" height="4" fill={roof} opacity=".9" />
      {win(146, 154, 22, 14)}{win(236, 154, 22, 14)}{win(190, 154, 22, 14, false)}
      <path d="M276 198l30 50" stroke={roof} strokeWidth="5" opacity=".8" />
      {[98, 306].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 250C${x + 3} 210 ${x - 2} 180 ${x + 4} 150`} stroke={roof} strokeWidth="5" fill="none" />
          {[-60, -25, 15, 55, 95].map((a) => <path key={a} d={`M${x + 4} 150q${28 * Math.cos((a * Math.PI) / 180)} ${-14 + (i ? 6 : 0)} ${44 * Math.cos((a * Math.PI) / 180)} ${12 + Math.abs(a) / 10}`} stroke={near} strokeWidth="7" strokeLinecap="round" fill="none" />)}
        </g>
      ))}
    </g>,
  ];

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient>
      </defs>
      {v !== 3 && <rect width="400" height="300" fill={`url(#${sky})`} />}
      {scenes[v]}
    </svg>
  );
}
