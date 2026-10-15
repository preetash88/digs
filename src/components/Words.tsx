import type { CSSProperties } from "react";

// Splits a sentence into words so each can fade in one after another.
export function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} style={{ "--w": i } as CSSProperties}>{w}{" "}</span>
      ))}
    </>
  );
}
