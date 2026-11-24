import React from 'react';

interface PersonaPortraitProps {
  /** The portrait is drawn from this text, so the same persona always gets the same rings. */
  seed: string;
  className?: string;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** An abstract emblem of off-centre rings: a stand-in portrait unique to each persona. */
const PersonaPortrait: React.FC<PersonaPortraitProps> = ({ seed, className = '' }) => {
  const h = hash(seed || 'persona');
  const ringCount = 3 + (h % 3);
  const angle = ((h >> 4) % 360) * (Math.PI / 180);
  const drift = 3 + ((h >> 12) % 4);
  const rings = Array.from({ length: ringCount }, (_, i) => {
    const step = i + 1;
    return {
      cx: 80 + Math.cos(angle) * drift * step,
      cy: 80 + Math.sin(angle) * drift * step,
      r: 66 - (48 / ringCount) * i - step * 2,
    };
  });
  const core = rings[rings.length - 1];
  const strokes = ['var(--line-strong)', 'var(--muted)', 'var(--ink)'];

  return (
    <svg viewBox="0 0 160 160" aria-hidden="true" className={className}>
      <circle cx="80" cy="80" r="78" fill="var(--raised)" />
      {rings.map((ring, i) => (
        <circle
          key={i}
          cx={ring.cx}
          cy={ring.cy}
          r={ring.r}
          fill="none"
          stroke={strokes[Math.min(i, strokes.length - 1)]}
          strokeWidth="1.5"
        />
      ))}
      <circle cx={core.cx + Math.cos(angle) * drift} cy={core.cy + Math.sin(angle) * drift} r={Math.max(8, core.r - 12)} fill="var(--accent)" />
    </svg>
  );
};

export default PersonaPortrait;
