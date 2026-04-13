import React, { useMemo } from 'react';

const COLORS = [
  '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#2563eb',
  '#ec4899', '#4f46e5', '#8b5cf6', '#a78bfa', '#0ea5e9',
  '#14b8a6', '#f59e0b', '#ef4444', '#10b981', '#6366f1',
  '#e879f9', '#06b6d4', '#f43f5e', '#3b82f6',
];

const BG_COLORS = [
  '#1e1033', '#0f172a', '#1a0a2e', '#0c1222', '#170d29',
  '#0d1117', '#1c1044', '#111827',
];

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMiniShapes(seed) {
  const rng = seededRandom(seed);
  const count = 4 + Math.floor(rng() * 5);
  const shapes = [];

  for (let i = 0; i < count; i++) {
    const color = COLORS[Math.floor(rng() * COLORS.length)];
    const x = 4 + rng() * 42;
    const y = 4 + rng() * 42;
    const opacity = 0.3 + rng() * 0.5;
    const type = Math.floor(rng() * 5);

    switch (type) {
      case 0: {
        const r = 3 + rng() * 8;
        shapes.push(<circle key={i} cx={x} cy={y} r={r} fill={color} opacity={opacity} />);
        break;
      }
      case 1: {
        const s = 4 + rng() * 10;
        shapes.push(<rect key={i} x={x} y={y} width={s} height={s} rx={rng() > 0.5 ? 2 : 0} fill={color} opacity={opacity} transform={`rotate(${rng() * 360} ${x + s / 2} ${y + s / 2})`} />);
        break;
      }
      case 2: {
        const s = 4 + rng() * 8;
        const pts = `${x},${y - s} ${x - s * 0.87},${y + s * 0.5} ${x + s * 0.87},${y + s * 0.5}`;
        shapes.push(<polygon key={i} points={pts} fill={color} opacity={opacity} />);
        break;
      }
      case 3: {
        const r = 4 + rng() * 7;
        shapes.push(<circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={1.5} opacity={opacity} />);
        break;
      }
      case 4: {
        const s = 3 + rng() * 6;
        const pts = `${x},${y - s} ${x + s * 0.7},${y} ${x},${y + s} ${x - s * 0.7},${y}`;
        shapes.push(<polygon key={i} points={pts} fill={color} opacity={opacity} />);
        break;
      }
    }
  }

  // tiny dots
  for (let i = 0; i < 5; i++) {
    shapes.push(
      <circle key={`d${i}`} cx={rng() * 50} cy={rng() * 50} r={0.8 + rng() * 1.5}
        fill={COLORS[Math.floor(rng() * COLORS.length)]} opacity={0.3 + rng() * 0.4} />
    );
  }

  return shapes;
}

const OrgLogo = ({ orgName, size = 20, className = '', style = {} }) => {
  const seed = useMemo(() => hashStr(orgName || 'org'), [orgName]);
  const bgColor = BG_COLORS[seed % BG_COLORS.length];
  const shapes = useMemo(() => generateMiniShapes(seed), [seed]);
  const initial = (orgName || 'O').charAt(0).toUpperCase();
  const textColor = COLORS[seed % COLORS.length];

  return (
    <div
      className={`org-logo-fallback ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg viewBox="0 0 50 50" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <clipPath id={`org-clip-${seed}`}>
            <circle cx="25" cy="25" r="25" />
          </clipPath>
        </defs>
        <g clipPath={`url(#org-clip-${seed})`}>
          <rect width="50" height="50" fill={bgColor} />
          {shapes}
        </g>
        <text
          x="25" y="26" textAnchor="middle" dominantBaseline="central"
          fill="#fff" fontSize="20" fontWeight="800"
          style={{ textShadow: `0 0 6px ${textColor}` }}
        >
          {initial}
        </text>
      </svg>
    </div>
  );
};

export default OrgLogo;
