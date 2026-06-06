import React from 'react';
import { Ic } from '../../icons';

export const MobNav = ({ cat, setCat, onUp, isDark, telegramReady = true, telegramConfigLoading = false }) => {
  const items = [
    { id: 'home', label: 'Home', Icon: Ic.Home },
    { id: 'files', label: 'Files', Icon: Ic.Folder },
    { id: 'upload', label: 'Upload', Icon: Ic.Upload, act: true },
    { id: 'analytics', label: 'Stats', Icon: Ic.BarChart },
    { id: 'settings', label: 'Settings', Icon: Ic.Settings },
  ];
  const uploadDisabled = telegramConfigLoading || !telegramReady;
  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-30 border-t ${isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-100'} backdrop-blur-xl`}>
      <div className="flex items-center justify-around py-2">
        {items.map((it) => {
          if (it.act) return <button key="up" onClick={onUp} disabled={uploadDisabled} title={uploadDisabled ? 'Set up Telegram in Settings first' : 'Upload files'} className={`relative -top-5 w-13 h-13 rounded-2xl text-white shadow-xl flex items-center justify-center transition-colors ${uploadDisabled ? 'bg-gray-400/70 shadow-gray-500/20 cursor-not-allowed' : 'bg-gradient-to-br from-emerald-500 to-teal-400 shadow-emerald-500/40'}`} style={{ width: 52, height: 52 }}><it.Icon /></button>;
          return <button key={it.id} onClick={() => setCat(it.id)} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 ${cat === it.id ? 'text-emerald-500' : isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            <it.Icon /><span className="text-[10px] font-semibold">{it.label}</span>
          </button>;
        })}
      </div>
    </div>
  );
};
