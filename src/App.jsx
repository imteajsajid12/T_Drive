"use client";
// ─── Maintenance mode ──────────────────────────────────────────────────────────
// Controlled via .env.local  →  NEXT_PUBLIC_MAINTENANCE_MODE=true | false
// Change the value and restart the dev server (or redeploy) to toggle.
const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
// ──────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useTransition } from 'react';
import { ThemeContext } from './contexts';
import { initialFiles } from './data';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobNav } from './components/layout/MobNav';
import { UploadModal } from './components/modals/UploadModal';
import { MediaPreview } from './components/modals/MediaPreview';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { LoginLogPage } from './components/pages/LoginLogPage';
import { Dashboard } from './components/pages/Dashboard';
import { LoginPage } from './components/pages/LoginPage';
import { LandingPage } from './components/pages/LandingPage';
import { MaintenancePage } from './components/pages/MaintenancePage';
import { BackgroundBlobs } from './components/ui/Utils';
import { account, client, getTelegramConfig, getTelegramFileMetaList, saveTelegramFileMeta, deleteTelegramFileMeta, updateFileNameInDb, saveLoginLog } from './lib/supabase';
import { createClient } from './utils/supabase/client';
const supabase = createClient();
import { normalizeSizeText } from './utils';
import { Toaster, toast } from 'sonner';
import { useRef } from 'react';
import Swal from 'sweetalert2';
import { usePathname, useRouter } from 'next/navigation';

