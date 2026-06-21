import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ic } from '../../icons';

export const Sidebar = ({ cat, setCat, collapsed, setCollapsed, isDark, mob, setMob }) => {
  const cats = [
    { id: 'home', label: 'Dashboard', Icon: Ic.Home },
    { id: 'files', label: 'My Files', Icon: Ic.Folder },
    { id: 'image', label: 'Images', Icon: Ic.Image },
    { id: 'video', label: 'Videos', Icon: Ic.Video },
    { id: 'music', label: 'Music', Icon: Ic.Music },
    { id: 'doc', label: 'Documents', Icon: Ic.Doc },
    { id: 'analytics', label: 'Analytics', Icon: Ic.BarChart },
    { id: 'loginlog', label: 'Login Log', Icon: Ic.Activity },
    { id: 'settings', label: 'Settings', Icon: Ic.Settings },
  ];
  const content = (
    <div className={`flex flex-col h-full ${collapsed && !mob ? 'md:w-20' : 'md:w-72'} transition-all duration-500`}>
      <div className={`p-5 flex items-center gap-3 ${collapsed && !mob ? 'md:justify-center' : ''}`}>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex-shrink-0 shadow-lg shadow-emerald-500/30">
          <span className="text-white font-black text-lg">T</span>
        </div>
        <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-800'} ${collapsed && !mob ? 'md:hidden' : ''}`}>T-Drive</span>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {cats.map((c, i) => (
          <motion.button key={c.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => { setCat(c.id); setMob(false); }} whileHover={{ x: c.id === cat ? 0 : 5 }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${c.id === cat ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25' : isDark ? 'text-gray-500 hover:bg-gray-700/40 hover:text-white' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'} ${collapsed && !mob ? 'md:justify-center md:px-2' : ''}`}>
            <c.Icon /><span className={`font-semibold text-sm ${collapsed && !mob ? 'md:hidden' : ''}`}>{c.label}</span>
          </motion.button>
        ))}
      </nav>
      <div className={`p-4 ${collapsed && !mob ? 'md:hidden' : ''}`}>
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-emerald-900/30 border border-emerald-800/30' : 'bg-emerald-50 border border-emerald-100'}`}>
          <p className={`text-xs font-bold mb-1 ${isDark ? 'text-white' : 'text-emerald-900'}`}>Upgrade to Pro</p>
          <p className={`text-[10px] mb-2.5 ${isDark ? 'text-gray-500' : 'text-emerald-700'}`}>Get 1TB storage & premium</p>
          <button className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20">Upgrade</button>
        </div>
      </div>
    </div>
  );
  return (
    <>
      <div className={`hidden md:block h-full border-r ${isDark ? 'bg-gray-900/30 border-gray-800/40' : 'bg-white/30 border-white/50'} backdrop-blur-2xl transition-all duration-500 ${collapsed ? 'w-20' : 'w-72'}`}>{content}</div>
      <AnimatePresence>
        {mob && (<>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMob(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" />
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }} className={`fixed left-0 top-0 bottom-0 z-50 w-72 ${isDark ? 'bg-gray-900' : 'bg-white'} md:hidden`}>{content}</motion.div>
        </>)}
      </AnimatePresence>
    </>
  );
};
