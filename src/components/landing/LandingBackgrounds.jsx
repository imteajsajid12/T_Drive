import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Ic } from './LandingIcons';

const prefersReduced = () => (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

export const ParticleField = ({ dark }) => {
  const reduced = prefersReduced();
  const particles = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 18 + 10,
    delay: Math.random() * 6,
    drift: Math.random() * 80 - 40,
  })), []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, background: dark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.12)' }}
          animate={reduced ? {} : { y: [0, -120, 120, 0], x: [0, p.drift / 4, -p.drift / 3, 0], opacity: [0.08, 0.45, 0.08] }}
          transition={reduced ? {} : { duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

export const GradientOrbs = ({ dark }) => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <motion.div className="absolute -top-24 -left-24 w-[48%] h-[48%] rounded-full bg-gradient-to-br from-emerald-400/12 to-teal-300/12 blur-3xl"
      animate={{ x: [0, 60, -40, 0], y: [0, -80, 50, 0] }} transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }} />
    <motion.div className="absolute -bottom-24 -right-24 w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-teal-400/10 to-emerald-300/10 blur-3xl"
      animate={{ x: [0, -70, 50, 0], y: [0, 50, -50, 0] }} transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }} />
    <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-gradient-to-br from-green-400/8 to-teal-300/8 blur-2xl"
      animate={{ rotate: [0, 180, 360] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} />
  </div>
);

export const FloatFileIcons = ({ dark }) => {
  const reduced = prefersReduced();
  const items = [
    { Icon: Ic.Image, x: 6, y: 14, dur: 18, del: 0, size: 32 },
    { Icon: Ic.Video, x: 86, y: 12, dur: 22, del: 2, size: 28 },
    { Icon: Ic.Music, x: 76, y: 66, dur: 20, del: 4, size: 36 },
    { Icon: Ic.Doc, x: 10, y: 72, dur: 24, del: 1, size: 30 },
    { Icon: Ic.Cloud, x: 52, y: 36, dur: 26, del: 3, size: 34 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {items.map((it, i) => (
        <motion.div key={i} className="absolute" style={{ left: `${it.x}%`, top: `${it.y}%` }}
          animate={reduced ? {} : { y: [0, -60, 40, 0], x: [0, 20, -15, 0], rotate: [0, 180, 360], opacity: [0.12, 0.5, 0.12] }}
          transition={reduced ? {} : { duration: it.dur, repeat: Infinity, ease: 'easeInOut', delay: it.del }}>
          <it.Icon width={it.size} height={it.size} className={dark ? 'text-emerald-300/40' : 'text-emerald-500/30'} />
        </motion.div>
      ))}
    </div>
  );
};

export const GridBackground = ({ dark }) => (
  <div className="pointer-events-none fixed inset-0 z-0 opacity-80">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-anim" width="72" height="72" patternUnits="userSpaceOnUse">
          <path d="M 72 0 L 0 0 0 72" fill="none" stroke={dark ? 'rgba(16,185,129,0.03)' : 'rgba(16,185,129,0.06)'} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-anim)" />
    </svg>
  </div>
);

export default { ParticleField, GradientOrbs, FloatFileIcons, GridBackground };
