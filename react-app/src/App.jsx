"use client";
import React, { useState, useEffect } from 'react';
import { ThemeContext } from './contexts';
import { initialFiles } from './data';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobNav } from './components/layout/MobNav';
import { UploadModal } from './components/modals/UploadModal';
import { MediaPreview } from './components/modals/MediaPreview';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { Dashboard } from './components/pages/Dashboard';
import { LoginPage } from './components/pages/LoginPage';
import { BackgroundBlobs } from './components/ui/Utils';
import { client, account } from './lib/appwrite';
import { Toaster, toast } from 'sonner';
import { useRef } from 'react';

export default function App() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mob, setMob] = useState(false);
  const [cat, setCat] = useState('home');
  const [q, setQ] = useState('');
  const [files, setFiles] = useState(initialFiles);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const [upOpen, setUpOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // Ping Appwrite server to verify setup
    client.ping().then(() => console.log('Appwrite pinged successfully!')).catch(console.error);
    
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const u = await account.get();
        setUser(u);
        setAuth(true);
      } catch (err) {
        console.warn('No active session found.');
        setAuth(false);
      }
    };
    checkSession();

    // 1. Initial theme load
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
    
    // 2. Load stored files from local storage
    try {
      const savedFiles = localStorage.getItem('tDriveFiles');
      if (savedFiles) {
        setFiles(JSON.parse(savedFiles));
      } else {
        setFiles(initialFiles);
      }
    } catch (e) {
      console.warn("Storage quota or parse error on load", e);
    }
  }, []);

  // Save files to local storage whenever they change
  useEffect(() => {
    try {
      if (files !== initialFiles) {
        localStorage.setItem('tDriveFiles', JSON.stringify(files));
      }
    } catch (e) {
      console.warn("Local storage quota exceeded! Couldn't save file contents.", e);
      // Fallback: store files WITHOUT their bulky base64 dataUrl properties to respect localStorage limits
      const lightFiles = files.map(({ url, ...rest }) => rest);
      localStorage.setItem('tDriveFiles', JSON.stringify(lightFiles));
    }
  }, [files]);

  // Telegram Auto-Sync Logic
  useEffect(() => {
    if (!auth) return;

    const syncWithTelegram = async () => {
      const tgToken = localStorage.getItem('tgBotToken');
      if (!tgToken) return;

      try {
        let offset = localStorage.getItem('tgSyncOffset') || 0;
        const res = await fetch(`https://api.telegram.org/bot${tgToken}/getUpdates?allowed_updates=["message"]&offset=${offset}`);
        const data = await res.json();
        if (!data.ok || !data.result || data.result.length === 0) return;

        let maxUpdateId = 0;
        const newFiles = [];
        // We use a set of existing IDs to prevent duplicates
        const existingIds = new Set(filesRef.current.map(f => f.id));

        for (const update of data.result) {
          if (update.update_id > maxUpdateId) {
            maxUpdateId = update.update_id;
          }
          const msg = update.message;
          if (!msg) continue;

          let tgFile = null;
          let type = 'other';
          let name = 'tg_file';

          if (msg.document) {
            tgFile = msg.document;
            type = tgFile.mime_type?.includes('image') ? 'image' 
                 : tgFile.mime_type?.includes('video') ? 'video' 
                 : tgFile.mime_type?.includes('audio') ? 'music' : 'doc';
            name = tgFile.file_name || `document_${msg.message_id}`;
          } else if (msg.photo && msg.photo.length > 0) {
            tgFile = msg.photo[msg.photo.length - 1]; // Highest resolution
            type = 'image';
            name = `photo_${msg.message_id}.jpg`;
          } else if (msg.video) {
            tgFile = msg.video;
            type = 'video';
            name = tgFile.file_name || `video_${msg.message_id}.mp4`;
          } else if (msg.audio) {
            tgFile = msg.audio;
            type = 'music';
            name = tgFile.file_name || `audio_${msg.message_id}.mp3`;
          }

          if (tgFile) {
            const fileId = `tg_${msg.message_id}`;
            
            if (!existingIds.has(fileId)) {
              // Get actual file path URL from TG
              const pathRes = await fetch(`https://api.telegram.org/bot${tgToken}/getFile?file_id=${tgFile.file_id}`);
              const pathData = await pathRes.json();
              
              let previewUrl = '';
              if (pathData.ok) {
                previewUrl = `https://api.telegram.org/file/bot${tgToken}/${pathData.result.file_path}`;
              }

              let sizeStr = '0 KB';
              if (tgFile.file_size) {
                sizeStr = tgFile.file_size > 1024 * 1024 
                  ? (tgFile.file_size / (1024 * 1024)).toFixed(1) + ' MB' 
                  : (tgFile.file_size / 1024).toFixed(1) + ' KB';
              }
              const dateStr = new Date(msg.date * 1000).toISOString().split('T')[0];

              newFiles.push({
                id: fileId,
                name: name,
                type: type,
                size: sizeStr,
                date: dateStr,
                preview: previewUrl,
                thumb: type === 'image' || type === 'video' ? previewUrl : null,
                url: previewUrl,
                star: false,
                source: 'telegram'
              });
              existingIds.add(fileId);
            }
          }
        }

        if (maxUpdateId > 0) {
          localStorage.setItem('tgSyncOffset', maxUpdateId + 1);
        }

        if (newFiles.length > 0) {
          setFiles(prev => {
            const updated = [...newFiles, ...prev];
            localStorage.setItem('tDriveFiles', JSON.stringify(updated));
            return updated;
          });
          toast.success(`Synced ${newFiles.length} new files from Telegram!`);
        } else if (data.result.length > 0) {
          // If we had updates but no new files (e.g. duplicates), we can silently ignore.
          // But it's good to know we processed them.
        }
      } catch (err) {
        console.error('Telegram sync error:', err);
        // Silently fail on network issues to not annoy the user
      }
    };

    syncWithTelegram();
    
    // Listen for manual sync requests from Dashboard
    const manualSyncListener = () => {
      syncWithTelegram();
    };
    window.addEventListener('telegramSyncRequested', manualSyncListener);

    // Setup interval to sync every 30 seconds
    const intervalId = setInterval(syncWithTelegram, 30000);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('telegramSyncRequested', manualSyncListener);
    };
  }, [auth]); // Re-run when files loads initially or auth changes

  const handleUpload = (newFile) => {
    setFiles(prev => [newFile, ...prev]);
  };

  const handleDelete = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  // ----------------------------------------------------
  // RENDER APP Content
  // ----------------------------------------------------
  if (!auth) return <LoginPage isDark={isDark} onLogin={async () => {
    try {
      const u = await account.get();
      setUser(u);
      setAuth(true);
    } catch(e) {
      console.error(e);
    }
  }} />;

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setAuth(false);
      setUser(null);
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <Toaster position="top-right" richColors theme={isDark ? 'dark' : 'light'} />
      <div className={`flex h-screen overflow-hidden transition-colors duration-500 font-sans ${isDark ? 'bg-[#0f172a] text-white selection:bg-emerald-500/30' : 'bg-[#f4f7f6] text-gray-900 selection:bg-emerald-200'}`}>
        
        {/* Background Decorative Blobs */}
        <BackgroundBlobs isDark={isDark} />

        {/* Sidebar Component */}
        <Sidebar 
          cat={cat} 
          setCat={setCat} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          isDark={isDark} 
          mob={mob} 
          setMob={setMob} 
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full h-full pb-16 md:pb-0 overflow-hidden">
          
          {/* Top Navbar */}
          <Navbar 
            isDark={isDark} 
            toggle={() => setIsDark(!isDark)} 
            onMenu={() => setMob(true)} 
            onUp={() => setUpOpen(true)} 
            q={q} 
            setQ={setQ} 
            user={{ name: user?.name || 'User', email: user?.email || 'user@example.com' }} 
            onLogout={handleLogout} 
          />

          {/* Page Routing/Content */}
          <div className="flex-1 overflow-y-auto w-full h-full pb-8 scroll-smooth" id="scroll-container">
            {cat === 'analytics' ? (
              <AnalyticsPage isDark={isDark} />
            ) : cat === 'settings' ? (
              <SettingsPage isDark={isDark} user={user} setUser={setUser} />
            ) : (
              <Dashboard 
                isDark={isDark} 
                files={files} 
                setFiles={setFiles} 
                cat={cat} 
                q={q} 
                openPreview={(f) => setPreview(f)} 
              />
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobNav 
          cat={cat} 
          setCat={setCat} 
          onUp={() => setUpOpen(true)} 
          isDark={isDark} 
        />

        {/* Modals */}
        <UploadModal 
          open={upOpen} 
          close={() => setUpOpen(false)} 
          isDark={isDark} 
          onUpload={handleUpload} 
        />
        <MediaPreview 
          file={preview} 
          isOpen={!!preview} 
          onClose={() => setPreview(null)} 
          isDark={isDark} 
          onDelete={handleDelete} 
        />

      </div>
    </ThemeContext.Provider>
  );
}
