import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const QuickAction = ({ ic: Icon, label, desc, grad = 'from-emerald-500 to-teal-400', isDark, delay = 0, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const config = {
    'from-emerald-400 to-teal-500': { bg: '#34D399', bgLight: '#14B8A6' },
    'from-blue-400 to-indigo-500': { bg: '#60A5FA', bgLight: '#6366F1' },
    'from-purple-400 to-pink-500': { bg: '#C084FC', bgLight: '#EC4899' },
    'from-red-400 to-rose-500': { bg: '#F87171', bgLight: '#F43F5E' },
  };
  const colors = config[grad] || config['from-emerald-400 to-teal-500'];

  return (
    <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={onClick} onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} className={`relative overflow-hidden p-5 rounded-3xl text-left group transition-shadow ${isDark ? 'bg-gray-800/60 border border-gray-700/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]' : 'bg-white/80 border border-gray-100 shadow-sm hover:shadow-xl'}`}>
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4 }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-[0.03]`} />
        <motion.div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[40px]" style={{ backgroundColor: colors.bg }} animate={{ scale: hovered ? 1.5 : 1, opacity: hovered ? 0.2 : 0 }} transition={{ duration: 0.6 }} />
        <motion.div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full blur-[40px]" style={{ backgroundColor: colors.bgLight }} animate={{ scale: hovered ? 1.5 : 1, opacity: hovered ? 0.2 : 0 }} transition={{ duration: 0.6, delay: 0.1 }} />
      </motion.div>
      <div className="relative z-10">
        <div className="relative w-12 h-12 mb-3">
          <motion.div className="absolute inset-0 rounded-2xl" animate={{ scale: hovered ? 1.1 : 1, rotate: hovered ? 5 : 0 }} transition={{ type: 'spring', stiffness: 300 }} style={{ background: `linear-gradient(135deg, ${colors.bg}22, ${colors.bgLight}22)` }} />
          <motion.div className="absolute inset-0.5 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.bg}dd, ${colors.bgLight}dd)` }} whileHover={{ scale: 1.1 }}>
            <div className="text-white"><Icon /></div>
            <motion.div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent" animate={hovered ? { x: ['-100%', '100%'] } : { x: '-100%' }} transition={{ duration: 0.6 }} />
          </motion.div>
        </div>
        <p className={`font-bold text-sm mb-0.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>{label}</p>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
      </div>
    </motion.button>
  );
};
