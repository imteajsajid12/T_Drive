"use client";
import { useState, useEffect } from 'react';

const ITEMS = [
  { label: 'iOS & Chrome performance fixes',     done: true  },
  { label: 'Dashboard data loading speed',        done: true  },
  { label: 'Landing page mobile rendering',       done: true  },
  { label: 'Background animation optimizations',  done: true  },
  { label: 'Final QA & regression testing',       done: false },
  { label: 'Production deployment verification',  done: false },
];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

export const MaintenancePage = () => {
  const [dots, setDots] = useState('');
  const [elapsed, setElapsed] = useState(0);

  // Animated dots for the "Working on it" label
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 600);
    return () => clearInterval(id);
  }, []);

  // Live elapsed timer (seconds since page load)
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const doneCount = ITEMS.filter(i => i.done).length;
  const progress = Math.round((doneCount / ITEMS.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Subtle background grid — CSS only, zero JS cost */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glow — static, no animation */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-teal-500/8 blur-[120px]" />

      <div className="relative z-10 w-full max-w-lg">

        {/* ── Logo + badge ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-5">
            <span className="text-white text-4xl font-black">T</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            UNDER MAINTENANCE
          </div>
        </div>

        {/* ── Main card ────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 shadow-2xl">

          {/* Heading */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <WrenchIcon />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">
                We're fixing things up{dots}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                T-Drive is temporarily offline for critical bug fixes and performance improvements. We'll be back shortly.
              </p>
            </div>
          </div>

          {/* ── Progress bar ─────────────────────────────────────── */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-gray-400">Overall progress</span>
              <span className="text-emerald-400">{progress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              {doneCount} of {ITEMS.length} tasks complete
            </p>
          </div>

          {/* ── Task checklist ───────────────────────────────────── */}
          <div className="space-y-2.5 mb-6">
            {ITEMS.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  item.done
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-white/5 border border-white/8 text-gray-400'
                }`}
              >
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-600'}`}>
                  {item.done ? <CheckIcon /> : <ClockIcon />}
                </span>
                <span>{item.label}</span>
                {!item.done && (
                  <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    In progress
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Footer info ──────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-5 border-t border-white/8 text-xs text-gray-500">
            <span>
              Page loaded <span className="text-gray-400 font-semibold">{elapsed}s</span> ago
            </span>
            <span>
              Est. return: <span className="text-emerald-400 font-semibold">very soon</span>
            </span>
          </div>
        </div>

        {/* ── Bottom note ──────────────────────────────────────────── */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Questions? Contact us at{' '}
          <span className="text-emerald-500 font-medium">support@tdrive.app</span>
        </p>
      </div>
    </div>
  );
};
