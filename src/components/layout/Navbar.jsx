import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ic } from '../../icons';

export const Navbar = ({ isDark, toggle, onMenu, onUp, q, setQ, user, onLogout, setCat, telegramReady = true, telegramConfigLoading = false }) => {
  const [sf, setSf] = useState(false);
  const [um, setUm] = useState(false);
  const ref = useRef(null);
  const displayName = user?.name?.trim() || 'User';
  const avatarInitial = displayName.slice(0, 1).toUpperCase();
  const uploadDisabled = telegramConfigLoading || !telegramReady;
  
  useEffect(() => { 
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setUm(false); }; 
    document.addEventListener('mousedown', h); 
    return () => document.removeEventListener('mousedown', h); 
  }, []);

  return (
    <div className={`sticky top-0 z-30 px-4 md:px-6 py-3 border-b overflow-visible ${isDark ? 'bg-gray-900/50 border-gray-800/40' : 'bg-white/30 border-white/50'} backdrop-blur-2xl`}>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <button onClick={onMenu} className={`p-2 rounded-xl md:hidden ${isDark ? 'hover:bg-gray-700 text-white' : 'hover:bg-emerald-50 text-gray-700'}`}><Ic.Menu /></button>
        <div className={`flex-1 min-w-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all ${sf ? isDark ? 'bg-gray-700/60 border border-emerald-500/30' : 'bg-white border border-emerald-300' : isDark ? 'bg-gray-800/30 border border-gray-700/40' : 'bg-white/40 border border-white/50'}`}>
          <span className={sf ? 'text-emerald-500' : isDark ? 'text-gray-600' : 'text-gray-400'}><Ic.Search /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setSf(true)} onBlur={() => setSf(false)} placeholder="Search files..." className={`flex-1 min-w-0 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-700 placeholder-gray-400'}`} />
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end min-w-0">
          <button onClick={toggle} className={`p-2.5 rounded-xl ${isDark ? 'bg-gray-700/60 text-emerald-400' : 'bg-emerald-100/60 text-emerald-600'}`}>{isDark ? <Ic.Sun /> : <Ic.Moon />}</button>
          <button
            onClick={onUp}
            disabled={uploadDisabled}
            title={uploadDisabled ? 'Set up Telegram in Settings first' : 'Upload files'}
            className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg transition-colors ${uploadDisabled ? 'bg-gray-400/40 text-white/70 shadow-gray-400/10 cursor-not-allowed' : 'bg-linear-to-r from-emerald-500 to-teal-400 text-white shadow-emerald-500/20'}`}
          ><Ic.Upload /> Upload</button>
          <div className="relative shrink-0" ref={ref}>
            <button onClick={() => setUm(!um)} className={`w-9 h-9 rounded-2xl overflow-hidden border-2 ${isDark ? 'border-emerald-500/30' : 'border-emerald-400/30'} shadow-md bg-linear-to-br from-emerald-500 to-teal-400 flex items-center justify-center`}>
              <span className="text-xs font-black text-white">{avatarInitial}</span>
            </button>
            <AnimatePresence>
              {um && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className={`absolute right-0 top-12 min-w-56 w-[min(95vw,14rem)] max-w-[95vw] rounded-2xl overflow-hidden shadow-2xl z-50 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
                  <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{displayName}</p>
                    <p className={`text-[10px] wrap-break-word ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user.email}</p>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <button onClick={() => { setUm(false); setCat && setCat('settings'); }} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-emerald-50 text-gray-600'}`}><Ic.Settings /> Settings</button>
                    <button onClick={onLogout} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50"><Ic.Shield /> Logout</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
