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
import Swal from 'sweetalert2';

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

    // Full sync function that fetches ALL messages from Telegram
    const fullSyncWithTelegram = async (clearOffset = false) => {
      const tgToken = localStorage.getItem('tgBotToken');
      if (!tgToken) {
        console.warn('No Telegram bot token found');
        return;
      }

      try {
        // If clearOffset is true, start from offset 0 to get all messages
        let offset = clearOffset ? 0 : (localStorage.getItem('tgSyncOffset') || 0);
        
        // Fetch updates with a reasonable limit to avoid overwhelming the API
        const limit = 100;
        const res = await fetch(`https://api.telegram.org/bot${tgToken}/getUpdates?allowed_updates=["message"]&offset=${offset}&limit=${limit}`);
        const data = await res.json();
        
        if (!data.ok) {
          console.error('Telegram API error:', data.description);
          toast.error(`Telegram API error: ${data.description}`);
          return;
        }
        
        if (!data.result || data.result.length === 0) {
          if (clearOffset) {
            toast.info('No files found in Telegram chat');
          }
          return;
        }

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
                source: 'telegram',
                tgChatId: msg.chat?.id,
                tgMessageId: msg.message_id
              });
              existingIds.add(fileId);
            }
          }
        }

        // Save the latest offset for incremental sync
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
          if (clearOffset) {
            toast.info('All files already synced');
          }
        }
      } catch (err) {
        console.error('Telegram sync error:', err);
        toast.error('Failed to sync from Telegram. Check your connection.');
      }
    };

    // Incremental sync (default behavior)
    const syncWithTelegram = async () => {
      await fullSyncWithTelegram(false);
    };

    // Full sync (clears offset to get all messages)
    const fullSync = async () => {
      await fullSyncWithTelegram(true);
    };

    syncWithTelegram();
    
    // Listen for manual sync requests from Dashboard
    const manualSyncListener = () => {
      syncWithTelegram();
    };
    window.addEventListener('telegramSyncRequested', manualSyncListener);

    // Listen for full sync requests
    const fullSyncListener = () => {
      fullSync();
    };
    window.addEventListener('telegramFullSyncRequested', fullSyncListener);

    // Setup interval to sync every 30 seconds
    const intervalId = setInterval(syncWithTelegram, 30000);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('telegramSyncRequested', manualSyncListener);
      window.removeEventListener('telegramFullSyncRequested', fullSyncListener);
    };
  }, [auth]); // Re-run when files loads initially or auth changes

  const handleUpload = (newFile) => {
    setFiles(prev => [newFile, ...prev]);
  };

  const handleDelete = (id) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    // Check if file exists on Telegram
    const hasTgMessageId = file.tgMessageId || (String(file.id).startsWith('tg_') ? String(file.id).split('_')[1] : null);
    const hasTgChatId = file.tgChatId || (() => {
      let storedChatId = localStorage.getItem('tgChatId');
      if (storedChatId) {
        const match = storedChatId.match(/-?\d+/);
        return match ? match[0] : null;
      }
      return null;
    })();
    const tgToken = localStorage.getItem('tgBotToken');

    // If file exists on Telegram, confirm deletion and delete from both places
    if (hasTgMessageId && hasTgChatId && tgToken) {
      // SweetAlert2 confirmation for Telegram files
      Swal.fire({
        title: `Delete "${file.name}"?`,
        text: 'This will permanently remove the file from both Telegram and your dashboard.',
        icon: 'warning',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete all!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
          confirmButton: 'px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105',
          cancelButton: 'px-6 py-3 rounded-xl font-bold text-gray-300 transition-all hover:scale-105',
          title: 'text-xl font-bold',
          text: 'text-gray-300'
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // Delete from Telegram first
            const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/deleteMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                chat_id: hasTgChatId, 
                message_id: hasTgMessageId 
              })
            });
            const tgData = await tgRes.json();
            
            if (!tgData.ok) {
              console.error('Telegram deletion failed:', tgData.description);
              Swal.fire({
                title: 'Deletion Failed',
                text: `Failed to delete from Telegram: ${tgData.description || 'Unknown error'}`,
                icon: 'error',
                iconColor: '#ef4444',
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'OK',
                customClass: {
                  confirmButton: 'px-6 py-3 rounded-xl font-bold text-white',
                  title: 'text-xl font-bold',
                  text: 'text-gray-300'
                }
              });
              return; // Don't delete from local if Telegram deletion failed
            }

            // Now delete from local state
            setFiles(prev => prev.filter(f => f.id !== id));
            
            // Success message
            Swal.fire({
              title: 'Deleted!',
              text: 'File deleted from Telegram and device.',
              icon: 'success',
              iconColor: '#10b981',
              confirmButtonColor: '#10b981',
              confirmButtonText: 'OK',
              customClass: {
                confirmButton: 'px-6 py-3 rounded-xl font-bold text-white',
                title: 'text-xl font-bold',
                text: 'text-gray-300'
              }
            });
          } catch (err) {
            console.error('Error deleting from Telegram:', err);
            Swal.fire({
              title: 'Error',
              text: 'Failed to delete from Telegram. File may still exist there.',
              icon: 'error',
              iconColor: '#ef4444',
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'OK',
              customClass: {
                confirmButton: 'px-6 py-3 rounded-xl font-bold text-white',
                title: 'text-xl font-bold',
                text: 'text-gray-300'
              }
            });
          }
        }
      });
    } else {
      // Local file only - delete with SweetAlert2 confirmation
      Swal.fire({
        title: `Delete "${file.name}"?`,
        text: 'This will permanently remove the file from your device.',
        icon: 'warning',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
          confirmButton: 'px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105',
          cancelButton: 'px-6 py-3 rounded-xl font-bold text-gray-300 transition-all hover:scale-105',
          title: 'text-xl font-bold',
          text: 'text-gray-300'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          setFiles(prev => prev.filter(f => f.id !== id));
          
          // Success message
          Swal.fire({
            title: 'Deleted!',
            text: 'File deleted from device.',
            icon: 'success',
            iconColor: '#10b981',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'px-6 py-3 rounded-xl font-bold text-white',
              title: 'text-xl font-bold',
              text: 'text-gray-300'
            }
          });
        }
      });
    }
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
