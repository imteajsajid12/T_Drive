"use client";

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ic } from '../../icons';

const isIOSDevice = () => {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
};

const isStandaloneMode = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

export const PWARegistration = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [dismissIOSHint, setDismissIOSHint] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });

    return undefined;
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIOSHint(false);
    };

    if (isStandaloneMode()) {
      setIsInstalled(true);
      return undefined;
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (isIOSDevice()) {
      setShowIOSHint(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const shouldShowIOSHint = showIOSHint && !dismissIOSHint && !deferredPrompt;

  return (
    <AnimatePresence>
      {deferredPrompt && (
        <motion.button
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
          }}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-400 px-4 py-3 text-white shadow-2xl shadow-emerald-500/30 backdrop-blur-xl"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Ic.Download />
          </span>
          <span className="text-left">
            <span className="block text-sm font-black leading-none">Install T-Drive</span>
            <span className="block text-[11px] opacity-80">Android, desktop, and more</span>
          </span>
        </motion.button>
      )}

      {shouldShowIOSHint && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-5 left-5 right-5 z-50 mx-auto max-w-md rounded-3xl border border-white/60 bg-white/90 p-4 shadow-2xl shadow-black/10 backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <Ic.Download />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-gray-900">Install T-Drive on iPhone</p>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                Tap the Share button in Safari, then choose Add to Home Screen.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDismissIOSHint(true)}
              className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
