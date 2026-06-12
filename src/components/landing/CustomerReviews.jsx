import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ============================================================
// ICONS (Required for this section)
// ============================================================
const Ic = {
  Star: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Heart: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Quote: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z"/></svg>,
  CheckCircle: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  ChevronRight: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronLeft: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 18 9 12 15 6"/></svg>,
  Users: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Award: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  TrendingUp: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};

// ============================================================
// UTILITY: Section Wrapper (Scroll Animation)
// ============================================================
const SectionWrapper = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================
// UTILITY: Animated Counter
// Uses requestAnimationFrame instead of setInterval for better
// integration with the browser's rendering pipeline
// ============================================================
const AnimatedCounter = ({ target, suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isInView) return;
    const startTime = performance.now();
    const endTime = startTime + duration * 1000;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ============================================================
// DATA: Reviews
// ============================================================
const REVIEWS_DATA = [
  { name: 'Sarah Johnson', role: 'Product Designer at Figma', avatar: 'SJ', avatarColor: 'from-pink-500 to-rose-500', rating: 5, text: 'T-Drive completely transformed how I manage design assets. The Telegram bot integration is genius — I can upload files without leaving my chat. The UI is beautiful and intuitive!', date: '2 weeks ago', verified: true },
  { name: 'Mike Chen', role: 'Software Engineer at Google', avatar: 'MC', avatarColor: 'from-blue-500 to-cyan-500', rating: 5, text: 'As a developer, I love the API access and simplicity. Setting up the bot took 5 minutes and now my whole team uses it daily. The encryption gives me peace of mind.', date: '1 month ago', verified: true },
  { name: 'Emily Davis', role: 'Content Creator', avatar: 'ED', avatarColor: 'from-purple-500 to-violet-500', rating: 5, text: 'I share large video files with clients through T-Drive. The password-protected links with expiry dates are exactly what I needed. Customer support is also amazing!', date: '3 weeks ago', verified: true },
  { name: 'Alex Rivera', role: 'Startup Founder', avatar: 'AR', avatarColor: 'from-emerald-500 to-teal-500', rating: 5, text: 'We migrated from a traditional cloud service and saved 60% on costs. The Telegram integration is perfect for our remote team. Highly recommend T-Drive!', date: '1 week ago', verified: true },
  { name: 'Lisa Park', role: 'Professional Photographer', avatar: 'LP', avatarColor: 'from-amber-500 to-orange-500', rating: 5, text: 'Managing my photo portfolio has never been easier. I can upload from my phone directly through Telegram. The mobile app is smooth and the sync is instant!', date: '2 months ago', verified: true },
  { name: 'David Kim', role: 'Marketing Director', avatar: 'DK', avatarColor: 'from-indigo-500 to-blue-500', rating: 5, text: 'The sharing features are top-notch. I can track who accessed my files and when. The analytics dashboard gives me insights I never had with other services.', date: '3 days ago', verified: true },
];

// ============================================================
// DATA: Stats & Trusted Companies
// ============================================================
const STATS_DATA = [
  { icon: Ic.Users, value: 10000, suffix: '+', label: 'Happy Users', color: 'from-blue-500 to-cyan-500' },
  { icon: Ic.Star, value: 4.9, suffix: '/5', label: 'Average Rating', color: 'from-yellow-500 to-orange-500' },
  { icon: Ic.Award, value: 99, suffix: '%', label: 'Satisfaction Rate', color: 'from-emerald-500 to-teal-500' },
  { icon: Ic.TrendingUp, value: 50, suffix: 'M+', label: 'Files Uploaded', color: 'from-purple-500 to-pink-500' },
];
const TRUSTED_COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'];

// ============================================================
// SUB-COMPONENTS (Fixed for Light/Dark Mode)
// ============================================================
const StarRating = ({ rating = 5, dark }) => (
  <div className="flex items-center gap-1 mb-4">
    {[...Array(5)].map((_, j) => (
      <motion.div key={j} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + j * 0.1 }}
        className={j < rating ? 'text-yellow-400' : (dark ? 'text-gray-600' : 'text-gray-300')}>
        <Ic.Star />
      </motion.div>
    ))}
  </div>
);

const ReviewAvatar = ({ initials, gradient }) => (
  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
    className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
    {initials}
  </motion.div>
);

const ReviewAuthorInfo = ({ name, role, date, verified, dark }) => (
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2">
      <p className={`font-bold text-sm truncate ${dark ? 'text-white' : 'text-gray-800'}`}>{name}</p>
      {verified && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="text-emerald-500 flex-shrink-0">
          <Ic.CheckCircle />
        </motion.div>
      )}
    </div>
    <p className={`text-xs truncate ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{role}</p>
    <p className={`text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{date}</p>
  </div>
);

