import { useState, useEffect } from 'react';
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
  // Desktop-only: heavy background layers (particles, orbs, floating icons).
  // On touch devices these 28-particle + blur-orb + 360°-icon layers kill iOS Safari.
  const [showDesktopBg, setShowDesktopBg] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return; // skip all animated backgrounds on mobile
    // Defer heavy layers until after first paint so the page content renders fast
    const t = setTimeout(() => setShowDesktopBg(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`${dark ? 'bg-gray-950 text-white' : 'bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 text-gray-900'} min-h-screen transition-colors duration-500 relative isolate`}
    >
      {/* Static/low-cost grid backdrop — mobile-safe (InfiniteGridBackdrop handles its own mobile detection) */}
      <InfiniteGridBackdrop dark={dark} className="z-0" />

      {/* Heavy animated layers — desktop only, deferred after first paint */}
      {showDesktopBg && <ParticleField dark={dark} />}
      {showDesktopBg && <GradientOrbs dark={dark} />}
      {showDesktopBg && <GridBackground dark={dark} />}
      {showDesktopBg && <FloatFileIcons dark={dark} />}

      {/* Content layer */}
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
