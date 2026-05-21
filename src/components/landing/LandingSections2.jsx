import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ic } from './LandingIcons';
import { SectionWrapper } from './LandingSections1';
import { ParticleField, GradientOrbs, FloatFileIcons, GridBackground } from './LandingBackgrounds';

// ====== TELEGRAM BOT CREATOR ======
export const BotCreator = ({ dark }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [botConnected, setBotConnected] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const timerRef = useRef(null);

  const handleCopyToken = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectBot = () => {
    setBotConnected(true);
    setTimeout(() => setBotConnected(false), 3000);
  };

  const steps = [
    {
      step: 1,
      title: 'Open Telegram',
      subtitle: 'Launch the app on any device',
      desc: 'Download and install Telegram from your app store, or open it on your desktop. Available on iOS, Android, macOS, Windows, and Linux.',
      icon: Ic.Smartphone,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: dark ? 'bg-blue-500/10' : 'bg-blue-50',
      borderColor: dark ? 'border-blue-500/30' : 'border-blue-200',
      textColor: dark ? 'text-blue-400' : 'text-blue-600',
      accentColor: '#3B82F6',
    },
    {
      step: 2,
      title: 'Search BotFather',
      subtitle: 'Find the official bot creator',
      desc: 'Tap the search icon at the top and type "BotFather". Look for the blue verified checkmark to ensure it\'s the official bot.',
      icon: Ic.Search,
      gradient: 'from-cyan-500 to-blue-500',
      bgColor: dark ? 'bg-cyan-500/10' : 'bg-cyan-50',
      borderColor: dark ? 'border-cyan-500/30' : 'border-cyan-200',
      textColor: dark ? 'text-cyan-400' : 'text-cyan-600',
      accentColor: '#06B6D4',
    },
    {
      step: 3,
      title: 'Send /newbot',
      subtitle: 'Start the creation wizard',
      desc: 'Tap on BotFather to open the chat, then type /newbot and send it. This starts the interactive bot creation process.',
      icon: Ic.Message,
      gradient: 'from-emerald-500 to-green-500',
      bgColor: dark ? 'bg-emerald-500/10' : 'bg-emerald-50',
      borderColor: dark ? 'border-emerald-500/30' : 'border-emerald-200',
      textColor: dark ? 'text-emerald-400' : 'text-emerald-600',
      accentColor: '#10B981',
    },
    {
      step: 4,
      title: 'Enter Bot Name',
      subtitle: 'Display name for users',
      desc: 'Choose a display name for your bot. This is what users will see when they interact with it. Example: "My Awesome Bot"',
      icon: Ic.Type,
      gradient: 'from-violet-500 to-purple-500',
      bgColor: dark ? 'bg-violet-500/10' : 'bg-violet-50',
      borderColor: dark ? 'border-violet-500/30' : 'border-violet-200',
      textColor: dark ? 'text-violet-400' : 'text-violet-600',
      accentColor: '#8B5CF6',
    },
    {
      step: 5,
      title: 'Set Bot Username',
      subtitle: 'Must end with "bot"',
      desc: 'Choose a unique username that ends with "bot". This will be your bot\'s link: t.me/your_bot_name',
      icon: Ic.User,
      gradient: 'from-amber-500 to-orange-500',
      bgColor: dark ? 'bg-amber-500/10' : 'bg-amber-50',
      borderColor: dark ? 'border-amber-500/30' : 'border-amber-200',
      textColor: dark ? 'text-amber-400' : 'text-amber-600',
      accentColor: '#F59E0B',
    },
    {
      step: 6,
      title: 'Copy Bot Token',
      subtitle: 'Keep it secure!',
      desc: 'BotFather will provide your API token. Copy it and keep it safe - you\'ll need it to connect to T-Drive.',
      icon: Ic.Key,
      gradient: 'from-rose-500 to-pink-500',
      bgColor: dark ? 'bg-rose-500/10' : 'bg-rose-50',
      borderColor: dark ? 'border-rose-500/30' : 'border-rose-200',
      textColor: dark ? 'text-rose-400' : 'text-rose-600',
      accentColor: '#F43F5E',
    },
    {
      step: 7,
      title: 'Connect to T-Drive',
      subtitle: 'Dashboard integration',
      desc: 'Open T-Drive settings, paste your bot token and chat ID, then click "Connect Bot & Save".',
      icon: Ic.Settings,
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: dark ? 'bg-blue-500/10' : 'bg-blue-50',
      borderColor: dark ? 'border-blue-500/30' : 'border-blue-200',
      textColor: dark ? 'text-blue-400' : 'text-blue-600',
      accentColor: '#3B82F6',
    },
  ];

  // Unified visual content for all steps - same size container
  const StepVisualContent = ({ step }) => {
    switch (step) {
      case 0: // Open Telegram
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 sm:p-6">
            <motion.div
              className="relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <div className={`w-44 sm:w-48 h-72 sm:h-80 rounded-[2rem] ${dark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-2xl overflow-hidden relative`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4 sm:h-5 bg-black rounded-b-xl z-20" />
                <div className="bg-blue-600 h-7 sm:h-8 flex items-center justify-between px-3 sm:px-4 pt-1">
                  <span className="text-white text-[10px] font-bold">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/50" />
                    <div className="w-3 h-2 rounded bg-white/50" />
                  </div>
                </div>
                <div className="bg-blue-500 px-3 py-2 flex items-center gap-2">
                  <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">☰</div>
                  <span className="text-white text-sm font-bold">Telegram</span>
                </div>
                <div className="p-2 space-y-1.5">
                  {[
                    { name: 'BotFather', emoji: '🤖', verified: true },
                    { name: 'John Doe', emoji: '👤', verified: false },
                    { name: 'Alice Smith', emoji: '👤', verified: false },
                    { name: 'T-Drive Bot', emoji: '☁️', verified: false },
                  ].map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.12 }}
                      className={`flex items-center gap-2 p-2 rounded-lg ${c.verified ? 'bg-blue-100 border border-blue-200' : ''}`}
                    >
                      <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${c.verified ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gray-200'}`}>
                        {c.emoji}
                      </div>
                      <p className="text-[10px] font-bold text-gray-800 truncate">{c.name}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <motion.div
                className="absolute -right-4 sm:-right-6 top-10 sm:top-12 bg-white rounded-lg shadow-lg p-2 border border-gray-200"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, type: 'spring' }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-5 sm:w-6 h-5 sm:h-6 rounded bg-blue-500 flex items-center justify-center">
                    <Ic.Smartphone width={12} height={12} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">Open App</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        );
      case 1: // Search BotFather
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 sm:p-6">
            <motion.div
              className="relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <div className={`w-44 sm:w-48 h-72 sm:h-80 rounded-[2rem] ${dark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-2xl overflow-hidden relative flex flex-col`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4 sm:h-5 bg-black rounded-b-xl z-20" />
                <div className="bg-cyan-500 px-3 py-2 flex items-center gap-2 pt-6">
                  <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">←</div>
                  <span className="text-white text-sm font-bold">Search</span>
                </div>
                <div className="px-3 py-2">
                  <motion.div
                    className={`rounded-lg px-3 py-2 flex items-center gap-2 ${dark ? 'bg-gray-700 border-2 border-cyan-400' : 'bg-white border-2 border-cyan-400'}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  >
                    <Ic.Search width={12} height={12} className="text-cyan-500 flex-shrink-0" />
                    <span className="text-[11px] text-gray-600 font-medium">BotFather</span>
                  </motion.div>
                </div>
                <div className="px-3 flex-1">
                  <motion.div
                    className={`flex items-center gap-2 p-2 rounded-lg ${dark ? 'bg-cyan-500/20 border-2 border-cyan-400' : 'bg-cyan-50 border-2 border-cyan-300'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-lg flex-shrink-0">🤖</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold text-gray-800">BotFather</p>
                        <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">✓</div>
                      </div>
                      <p className="text-[9px] text-cyan-600 font-semibold">Verified Bot</p>
                    </div>
                  </motion.div>
                </div>
              </div>
              <motion.div
                className="absolute -left-3 sm:-left-4 top-16 sm:top-20 bg-white rounded-lg shadow-lg p-2 border border-gray-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
              >
                <span className="text-[10px] font-bold text-blue-600">✓ Verified</span>
              </motion.div>
            </motion.div>
          </div>
        );
      case 2: // Send /newbot
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 sm:p-6">
            <motion.div
              className={`w-52 sm:w-56 h-72 sm:h-80 rounded-[2rem] ${dark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-2xl overflow-hidden relative flex flex-col`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4 sm:h-5 bg-black rounded-b-xl z-20" />
              <div className="bg-emerald-500 px-3 py-2 flex items-center gap-2 pt-6">
                <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">←</div>
                <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-white/30 flex items-center justify-center text-sm">🤖</div>
                <div>
                  <p className="text-white text-xs font-bold">BotFather</p>
                  <p className="text-white/60 text-[9px]">bot</p>
                </div>
              </div>
              <div className="flex-1 p-3 space-y-3 bg-gray-50">
                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="bg-emerald-500 text-white text-[10px] px-3 py-1.5 rounded-xl rounded-br-md">
                    <span className="font-mono font-bold">/newbot</span>
                  </div>
                </motion.div>
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="bg-white text-gray-700 text-[10px] px-3 py-2 rounded-xl rounded-bl-md shadow-sm max-w-[80%]">
                    <p className="font-bold">Alright, a new bot. How are we going to call it?</p>
                  </div>
                </motion.div>
              </div>
              <div className="p-2 bg-white border-t border-gray-100">
                <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
                  <span className="text-gray-400 text-[10px]">Type a message...</span>
                  <div className="ml-auto w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Ic.Send width={10} height={10} className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      case 3: // Enter Bot Name
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 sm:p-6">
            <motion.div
              className={`w-52 sm:w-56 h-72 sm:h-80 rounded-[2rem] ${dark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-2xl overflow-hidden relative flex flex-col`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4 sm:h-5 bg-black rounded-b-xl z-20" />
              <div className="bg-violet-500 px-3 py-2 flex items-center gap-2 pt-6">
                <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">←</div>
                <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-white/30 flex items-center justify-center text-sm">🤖</div>
                <div>
                  <p className="text-white text-xs font-bold">BotFather</p>
                  <p className="text-white/60 text-[9px]">bot</p>
                </div>
              </div>
              <div className="flex-1 p-3 space-y-3 bg-gray-50">
                <div className="flex justify-end">
                  <div className="bg-violet-500 text-white text-[10px] px-3 py-1.5 rounded-xl rounded-br-md">
                    <span className="font-mono font-bold">/newbot</span>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white text-gray-700 text-[10px] px-3 py-1.5 rounded-xl rounded-bl-md shadow-sm">
                    <p>Please choose a name for your bot.</p>
                  </div>
                </div>
                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="bg-violet-500 text-white text-[10px] px-3 py-1.5 rounded-xl rounded-br-md">
                    My Awesome Bot
                  </div>
                </motion.div>
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="bg-white text-gray-700 text-[10px] px-3 py-1.5 rounded-xl rounded-bl-md shadow-sm">
                    <p>Good. Now let's choose a username.</p>
                  </div>
                </motion.div>
              </div>
              <div className="p-2 bg-white border-t border-gray-100">
                <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
                  <span className="text-gray-400 text-[10px]">Type a name...</span>
                  <div className="ml-auto w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-violet-500 flex items-center justify-center">
                    <Ic.Send width={10} height={10} className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      case 4: // Set Bot Username
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 sm:p-6">
            <motion.div
              className={`w-52 sm:w-56 h-72 sm:h-80 rounded-[2rem] ${dark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-2xl overflow-hidden relative flex flex-col`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4 sm:h-5 bg-black rounded-b-xl z-20" />
              <div className="bg-amber-500 px-3 py-2 flex items-center gap-2 pt-6">
                <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">←</div>
                <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-white/30 flex items-center justify-center text-sm">🤖</div>
                <div>
                  <p className="text-white text-xs font-bold">BotFather</p>
                  <p className="text-white/60 text-[9px]">bot</p>
                </div>
              </div>
              <div className="flex-1 p-3 space-y-3 bg-gray-50">
                <div className="flex justify-end">
                  <div className="bg-amber-500 text-white text-[10px] px-3 py-1.5 rounded-xl rounded-br-md">My Awesome Bot</div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white text-gray-700 text-[10px] px-3 py-1.5 rounded-xl rounded-bl-md shadow-sm">
                    <p>Choose a username. It must end in "bot".</p>
                  </div>
                </div>
                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="bg-amber-500 text-white text-[10px] px-3 py-1.5 rounded-xl rounded-br-md font-mono font-bold">
                    my_awesome_bot
                  </div>
                </motion.div>
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="bg-white text-gray-700 text-[10px] px-3 py-1.5 rounded-xl rounded-bl-md shadow-sm">
                    <p className="font-bold text-emerald-600">✓ Done! Your bot is ready.</p>
                  </div>
                </motion.div>
              </div>
              <div className="p-2 bg-white border-t border-gray-100">
                <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
                  <span className="text-gray-400 text-[10px]">Type username...</span>
                  <div className="ml-auto w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-amber-500 flex items-center justify-center">
                    <Ic.Send width={10} height={10} className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      case 5: // Copy Bot Token
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 sm:p-6">
            <motion.div
              className={`w-full max-w-xs rounded-2xl ${dark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-2xl overflow-hidden`}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-5 flex items-center gap-4">
                <motion.div
                  className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-white/20 flex items-center justify-center text-white"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Ic.Key />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base">Your Bot Token</h3>
                  <p className="text-white/70 text-xs">Generated by BotFather</p>
                </div>
                <motion.div
                  className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-white/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Ic.Lock className="text-white" width={18} height={18} />
                </motion.div>
              </div>
              <div className="p-5">
                <div className={`flex items-center gap-3 p-3 rounded-xl ${dark ? 'bg-gray-700/50 border border-gray-600' : 'bg-rose-50 border border-rose-200'}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-[11px] break-all ${dark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      123456789:AAExampleBotTokenHere
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyToken}
                    className={`px-3 py-2 rounded-lg font-bold text-[10px] flex items-center gap-1 flex-shrink-0 ${copied ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'}`}
                  >
                    {copied ? <><Ic.CheckCircle /> Copied</> : <><Ic.Copy /> Copy</>}
                  </motion.button>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200"
                >
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <p className="text-[10px] text-amber-700 font-medium">
                    Never share your bot token publicly. Anyone with this token can control your bot.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        );
      case 6: // Connect to T-Drive
        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className={`w-full max-w-xs rounded-2xl overflow-hidden ${dark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-2xl`}
            >
              <div className={`px-4 py-4 border-b ${dark ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>Bot Integration</h3>
                    <p className={`text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Connect your bot</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                  <Ic.CheckCircle /> LOCAL
                </div>
              </div>
              <div className="px-4 py-3 space-y-3">
                <div>
                  <label className={`text-[10px] font-bold mb-1 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Bot Name</label>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${dark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <span className="text-gray-400 text-xs">@</span>
                    <input value="imteaj_t_drive_bot" readOnly className={`flex-1 bg-transparent outline-none font-mono text-[11px] ${dark ? 'text-white' : 'text-gray-800'}`} />
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] font-bold mb-1 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>API Token</label>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${dark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <span className={`font-mono text-[11px] tracking-widest flex-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>••••••••••••••••••••</span>
                    <button className="text-blue-500 hover:text-blue-600"><Ic.Copy /></button>
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] font-bold mb-1 block ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Chat ID</label>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${dark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <input value="790875483" readOnly className={`flex-1 bg-transparent outline-none font-mono text-[11px] ${dark ? 'text-white' : 'text-gray-800'}`} />
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConnectBot}
                  disabled={botConnected}
                  className={`w-full py-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 transition-all ${botConnected ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'}`}
                >
                  <AnimatePresence mode="wait">
                    {botConnected ? (
                      <motion.span key="connected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Ic.CheckCircle /> Connected!
                      </motion.span>
                    ) : (
                      <motion.span key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Ic.Send /> Connect Bot & Save
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  const startAutoPlay = () => {
    setAutoPlay(true);
    setActiveStep(0);
  };

  const stopAutoPlay = () => {
    setAutoPlay(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (autoPlay && activeStep < steps.length - 1) {
      timerRef.current = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 4500);
    } else if (autoPlay && activeStep === steps.length - 1) {
      setAutoPlay(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlay, activeStep, steps.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveStep(prev => Math.min(steps.length - 1, prev + 1));
        stopAutoPlay();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveStep(prev => Math.max(0, prev - 1));
        stopAutoPlay();
      } else if (e.key === ' ') {
        e.preventDefault();
        autoPlay ? stopAutoPlay() : startAutoPlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [autoPlay, steps.length]);

  return (
    <section id="bot-creator" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-blue-500/5 blur-3xl" />
      {/* Background animations are mounted at page-level (LandingPage) */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionWrapper className="text-center mb-12 sm:mb-16">
          <motion.div 
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold mb-6 ${dark ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200'}`}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Ic.Rocket /> Interactive Step-by-Step Guide
          </motion.div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
            Create Your Telegram Bot{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">in 7 Easy Steps</span>
          </h2>
          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            Follow along with our interactive guide. Watch each step come to life with animated Telegram simulations.
          </p>
        </SectionWrapper>

        {/* Horizontal Step Progress Bar */}
        <SectionWrapper className="mb-8">
          <div className={`rounded-2xl p-4 sm:p-6 ${dark ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/70 border border-white shadow-xl'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Progress: Step {activeStep + 1} of {steps.length}</h3>
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onClick={autoPlay ? stopAutoPlay : startAutoPlay}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${autoPlay ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                >
                  {autoPlay ? <Ic.Pause /> : <Ic.Play />} {autoPlay ? 'Stop' : 'Auto Play'}
                </motion.button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
                animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-between mt-4 px-1">
              {steps.map((step, i) => {
                const isActive = activeStep === i;
                const isCompleted = i < activeStep;
                return (
                  <button
                    key={i}
                    onClick={() => { setActiveStep(i); stopAutoPlay(); }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <motion.div 
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold transition-all relative ${isActive ? `bg-gradient-to-r ${step.gradient} text-white shadow-lg scale-110` : isCompleted ? 'bg-emerald-500 text-white' : (dark ? 'bg-gray-700 text-gray-500 group-hover:bg-gray-600' : 'bg-gray-200 text-gray-400 group-hover:bg-gray-300')}`}
                      whileHover={{ scale: isActive ? 1.1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isCompleted ? <Ic.CheckCircle /> : step.step}
                      {isActive && (
                        <motion.div 
                          className={`absolute inset-0 rounded-xl bg-gradient-to-r ${step.gradient}`}
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                    <span className={`text-[10px] font-medium hidden sm:block ${isActive ? (dark ? 'text-white' : 'text-gray-800') : (dark ? 'text-gray-600' : 'text-gray-400')}`}>
                      {step.title.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </SectionWrapper>

        {/* Main Content - FIXED: Uniform card sizes */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left: Step Details */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {steps.map((step, index) => (
                activeStep === index && (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 30 }} 
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    {/* Step Info Card - FIXED: Consistent height */}
                    <div className={`rounded-3xl p-6 sm:p-8 min-h-[280px] sm:min-h-[320px] flex flex-col ${step.bgColor} ${step.borderColor} border shadow-lg`}>
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <motion.div 
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center shadow-lg flex-shrink-0`}
                          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                          transition={{ duration: 0.6 }}
                        >
                          <step.icon />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg ${dark ? 'bg-gray-700 text-gray-300' : 'bg-white/80 text-gray-600'}`}>
                              Step {step.step}
                            </span>
                            {index > 0 && (
                              <motion.span 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600`}
                              >
                                <Ic.CheckCircle /> Done
                              </motion.span>
                            )}
                          </div>
                          <h3 className={`text-lg sm:text-xl font-black ${dark ? 'text-white' : 'text-gray-800'}`}>{step.title}</h3>
                          <p className={`text-xs sm:text-sm ${step.textColor} font-medium`}>{step.subtitle}</p>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className={`text-sm flex-1 ${dark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>{step.desc}</p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3 mt-4">
                      <motion.button 
                        onClick={() => { setActiveStep(Math.max(0, activeStep - 1)); stopAutoPlay(); }} 
                        disabled={activeStep === 0}
                        whileHover={{ scale: activeStep === 0 ? 1 : 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeStep === 0 ? 'opacity-40 cursor-not-allowed' : ''} ${dark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-50 shadow-sm border border-gray-200'}`}
                      >
                        <Ic.ChevronLeft /> <span className="hidden sm:inline">Previous</span>
                      </motion.button>
                      <motion.button 
                        onClick={() => { setActiveStep(Math.min(steps.length - 1, activeStep + 1)); stopAutoPlay(); }} 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-3.5 rounded-2xl bg-gradient-to-r ${step.gradient} text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all`}
                      >
                        {activeStep === steps.length - 1 ? <><Ic.CheckBadge /> Done!</> : <>Next Step <Ic.ChevronRight /></>}
                      </motion.button>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Right: Visual Preview - FIXED: Uniform container */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {steps.map((step, index) => (
                activeStep === index && (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: 50, scale: 0.95 }} 
                    animate={{ opacity: 1, x: 0, scale: 1 }} 
                    exit={{ opacity: 0, x: -50, scale: 0.95 }} 
                    transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                    className={`rounded-3xl min-h-[400px] sm:min-h-[480px] flex items-center justify-center ${dark ? 'bg-gray-800/30 border border-gray-700/30' : 'bg-gradient-to-br from-gray-50 to-white border border-white shadow-lg'}`}
                  >
                    <StepVisualContent step={index} />
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Reference Commands */}
        <SectionWrapper className="mt-16 sm:mt-20">
          <h3 className={`text-xl sm:text-2xl font-black text-center mb-8 ${dark ? 'text-white' : 'text-gray-800'}`}>Quick Reference Commands</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { cmd: '/newbot', desc: 'Create a new bot', gradient: 'from-blue-500 to-cyan-500' },
              { cmd: '/mybots', desc: 'Manage your bots', gradient: 'from-emerald-500 to-green-500' },
              { cmd: '/token', desc: 'Get API token', gradient: 'from-purple-500 to-pink-500' },
            ].map((cmd, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1 }} 
                whileHover={{ y: -5, scale: 1.02 }}
                className={`p-5 sm:p-6 rounded-3xl ${dark ? 'bg-gray-800/50 border border-gray-700/40' : 'bg-white/70 border border-white shadow-sm'}`}
              >
                <div className={`inline-flex px-4 py-2 rounded-xl bg-gradient-to-r ${cmd.gradient} text-white font-mono font-bold text-base sm:text-lg shadow-lg mb-3`}>
                  {cmd.cmd}
                </div>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{cmd.desc}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
};

// ====== PRICING ======
export const Pricing = ({ dark }) => {
  const plans = [
    { name: 'Free', price: '$0', period: 'forever', features: ['5 GB Storage', 'Telegram Bot Access', 'Basic Sharing', 'Web Dashboard'], cta: 'Get Started', popular: false },
    { name: 'Pro', price: '$9', period: '/month', features: ['100 GB Storage', 'Priority Bot Access', 'Advanced Sharing', 'File Preview', 'API Access', 'Custom Domain'], cta: 'Start Pro Trial', popular: true },
    { name: 'Enterprise', price: '$29', period: '/month', features: ['Unlimited Storage', 'Dedicated Bot', 'Team Management', 'Analytics Dashboard', 'White Label', '24/7 Support'], cta: 'Contact Sales', popular: false },
  ];
  return (
    <section id="pricing" className="py-20 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-12 sm:mb-16">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Pricing</h2>
        </SectionWrapper>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <SectionWrapper key={i}>
              <motion.div whileHover={{ y: -8 }} className={`relative p-6 sm:p-8 rounded-3xl overflow-hidden ${p.popular ? 'bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/30 lg:scale-105' : (dark ? 'bg-gray-800/50 border border-gray-700/40' : 'bg-white/70 border border-white shadow-lg')}`}>
                <h3 className="text-lg sm:text-xl font-bold mb-2 relative z-10">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-6 relative z-10">
                  <span className="text-3xl sm:text-4xl font-black">{p.price}</span>
                  <span className={`text-sm ${p.popular ? 'text-white/70' : (dark ? 'text-gray-500' : 'text-gray-400')}`}>{p.period}</span>
                </div>
                <ul className="space-y-3 mb-6 sm:mb-8 relative z-10">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <span className={p.popular ? 'text-white' : 'text-emerald-500'}><Ic.Check /></span>
                      <span className={p.popular ? 'text-white/90' : (dark ? 'text-gray-400' : 'text-gray-600')}>{f}</span>
                    </li>
                  ))}
                </ul>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-2xl font-bold text-sm relative z-10 ${p.popular ? 'bg-white text-emerald-600 shadow-lg' : (dark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200')}`}>
                  {p.cta}
                </motion.button>
              </motion.div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

// ====== FAQ ======
export const FAQ = ({ dark }) => {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'How does the Telegram bot work?', a: 'Simply add @TDriveBot on Telegram and start chatting. Send files directly to the bot, use commands like /list to view files, or /share to generate links.' },
    { q: 'Is my data secure?', a: 'Yes. All files are encrypted end-to-end before being stored. Only you hold the encryption keys, ensuring complete privacy.' },
  ];
  return (
    <section id="faq" className="py-20 sm:py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-12 sm:mb-16">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>FAQ</h2>
        </SectionWrapper>
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((f, i) => (
            <SectionWrapper key={i}>
              <div className={`rounded-2xl overflow-hidden ${dark ? 'bg-gray-800/40 border border-gray-700/40' : 'bg-white/70 border border-white shadow-sm'}`}>
                <button onClick={() => setOpen(open === i ? null : i)} className={`w-full flex items-center justify-between p-4 sm:p-6 text-left transition-colors ${dark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}>
                  <span className={`font-semibold text-sm sm:text-base ${dark ? 'text-white' : 'text-gray-800'}`}>{f.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} className={`flex-shrink-0 ${dark ? 'text-gray-400' : 'text-gray-500'}`}><Ic.ChevronDown /></motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <p className={`px-4 sm:px-6 pb-4 sm:pb-6 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

// ====== CTA SECTION ======
export const CTA = ({ dark, onLoginClick }) => (
  <section className="py-20 sm:py-24 relative">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <SectionWrapper>
        <motion.div className={`relative overflow-hidden p-8 sm:p-12 rounded-3xl text-center ${dark ? 'bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-800/50' : 'bg-gradient-to-br from-emerald-500 to-teal-400'} shadow-2xl`}>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">Start storing smarter today</h2>
            <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-lg mx-auto">Join thousands of users who trust T-Drive for their cloud storage needs.</p>
            <motion.button onClick={onLoginClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl bg-white text-emerald-600 font-bold text-base sm:text-lg shadow-xl flex items-center gap-2 mx-auto">
              <Ic.Bot /> Start Free with Telegram
            </motion.button>
          </div>
        </motion.div>
      </SectionWrapper>
    </div>
  </section>
);

// ====== FOOTER ======
export const Footer = ({ dark }) => (
  <footer className={`py-12 sm:py-16 border-t ${dark ? 'border-gray-800' : 'border-gray-200'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
      <p className={`text-sm ${dark ? 'text-gray-600' : 'text-gray-400'}`}>© 2026 T-Drive. All rights reserved.</p>
    </div>
  </footer>
);
