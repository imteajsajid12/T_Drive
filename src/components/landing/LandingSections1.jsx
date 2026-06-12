import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Ic } from './LandingIcons';
import { FloatFileIcons } from './LandingBackgrounds';

// ====== HELPERS ======
const tGradMap = { image: 'from-emerald-400 to-teal-500', video: 'from-green-500 to-emerald-600', music: 'from-teal-400 to-green-500', doc: 'from-emerald-500 to-green-600' };
const tIconMap = { image: Ic.Image, video: Ic.Video, music: Ic.Music, doc: Ic.Doc };
const tGrad = (type) => tGradMap[type] || 'from-gray-400 to-gray-500';
const tIcon = (type) => tIconMap[type] || Ic.Doc;

// ====== ANIMATED SECTION WRAPPER ======
// Uses a smaller trigger margin on mobile to avoid triggering too early / layout jank
export const SectionWrapper = ({ children, className = '' }) => {
  const ref = useRef(null);
  // '-60px' on mobile is gentler on layout recalc vs the default '-100px'
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      // Shorter duration and simpler easing reduces animation frame budget
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ====== NAVBAR ======
export const Navbar = ({ dark, onLoginClick, isAuthed = false, user, onDashboardClick, onProfileClick, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  useEffect(() => {
    // passive:true prevents scroll blocking on mobile
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  const links = ['Features', 'Bot Creator', 'Pricing', 'FAQ'];
  const displayName = user?.name?.trim() || user?.email?.split('@')?.[0] || 'User';
  const avatarInitial = displayName.slice(0, 1).toUpperCase();
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? (dark ? 'bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50 shadow-lg shadow-black/10' : 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm') : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <motion.div className="flex items-center gap-2 sm:gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-white font-black text-base sm:text-lg">T</span>
          </motion.div>
          <span className={`text-lg sm:text-xl font-black ${dark ? 'text-white' : 'text-gray-800'}`}>T-Drive</span>
        </motion.div>
        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <motion.a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} whileHover={{ y: -2 }} className={`text-sm font-medium transition-colors ${dark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>{l}</motion.a>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          {isAuthed ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className={`flex items-center gap-3 px-3 py-2 rounded-2xl transition-all ${dark ? 'bg-gray-800/70 hover:bg-gray-800 border border-gray-700' : 'bg-white/80 hover:bg-white border border-white/80 shadow-sm'}`}
              >
                <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20">{avatarInitial}</span>
                <span className={`text-sm font-semibold max-w-28 truncate ${dark ? 'text-white' : 'text-gray-800'}`}>{displayName}</span>
              </button>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} className={`absolute right-0 top-14 w-56 rounded-2xl overflow-hidden shadow-2xl ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
                  <div className={`p-4 border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>{displayName}</p>
                    <p className={`text-[10px] truncate ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{user?.email || ''}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button onClick={() => { setProfileOpen(false); onDashboardClick && onDashboardClick(); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${dark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-emerald-50 text-gray-700'}`}><Ic.Grid /> Dashboard</button>
                    <button onClick={() => { setProfileOpen(false); onProfileClick && onProfileClick(); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${dark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-emerald-50 text-gray-700'}`}><Ic.Users /> Profile</button>
                    <button onClick={() => { setProfileOpen(false); onLogout && onLogout(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50"><Ic.Shield /> Logout</button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <button onClick={onLoginClick} className={`text-sm font-medium px-4 py-2.5 rounded-xl transition-colors ${dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>Login</button>
              <motion.button onClick={onLoginClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20">Get Started</motion.button>
            </>
          )}
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden p-2 rounded-xl ${dark ? 'text-white' : 'text-gray-800'}`}>
          {mobileOpen ? <Ic.X /> : <Ic.Menu />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`lg:hidden ${dark ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-xl border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="px-6 py-4 space-y-3">
              {links.map((l) => (
                <motion.a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileOpen(false)} whileTap={{ scale: 0.95 }} className={`block text-sm font-medium py-2 ${dark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>{l}</motion.a>
              ))}
              {isAuthed ? (
                <>
                  <button onClick={() => { setMobileOpen(false); onDashboardClick && onDashboardClick(); }} className={`w-full mt-2 px-5 py-3 rounded-xl font-bold text-sm ${dark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>Dashboard</button>
                  <button onClick={() => { setMobileOpen(false); onProfileClick && onProfileClick(); }} className={`w-full mt-2 px-5 py-3 rounded-xl font-bold text-sm ${dark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>Profile</button>
                  <button onClick={() => { setMobileOpen(false); onLogout && onLogout(); }} className="w-full mt-2 px-5 py-3 rounded-xl bg-transparent border border-red-500 text-red-500 font-bold text-sm">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMobileOpen(false); onLoginClick(); }} className="w-full mt-2 px-5 py-3 rounded-xl bg-transparent border border-emerald-500 text-emerald-500 font-bold text-sm">Login</button>
                  <button className="w-full mt-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm">Get Started</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ====== HERO SECTION ======
export const Hero = ({ dark }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* FloatFileIcons rendered via LandingPage's showBg layer — no double render here */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 ${dark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
            <Ic.Zap /> Powered by Telegram Bot API
          </motion.div>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
            Store files via{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Telegram Bot</span>
          </h1>
          <p className={`text-base sm:text-lg mb-8 max-w-lg ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            Upload, download, and manage your files directly through Telegram. T-Drive makes cloud storage as simple as sending a message.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-base sm:text-lg shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2">
              <Ic.Send /> Start Free Trial
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 border-2 ${dark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-200 text-gray-800 hover:bg-gray-50'}`}>
              <Ic.Play /> Watch Demo
            </motion.button>
          </div>
          <div className="flex items-center gap-6 mt-8">
            <div className="flex -space-x-2">
              {['A', 'B', 'C', 'D'].map((l, i) => (
                <motion.div key={i} whileHover={{ scale: 1.2, zIndex: 10 }} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{l}</motion.div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 sm:gap-1 text-yellow-400"><Ic.Star /><Ic.Star /><Ic.Star /><Ic.Star /><Ic.Star /></div>
              <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Trusted by 10,000+ users</p>
            </div>
          </div>
        </motion.div>
        <div className="relative">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className={`relative p-6 sm:p-8 rounded-3xl ${dark ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/60 border border-white/60 shadow-2xl'} backdrop-blur-xl`}>
            <div className="space-y-3 sm:space-y-4">
              {[
                { name: 'photo_2024.jpg', type: 'image', size: '4.2 MB', progress: 100 },
                { name: 'project.pdf', type: 'doc', size: '12 MB', progress: 65 },
                { name: 'meeting.mp4', type: 'video', size: '156 MB', progress: 30 },
              ].map((f, i) => {
                const FileIcon = tIcon(f.type);
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.2 }}
                    onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}
                    className={`p-3 sm:p-4 rounded-2xl transition-all cursor-pointer ${dark ? 'bg-gray-700/50 border border-gray-600/30 hover:border-emerald-500/50' : 'bg-gray-50 border border-gray-100 hover:border-emerald-300'} ${hoveredCard === i ? 'shadow-lg' : ''}`}>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <motion.div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${tGrad(f.type)} text-white flex items-center justify-center`} whileHover={{ scale: 1.1, rotate: 5 }}>
                          <FileIcon />
                        </motion.div>
                        <div>
                          <p className={`font-semibold text-xs sm:text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>{f.name}</p>
                          <p className={`text-[10px] sm:text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{f.size}</p>
                        </div>
                      </div>
                      {f.progress === 100 && <span className="text-emerald-500"><Ic.Check /></span>}
                    </div>
                    <div className={`h-1.5 sm:h-2 rounded-full overflow-hidden ${dark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" initial={{ width: 0 }} animate={{ width: `${f.progress}%` }} transition={{ duration: 1.5, delay: 0.8 + i * 0.3 }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
              {[{ label: 'Stored', value: '2.4 GB' }, { label: 'Files', value: '1,247' }, { label: 'Shared', value: '89' }].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + i * 0.15 }} className="text-center">
                  <p className={`text-lg sm:text-xl font-black ${dark ? 'text-white' : 'text-gray-800'}`}>{s.value}</p>
                  <p className={`text-[10px] sm:text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 px-4 sm:px-5 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/30 flex items-center gap-2"
            style={{ willChange: 'transform' }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Ic.Shield /> <span className="text-xs sm:text-sm font-medium">End-to-end encrypted</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ====== FEATURES SECTION ======
export const Features = ({ dark }) => {
  const features = [
    { Icon: Ic.Cloud, title: 'Cloud Storage', desc: 'Unlimited storage for all your files with automatic backup and sync.', gradient: 'from-emerald-500 to-teal-400' },
    { Icon: Ic.Shield, title: 'End-to-End Encryption', desc: 'Your files are encrypted before leaving your device. Only you hold the keys.', gradient: 'from-blue-500 to-cyan-400' },
    { Icon: Ic.Zap, title: 'Instant Access', desc: 'Access your files anywhere, anytime through Telegram or web dashboard.', gradient: 'from-amber-500 to-orange-400' },
    { Icon: Ic.Bot, title: 'Telegram Bot', desc: 'Upload and manage files through simple Telegram commands.', gradient: 'from-violet-500 to-purple-400' },
    { Icon: Ic.Send, title: 'Easy Sharing', desc: 'Generate secure shareable links with expiry and password protection.', gradient: 'from-rose-500 to-pink-400' },
    { Icon: Ic.Globe, title: 'Cross Platform', desc: 'Works on Telegram, Web, and mobile apps seamlessly.', gradient: 'from-cyan-500 to-blue-400' },
  ];
  
  return (
    <section id="features" className="py-20 sm:py-24 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-12 sm:mb-16">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
            Everything you need,{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">nothing you don't</span>
          </h2>
          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Powerful features designed for simplicity and security.</p>
        </SectionWrapper>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => {
            const FIcon = f.Icon;
            return (
              <SectionWrapper key={i}>
                <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}
                  className={`p-5 sm:p-6 rounded-3xl transition-all group cursor-pointer relative overflow-hidden ${dark ? 'bg-gray-800/40 border border-gray-700/40 hover:bg-gray-700/50' : 'bg-white/60 border border-white shadow-sm hover:shadow-xl'}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-all group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br ${f.gradient} text-white shadow-lg`}><FIcon /></div>
                  <h3 className={`text-base sm:text-lg font-bold mb-2 ${dark ? 'text-white' : 'text-gray-800'}`}>{f.title}</h3>
                  <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{f.desc}</p>
                </motion.div>
              </SectionWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};