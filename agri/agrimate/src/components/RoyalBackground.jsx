import { useMemo } from 'react';

function Stars() {
  const stars = useMemo(() => Array.from({ length: 200 }, (_, i) => ({
    id: i,
    top:  `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    d:    `${2 + Math.random() * 4}s`,
    dl:   `${Math.random() * 4}s`,
    size: Math.random() > 0.85 ? '2px' : '1px',
  })), []);

  return (
    <div className="stars">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            top: s.top, left: s.left,
            '--d': s.d, '--dl': s.dl,
            width: s.size, height: s.size,
          }}
        />
      ))}
    </div>
  );
}

export default function RoyalBackground() {
  return (
    <div className="royal-bg">
      <Stars />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}
