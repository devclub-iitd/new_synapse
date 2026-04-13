import React, { useMemo } from 'react';

const COLORS = [
  '#5a9fcf', '#4a8bba', '#3d7fad', '#2e6a96', '#7eb8e0',
  '#d85d4c', '#5a9e6f', '#8ec4e8', '#a0d0f0', '#6aadd0',
  '#5a9e6f', '#d4a24a', '#d85d4c', '#3d8a55', '#b8862e',
  '#8895a8', '#6aadd0', '#c0443a', '#7eb8e0',
];

const BG_COLORS = [
  '#0e1117', '#0a0c10', '#101828', '#151a22', '#0c0f14',
  '#111520', '#0d1018', '#121620',
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
