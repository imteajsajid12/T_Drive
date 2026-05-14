import React from 'react';
import { motion } from 'framer-motion';

export const ChartBox = ({ label, isDark, className = '', children }) => (
  <motion.div whileHover={{ y: -4 }} className={`relative group p-5 rounded-3xl overflow-hidden transition-shadow duration-300 ${isDark ? 'bg-gray-800/60 border border-gray-700/50 backdrop-blur-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]' : 'bg-white/80 border border-gray-100/80 backdrop-blur-xl shadow-sm hover:shadow-xl'} flex flex-col h-full ${className}`}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[40px] rounded-full bg-emerald-500/10`} />
      <div className={`absolute -bottom-10 -left-10 w-32 h-32 blur-[40px] rounded-full bg-teal-500/10`} />
    </div>
    <div className="relative z-10 flex items-center justify-between mb-5">
      <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>{label}</h3>
      <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}>
        <span className="text-lg leading-none -mt-2">...</span>
      </button>
    </div>
    <div className="relative z-10 flex-1 w-full h-full min-h-[200px]">
      {children}
    </div>
  </motion.div>
);
