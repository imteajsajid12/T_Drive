import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ParticleField, GradientOrbs, GridBackground, FloatFileIcons } from '../landing/LandingBackgrounds';
import { Navbar, Hero, Features } from '../landing/LandingSections1';
import { BotCreator, Pricing, FAQ, CTA, Footer } from '../landing/LandingSections2';
import { Ic } from '../landing/LandingIcons';

export const LandingPage = ({ onLoginClick, isAuthed = false, user, onDashboardClick, onProfileClick, onLogout }) => {
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBg, setShowBg] = useState(false);

  useEffect(() => {
    // shorten initial loading time to avoid long spinner experience
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      // defer heavy background mount slightly to avoid blocking first paint
      const t = setTimeout(() => setShowBg(true), 150);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/40 mb-6">
            <span className="text-white text-4xl font-black">T</span>
          </motion.div>
          <motion.div className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
            <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
            <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${dark ? 'bg-gray-950 text-white' : 'bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 text-gray-900'} min-h-screen transition-colors duration-500 relative isolate`}>
      {showBg && <ParticleField dark={dark} />}
      {showBg && <GradientOrbs />}
      {showBg && <GridBackground dark={dark} />}
      {showBg && <FloatFileIcons />}
      <Navbar dark={dark} onLoginClick={onLoginClick} isAuthed={isAuthed} user={user} onDashboardClick={onDashboardClick} onProfileClick={onProfileClick} onLogout={onLogout} />
      <Hero dark={dark} />
      <Features dark={dark} />
      <BotCreator dark={dark} />
      <Pricing dark={dark} />
      <FAQ dark={dark} />
      <CTA dark={dark} onLoginClick={onLoginClick} />
      <Footer dark={dark} />

      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDark(!dark)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all ${dark ? 'bg-gray-800 text-yellow-400 border border-gray-700' : 'bg-white text-gray-700 border border-gray-200'}`}>
        {dark ? <Ic.Sun /> : <Ic.Moon />}
      </motion.button>
    </div>
  );
};
