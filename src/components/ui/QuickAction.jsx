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
    <motion.button 
      layout
      onClick={onClick} 
      onHoverStart={() => setHovered(true)} 
      onHoverEnd={() => setHovered(false)} 
      whileHover={{ y: -8, scale: 1.02 }} 
      whileTap={{ scale: 0.96 }} 
      className={`relative w-full overflow-hidden p-5 rounded-3xl text-left group transition-all duration-300 ${isDark ? 'bg-gray-800/80 border border-gray-700/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]' : 'bg-white border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]'}`}
    >
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4 }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-[0.05]`} />
        <motion.div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[40px] z-0" style={{ backgroundColor: colors.bg }} animate={{ scale: hovered ? 1.5 : 1, opacity: hovered ? 0.3 : 0 }} transition={{ duration: 0.6 }} />
        <motion.div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full blur-[40px] z-0" style={{ backgroundColor: colors.bgLight }} animate={{ scale: hovered ? 1.5 : 1, opacity: hovered ? 0.3 : 0 }} transition={{ duration: 0.6, delay: 0.1 }} />
      </motion.div>
      <div className="relative z-10">
        <div className="relative w-12 h-12 mb-4">
          <motion.div className="absolute inset-0 rounded-2xl" animate={{ scale: hovered ? 1.15 : 1, rotate: hovered ? 8 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ background: `linear-gradient(135deg, ${colors.bg}22, ${colors.bgLight}22)` }} />
          <motion.div className="absolute inset-0.5 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.bg}, ${colors.bgLight})` }} whileHover={{ scale: 1.1 }}>
            <div className="text-white drop-shadow-md"><Icon /></div>
            <motion.div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/40 to-transparent" animate={hovered ? { x: ['-100%', '100%'] } : { x: '-100%' }} transition={{ duration: 0.8, ease: "easeInOut" }} />
          </motion.div>
        </div>
        <p className={`font-bold text-sm mb-1 transition-colors ${isDark ? 'text-gray-100 lg:group-hover:text-white' : 'text-gray-800 lg:group-hover:text-black'}`}>{label}</p>
        <p className={`text-xs transition-colors ${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-600'}`}>{desc}</p>
      </div>
    </motion.button>
  );
};
