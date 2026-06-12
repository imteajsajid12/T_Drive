import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ParticleField, GradientOrbs, GridBackground, FloatFileIcons } from '../landing/LandingBackgrounds';
import { Navbar, Hero, Features } from '../landing/LandingSections1';
import { BotCreator, Pricing, FAQ, CTA, Footer } from '../landing/LandingSections2';
import { Ic } from '../landing/LandingIcons';
import { InfiniteGridBackdrop } from '../ui/the-infinite-grid';
import { Apk } from '../landing/Apk';
import { Review } from '../landing/CustomerReviews';

export const LandingPage = ({ onLoginClick, isAuthed = false, user, onDashboardClick, onProfileClick, onLogout }) => {
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBg, setShowBg] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      // Defer heavy background mount slightly to avoid blocking first paint
      const t = setTimeout(() => setShowBg(true), 150);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/40 mb-6"
          >
            <span className="text-white text-4xl font-black">T</span>
          </motion.div>
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${dark ? 'bg-gray-950 text-white' : 'bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 text-gray-900'} min-h-screen transition-colors duration-500 relative isolate`}
    >
      {/* Animated infinite grid backdrop — handles its own mobile detection internally */}
      <InfiniteGridBackdrop dark={dark} className="z-0" />

      {/* All background layers shown once deferred mount is ready */}
      {showBg && <ParticleField dark={dark} />}
      {showBg && <GradientOrbs dark={dark} />}
      {showBg && <GridBackground dark={dark} />}
      {showBg && <FloatFileIcons dark={dark} />}

      {/* Content layer — promoted to its own GPU layer for smooth scroll */}
      <div className="relative z-10" style={{ isolation: 'isolate' }}>
        <Navbar
          dark={dark}
          onLoginClick={onLoginClick}
          isAuthed={isAuthed}
          user={user}
          onDashboardClick={onDashboardClick}
          onProfileClick={onProfileClick}
          onLogout={onLogout}
        />
        <Hero dark={dark} />
        <Features dark={dark} />
        <Apk dark={dark} />
        <BotCreator dark={dark} />
        <Review dark={dark} />
        <Pricing dark={dark} />
        <FAQ dark={dark} />
        <CTA dark={dark} onLoginClick={onLoginClick} />
        <Footer dark={dark} />
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setDark(!dark)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all ${dark ? 'bg-gray-800 text-yellow-400 border border-gray-700' : 'bg-white text-gray-700 border border-gray-200'}`}
      >
        {dark ? <Ic.Sun /> : <Ic.Moon />}
      </motion.button>
    </div>
  );
};
