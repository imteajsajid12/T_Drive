import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Ic } from '../../icons';

export const StatCard = ({ ic: Icon, title: label, val: value, sub: change, color: grad, isDark, delay = 0 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-5deg', '5deg']);
  const [hovered, setHovered] = useState(false);
  const [count, setCount] = useState(0);
  const targetNum = typeof value === 'number' ? value : parseInt(value) || 0;

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = targetNum / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= targetNum) { setCount(targetNum); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [targetNum]);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / (rect.width / 2));
    y.set((e.clientY - centerY) / (rect.height / 2));
  }

  const config = {
    'from-emerald-400 to-teal-500': { bg: '#34D399', glow: 'rgba(52,211,153,0.3)' },
    'from-green-500 to-emerald-600': { bg: '#10B981', glow: 'rgba(16,185,129,0.3)' },
    'from-teal-400 to-green-500': { bg: '#14B8A6', glow: 'rgba(20,184,166,0.3)' },
    'from-emerald-500 to-green-600': { bg: '#10B981', glow: 'rgba(16,185,129,0.3)' },
  };
  const colors = config[grad] || config['from-emerald-400 to-teal-500'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { x.set(0); y.set(0); setHovered(false); }}
      className="relative"
    >
      <div className={`relative overflow-hidden rounded-3xl p-5 ${isDark ? 'bg-gray-800/50 border border-gray-700/40' : 'bg-white/70 border border-white/60 shadow-lg'}`}>
        <motion.div
          className="absolute w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, \${colors.glow} 0%, transparent 70%)`,
            left: useTransform(mouseX, [-1, 1], ['0%', '100%']),
            top: useTransform(mouseY, [-1, 1], ['0%', '100%']),
          }}
        />
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id={`g-\${label}`} width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke={colors.bg} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#g-\${label})`} />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="relative w-12 h-12">
              <motion.div className="absolute inset-0 rounded-2xl" animate={{ scale: hovered ? 1.15 : 1, opacity: hovered ? 0.6 : 0.3 }} transition={{ duration: 0.3 }} style={{ background: `linear-gradient(135deg, \${colors.bg}, \${colors.bg}88)` }} />
              <motion.div className="absolute inset-0.5 rounded-2xl flex items-center justify-center text-white overflow-hidden" style={{ background: `linear-gradient(135deg, \${colors.bg}dd, \${colors.bg}99)` }} whileHover={{ rotate: 8, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Icon />
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }} />
              </motion.div>
            </div>
            {change && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.3, type: 'spring', bounce: 0.6 }} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-sm ${change.toString().startsWith('-') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : change.toString().startsWith('+') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                {change.toString().startsWith('+') && <Ic.ArrowUp />}
                {change.toString().startsWith('-') && <Ic.ArrowDown />}
                {change}
              </motion.div>
            )}
          </div>
          <motion.div className={`text-2xl font-black mb-0.5 \${isDark ? 'text-white' : 'text-gray-900'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + 0.15 }}>{count.toLocaleString()}{typeof value === 'string' && isNaN(parseInt(value)) ? value : ''}</motion.div>
          <motion.p className={`text-xs font-medium \${isDark ? 'text-gray-400' : 'text-gray-500'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.2 }}>{label}</motion.p>
          <div className={`mt-3 h-1.5 rounded-full overflow-hidden \${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <motion.div className="h-full rounded-full relative" style={{ background: `linear-gradient(90deg, \${colors.bg}, \${colors.bg}88)` }} initial={{ width: 0 }} animate={{ width: `\${Math.min((targetNum / 10) * 100, 100)}%` }} transition={{ duration: 1.5, delay: delay + 0.3, ease: 'easeOut' }}>
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
