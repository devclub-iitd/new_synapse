import React, { useState, useMemo } from 'react';

const COLORS = [
  '#5a9fcf', '#4a8bba', '#3d7fad', '#2e6a96', '#7eb8e0',
  '#d85d4c', '#5a9e6f', '#8ec4e8', '#a0d0f0', '#6aadd0',
  '#5a9e6f', '#d4a24a', '#d85d4c', '#3d8a55', '#b8862e',
  '#8895a8', '#6aadd0', '#c0443a', '#8ec4e8', '#7eb8e0',
];

const BG_COLORS = [
  '#5a9fcf', '#4a8bba', '#6aadd0', '#5a9e6f', '#3d8a55',
  '#d4a24a', '#d85d4c', '#3d7fad', '#b8862e', '#8895a8',
  '#7eb8e0', '#c0443a', '#8ec4e8', '#4a8bba', '#6aadd0',
  '#2e6a96', '#3d8a55', '#5a9e6f', '#d85d4c', '#3d7fad',
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

function generateShapes(seed, width, height) {
  const rng = seededRandom(seed);
  const count = 8 + Math.floor(rng() * 10);
  const shapes = [];

  for (let i = 0; i < count; i++) {
    const color = COLORS[Math.floor(rng() * COLORS.length)];
    const x = rng() * width;
    const y = rng() * height;
    const opacity = 0.12 + rng() * 0.35;
    const rotation = Math.floor(rng() * 360);
    const shapeType = Math.floor(rng() * 8);

    switch (shapeType) {
      case 0: { // circle
        const r = 10 + rng() * 40;
        shapes.push(<circle key={i} cx={x} cy={y} r={r} fill={color} opacity={opacity} />);
        break;
      }
      case 1: { // ring
        const r = 15 + rng() * 35;
        shapes.push(<circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={2 + rng() * 4} opacity={opacity} />);
        break;
      }
      case 2: { // rectangle
        const w = 20 + rng() * 60;
        const h = 20 + rng() * 60;
        shapes.push(<rect key={i} x={x} y={y} width={w} height={h} rx={rng() > 0.5 ? 6 : 0} fill={color} opacity={opacity} transform={`rotate(${rotation} ${x + w / 2} ${y + h / 2})`} />);
        break;
      }
      case 3: { // triangle
        const s = 20 + rng() * 45;
        const pts = `${x},${y - s} ${x - s * 0.87},${y + s * 0.5} ${x + s * 0.87},${y + s * 0.5}`;
        shapes.push(<polygon key={i} points={pts} fill={color} opacity={opacity} transform={`rotate(${rotation} ${x} ${y})`} />);
        break;
      }
      case 4: { // diamond
        const s = 15 + rng() * 35;
        const pts = `${x},${y - s} ${x + s * 0.7},${y} ${x},${y + s} ${x - s * 0.7},${y}`;
        shapes.push(<polygon key={i} points={pts} fill={color} opacity={opacity} transform={`rotate(${rotation} ${x} ${y})`} />);
        break;
      }
      case 5: { // cross / plus
        const s = 10 + rng() * 25;
        const t = s * 0.3;
        shapes.push(
          <g key={i} transform={`rotate(${rotation} ${x} ${y})`} opacity={opacity}>
            <rect x={x - s} y={y - t} width={s * 2} height={t * 2} rx={2} fill={color} />
            <rect x={x - t} y={y - s} width={t * 2} height={s * 2} rx={2} fill={color} />
          </g>
        );
        break;
      }
      case 6: { // zigzag line
        const len = 30 + rng() * 60;
        const amp = 8 + rng() * 15;
        const segs = 3 + Math.floor(rng() * 4);
        let d = `M${x},${y}`;
        for (let j = 1; j <= segs; j++) {
          const lx = x + (len / segs) * j;
          const ly = y + (j % 2 === 0 ? 0 : (j % 4 === 1 ? -amp : amp));
          d += ` L${lx},${ly}`;
        }
        shapes.push(<path key={i} d={d} fill="none" stroke={color} strokeWidth={2 + rng() * 3} strokeLinecap="round" opacity={opacity} transform={`rotate(${rotation} ${x} ${y})`} />);
        break;
      }
      case 7: { // star / asterisk
        const r = 8 + rng() * 20;
        const arms = 3 + Math.floor(rng() * 4);
        let d = '';
        for (let j = 0; j < arms; j++) {
          const angle = (j / arms) * Math.PI * 2 + rotation * (Math.PI / 180);
          d += `M${x},${y} L${x + Math.cos(angle) * r},${y + Math.sin(angle) * r} `;
        }
        shapes.push(<path key={i} d={d} fill="none" stroke={color} strokeWidth={2 + rng() * 3} strokeLinecap="round" opacity={opacity} />);
        break;
      }
    }
  }

  // scatter some small dots
  for (let i = 0; i < 15; i++) {
    const color = COLORS[Math.floor(rng() * COLORS.length)];
    shapes.push(
      <circle
        key={`dot-${i}`}
        cx={rng() * width}
        cy={rng() * height}
        r={1.5 + rng() * 3}
        fill={color}
        opacity={0.2 + rng() * 0.4}
      />
    );
  }

  return shapes;
}

const EventBanner = ({ orgName, className = '', style = {} }) => {
  const seed = useMemo(() => hashStr(orgName || 'event'), [orgName]);
  const bgColor = BG_COLORS[seed % BG_COLORS.length];

  const shapes = useMemo(() => generateShapes(seed, 400, 250), [seed]);

  return (
    <div
      className={`event-banner-fallback ${className}`}
      style={{ background: bgColor, ...style }}
    >
      <svg
        className="event-banner-shapes"
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
      >
        {shapes}
      </svg>
      <div
        className="event-banner-text"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '1.4rem',
          fontWeight: 800,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#fff',
          textShadow: '0 2px 12px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.3)',
          maxWidth: '85%',
          textAlign: 'center',
          lineHeight: 1.2,
          wordBreak: 'break-word',
          zIndex: 2,
        }}
      >
        {orgName || 'Event'}
      </div>
    </div>
  );
};

export const useImageFallback = (imageUrl) => {
  const [failed, setFailed] = useState(false);
  const hasImage = !!imageUrl && !failed;
  const onError = () => setFailed(true);
  return { hasImage, onError };
};

export default EventBanner;
