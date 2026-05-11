import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ic } from '../../icons';

export const SettingsPage = ({ isDark }) => {
  const [tgName, setTgName] = useState('@imteaj_t_drive_bot');
  const [tgToken, setTgToken] = useState('8721702939:AAGtDcMWdQPZYxrWGuCBvZ27UTbs4eBzH_E');
  const [tgChatId, setTgChatId] = useState('790875483');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load Telegram config from local storage on mount
    const savedName = localStorage.getItem('tgBotName');
    const savedToken = localStorage.getItem('tgBotToken');
    const savedChatId = localStorage.getItem('tgChatId');
    if (savedName) setTgName(savedName);
    if (savedToken) setTgToken(savedToken);
    if (savedChatId) setTgChatId(savedChatId);
  }, []);

  const saveTelegramConfig = () => {
    localStorage.setItem('tgBotName', tgName);
    localStorage.setItem('tgBotToken', tgToken);
    localStorage.setItem('tgChatId', tgChatId);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>Settings</h1>
      
      {/* Profile Section */}
      <div className={`rounded-3xl p-6 transition-all ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm hover:shadow-md`}>
        <h2 className={`font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}><Ic.Users /> Profile</h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-500/20">
              <img src="https://placehold.co/96x96/10B981/fff?text=A" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute -bottom-3 -right-3 p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"><Ic.Image /></motion.button>
          </div>
          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>First Name</label>
                <input type="text" defaultValue="Alex" className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-700' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last Name</label>
                <input type="text" defaultValue="Morgan" className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-700' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
              <input type="email" defaultValue="alex@example.com" className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-700' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20">Save Changes</motion.button>
          </div>
        </div>
      </div>
      
      {/* Telegram Configuration Section */}
      <div className={`rounded-3xl p-6 transition-all ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm hover:shadow-md`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <span className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center text-white scale-90">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>
            </span>
            Telegram Bot Integration
          </h2>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>LOCAL STORAGE</span>
        </div>
        
        <p className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Connect your custom Telegram bot (e.g., <code>t.me/imteaj_t_drive_bot</code>) to back up your dashboard files directly through Telegram's API infrastructure.
        </p>

        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Bot Name</label>
            <input 
              type="text" 
              placeholder="@imteaj_t_drive_bot"
              value={tgName}
              onChange={(e) => setTgName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-indigo-500'}`} 
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>HTTP API Token</label>
            <input 
              type="password" 
              placeholder="e.g. 8721702939:AAGtDcMWdQPZYxrWGuCBvZ27UTbs4eBzH_E"
              value={tgToken}
              onChange={(e) => setTgToken(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono tracking-wider outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-indigo-500'}`} 
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your Telegram Chat ID (Get from @userinfobot)</label>
            <input 
              type="text" 
              placeholder="e.g. 123456789"
              value={tgChatId}
              onChange={(e) => setTgChatId(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono tracking-wider outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-indigo-500'}`} 
            />
          </div>
          <div className="pt-2">
            <motion.button 
              onClick={saveTelegramConfig}
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${isSaved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-[#0088cc] text-white shadow-[#0088cc]/20'}`}
            >
              {isSaved ? <><Ic.Check /> Connected & Saved!</> : 'Connect Bot & Save Locally'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className={`rounded-3xl p-6 transition-all ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm hover:shadow-md`}>
        <h2 className={`font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}><Ic.Bell /> Notifications</h2>
        <div className="space-y-4">
          {[
            { t: 'Email Alerts', d: 'Receive daily summary of activity' },
            { t: 'Push Notifications', d: 'Real-time alerts for shared files' },
            { t: 'Marketing', d: 'Updates, news, and special offers' }
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{n.t}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{n.d}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDark ? 'peer-checked:bg-emerald-500' : 'peer-checked:bg-emerald-500'}`}></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
