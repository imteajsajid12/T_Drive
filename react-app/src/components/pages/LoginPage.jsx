import React from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';

export const LoginPage = ({ isDark, onLogin }) => (
  <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-emerald-50/50'}`}>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
          <span className="text-white text-3xl font-black">T</span>
        </div>
        <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>T-Drive Login</h1>
        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Enter your credentials to access your files</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4">
        <div>
          <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><Ic.Mail /></span>
            <input type="email" placeholder="you@example.com" className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-700' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} required />
          </div>
        </div>
        <div>
          <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><Ic.Lock /></span>
            <input type="password" placeholder="••••••••" className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-700' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} required />
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-gray-300" />
            <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Remember me</span>
          </label>
          <a href="#" className="flex items-center text-xs font-bold text-emerald-500 hover:text-emerald-400">Forgot password?</a>
        </div>
        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">Sign In</button>
      </form>
    </motion.div>
  </div>
);
