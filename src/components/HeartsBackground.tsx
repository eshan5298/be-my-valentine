import type { CSSProperties } from "react";
import { useMemo } from "react";

type Heart = {
  id: string;
  leftPct: number;
  sizePx: number;
  delayS: number;
  durationS: number;
  opacity: number;
  hueRotateDeg: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function HeartsBackground() {
  const hearts = useMemo<Heart[]>(() => {
    const count = 18;
    return Array.from({ length: count }, (_, i) => ({
      id: `heart-${i}`,
      leftPct: rand(2, 98),
      sizePx: rand(14, 44),
      delayS: rand(0, 6),
      durationS: rand(7, 14),
      opacity: rand(0.18, 0.55),
      hueRotateDeg: rand(-18, 18)
    }));
  }, []);

  return (
    <div className="heartsBg" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart"
          style={
            {
              "--left": `${h.leftPct}%`,
              "--size": `${h.sizePx}px`,
              "--delay": `${h.delayS}s`,
              "--duration": `${h.durationS}s`,
              "--opacity": h.opacity,
              "--hue": `${h.hueRotateDeg}deg`
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
