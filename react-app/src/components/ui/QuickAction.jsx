import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const QuickAction = ({ ic: Icon, label, desc, grad = 'from-emerald-500 to-teal-400', isDark, delay = 0, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const config = {
    'from-emerald-500 to-teal-400': { bg: '#10B981', bgLight: '#34D399' },
    'from-teal-500 to-emerald-400': { bg: '#14B8A6', bgLight: '#5EEAD4' },
    'from-green-500 to-emerald-600': { bg: '#10B981', bgLight: '#6EE7B7' },
    'from-emerald-600 to-green-500': { bg: '#059669', bgLight: '#34D399' },
  };
  const colors = config[grad] || config['from-emerald-500 to-teal-400'];

  return (
    <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }} whileHover={{ y: -8 }} whileTap={{ scale: 0.96 }} onClick={onClick} onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} className={`relative overflow-hidden p-5 rounded-3xl text-left group ${isDark ? 'bg-gray-800/50 border border-gray-700/40' : 'bg-white/70 border border-white/60 shadow-md'}`}>
      <motion.div className="absolute inset-0" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: colors.bg + '15' }} />
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
