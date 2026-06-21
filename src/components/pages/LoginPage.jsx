import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';
import { account, saveLoginLog } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const LoginPage = ({ isDark, onLogin, onBack, initialMode = 'signin', onSwitchMode }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isMuted, setIsMuted] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [floatIcons, setFloatIcons] = useState([]);
  const audioRef = useRef(null);
  const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  useEffect(() => {
    // Generate floating music icons for the background
    setFloatIcons(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      duration: 15 + Math.random() * 15,
      delay: Math.random() * 5,
      size: 20 + Math.random() * 20
    })));
  }, []);

  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        // Create user using Appwrite
        await account.create(uuidv4(), email, password, name);
      }
      // Create session using Appwrite (login automatically after signup or execute regular login)
      await account.createEmailPasswordSession(email, password);
      onLogin(); // Tell App.jsx we are logged in
    } catch (err) {
      console.error(err);
      // Log the failed attempt (no user_id since auth failed; use email to identify)
      saveLoginLog({
        userId: 'unknown',
        email,
        event: 'attempt',
        status: 'failed',
      });
      if (err.message && err.message.toLowerCase().includes('blocked')) {
        try {
          localStorage.removeItem('cookieFallback');
          await account.deleteSession('current').catch(() => {});
        } catch (e) {}
        setError('Your previous account was blocked (likely due to repeated failed logins). We have cleared your stuck session. Please refresh the page and sign up with a NEW email address.');
      } else {
        setError(err.message || (isSignUp ? 'Sign up failed.' : 'Login failed. Please check your credentials.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-gray-950' : 'bg-emerald-50'}`}>
      {onBack && (
        <button 
          onClick={onBack}
          className={`absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full font-bold opacity-80 hover:opacity-100 transition-all ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
        >
          <Ic.ArrowLeft /> Back
        </button>
      )}
      
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
        <div className={`absolute inset-0 ${isDark ? 'bg-gray-900/70' : 'bg-linear-to-br from-emerald-50/80 to-teal-100/60'}`}></div>
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
        className={`relative z-10 w-full max-w-md p-8 rounded-4xl shadow-2xl backdrop-blur-xl ${isDark ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white/90 border border-white/50'}`}
      >
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto bg-linear-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 cursor-pointer"
          >
            <span className="text-white text-3xl font-black">T</span>
          </motion.div>
          <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {isSignUp ? 'Join T-Drive' : 'T-Drive Login'}
          </h1>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {isSignUp ? 'Create your account to start managing files' : 'Enter your credentials to access your files'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {isSignUp && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ type: "spring", stiffness: 300 }}>
              <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
              <div className="relative group mb-5">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-emerald-400' : 'text-gray-400 group-focus-within:text-emerald-500'}`}><Ic.User /></span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold outline-none transition-all duration-300 ${isDark ? 'bg-gray-900/50 border border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-900 focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-gray-50/50 border border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} 
                  required={isSignUp}
                />
              </div>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <div className="relative group">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-emerald-400' : 'text-gray-400 group-focus-within:text-emerald-500'}`}><Ic.Mail /></span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-4 mt-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 relative overflow-hidden group ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            <span className="relative z-10">{loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}</span>
            <div className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-20 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] translate-x-[-150%] group-hover:translate-x-[150%] transition-all duration-700 ease-out"></div>
          </motion.button>
          
          <div className="mt-4 text-center">
            <button 
              type="button" 
              onClick={() => {
                const nextIsSignUp = !isSignUp;
                setIsSignUp(nextIsSignUp);
                setError('');
                if (onSwitchMode) {
                  onSwitchMode(nextIsSignUp ? 'signup' : 'signin');
                }
              }} 
              className={`text-xs font-bold transition-colors ${isDark ? 'text-gray-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-600'}`}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center space-x-2">
            <span className={`h-px w-16 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></span>
            <span className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Or continue with</span>
            <span className={`h-px w-16 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></span>
          </div>

          <motion.button 
            type="button" 
            onClick={() => account.createOAuth2Session('google', `${redirectOrigin}/dashboard`, `${redirectOrigin}/login`)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full flex items-center justify-center gap-3 py-3.5 mt-4 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md ${isDark ? 'bg-gray-900 border border-gray-700 text-white hover:bg-gray-800' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
