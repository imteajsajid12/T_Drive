import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ====== REQUIRED SVG ICONS ======
const Ic = {
  Download: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Star: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Zap: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Fingerprint: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2"/></svg>,
  Bell: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Wifi: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  Battery: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>,
  Upload: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Folder: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Shield: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Settings: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Apple: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>,
  Bot: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  Laptop: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0l1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>,
  Monitor: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Image: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Video: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  Music: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  Doc: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  User: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Search: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

// ====== HELPERS ======
const SectionWrapper = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
};

const tGradMap = { image: 'from-emerald-400 to-teal-500', video: 'from-green-500 to-emerald-600', music: 'from-teal-400 to-green-500', doc: 'from-emerald-500 to-green-600' };
const tIconMap = { image: Ic.Image, video: Ic.Video, music: Ic.Music, doc: Ic.Doc };
const tGrad = (type) => tGradMap[type] || 'from-gray-400 to-gray-500';
const tIcon = (type) => tIconMap[type] || Ic.Doc;

// ====== APK COMPONENT ======
// Exported as BOTH named and default to prevent any import errors
export const Apk = ({ dark }) => {
  return (
      <>
    <section id="download-app" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionWrapper className="text-center mb-12 sm:mb-16">
          <motion.div
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold mb-6 ${dark ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 border border-emerald-200'}`}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Ic.Download /> Download Now
          </motion.div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
            Get T-Drive{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">on your phone</span>
          </h2>
          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            Available on iOS and Android. Access your files anywhere, anytime with our native mobile app.
          </p>
        </SectionWrapper>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <SectionWrapper>
              <motion.div
                className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl mb-8 ${dark ? 'bg-gray-800/60 border border-gray-700/50' : 'bg-white/80 border border-gray-200 shadow-sm'}`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-0.5 text-yellow-400">
                  <Ic.Star /><Ic.Star /><Ic.Star /><Ic.Star /><Ic.Star />
                </div>
                <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>4.9</span>
                <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>10K+ Reviews</span>
              </motion.div>
            </SectionWrapper>

            <SectionWrapper>
              <div className="space-y-4 mb-10">
                {[
                  { IconComp: Ic.Zap, title: 'Lightning Fast', desc: 'Native performance with instant file access' },
                  { IconComp: Ic.Fingerprint, title: 'Biometric Lock', desc: 'Face ID & fingerprint security' },
                  { IconComp: Ic.Bell, title: 'Smart Notifications', desc: 'Real-time sync & share alerts' },
                  { IconComp: Ic.Wifi, title: 'Offline Mode', desc: 'Access cached files without internet' },
                ].map((feature, i) => {
                  const FeatureIcon = feature.IconComp;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${dark ? 'bg-gray-800/40 border border-gray-700/30 hover:border-emerald-500/30' : 'bg-white/60 border border-gray-100 hover:border-emerald-200 hover:shadow-md'}`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                        <FeatureIcon />
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>{feature.title}</h4>
                        <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{feature.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </SectionWrapper>

            <SectionWrapper>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.a href="#" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="group flex items-center gap-3 px-6 py-4 rounded-2xl transition-all shadow-lg bg-gray-900 hover:bg-gray-800">
                  <svg width="28" height="28" viewBox="0 0 24 24" className="flex-shrink-0">
                    <path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z"/>
                    <path fill="#4285F4" d="M17.556 8.237L5.178.766a1.003 1.003 0 00-1.036-.002L14.21 11.17l3.346-2.933z"/>
                    <path fill="#EA4335" d="M17.556 15.763l-3.346-2.933-10.068 10.404a1.003 1.003 0 001.036-.002l12.378-7.47z"/>
                    <path fill="#FBBC04" d="M21.003 10.182L17.556 8.237l-3.346 2.933 3.346 2.933 3.447-1.947c.997-.564.997-2.41 0-2.974z"/>
                  </svg>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">GET IT ON</p>
                    <p className="text-white font-bold text-base sm:text-lg leading-tight">Google Play</p>
                  </div>
                </motion.a>

                <motion.a href="#" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="group flex items-center gap-3 px-6 py-4 rounded-2xl transition-all shadow-lg bg-gray-900 hover:bg-gray-800">
                  <Ic.Apple className="text-white flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Download on the</p>
                    <p className="text-white font-bold text-base sm:text-lg leading-tight">App Store</p>
                  </div>
                </motion.a>
              </div>
            </SectionWrapper>

            <SectionWrapper>
              <div className={`flex items-center gap-4 p-4 rounded-2xl ${dark ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/60 border border-gray-200'}`}>
                <motion.div className="w-20 h-20 rounded-xl bg-white p-2 flex-shrink-0 shadow-inner" whileHover={{ scale: 1.05, rotate: 2 }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="5" y="5" width="30" height="30" rx="4" fill="#111" /><rect x="10" y="10" width="20" height="20" rx="2" fill="white" /><rect x="14" y="14" width="12" height="12" rx="1" fill="#111" />
                    <rect x="65" y="5" width="30" height="30" rx="4" fill="#111" /><rect x="70" y="10" width="20" height="20" rx="2" fill="white" /><rect x="74" y="14" width="12" height="12" rx="1" fill="#111" />
                    <rect x="5" y="65" width="30" height="30" rx="4" fill="#111" /><rect x="10" y="70" width="20" height="20" rx="2" fill="white" /><rect x="14" y="74" width="12" height="12" rx="1" fill="#111" />
                    <rect x="40" y="5" width="8" height="8" rx="1" fill="#111" /><rect x="52" y="5" width="8" height="8" rx="1" fill="#111" /><rect x="40" y="17" width="8" height="8" rx="1" fill="#111" />
                    <rect x="40" y="40" width="8" height="8" rx="1" fill="#111" /><rect x="52" y="40" width="8" height="8" rx="1" fill="#111" /><rect x="5" y="40" width="8" height="8" rx="1" fill="#111" />
                    <rect x="17" y="40" width="8" height="8" rx="1" fill="#111" /><rect x="29" y="40" width="8" height="8" rx="1" fill="#111" /><rect x="65" y="40" width="8" height="8" rx="1" fill="#111" />
                    <rect x="77" y="40" width="8" height="8" rx="1" fill="#111" /><rect x="89" y="40" width="8" height="8" rx="1" fill="#111" /><rect x="40" y="52" width="8" height="8" rx="1" fill="#111" />
                    <rect x="52" y="52" width="8" height="8" rx="1" fill="#111" /><rect x="65" y="52" width="8" height="8" rx="1" fill="#111" /><rect x="77" y="52" width="8" height="8" rx="1" fill="#111" />
                    <rect x="40" y="65" width="8" height="8" rx="1" fill="#111" /><rect x="52" y="65" width="8" height="8" rx="1" fill="#111" /><rect x="65" y="65" width="8" height="8" rx="1" fill="#111" />
                    <rect x="40" y="77" width="8" height="8" rx="1" fill="#111" /><rect x="52" y="77" width="8" height="8" rx="1" fill="#111" /><rect x="77" y="65" width="8" height="8" rx="1" fill="#111" />
                    <rect x="89" y="65" width="8" height="8" rx="1" fill="#111" /><rect x="65" y="77" width="8" height="8" rx="1" fill="#111" /><rect x="89" y="77" width="8" height="8" rx="1" fill="#111" />
                    <rect x="77" y="89" width="8" height="8" rx="1" fill="#111" /><rect x="89" y="89" width="8" height="8" rx="1" fill="#111" />
                  </svg>
                </motion.div>
                <div>
                  <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>Scan to Download</p>
                  <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Point your camera at the QR code</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <span className={`text-[10px] font-bold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>Available worldwide</span>
                  </div>
                </div>
              </div>
            </SectionWrapper>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-400/30 blur-[80px]" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 4, repeat: Infinity }} />

              <motion.div className="relative z-10" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <div className="w-56 sm:w-64 h-[440px] sm:h-[500px] rounded-[2.5rem] bg-gray-900 border-[3px] border-gray-700 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-30" />
                  <div className="h-full bg-gradient-to-b from-emerald-500 to-teal-600 flex flex-col">
                    <div className="flex items-center justify-between px-5 pt-2 pb-1">
                      <span className="text-white text-[10px] font-bold">9:41</span>
                      <div className="flex items-center gap-1"><Ic.Wifi width={12} height={12} className="text-white/80" /><Ic.Battery width={14} height={14} className="text-white/80" /></div>
                    </div>
                    <div className="px-5 pt-6 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"><span className="text-white font-black text-lg">T</span></div>
                        <div><p className="text-white font-bold text-base">T-Drive</p><p className="text-white/60 text-[10px]">Your Cloud Storage</p></div>
                        <div className="ml-auto w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Ic.Bell width={14} height={14} className="text-white" /></div>
                      </div>
                    </div>
                    <div className="px-5 mb-4">
                      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2"><span className="text-white/80 text-xs font-medium">Storage Used</span><span className="text-white text-xs font-bold">2.4 / 5 GB</span></div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden"><motion.div className="h-full bg-white rounded-full" initial={{ width: 0 }} whileInView={{ width: '48%' }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.5 }} /></div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-400" /><span className="text-white/70 text-[10px]">Images</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-white/70 text-[10px]">Videos</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-400" /><span className="text-white/70 text-[10px]">Docs</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 mb-4">
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { IconComp: Ic.Upload, label: 'Upload', color: 'bg-emerald-400/30' },
                          { IconComp: Ic.Folder, label: 'Files', color: 'bg-blue-400/30' },
                          { IconComp: Ic.Shield, label: 'Secure', color: 'bg-violet-400/30' },
                          { IconComp: Ic.Settings, label: 'Settings', color: 'bg-amber-400/30' },
                        ].map((a, i) => {
                          const ActionIcon = a.IconComp;
                          return (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 + i * 0.1 }} className="flex flex-col items-center gap-1.5">
                              <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center text-white`}><ActionIcon width={16} height={16} /></div>
                              <span className="text-white/70 text-[9px]">{a.label}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="px-5 flex-1">
                      <p className="text-white/60 text-[10px] font-bold mb-2 uppercase tracking-wider">Recent Files</p>
                      <div className="space-y-2">
                        {[
                          { name: 'photo_vacation.jpg', size: '4.2 MB', type: 'image' },
                          { name: 'report_Q4.pdf', size: '12 MB', type: 'doc' },
                          { name: 'meeting_notes.mp4', size: '156 MB', type: 'video' },
                        ].map((f, i) => {
                          const FileIcon = tIcon(f.type);
                          return (
                            <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 1 + i * 0.15 }} className="flex items-center gap-2.5 bg-white/10 rounded-xl p-2.5">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tGrad(f.type)} flex items-center justify-center`}><FileIcon width={14} height={14} className="text-white" /></div>
                              <div className="flex-1 min-w-0"><p className="text-white text-[10px] font-bold truncate">{f.name}</p><p className="text-white/50 text-[9px]">{f.size}</p></div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm px-6 py-3 flex items-center justify-around">
                      {[
                        { IconComp: Ic.Folder, active: true }, { IconComp: Ic.Search, active: false },
                        { IconComp: Ic.Plus, active: false, special: true }, { IconComp: Ic.Shield, active: false }, { IconComp: Ic.User, active: false },
                      ].map((n, i) => {
                        const NavIcon = n.IconComp;
                        return (
                          <div key={i} className={`${n.special ? 'w-10 h-10 -mt-4 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-lg shadow-emerald-500/50' : 'w-8 h-8'} flex items-center justify-center ${n.active ? 'text-white' : 'text-white/50'}`}>
                            <NavIcon width={16} height={16} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div className={`absolute -left-8 sm:-left-12 top-16 sm:top-20 z-20 px-3 py-2.5 rounded-xl ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-xl`} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 1.2 }} animate={{ y: [0, -8, 0] }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center"><Ic.Shield width={14} height={14} className="text-white" /></div>
                  <div><p className={`text-[10px] font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>End-to-End</p><p className={`text-[9px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Encrypted</p></div>
                </div>
              </motion.div>

              <motion.div className={`absolute -right-8 sm:-right-12 bottom-24 sm:bottom-32 z-20 px-3 py-2.5 rounded-xl ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-xl`} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 1.4 }} animate={{ y: [0, 8, 0] }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center"><Ic.Zap width={14} height={14} className="text-white" /></div>
                  <div><p className={`text-[10px] font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Super Fast</p><p className={`text-[9px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Upload Speed</p></div>
                </div>
              </motion.div>

              <motion.div className={`absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 z-20 px-3 py-2.5 rounded-xl ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-xl`} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1, y: -5 }} viewport={{ once: true }} transition={{ delay: 1.6, type: 'spring' }}>
                <div className="flex items-center gap-2">
                  <motion.div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}><Ic.Star className="text-white" /></motion.div>
                  <div><p className={`text-[10px] font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>4.9 Rating</p><p className={`text-[9px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>10K+ Users</p></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <SectionWrapper className="mt-16 sm:mt-20">
          <div className={`rounded-3xl p-6 sm:p-8 ${dark ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/60 border border-white shadow-xl'}`}>
            <div className="text-center mb-6">
              <h3 className={`text-lg sm:text-xl font-black ${dark ? 'text-white' : 'text-gray-800'}`}>Available on all platforms</h3>
              <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Download for your preferred device</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'iOS', version: 'iOS 14+', IconComp: Ic.Apple, gradient: 'from-gray-700 to-gray-900' },
                { name: 'Android', version: 'Android 8+', IconComp: Ic.Bot, gradient: 'from-green-500 to-green-700' },
                { name: 'macOS', version: 'macOS 11+', IconComp: Ic.Laptop, gradient: 'from-gray-600 to-gray-800' },
                { name: 'Windows', version: 'Win 10+', IconComp: Ic.Monitor, gradient: 'from-blue-500 to-blue-700' },
              ].map((platform, i) => {
                const PlatIcon = platform.IconComp;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4, scale: 1.02 }} className={`flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all ${dark ? 'bg-gray-700/40 border border-gray-600/30 hover:border-emerald-500/30' : 'bg-gray-50 border border-gray-200 hover:border-emerald-300 hover:shadow-md'}`}>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-lg text-white`}><PlatIcon width={28} height={28} /></div>
                    <div className="text-center"><p className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>{platform.name}</p><p className={`text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{platform.version}</p></div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </SectionWrapper>
      </div>
    </section>
  
    
    </>
  );
};

export default Apk;