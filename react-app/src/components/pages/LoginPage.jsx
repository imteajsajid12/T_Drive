import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';

export const LoginPage = ({ isDark, onLogin }) => {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Generate floating music icons for the background
  const floatIcons = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    duration: 15 + Math.random() * 15,
    delay: Math.random() * 5,
    size: 20 + Math.random() * 20
  }));

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-gray-950' : 'bg-emerald-50'}`}>
      
      {/* Background Animated Video Wrapper */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden mix-blend-overlay pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className={`object-cover w-full h-full blur-sm scale-110 ${isDark ? 'opacity-60' : 'opacity-30'}`}
          src="https://cdn.pixabay.com/video/2021/05/04/73100-546747167_tiny.mp4"
        />
        <div className={`absolute inset-0 ${isDark ? 'bg-gray-900/70' : 'bg-gradient-to-br from-emerald-50/80 to-teal-100/60'}`}></div>
      </div>

      {/* Floating Music Icons Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {floatIcons.map((item) => (
          <motion.div
            key={item.id}
            className={`absolute ${isDark ? 'text-emerald-500/20' : 'text-emerald-600/10'}`}
            style={{ left: `${item.x}%`, bottom: '-10%', width: item.size, height: item.size }}
            animate={{ 
              y: ['0vh', '-120vh'],
              rotate: [0, 180, 360],
              x: [0, Math.random() * 50 - 25, 0]
            }}
            transition={{ 
              duration: item.duration, 
              repeat: Infinity, 
              delay: item.delay,
              ease: "linear" 
            }}
          >
            <Ic.Music />
          </motion.div>
        ))}
      </div>

      {/* Ambient Audio Element */}
      <audio 
        ref={audioRef}
        autoPlay 
        loop 
        muted={isMuted}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
        style={{ display: 'none' }}
      />

      {/* Audio Toggle Button */}
      <motion.button 
        onClick={toggleAudio}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={isMuted ? "Play Music" : "Mute Music"}
        className={`absolute bottom-8 right-8 z-30 p-4 rounded-full backdrop-blur-md shadow-2xl flex items-center justify-center transition-colors
          ${isDark ? 'bg-gray-800/80 text-emerald-400 border border-gray-700 hover:bg-gray-700' : 'bg-white/20 text-white border border-white/40 hover:bg-white/40'}`}
      >
        <motion.div
          animate={!isMuted ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isMuted ? <Ic.VolumeX /> : <Ic.Music />}
        </motion.div>
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.9 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ type: 'spring', duration: 1, bounce: 0.4 }}
        className={`relative z-10 w-full max-w-md p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl ${isDark ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/90 border border-white/50'}`}
      >
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 cursor-pointer"
          >
            <span className="text-white text-3xl font-black">T</span>
          </motion.div>
          <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>T-Drive Login</h1>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Enter your credentials to access your files</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-5">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <div className="relative group">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-emerald-400' : 'text-gray-400 group-focus-within:text-emerald-500'}`}><Ic.Mail /></span>
              <input 
                type="email" 
                defaultValue="admin@tdrive.com"
                placeholder="you@example.com" 
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold outline-none transition-all duration-300 ${isDark ? 'bg-gray-900/50 border border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-900 focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-gray-50/50 border border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} 
                required 
              />
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <div className="relative group">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-emerald-400' : 'text-gray-400 group-focus-within:text-emerald-500'}`}><Ic.Lock /></span>
              <input 
                type="password" 
                defaultValue="password123"
                placeholder="••••••••" 
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold outline-none transition-all duration-300 ${isDark ? 'bg-gray-900/50 border border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-900 focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-gray-50/50 border border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} 
                required 
              />
            </div>
          </motion.div>
          <div className="flex items-center justify-between py-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-gray-300 transition-transform group-hover:scale-110" />
              <span className={`text-xs font-semibold transition-colors ${isDark ? 'text-gray-400 group-hover:text-emerald-400' : 'text-gray-600 group-hover:text-emerald-600'}`}>Remember me</span>
            </label>
            <a href="#" className="flex items-center text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors">Forgot password?</a>
          </div>
          <motion.button 
            type="submit" 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 relative overflow-hidden group"
          >
            <span className="relative z-10">Sign In</span>
            <div className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-20 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] -translate-x-[150%] group-hover:translate-x-[150%] transition-all duration-700 ease-out"></div>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