const ReviewCard = ({ review, index, dark }) => (
  <motion.div key={`${review.name}-${index}`}
    initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
    transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -8, scale: 1.02 }}
    className={`relative p-6 sm:p-8 rounded-3xl overflow-hidden group ${dark ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/80 border border-gray-200 shadow-lg'}`}>
    
    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${review.avatarColor} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
    
    <div className={`absolute top-4 right-4 opacity-10 ${dark ? 'text-white' : 'text-gray-900'}`}>
      <Ic.Quote width={48} height={48} className="currentColor" />
    </div>

    <StarRating rating={review.rating} dark={dark} />

    <p className={`text-sm sm:text-base mb-6 leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
      &ldquo;{review.text}&rdquo;
    </p>

    <div className="flex items-center gap-3">
      <ReviewAvatar initials={review.avatar} gradient={review.avatarColor} />
      <ReviewAuthorInfo name={review.name} role={review.role} date={review.date} verified={review.verified} dark={dark} />
    </div>
  </motion.div>
);

const CarouselNavButton = ({ direction, onClick, dark }) => {
  const isLeft = direction === 'left';
  return (
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClick}
      className={`absolute ${isLeft ? '-left-4 sm:-left-6' : '-right-4 sm:-right-6'} top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-colors ${dark ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700' : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50'}`}
      aria-label={isLeft ? 'Previous review' : 'Next review'}>
      {isLeft ? <Ic.ChevronLeft /> : <Ic.ChevronRight />}
    </motion.button>
  );
};

const CarouselDots = ({ total, active, onChange, dark }) => (
  <div className="flex items-center justify-center gap-2 mt-8">
    {Array.from({ length: total }, (_, i) => (
      <motion.button key={i} onClick={() => onChange(i)}
        className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' : (dark ? 'w-2 bg-gray-600 hover:bg-gray-500' : 'w-2 bg-gray-300 hover:bg-gray-400')}`}
        whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} aria-label={`Go to review ${i + 1}`} />
    ))}
  </div>
);

const AutoPlayIndicator = ({ isPlaying, dark }) => (
  <div className="flex items-center justify-center gap-2 mt-4">
    <motion.div
      className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500' : (dark ? 'bg-gray-500' : 'bg-gray-400')}`}
      style={{ willChange: 'transform, opacity' }}
      animate={isPlaying ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
      {isPlaying ? 'Auto-playing' : 'Paused'}
    </span>
  </div>
);

const ReviewStats = ({ dark }) => (
  <SectionWrapper className="mb-12">
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 rounded-3xl ${dark ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/60 border border-white shadow-xl'}`}>
      {STATS_DATA.map((stat, i) => {
        const StatIcon = stat.icon;
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
            <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
              <StatIcon className="text-white" />
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${dark ? 'text-white' : 'text-gray-800'}`}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
            <p className={`text-xs sm:text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  </SectionWrapper>
);

const TrustBadges = ({ dark }) => (
  <SectionWrapper className="mt-16">
    <div className={`p-6 sm:p-8 rounded-3xl ${dark ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/60 border border-white shadow-xl'}`}>
      <p className={`text-center text-sm font-bold mb-6 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>TRUSTED BY TEAMS AT</p>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center">
        {TRUSTED_COMPANIES.map((company, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.1 }}
            className={`text-center font-bold text-lg ${dark ? 'text-gray-600' : 'text-gray-300'}`}>
            {company}
          </motion.div>
        ))}
      </div>
    </div>
  </SectionWrapper>
);

const ReviewSectionHeader = ({ dark }) => (
  <SectionWrapper className="text-center mb-12 sm:mb-16">
    <motion.div
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold mb-6 ${dark ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border border-purple-200'}`}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Ic.Heart /> Loved by Thousands
    </motion.div>
    <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
      What our{' '}
      <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">customers say</span>
    </h2>
    <p className={`text-base sm:text-lg max-w-2xl mx-auto ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
      Join thousands of satisfied users who trust T-Drive for their cloud storage needs.
    </p>
  </SectionWrapper>
);

// ============================================================
// MAIN COMPONENT: Customer Reviews Section
// ============================================================
export function CustomerReviews({ dark = true }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef(null);
  const reviews = REVIEWS_DATA;

  useEffect(() => {
    if (isAutoPlaying) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAutoPlaying, reviews.length]);

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToReview = (index) => { setActiveIndex(index); pauseAutoPlay(); };
  const nextReview = () => { setActiveIndex((prev) => (prev + 1) % reviews.length); pauseAutoPlay(); };
  const prevReview = () => { setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length); pauseAutoPlay(); };

  const getVisibleReviews = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) visible.push(reviews[(activeIndex + i) % reviews.length]);
    return visible;
  };

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-purple-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-pink-500/10 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <ReviewSectionHeader dark={dark} />
        <ReviewStats dark={dark} />

        <SectionWrapper>
          <div className="relative">
            <CarouselNavButton direction="left" onClick={prevReview} dark={dark} />
            <CarouselNavButton direction="right" onClick={nextReview} dark={dark} />

            <div className="grid md:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {getVisibleReviews().map((review, i) => (
                  <ReviewCard key={`${review.name}-${activeIndex}-${i}`} review={review} index={i} dark={dark} />
                ))}
              </AnimatePresence>
            </div>

            <CarouselDots total={reviews.length} active={activeIndex} onChange={goToReview} dark={dark} />
            <AutoPlayIndicator isPlaying={isAutoPlaying} dark={dark} />
          </div>
        </SectionWrapper>

        <TrustBadges dark={dark} />
      </div>
    </section>
  );
}

// Export alias to match your LandingPage import structure
export const Review = CustomerReviews;