import React from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';

export const SettingsPage = ({ isDark }) => (
  <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
    <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>Settings</h1>
    <div className={`rounded-3xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm`}>
      <h2 className={`font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}><Ic.Users /> Profile</h2>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
            <img src="https://placehold.co/96x96/10B981/fff?text=A" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="absolute -bottom-3 -right-3 p-2 rounded-xl bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-colors"><Ic.Image /></button>
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
          <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">Save Changes</button>
        </div>
      </div>
    </div>
    <div className={`rounded-3xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm`}>
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
  </div>
);