export default function App() {
  const [auth, setAuth] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mob, setMob] = useState(false);
  const [q, setQ] = useState('');
  const [files, setFiles] = useState(initialFiles);
  const [telegramConfigState, setTelegramConfigState] = useState({ checked: false, ready: false, loading: false });
  const filesRef = useRef(files);
  const router = useRouter();
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const normalizedPathname = pathname?.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  const getUserStorageKey = (suffix, userId = user?.$id || 'guest') => `tDrive:${userId}:${suffix}`;
  const readUserStorage = (suffix, userId = user?.$id || 'guest') => localStorage.getItem(getUserStorageKey(suffix, userId));
  const writeUserStorage = (suffix, value, userId = user?.$id || 'guest') => localStorage.setItem(getUserStorageKey(suffix, userId), value);
  const routeToCat = {
    '/dashboard': 'home',
    '/dashboard/files': 'files',
    '/dashboard/images': 'image',
    '/dashboard/videos': 'video',
    '/dashboard/music': 'music',
    '/dashboard/documents': 'doc',
    '/analytics': 'analytics',
    '/settings': 'settings',
    '/login-log': 'loginlog',
  };
  const catToRoute = {
    home: '/dashboard',
    files: '/dashboard/files',
    image: '/dashboard/images',
    video: '/dashboard/videos',
    music: '/dashboard/music',
    doc: '/dashboard/documents',
    analytics: '/analytics',
    settings: '/settings',
    loginlog: '/login-log',
  };

  const getCatFromPath = (path) => {
    if (!path) return 'home';
    const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    return routeToCat[normalizedPath] || 'home';
  };

  const handleSetCat = (nextCat) => {
    const target = catToRoute[nextCat] || '/dashboard';
    if (normalizedPathname !== target) {
      startTransition(() => {
        router.push(target, { scroll: false });
      });
    }
  };

  useEffect(() => {
    const routesToWarm = ['/dashboard', '/dashboard/files', '/dashboard/images', '/dashboard/videos', '/dashboard/music', '/dashboard/documents', '/analytics', '/settings'];

    routesToWarm.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

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

  useEffect(() => {
    if (!auth) {
      setTelegramConfigState({ checked: false, ready: false, loading: false });
      return;
    }

    let cancelled = false;

    const checkTelegramConfig = async () => {
      setTelegramConfigState({ checked: false, ready: false, loading: true });

      try {
        const { tgToken, tgChatId } = await loadTelegramCredentials();
        if (cancelled) return;

        setTelegramConfigState({
          checked: true,
          ready: Boolean(tgToken && tgChatId),
          loading: false
        });
      } catch (err) {
        console.warn('Unable to verify Telegram config state:', err);
        if (!cancelled) {
          setTelegramConfigState({ checked: true, ready: false, loading: false });
        }
      }
    };

    checkTelegramConfig();

    const onConfigUpdated = () => { cancelled = false; checkTelegramConfig(); };
    window.addEventListener('telegramConfigUpdated', onConfigUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener('telegramConfigUpdated', onConfigUpdated);
    };
  }, [auth, user?.$id]);

  const resolveTelegramFileUrl = async (tgToken, tgFileId) => {
    if (!tgToken || !tgFileId) return null;

    try {
      const res = await fetch(`https://api.telegram.org/bot${tgToken}/getFile?file_id=${tgFileId}`);
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') || 1;
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        return resolveTelegramFileUrl(tgToken, tgFileId);
      }
      const data = await res.json();
      if (data.ok && data.result?.file_path) {
        return `https://api.telegram.org/file/bot${tgToken}/${data.result.file_path}`;
      }
    } catch (err) {
      console.warn('Could not resolve Telegram file URL:', err);
    }

    return null;
  };

  // Helper to chunk promises and avoid rate limits
  const chunkedPromiseAll = async (items, chunkFn, limit = 5) => {
    const results = [];
    for (let i = 0; i < items.length; i += limit) {
      const chunk = items.slice(i, i + limit);
      const chunkResults = await Promise.all(chunk.map(chunkFn));
      results.push(...chunkResults);
    }
    return results;
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

  // ── Name resolution helpers ──────────────────────────────────────────────────

  /**
   * Returns true if the name is a real human-readable filename, not a raw
   * Telegram file_id placeholder or an auto-generated fallback.
   */
  const isRealFileName = (name) =>
    Boolean(name) &&
    !name.startsWith('telegram_') &&
    !name.startsWith('file_') &&
    !name.startsWith('tg_file');

  /**
   * Build a display-ready file name from a Supabase storage row.
   * Priority (highest → lowest):
   *   1. doc.name  (the `name` column in the Supabase `storage` table)
   *   2. file_<shortId>.<ext>  (clean fallback — never shows raw Telegram file IDs)
   */
  const resolveDisplayName = (doc) => {
    // `doc.name` is the `name` column from the Supabase `storage` table
    if (doc.name && doc.name.trim() && isRealFileName(doc.name)) {
      return doc.name.trim();
    }
    const ext = (doc.Extension || '').toLowerCase();
    // Use a short numeric segment from the DB row id, not the opaque Telegram file_id
    const shortId = String(doc.$id || doc.id || '').slice(-6) || 'unknown';
    return `file_${shortId}${ext ? `.${ext}` : ''}`;
  };

  const buildTelegramFileEntry = async (doc, tgToken) => {
    const fileId = doc.file_id;
    const extension = (doc.Extension || '').toLowerCase();
    const type = inferTypeFromExtension(extension);
    const previewUrl = tgToken ? await resolveTelegramFileUrl(tgToken, fileId) : null;
    const size = normalizeSizeText(doc.size);
    const safeId = doc.$id || doc.id || fileId;

    const displayName = resolveDisplayName(doc);

    // Supabase uses created_at, Appwrite uses $createdAt
    const rawDate = doc.created_at || doc.$createdAt || null;
    const dateStr = rawDate
      ? new Date(rawDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    return {
      id: safeId,
      name: displayName,
      type,
      size,
      date: dateStr,
      preview: previewUrl || '',
      thumb: (type === 'image' || type === 'video') ? (previewUrl || '') : null,
      url: previewUrl || '',
      star: false,
      source: 'telegram',
      telegramKey: fileId,
      tgFileId: fileId,
      tgMessageId: String(safeId).replace(/^tg_/, ''),
      telegramDbId: doc.$id || doc.id,
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
        console.warn('No active session found.', err);
        if (err?.message?.toLowerCase().includes('blocked')) {
          try {
             localStorage.removeItem('cookieFallback');
             await account.deleteSession('current').catch(() => {});
          } catch(e) {}
        }
        setAuth(false);
      } finally {
        setSessionChecked(true);
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
    if (!auth || !user?.$id) return;

    const refreshTelegramMedia = async () => {
      const { tgToken } = await loadTelegramCredentials();
      if (!tgToken) return;

      const telegramFiles = filesRef.current.filter((file) => file.source === 'telegram' && file.tgFileId);
      if (!telegramFiles.length) return;

      const refreshed = await chunkedPromiseAll(telegramFiles, async (file) => {
          const freshUrl = await resolveTelegramFileUrl(tgToken, file.tgFileId);
          if (!freshUrl || freshUrl === file.url) return file;

          return {
            ...file,
            url: freshUrl,
            preview: freshUrl,
            thumb: file.type === 'image' || file.type === 'video' ? freshUrl : file.thumb,
            telegramUrlCheckedAt: new Date().toISOString()
          };
        }, 5);

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
  }, [auth, user?.$id]);

  useEffect(() => {
    if (!auth || !user?.$id) return;

    const loadTelegramFilesFromDatabase = async () => {
      const { tgToken } = await loadTelegramCredentials();
      const userId = user.$id;
      const records = await getTelegramFileMetaList(userId);
      if (!records.length) return;

      // ── Backfill pass: rows without a real name in the `name` column ────────
      // Strategy: build a lookup map from in-memory files (most authoritative),
      // fall back to localStorage. For each row missing a real name, patch the DB.
      const rowsMissingName = records.filter(
        (doc) => !doc.name || !doc.name.trim() || !isRealFileName(doc.name)
      );

      if (rowsMissingName.length > 0) {
        // Build a lookup map from the current in-memory files list (most up-to-date)
        const localNameByTgKey = new Map(
          filesRef.current
            .filter((f) => f.source === 'telegram' && isRealFileName(f.name))
            .map((f) => [f.tgFileId || f.telegramKey, f.name])
        );

        // Also try localStorage in case filesRef is empty on first load
        try {
          const saved = readUserStorage('tDriveFiles', userId);
          if (saved) {
            JSON.parse(saved)
              .filter((f) => f.source === 'telegram' && isRealFileName(f.name))
              .forEach((f) => {
                const key = f.tgFileId || f.telegramKey;
                if (key && !localNameByTgKey.has(key)) {
                  localNameByTgKey.set(key, f.name);
                }
              });
          }
        } catch (_) { /* ignore parse errors */ }

        // Backfill in parallel (fire-and-forget, non-blocking)
        Promise.allSettled(
          rowsMissingName.map(async (doc) => {
            const realName = localNameByTgKey.get(doc.file_id);
            if (!realName) return;
            await updateFileNameInDb(doc.file_id, userId, realName);
            // Patch in-memory so this session already uses the real name
            doc.name = realName;
          })
        );
      }
      // ─────────────────────────────────────────────────────────────────────────

      const entries = await chunkedPromiseAll(
        records,
        (doc) => buildTelegramFileEntry(doc, tgToken),
        5
      );
      const entriesByKey = new Map(entries.map((e) => [getTelegramFileKey(e), e]));

      setFiles((prev) => {
        const merged = prev.map((file) => {
          const dbEntry = file.source === 'telegram'
            ? entriesByKey.get(getTelegramFileKey(file))
            : null;
          if (!dbEntry) return file;

          // DB name wins when it's a real name; keep the local name otherwise
          const resolvedName = isRealFileName(dbEntry.name)
            ? dbEntry.name
            : isRealFileName(file.name)
              ? file.name
              : dbEntry.name; // both are placeholders — use DB value

          return {
            ...file,
            name: resolvedName,
            telegramKey: dbEntry.telegramKey || file.telegramKey,
            tgFileId: dbEntry.tgFileId || file.tgFileId,
            size: (file.size && file.size !== '0 MB') ? normalizeSizeText(file.size) : dbEntry.size,
            url: file.url || dbEntry.url,
            preview: file.preview || dbEntry.preview,
            thumb: file.thumb || dbEntry.thumb,
            source: 'telegram',
          };
        });

        const existingKeys = new Set(
          merged.map((f) => f.source === 'telegram' ? getTelegramFileKey(f) : f.id)
        );
        const appendOnly = entries.filter((e) => !existingKeys.has(getTelegramFileKey(e)));
        const finalList = dedupeFilesByKey([...appendOnly, ...merged]);

        if (user?.$id) {
          writeUserStorage('tDriveFiles', JSON.stringify(finalList), user.$id);
        }
        return finalList;
      });
    };

    loadTelegramFilesFromDatabase();
  }, [auth, user?.$id]);

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

  useEffect(() => {
    if (!sessionChecked || !normalizedPathname) return;

    const isPublicRoute = normalizedPathname === '/' || normalizedPathname === '/login' || normalizedPathname === '/registration';

    if (!auth && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    if (auth && (normalizedPathname === '/login' || normalizedPathname === '/registration')) {
      router.replace('/dashboard');
    }
  }, [auth, normalizedPathname, router, sessionChecked]);

  // Telegram Auto-Sync Logic
  useEffect(() => {
    if (!auth || !user?.$id) return;

    // Full sync function that fetches ALL messages from Telegram
    const fullSyncWithTelegram = async (clearOffset = false) => {
      const { tgToken, tgChatId } = await loadTelegramCredentials();

      if (!tgToken || !tgChatId) {
        console.warn('No Telegram bot token or chat ID found');
        return;
      }

      try {
        // If clearOffset is true, start from offset 0 to get all messages
        const userId = user.$id;
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

          // Only process messages from the user's configured chat — prevents
          // files sent to the bot from OTHER chats (other users) from appearing
          if (String(msg.chat?.id) !== String(tgChatId)) continue;

          let tgFile = null;
          let type = 'other';
          let name = 'tg_file';

          if (msg.document) {
            tgFile = msg.document;
            type = tgFile.mime_type?.includes('image') ? 'image' 
                 : tgFile.mime_type?.includes('video') ? 'video' 
                 : tgFile.mime_type?.includes('audio') ? 'music' : 'doc';
            // file_name from Telegram is the original filename for documents
            name = tgFile.file_name || `document_${msg.message_id}`;
          } else if (msg.photo && msg.photo.length > 0) {
            tgFile = msg.photo[msg.photo.length - 1]; // Highest resolution
            type = 'image';
            // Photos sent as images (not documents) have no filename in Telegram API
            // Use caption text if available (trimmed, safe as filename), else descriptive fallback
            const caption = (msg.caption || '').trim().replace(/[/\\?%*:|"<>]/g, '_').slice(0, 60);
            name = caption ? `${caption}.jpg` : `photo_${msg.message_id}.jpg`;
          } else if (msg.video) {
            tgFile = msg.video;
            type = 'video';
            name = tgFile.file_name || `video_${msg.message_id}.mp4`;
          } else if (msg.audio) {
            tgFile = msg.audio;
            type = 'music';
            // Telegram audio objects may carry title + performer
            const audioTitle = tgFile.title || tgFile.file_name || '';
            const audioPerformer = tgFile.performer || '';
            name = audioTitle
              ? (audioPerformer ? `${audioPerformer} - ${audioTitle}.mp3` : `${audioTitle}.mp3`)
              : `audio_${msg.message_id}.mp3`;
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
                userId: user.$id,
                fileName: name,
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

    // Setup interval to sync every 60 seconds
    const intervalId = setInterval(syncWithTelegram, 60000);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('telegramSyncRequested', manualSyncListener);
      window.removeEventListener('telegramFullSyncRequested', fullSyncListener);
    };
  }, [auth, user?.$id]); // Re-run when auth changes or when the active user switches

  const handleLogout = async () => {
    try {
      if (user?.$id) {
        saveLoginLog({ userId: user.$id, email: user.email, event: 'logout', status: 'success' });
      }
      await account.deleteSession('current');
      setFiles(initialFiles);
      setAuth(false);
      setUser(null);
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const handleUpload = (newFile) => {
    setFiles(prev => [newFile, ...prev]);
  };

  const handleOpenUpload = () => {
    if (!telegramConfigState.ready) {
      toast.error('Set up your Telegram bot in Settings before uploading.');
      return;
    }

    setUpOpen(true);
  };

  // ── Silent delete (no confirmation dialog) — used by bulk-delete ────────────
  // Does full Telegram + Supabase + local-state cleanup without blocking UI with
  // per-file Swal modals. The caller is responsible for showing a single confirm.
  const handleDeleteSilent = async (id) => {
    const file = filesRef.current.find(f => f.id === id);
    if (!file) return;

    const isTelegramFile = file.source === 'telegram' || String(file.id).startsWith('tg_');

    let tgMsgIdInt = null;
    if (file.tgMessageId) {
      const parsed = parseInt(file.tgMessageId, 10);
      if (!isNaN(parsed)) tgMsgIdInt = parsed;
    }
    if (tgMsgIdInt === null && String(file.id).startsWith('tg_')) {
      const parsed = parseInt(String(file.id).replace('tg_', ''), 10);
      if (!isNaN(parsed)) tgMsgIdInt = parsed;
    }

    const supabaseFileId = file.tgFileId || file.telegramKey || null;

    // Step 1: Telegram
    if (isTelegramFile && tgMsgIdInt !== null) {
      try {
        const { tgToken, tgChatId } = await loadTelegramCredentials();
        const effectiveChatId = file.tgChatId || tgChatId;
        if (tgToken && effectiveChatId) {
          await fetch(`https://api.telegram.org/bot${tgToken}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: effectiveChatId, message_id: tgMsgIdInt }),
          });
        }
      } catch (err) {
        console.warn('Bulk-delete: Telegram remove error for', id, err);
      }
    }

    // Step 2: Supabase
    if (supabaseFileId && user?.$id) {
      await deleteTelegramFileMeta(supabaseFileId, user.$id).catch(err =>
        console.warn('Bulk-delete: Supabase remove error for', id, err)
      );
    }

    // Step 3: Local state (use functional update so each call operates on latest state)
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id);
      if (user?.$id) {
        try {
          writeUserStorage('tDriveFiles', JSON.stringify(next), user.$id);
        } catch {
          const lightFiles = next.map(({ url, ...rest }) => rest);
          writeUserStorage('tDriveFiles', JSON.stringify(lightFiles), user.$id);
        }
      }
      return next;
    });

    // Step 4: Close preview if open
    setPreview(current => {
      if (!current || current.file?.id !== id) return current;
      return null;
    });
  };

  const handleDelete = async (id) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    const isTelegramFile = file.source === 'telegram' || String(file.id).startsWith('tg_');

    // Resolve the Telegram message ID as a proper integer.
    // Priority: file.tgMessageId → parse from file.id (tg_<msgId>) → null
    let tgMsgIdInt = null;
    if (file.tgMessageId) {
      const parsed = parseInt(file.tgMessageId, 10);
      if (!isNaN(parsed)) tgMsgIdInt = parsed;
    }
    if (tgMsgIdInt === null && String(file.id).startsWith('tg_')) {
      const parsed = parseInt(String(file.id).replace('tg_', ''), 10);
      if (!isNaN(parsed)) tgMsgIdInt = parsed;
    }

    // The Telegram file_id used as the key in the Supabase `storage` table
    const supabaseFileId = file.tgFileId || file.telegramKey || null;

    // ── Confirmation dialog ─────────────────────────────────────
    const confirmText = isTelegramFile
      ? 'This will permanently remove the file from Telegram, Supabase, and your dashboard.'
      : 'This will permanently remove the file from your dashboard.';

    const { isConfirmed } = await Swal.fire({
      title: `Delete "${file.name}"?`,
      text: confirmText,
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#1e293b',
      customClass: {
        popup: 'rounded-3xl shadow-2xl',
        confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-white transition-all',
        cancelButton: 'px-6 py-2.5 rounded-xl font-bold transition-all',
      },
    });

    if (!isConfirmed) return;

    // ── Show loading state ──────────────────────────────────────
    Swal.fire({
      title: 'Deleting…',
      text: 'Please wait while we remove the file.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#1e293b',
      didOpen: () => Swal.showLoading(),
    });

    const errors = [];

    // ── Step 1: Delete from Telegram ────────────────────────────
    if (isTelegramFile && tgMsgIdInt !== null) {
      try {
        const { tgToken, tgChatId } = await loadTelegramCredentials();
        // file.tgChatId is most reliable — fallback to config chat id
        const effectiveChatId = file.tgChatId || tgChatId;

        if (!tgToken || !effectiveChatId) {
          errors.push('Telegram credentials missing — could not delete from Telegram.');
        } else {
          const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: effectiveChatId,
              message_id: tgMsgIdInt,   // integer — required by Telegram API
            }),
          });
          const tgData = await tgRes.json();

          if (!tgData.ok) {
            // Treat "already deleted" and "too old to delete" as non-fatal — still clean up locally
            const desc = (tgData.description || '').toLowerCase();
            const isAlreadyGone = desc.includes('message to delete not found');
            const isTooOld = desc.includes("can't be deleted for everyone") || desc.includes('message_id_invalid');

            if (isAlreadyGone || isTooOld) {
              console.warn(`Telegram: ${tgData.description} — treating as soft error, proceeding with local cleanup.`);
              // Surface a note to the user but don't block the delete
              errors.push(`Telegram note: ${tgData.description} (file will still be removed locally and from Supabase).`);
            } else {
              errors.push(`Telegram: ${tgData.description || 'Unknown error'}`);
              console.error('Telegram deletion failed:', tgData.description);
            }
          }
        }
      } catch (err) {
        errors.push('Network error while deleting from Telegram.');
        console.error('Telegram delete error:', err);
      }
    }

    // ── Step 2: Delete from Supabase `storage` table ───────────
    if (supabaseFileId && user?.$id) {
      const deleted = await deleteTelegramFileMeta(supabaseFileId, user.$id);
      if (!deleted) {
        errors.push('Supabase: could not remove file metadata row.');
      }
    }

    // ── Step 3: Remove from local state + localStorage ─────────
    // Always remove from local state regardless of upstream errors —
    // if Telegram/Supabase had issues we already logged them above.
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id);
      if (user?.$id) {
        try {
          writeUserStorage('tDriveFiles', JSON.stringify(next), user.$id);
        } catch (e) {
          const lightFiles = next.map(({ url, ...rest }) => rest);
          writeUserStorage('tDriveFiles', JSON.stringify(lightFiles), user.$id);
        }
      }
      return next;
    });

    // ── Step 4: Close the preview modal if this file was open ──
    setPreview(current => {
      if (!current) return null;
      if (current.file?.id === id) return null;
      return current;
    });

    // ── Step 5: Show result ─────────────────────────────────────
    // Separate soft notes (too-old Telegram messages) from hard errors (real failures)
    const softNotes = errors.filter(e => e.startsWith('Telegram note:'));
    const hardErrors = errors.filter(e => !e.startsWith('Telegram note:'));

    if (hardErrors.length === 0) {
      // Full success — or only soft Telegram notes (message too old / already gone)
      const extraNote = softNotes.length > 0
        ? '\n\nNote: The Telegram message was too old to delete remotely, but it has been removed from Supabase and your dashboard.'
        : '';
      Swal.fire({
        title: 'Deleted!',
        text: (isTelegramFile
          ? 'File removed from Supabase and your dashboard.'
          : 'File removed from your dashboard.') + extraNote,
        icon: 'success',
        iconColor: '#10b981',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK',
        background: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#1e293b',
        customClass: {
          popup: 'rounded-3xl shadow-2xl',
          confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-white',
        },
      });
    } else {
      // Hard errors — local state was still cleaned up but something upstream failed
      Swal.fire({
        title: 'Partially Deleted',
        html: `
          <p class="text-sm mb-3">The file was removed from your dashboard, but there were issues:</p>
          <ul class="text-left text-sm space-y-1 list-disc pl-5">
            ${hardErrors.map(e => `<li>${e}</li>`).join('')}
          </ul>
        `,
        icon: 'warning',
        iconColor: '#f59e0b',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'OK',
        background: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#1e293b',
        customClass: {
          popup: 'rounded-3xl shadow-2xl',
          confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-white',
        },
      });
    }
  };

  // ----------------------------------------------------
  // RENDER APP Content
  // ----------------------------------------------------

  // Maintenance mode — short-circuits all routing, shows the maintenance page
  // for every URL. Flip MAINTENANCE_MODE at the top of this file to re-enable.
  if (MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }

  if (!sessionChecked) {
    return null;
  }

  if (!auth) {
    if (normalizedPathname === '/login' || normalizedPathname === '/registration') {
      return (
        <LoginPage 
          isDark={isDark} 
          initialMode={normalizedPathname === '/registration' ? 'signup' : 'signin'}
          onLogin={async () => {
            try {
              const u = await account.get();
              setUser(u);
              setAuth(true);
              const logResult = await saveLoginLog({ userId: u.$id, email: u.email, event: 'login', status: 'success' });
              if (logResult?.rlsError) {
                // INSERT blocked by RLS — store a flag so LoginLogPage can show the fix instructions
                localStorage.setItem('tDrive:loginLogRLSError', '1');
                console.error('Login log blocked by Supabase RLS. Fix: run "ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY;" in Supabase SQL editor.');
              } else if (logResult) {
                // Successful insert — clear any stale RLS error flag
                localStorage.removeItem('tDrive:loginLogRLSError');
              }
              router.replace('/dashboard');
            } catch(e) {
              console.error(e);
            }
          }}
          onBack={() => router.push('/')}
          onSwitchMode={(mode) => router.push(mode === 'signup' ? '/registration' : '/login')}
        />
      );
    }

    return <LandingPage onLoginClick={() => router.push('/login')} isAuthed={auth} user={user} onDashboardClick={() => router.push('/dashboard')} onProfileClick={() => router.push('/settings')} onLogout={handleLogout} />;
  }

  if (normalizedPathname === '/') {
    return <LandingPage onLoginClick={() => router.push('/login')} isAuthed={auth} user={user} onDashboardClick={() => router.push('/dashboard')} onProfileClick={() => router.push('/settings')} onLogout={handleLogout} />;
  }

  const activeCat = getCatFromPath(normalizedPathname);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <Toaster position="top-right" richColors theme={isDark ? 'dark' : 'light'} />
      <div className={`flex h-screen overflow-hidden transition-colors duration-500 font-sans ${isDark ? 'bg-[#0f172a] text-white selection:bg-emerald-500/30' : 'bg-[#f4f7f6] text-gray-900 selection:bg-emerald-200'}`}>
        
        {/* Background Decorative Blobs */}
        <BackgroundBlobs isDark={isDark} />

        {/* Sidebar Component */}
        <Sidebar 
          cat={activeCat} 
          setCat={handleSetCat} 
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
            onUp={handleOpenUpload} 
            q={q} 
            setQ={setQ} 
            user={{ name: user?.name || 'User', email: user?.email || 'user@example.com' }} 
            setCat={handleSetCat}
            onLogout={handleLogout} 
            telegramReady={telegramConfigState.ready}
            telegramConfigLoading={telegramConfigState.loading}
          />

          {/* Page Routing/Content */}
          <div className="flex-1 overflow-y-auto w-full h-full pb-8 scroll-smooth" id="scroll-container">
            {activeCat === 'analytics' ? (
              <AnalyticsPage isDark={isDark} />
            ) : activeCat === 'settings' ? (
              <SettingsPage isDark={isDark} user={user} setUser={setUser} />
            ) : activeCat === 'loginlog' ? (
              <LoginLogPage isDark={isDark} user={user} />
            ) : (
              <Dashboard 
                isDark={isDark} 
                files={files} 
                setFiles={setFiles} 
                cat={activeCat} 
                q={q} 
                setQ={setQ}
                user={user}
                telegramReady={telegramConfigState.ready}
                telegramConfigChecked={telegramConfigState.checked}
                telegramConfigLoading={telegramConfigState.loading}
                onConfigureTelegram={() => handleSetCat('settings')}
                openPreview={(f) => setPreview(f)}
                onDelete={handleDelete}
                onDeleteMany={handleDeleteSilent}
              />
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobNav 
          cat={activeCat} 
          setCat={handleSetCat} 
          onUp={handleOpenUpload} 
          isDark={isDark} 
          telegramReady={telegramConfigState.ready}
          telegramConfigLoading={telegramConfigState.loading}
        />

        {/* Modals */}
        <UploadModal 
          open={upOpen} 
          close={() => setUpOpen(false)} 
          isDark={isDark}
          user={user} 
          onUpload={handleUpload} 
          disabled={telegramConfigState.loading || !telegramConfigState.ready}
          onConfigureTelegram={() => handleSetCat('settings')}
        />
        <MediaPreview 
          file={preview?.file || null}
          items={preview?.items || []}
          index={preview?.index || 0}
          isOpen={!!preview} 
          onClose={() => setPreview(null)} 
          isDark={isDark} 
          onDelete={handleDelete} 
          onNavigate={(nextIndex) => setPreview((current) => current ? { ...current, file: current.items[nextIndex], index: nextIndex } : current)}
        />

      </div>
    </ThemeContext.Provider>
  );
}
