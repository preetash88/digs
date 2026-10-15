// Southern Cross emblem used in the logo and footer.
export function Mark({ size = 26 }: { size?: number }) {
  const d = (cx: number, cy: number, r: number) => `M${cx} ${cy - r}L${cx + r * 0.62} ${cy}L${cx} ${cy + r}L${cx - r * 0.62} ${cy}Z`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">
      <path d={d(16, 5, 4)} />
      <path d={d(16, 26, 5)} />
      <path d={d(6, 14, 3.4)} />
      <path d={d(26, 11, 3.8)} />
      <path d={d(21, 19, 1.9)} />
    </svg>
  );
}
