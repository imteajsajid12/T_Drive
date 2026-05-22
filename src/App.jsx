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
import { LandingPage } from './components/pages/LandingPage';
import { BackgroundBlobs } from './components/ui/Utils';
import { client, account, getTelegramConfig, getTelegramFileMetaList, saveTelegramFileMeta } from './lib/appwrite';
import { normalizeSizeText } from './utils';
import { Toaster, toast } from 'sonner';
import { useRef } from 'react';
import Swal from 'sweetalert2';

export default function App() {
  const [auth, setAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mob, setMob] = useState(false);
  const [cat, setCat] = useState('home');
  const [q, setQ] = useState('');
  const [files, setFiles] = useState(initialFiles);
  const filesRef = useRef(files);

  const getUserStorageKey = (suffix, userId = user?.$id || 'guest') => `tDrive:${userId}:${suffix}`;
  const readUserStorage = (suffix, userId = user?.$id || 'guest') => localStorage.getItem(getUserStorageKey(suffix, userId));
  const writeUserStorage = (suffix, value, userId = user?.$id || 'guest') => localStorage.setItem(getUserStorageKey(suffix, userId), value);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const loadTelegramCredentials = async () => {
    const userId = user?.$id || 'guest';
    let tgToken = readUserStorage('tgBotToken', userId);
    let tgChatId = readUserStorage('tgChatId', userId);

    try {
      const config = await getTelegramConfig(userId);
      if (config) {
        tgToken = config.token || tgToken;
        tgChatId = config.chat_id || tgChatId;

        if (tgToken) writeUserStorage('tgBotToken', tgToken, userId);
        if (tgChatId) writeUserStorage('tgChatId', tgChatId, userId);
      }
    } catch (err) {
      console.warn('Could not load Telegram config from Appwrite, using localStorage:', err);
    }

    return { tgToken, tgChatId };
  };

  const resolveTelegramFileUrl = async (tgToken, tgFileId) => {
    if (!tgToken || !tgFileId) return null;

    try {
      const res = await fetch(`https://api.telegram.org/bot${tgToken}/getFile?file_id=${tgFileId}`);
      const data = await res.json();
      if (data.ok && data.result?.file_path) {
        return `https://api.telegram.org/file/bot${tgToken}/${data.result.file_path}`;
      }
    } catch (err) {
      console.warn('Could not resolve Telegram file URL:', err);
    }

    return null;
  };

  

  const getExtensionFromName = (name = '') => {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };

  const inferTypeFromExtension = (extension = '') => {
    const ext = extension.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'm4a', 'ogg', 'flac'].includes(ext)) return 'music';
    return 'doc';
  };

  const getTelegramFileKey = (file) => file?.telegramKey || file?.tgFileId || file?.id;

  const dedupeFilesByKey = (items = []) => {
    const seen = new Set();

    return items.filter((item) => {
      const key = item.source === 'telegram' ? getTelegramFileKey(item) : item.id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const buildTelegramFileEntry = async (doc, tgToken) => {
    const fileId = doc.file_id;
    const extension = (doc.Extension || '').toLowerCase();
    const type = inferTypeFromExtension(extension);
    const previewUrl = await resolveTelegramFileUrl(tgToken, fileId);
    const size = normalizeSizeText(doc.size);
    const safeId = doc.$id || fileId;

    return {
      id: safeId,
      name: `telegram_${fileId}${extension ? `.${extension}` : ''}`,
      type,
      size,
      date: doc.$createdAt ? new Date(doc.$createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      preview: previewUrl || '',
      thumb: (type === 'image' || type === 'video') ? (previewUrl || '') : null,
      url: previewUrl || '',
      star: false,
      source: 'telegram',
      telegramKey: fileId,
      tgFileId: fileId,
      tgMessageId: String(safeId).replace(/^tg_/, ''),
      telegramDbId: doc.$id
    };
  };

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
  }, []);

  useEffect(() => {
    if (!auth || !user?.$id) {
      setFiles(initialFiles);
      return;
    }

    try {
      const savedFiles = readUserStorage('tDriveFiles', user.$id);
      if (savedFiles) {
        setFiles(dedupeFilesByKey(JSON.parse(savedFiles)));
      } else {
        setFiles(initialFiles);
      }
    } catch (e) {
      console.warn('Storage quota or parse error on load', e);
      setFiles(initialFiles);
    }
  }, [auth, user?.$id]);

  useEffect(() => {
    if (!auth) return;

    const refreshTelegramMedia = async () => {
      const { tgToken } = await loadTelegramCredentials();
      if (!tgToken) return;

      const telegramFiles = filesRef.current.filter((file) => file.source === 'telegram' && file.tgFileId);
      if (!telegramFiles.length) return;

      const refreshed = await Promise.all(
        telegramFiles.map(async (file) => {
          const freshUrl = await resolveTelegramFileUrl(tgToken, file.tgFileId);
          if (!freshUrl || freshUrl === file.url) return file;

          return {
            ...file,
            url: freshUrl,
            preview: freshUrl,
            thumb: file.type === 'image' || file.type === 'video' ? freshUrl : file.thumb,
            telegramUrlCheckedAt: new Date().toISOString()
          };
        })
      );

      let didChange = false;
      const refreshedById = new Map(refreshed.map((file) => [file.id, file]));

      setFiles((prev) => {
        const next = prev.map((file) => {
          const updated = refreshedById.get(file.id);
          if (!updated || updated === file) return file;
          didChange = true;
          return updated;
        });

        if (didChange) {
          if (user?.$id) {
            writeUserStorage('tDriveFiles', JSON.stringify(next), user.$id);
          }
        }

        return didChange ? next : prev;
      });
    };

    refreshTelegramMedia();
  }, [auth]);

  useEffect(() => {
    if (!auth) return;

    const loadTelegramFilesFromDatabase = async () => {
      const { tgToken } = await loadTelegramCredentials();
      if (!tgToken) return;

      const userId = user?.$id || 'default';
      const records = await getTelegramFileMetaList(userId);
      if (!records.length) return;

      const entries = await Promise.all(records.map((doc) => buildTelegramFileEntry(doc, tgToken)));
      const entriesByKey = new Map(entries.map((entry) => [getTelegramFileKey(entry), entry]));

      setFiles((prev) => {
        const merged = prev.map((file) => {
          const dbEntry = file.source === 'telegram' ? entriesByKey.get(getTelegramFileKey(file)) : null;
          if (!dbEntry) return file;

          return {
            ...file,
            telegramKey: dbEntry.telegramKey || file.telegramKey,
            tgFileId: dbEntry.tgFileId || file.tgFileId,
            size: file.size && file.size !== '0 MB' ? normalizeSizeText(file.size) : dbEntry.size,
            url: file.url || dbEntry.url,
            preview: file.preview || dbEntry.preview,
            thumb: file.thumb || dbEntry.thumb,
            source: 'telegram'
          };
        });

        const existingIds = new Set(merged.map((file) => file.source === 'telegram' ? getTelegramFileKey(file) : file.id));
        const appendOnly = entries.filter((entry) => !existingIds.has(getTelegramFileKey(entry)));
        const finalList = dedupeFilesByKey([...appendOnly, ...merged]);
        if (user?.$id) {
          writeUserStorage('tDriveFiles', JSON.stringify(finalList), user.$id);
        }
        return finalList;
      });
    };

    loadTelegramFilesFromDatabase();
  }, [auth]);

  // Save files to local storage whenever they change
  useEffect(() => {
    try {
      if (files !== initialFiles) {
        if (user?.$id) {
          writeUserStorage('tDriveFiles', JSON.stringify(files), user.$id);
        }
      }
    } catch (e) {
      console.warn("Local storage quota exceeded! Couldn't save file contents.", e);
      // Fallback: store files WITHOUT their bulky base64 dataUrl properties to respect localStorage limits
      const lightFiles = files.map(({ url, ...rest }) => rest);
      if (user?.$id) {
        writeUserStorage('tDriveFiles', JSON.stringify(lightFiles), user.$id);
      }
    }
  }, [files]);

  // Telegram Auto-Sync Logic
  useEffect(() => {
    if (!auth) return;

    // Full sync function that fetches ALL messages from Telegram
    const fullSyncWithTelegram = async (clearOffset = false) => {
      const { tgToken } = await loadTelegramCredentials();

      if (!tgToken) {
        console.warn('No Telegram bot token found');
        return;
      }

      try {
        // If clearOffset is true, start from offset 0 to get all messages
        const userId = user?.$id || 'guest';
        let offset = clearOffset ? 0 : (readUserStorage('tgSyncOffset', userId) || 0);
        
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
        const existingIds = new Set(filesRef.current.map((file) => file.source === 'telegram' ? getTelegramFileKey(file) : file.id));

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
            const telegramKey = tgFile.file_id;
            
            if (!existingIds.has(telegramKey)) {
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
              sizeStr = normalizeSizeText(sizeStr);
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
                telegramKey,
                tgFileId: tgFile.file_id,
                tgChatId: msg.chat?.id,
                tgMessageId: msg.message_id
              });
              saveTelegramFileMeta({
                messageId: msg.message_id,
                fileId: tgFile.file_id,
                extension: getExtensionFromName(name) || type,
                size: sizeStr,
                userId: user?.$id || 'default'
              });
              existingIds.add(telegramKey);
            }
          }
        }

        // Save the latest offset for incremental sync
        if (maxUpdateId > 0) {
          writeUserStorage('tgSyncOffset', String(maxUpdateId + 1), user?.$id || 'guest');
        }

        if (newFiles.length > 0) {
          setFiles(prev => {
            const updated = dedupeFilesByKey([...newFiles, ...prev]);
            if (user?.$id) {
              writeUserStorage('tDriveFiles', JSON.stringify(updated), user.$id);
            }
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

    // If file exists on Telegram, confirm deletion and delete from both places
    if (hasTgMessageId) {
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
            const { tgToken, tgChatId } = await loadTelegramCredentials();
            const effectiveChatId = file.tgChatId || tgChatId;

            if (!tgToken || !effectiveChatId) {
              throw new Error('Telegram configuration is missing');
            }

            // Delete from Telegram first
            const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/deleteMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                chat_id: effectiveChatId,
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
  if (!auth) {
    if (showLogin) {
      return (
        <LoginPage 
          isDark={isDark} 
          onLogin={async () => {
            try {
              const u = await account.get();
              setUser(u);
              setAuth(true);
            } catch(e) {
              console.error(e);
            }
          }} 
          onBack={() => setShowLogin(false)}
        />
      );
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

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
            setCat={setCat}
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
                setQ={setQ}
                user={user}
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
          user={user} 
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
