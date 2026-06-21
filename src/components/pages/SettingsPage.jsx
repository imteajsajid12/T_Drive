import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';
import { account, getTelegramConfig, saveTelegramConfig } from '../../lib/supabase';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export const SettingsPage = ({ isDark, user, setUser }) => {
  const [tgName, setTgName] = useState('@t-drive_bot');
  const [tgToken, setTgToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [configSource, setConfigSource] = useState('local'); // 'supabase' or 'local'

  // Dynamic Profile Edit States
  const [fullName, setFullName] = useState(user?.name || user?.user_metadata?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Reset States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Telegram chat-ID auto-detect
  const [isFetchingChatId, setIsFetchingChatId] = useState(false);

  const displayName = fullName.trim() || user?.name?.trim() || 'Your Name';
  const displayInitial = displayName.slice(0, 1).toUpperCase();
  const getUserStorageKey = (suffix, userId = user?.$id || 'guest') => `tDrive:${userId}:${suffix}`;
  const readUserStorage = (suffix, userId = user?.$id || 'guest') => localStorage.getItem(getUserStorageKey(suffix, userId));
  const writeUserStorage = (suffix, value, userId = user?.$id || 'guest') => localStorage.setItem(getUserStorageKey(suffix, userId), value);

  useEffect(() => {
    if (user?.name || user?.user_metadata?.name) {
      setFullName(user.name || user.user_metadata?.name || '');
    }
  }, [user]);

  useEffect(() => {
    // Load Telegram config from Appwrite first, then fallback to localStorage
    const loadTelegramConfig = async () => {
      setIsLoading(true);
      try {
        const userId = user?.$id || 'default'; // Use user ID or default
        const supabaseConfig = await getTelegramConfig(userId);
        
        if (supabaseConfig) {
          // Load from Appwrite
          setTgName(supabaseConfig.name || '@imteaj_t_drive_bot');
          setTgToken(supabaseConfig.token || '');
          setTgChatId(supabaseConfig.chat_id || '');
          setConfigSource('supabase');
          writeUserStorage('tgBotName', supabaseConfig.name || '', userId);
          writeUserStorage('tgBotToken', supabaseConfig.token || '', userId);
          writeUserStorage('tgChatId', supabaseConfig.chat_id || '', userId);
        } else {
          // Fallback to localStorage
          const savedName = readUserStorage('tgBotName', userId);
          const savedToken = readUserStorage('tgBotToken', userId);
          const savedChatId = readUserStorage('tgChatId', userId);
          if (savedName) setTgName(savedName);
          if (savedToken) setTgToken(savedToken);
          if (savedChatId) setTgChatId(savedChatId);
          setConfigSource('local');
        }
      } catch (err) {
        console.error('Error loading Telegram config from Appwrite:', err);
        // Fallback to localStorage on error
        const userId = user?.$id || 'guest';
        const savedName = readUserStorage('tgBotName', userId);
        const savedToken = readUserStorage('tgBotToken', userId);
        const savedChatId = readUserStorage('tgChatId', userId);
        if (savedName) setTgName(savedName);
        if (savedToken) setTgToken(savedToken);
        if (savedChatId) setTgChatId(savedChatId);
        setConfigSource('local');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadTelegramConfig();
    }
  }, [user]);

  const swalBase = () => ({
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#1e293b',
    customClass: {
      popup: 'rounded-3xl shadow-2xl',
      confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-white',
      cancelButton: 'px-6 py-2.5 rounded-xl font-bold',
    },
  });

  const fetchChatIdFromTelegram = async () => {
    if (!tgToken.trim()) {
      Swal.fire({
        title: 'Token Required',
        text: 'Enter your Bot API Token first, then click Auto-detect.',
        icon: 'warning',
        iconColor: '#f59e0b',
        confirmButtonColor: '#0088cc',
        confirmButtonText: 'OK',
        ...swalBase(),
      });
      return;
    }

    setIsFetchingChatId(true);
    try {
      const res = await fetch(`https://api.telegram.org/bot${tgToken.trim()}/getUpdates`);
      const data = await res.json();

      if (!data.ok) {
        Swal.fire({
          title: 'Invalid Bot Token',
          text: data.description || 'Could not connect to Telegram. Double-check your bot token.',
          icon: 'error',
          iconColor: '#ef4444',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          ...swalBase(),
        });
        return;
      }

      const update = data.result?.find(u => u.message?.chat?.id);

      if (update) {
        const chatId = String(update.message.chat.id);
        const chatLabel =
          update.message.chat.first_name ||
          update.message.chat.title ||
          update.message.chat.username ||
          'your chat';
        setTgChatId(chatId);
        Swal.fire({
          title: 'Chat ID Detected!',
          html: `
            <p style="font-size:13px;margin-bottom:10px;">Your Chat ID has been auto-filled:</p>
            <div style="font-family:monospace;font-size:22px;font-weight:900;color:#0088cc;background:${isDark ? '#0f172a' : '#eff6ff'};padding:10px 18px;border-radius:12px;letter-spacing:2px;">${chatId}</div>
            <p style="font-size:11px;margin-top:10px;opacity:.6;">From: ${chatLabel}</p>
          `,
          icon: 'success',
          iconColor: '#10b981',
          confirmButtonColor: '#0088cc',
          confirmButtonText: 'Great!',
          ...swalBase(),
        });
      } else {
        Swal.fire({
          title: 'No Messages Found',
          html: `
            <p style="font-size:13px;margin-bottom:12px;">Your bot hasn't received any messages yet.</p>
            <p style="font-size:13px;font-weight:700;margin-bottom:8px;">To get your Chat ID:</p>
            <ol style="text-align:left;font-size:13px;padding-left:18px;line-height:2;">
              <li>Open <strong>Telegram</strong></li>
              <li>Search for your bot: <strong>${tgName || 'your bot'}</strong></li>
              <li>Send any message, e.g. <code style="background:${isDark ? '#0f172a' : '#f1f5f9'};padding:1px 6px;border-radius:4px;">/start</code></li>
              <li>Click <strong>Auto-detect Chat ID</strong> again</li>
            </ol>
          `,
          icon: 'info',
          iconColor: '#0088cc',
          confirmButtonColor: '#0088cc',
          confirmButtonText: 'Got it!',
          ...swalBase(),
        });
      }
    } catch (err) {
      toast.error('Network error — could not reach Telegram API.');
    } finally {
      setIsFetchingChatId(false);
    }
  };

  const saveTelegramConfigHandler = async () => {
    if (!tgName || !tgToken || !tgChatId) {
      toast.error('Please fill in all Telegram configuration fields.');
      return;
    }

    setIsSaving(true);
    try {
      const userId = user?.$id || 'default';
      const config = {
        name: tgName,
        token: tgToken,
        chatId: tgChatId
      };

      await saveTelegramConfig(userId, config);

      writeUserStorage('tgBotName', tgName, userId);
      writeUserStorage('tgBotToken', tgToken, userId);
      writeUserStorage('tgChatId', tgChatId, userId);

      setConfigSource('supabase');
      setIsSaved(true);

      // Notify App.jsx to re-check config readiness and kick off a fresh sync
      window.dispatchEvent(new Event('telegramConfigUpdated'));
      window.dispatchEvent(new Event('telegramFullSyncRequested'));

      Swal.fire({
        title: 'Bot Connected!',
        html: `
          <p style="font-size:13px;margin-bottom:8px;">Your Telegram bot is now connected to T-Drive.</p>
          <p style="font-size:12px;opacity:.6;">Bot: <strong>${tgName}</strong> &nbsp;|&nbsp; Chat ID: <strong>${tgChatId}</strong></p>
        `,
        icon: 'success',
        iconColor: '#10b981',
        confirmButtonColor: '#0088cc',
        confirmButtonText: 'Start Using',
        ...swalBase(),
      });

      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error('Error saving Telegram config:', err);

      const userId = user?.$id || 'guest';
      writeUserStorage('tgBotName', tgName, userId);
      writeUserStorage('tgBotToken', tgToken, userId);
      writeUserStorage('tgChatId', tgChatId, userId);

      setConfigSource('local');
      setIsSaved(true);
      toast.warning('Saved to local storage (database connection issue)');
      setTimeout(() => setIsSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = async () => {
    if (!fullName) return toast.error('Name cannot be empty.');
    setIsUpdatingProfile(true);
    try {
      const updatedUser = await account.updateName(fullName);
      if (setUser) {
        setUser((prev) => ({ ...prev, ...updatedUser }));
      }
      setFullName(updatedUser?.name || fullName);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const updatePassword = async () => {
    if (!oldPassword || !newPassword) return toast.error('Please enter both passwords.');
    if (newPassword.length < 8) return toast.error('New password must be at least 8 characters.');
    
    setIsUpdatingPassword(true);
    try {
      await account.updatePassword(newPassword, oldPassword);
      toast.success('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password. Check old password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>Settings</h1>
      
      {/* Profile Section */}
      <div className={`rounded-3xl p-6 transition-all ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm hover:shadow-md`}>
        <h2 className={`font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}><Ic.Users /> Profile</h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-500/20 bg-linear-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
              <span className="text-3xl font-black text-white">{displayInitial}</span>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute -bottom-3 -right-3 p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"><Ic.Image /></motion.button>
          </div>
          <div className="flex-1 w-full space-y-4">
            <div>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{displayName}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-700' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} 
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
              <input 
                type="email" 
                value={user?.email || 'admin@example.com'} 
                disabled 
                className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all opacity-70 cursor-not-allowed ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-700' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} 
              />
              <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Email cannot be changed directly from here.</p>
            </div>
            <motion.button 
              onClick={updateProfile} 
              disabled={isUpdatingProfile}
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className={`px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 ${isUpdatingProfile ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Security Section (Password Update) */}
      <div className={`rounded-3xl p-6 transition-all ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm hover:shadow-md`}>
        <h2 className={`font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}><Ic.Lock /> Security</h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Old Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-emerald-500' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-emerald-500'}`} 
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>New Password</label>
            <input 
              type="password" 
              placeholder="•••••••• (Min. 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-emerald-500' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-emerald-500'}`} 
            />
          </div>
          <div className="pt-2">
            <motion.button 
              onClick={updatePassword}
              disabled={isUpdatingPassword}
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all bg-red-500 text-white hover:bg-red-600 shadow-red-500/20 ${isUpdatingPassword ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Telegram Configuration Section */}
      <div className={`rounded-3xl p-6 transition-all ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm hover:shadow-md`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <span className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center text-white scale-90">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>
            </span>
            Telegram Bot Integration
          </h2>
          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${configSource === 'supabase' ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600') : (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600')}`}>
            {isLoading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"></motion.div>
                LOADING
              </>
            ) : (
              <>
                <Ic.Check className="w-3 h-3" />
                {configSource === 'supabase' ? 'SUPABASE DATABASE' : 'LOCAL STORAGE'}
              </>
            )}
          </span>
        </div>
        
        <p className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Connect your custom Telegram bot (e.g., <code className={`${isDark ? 'bg-gray-700 text-emerald-400' : 'bg-gray-100 text-emerald-600'} px-1.5 py-0.5 rounded`}>t.me/imteaj_t_drive_bot</code>) to back up your dashboard files directly through Telegram's API infrastructure.
        </p>

        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Bot Name</label>
            <input 
              type="text" 
              placeholder="t_drive_bot"
              value={tgName}
              onChange={(e) => setTgName(e.target.value)}
              disabled={isLoading}
              className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-indigo-500'}`} 
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>HTTP API Token</label>
            <input 
              type="password" 
              placeholder="e.g. 2345678:"
              value={tgToken}
              onChange={(e) => setTgToken(e.target.value)}
              disabled={isLoading}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono tracking-wider outline-none transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-indigo-500'}`} 
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your Telegram Chat ID</label>
              <motion.button
                type="button"
                onClick={fetchChatIdFromTelegram}
                disabled={isLoading || isFetchingChatId}
                whileHover={!isLoading && !isFetchingChatId ? { scale: 1.03 } : {}}
                whileTap={!isLoading && !isFetchingChatId ? { scale: 0.97 } : {}}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all
                  ${isFetchingChatId ? 'opacity-70 cursor-wait' : ''}
                  ${isDark ? 'bg-[#0088cc]/20 text-[#38bdf8] hover:bg-[#0088cc]/30 border border-[#0088cc]/30' : 'bg-[#e8f4fc] text-[#0088cc] hover:bg-[#d0eaf8] border border-[#0088cc]/20'}`}
              >
                {isFetchingChatId ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>
                )}
                {isFetchingChatId ? 'Detecting…' : 'Auto-detect Chat ID'}
              </motion.button>
            </div>
            <input
              type="text"
              placeholder="e.g. 123456789  — or click Auto-detect above"
              value={tgChatId}
              onChange={(e) => setTgChatId(e.target.value)}
              disabled={isLoading || isFetchingChatId}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono tracking-wider outline-none transition-all
                ${isLoading || isFetchingChatId ? 'opacity-50 cursor-not-allowed' : ''}
                ${isDark ? 'bg-gray-700/50 border border-gray-600 text-white focus:border-indigo-500' : 'bg-gray-50 border border-gray-200 text-gray-800 focus:border-indigo-500'}`}
            />
            <p className={`text-[10px] mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Enter your token above, then click <strong>Auto-detect</strong> — or get it manually from <strong>@userinfobot</strong> on Telegram.
            </p>
          </div>
          <div className="pt-2">
            <motion.button 
              onClick={saveTelegramConfigHandler}
              disabled={isSaving || isLoading}
              whileHover={!isSaving && !isLoading ? { scale: 1.02 } : {}} 
              whileTap={!isSaving && !isLoading ? { scale: 0.98 } : {}} 
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${isSaving || isLoading ? 'opacity-70 cursor-wait' : ''} ${isSaved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-[#0088cc] text-white shadow-[#0088cc]/20'}`}
            >
              {isSaving ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></motion.div>
                  Saving to Appwrite...
                </>
              ) : isSaved ? (
                <><Ic.Check /> Connected & Saved!</>
              ) : (
                'Connect Bot & Save'
              )}
            </motion.button>
            {configSource === 'local' && !isSaving && (
              <p className={`text-[10px] mt-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                ⚠ Currently using local storage. Click the button above to migrate to Appwrite database.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className={`rounded-3xl p-6 transition-all ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm hover:shadow-md`}>
        <h2 className={`font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}><Ic.Bell /> Notifications</h2>
        <div className="space-y-4">
          {[
            { t: 'Email Alerts', d: 'Receive daily summary of activity' },
            { t: 'Push Notifications', d: 'Real-time alerts for shared files' },
            { t: 'Marketing', d: 'Updates, news, and special offers' }
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{n.t}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{n.d}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDark ? 'peer-checked:bg-emerald-500' : 'peer-checked:bg-emerald-500'}`}></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
