import React from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';

export const ChartBox = ({ title, children, isDark, d }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: d }} whileHover={{ y: -3 }} className={`p-5 rounded-3xl ${isDark ? 'bg-gray-800/40 border border-gray-700/40' : 'bg-white/60 border border-white/60 shadow-sm'} backdrop-blur-xl`}>
    <div className="flex items-center justify-between mb-5">
      <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
      <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}><Ic.MoreH /></button>
    </div>
    {children}
  </motion.div>
);

export const ChartTooltip = ({ active, payload, label, isDarkMode }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className={`px-3 py-2 rounded-xl shadow-xl backdrop-blur-sm border ${isDarkMode ? 'bg-gray-700/90 border-gray-600' : 'bg-white/90 border-gray-200'}`}>
      <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="text-[10px] mt-0.5">{p.name}: {p.value}</p>)}
    </div>
  );
};

export const ActItem = ({ Icon, title, sub, time, grad, isDark, idx }) => (
  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 + 0.3 }} whileHover={{ x: 5 }} className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-emerald-50/50'}`}>
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} text-white flex items-center justify-center flex-shrink-0 shadow-md`}><Icon /></div>
    <div className="flex-1 min-w-0">
      <p className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</p>
      <p className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{sub}</p>
    </div>
    <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'} flex-shrink-0`}>{time}</span>
  </motion.div>
);

export const FloatIcons = ({ isDark }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[
      { Ic: Ic.Music, x: 8, y: 15, sz: 32, dur: 22, del: 0 },
      { Ic: Ic.Video, x: 82, y: 12, sz: 28, dur: 26, del: 3 },
      { Ic: Ic.Image, x: 72, y: 68, sz: 36, dur: 24, del: 5 },
      { Ic: Ic.Folder, x: 48, y: 35, sz: 34, dur: 20, del: 7 },
      { Ic: Ic.Star, x: 42, y: 82, sz: 22, dur: 19, del: 9 },
      { Ic: Ic.Shield, x: 78, y: 38, sz: 26, dur: 27, del: 2.5 },
    ].map((it, i) => (
      <motion.div key={i} className={`absolute ${isDark ? 'text-emerald-500/10' : 'text-emerald-500/10'}`} style={{ left: it.x + '%', top: it.y + '%' }} animate={{ y: [0, -60, 50, 0], x: [0, 30, -20, 0], rotate: [0, 180, 360] }} transition={{ duration: it.dur, repeat: Infinity, ease: 'easeInOut', delay: it.del }}>
        <div style={{ width: it.sz, height: it.sz }}><it.Ic /></div>
      </motion.div>
    ))}
  </div>
);

export const Orbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div className="absolute -top-20 -left-20 w-[55%] h-[55%] rounded-full bg-gradient-to-br from-emerald-400/20 to-green-300/20 blur-[120px]" animate={{ x: [0, 80, -50, 0], y: [0, -90, 60, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
    <motion.div className="absolute -bottom-20 -right-20 w-[65%] h-[65%] rounded-full bg-gradient-to-tl from-teal-400/18 to-emerald-300/18 blur-[140px]" animate={{ x: [0, -90, 70, 0], y: [0, 60, -70, 0] }} transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }} />
  </div>
);

export const Toast = ({ msg, type, onClose }) => (
  <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.9 }} transition={{ type: 'spring', damping: 22, stiffness: 300 }} className={`fixed bottom-32 md:bottom-8 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 backdrop-blur-xl ${type === 'success' ? 'bg-emerald-500/90' : 'bg-red-500/90'} text-white`}>
    {type === 'success' && <Ic.Check />}
    <span className="font-medium text-sm">{msg}</span>
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><Ic.X /></button>
  </motion.div>
);
export const BackgroundBlobs = ({ isDark }) => (
  <>
    <Orbs />
    <FloatIcons isDark={isDark} />
  </>
);
