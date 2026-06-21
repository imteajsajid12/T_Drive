import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';
import { getTelegramConfig, saveTelegramFileMeta } from '../../lib/supabase';
import { normalizeSizeText } from '../../utils';

export const UploadModal = ({ open, close, isDark, onUpload, user, disabled = false, onConfigureTelegram }) => {
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState({});
  const ref = useRef(null);
  if (!open) return null;

  const drop = (e) => { e.preventDefault(); setDrag(false); handleFiles(Array.from(e.dataTransfer.files)); };
  const pick = (e) => { handleFiles(Array.from(e.target.files)); };
  const getUserStorageKey = (suffix, userId = user?.$id || 'guest') => `tDrive:${userId}:${suffix}`;
  const readUserStorage = (suffix, userId = user?.$id || 'guest') => localStorage.getItem(getUserStorageKey(suffix, userId));
  const writeUserStorage = (suffix, value, userId = user?.$id || 'guest') => localStorage.setItem(getUserStorageKey(suffix, userId), value);
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

  const handleFiles = (fs) => {
    fs.forEach(async (f) => {
      const id = Date.now() + Math.random();
      setProgress((p) => ({ ...p, [id]: { name: f.name, prog: 0 } }));

      const { tgToken, tgChatId } = await loadTelegramCredentials();

      // Bot API limits free document upload to 50MB (equivalent to ~52428800 bytes)
      const isOversizedForTg = f.size > 50 * 1024 * 1024;

      if (tgToken && tgChatId && !isOversizedForTg) {
        // Send to Telegram
        try {
          const formData = new FormData();
          formData.append('chat_id', tgChatId);
          formData.append('document', f);
          formData.append('caption', `Uploaded from T-Drive Dashboard: ${f.name}`);

          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://api.telegram.org/bot${tgToken}/sendDocument`);
          
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const p = (e.loaded / e.total) * 100;
              setProgress((prev) => ({ ...prev, [id]: { ...prev[id], prog: p } }));
            }
          };

          xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              let tgUrl = null;
              let tgMsgId = null;
              let returnedChatId = null;
              try {
                const res = JSON.parse(xhr.responseText);
                tgMsgId = res.result.message_id;
                returnedChatId = res.result.chat?.id;
                const fileId = res.result.document?.file_id || res.result.photo?.[res.result.photo.length - 1]?.file_id || res.result.video?.file_id || res.result.audio?.file_id;
                if (fileId) {
                  const pathRes = await fetch(`https://api.telegram.org/bot${tgToken}/getFile?file_id=${fileId}`);
                  const pathData = await pathRes.json();
                  if (pathData.ok) {
                    tgUrl = `https://api.telegram.org/file/bot${tgToken}/${pathData.result.file_path}`;
                  }
                }
                completeUpload(f, id, tgUrl, tgMsgId, returnedChatId, fileId);
                return;
              } catch(e) {
                console.error("Error getting Telegram file URL:", e);
              }
              completeUpload(f, id, tgUrl, tgMsgId, returnedChatId, null);
            } else {
              let errorMsg = 'Unknown error';
              try {
                const res = JSON.parse(xhr.responseText);
                errorMsg = res.description || xhr.responseText;
              } catch(e) {
                errorMsg = xhr.responseText;
              }
              console.error('Telegram upload failed:', xhr.responseText);
              alert('Failed to backup to Telegram: ' + errorMsg);
              completeUpload(f, id); // Still save locally
            }
          };

          xhr.onerror = () => {
            console.error('Telegram upload error');
            alert('Failed to upload to Telegram due to a network error.');
            completeUpload(f, id); // Still save locally
          };

          xhr.send(formData);
        } catch (err) {
          console.error('Error preparing Telegram upload:', err);
          fallbackSimulateUpload(f, id);
        }
      } else {
        if (isOversizedForTg) {
          console.warn("File was skipped for Telegram cloud because it exceeds the bot API's 50MB limit. Rendering locally instead.");
          // We can silently fallback to browser storage, or throw a gentle warning if desired.
        }
        // No telegram config or oversized, just simulate upload locally
        fallbackSimulateUpload(f, id);
      }
    });
  };

  const getFileExtension = (name = '') => {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };

  const completeUpload = async (f, id, externalUrl = null, tgMsgId = null, returnedChatId = null, tgFileId = null) => {
    let tp = 'doc';
    if (f.type.startsWith('image')) tp = 'image';
    else if (f.type.startsWith('video')) tp = 'video';
    else if (f.type.startsWith('audio')) tp = 'music';
    
    // Memory Optimization & Browser Policy workaround:
    // ALWAYS use createObjectURL. Base64 (readAsDataURL) for PDFs is blocked by modern Chrome/Safari strict security policies in iframes.
    // Native blob: URLs are trusted and render flawlessly.
    const fileDataUrl = externalUrl || URL.createObjectURL(f);
    const isTelegramUpload = Boolean(tgFileId);
    const fileMetaId = tgFileId || `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    try {
      await saveTelegramFileMeta({
        messageId: tgMsgId,
        fileId: fileMetaId,
        extension: getFileExtension(f.name) || tp,
        size: normalizeSizeText(f.size),
        userId: user?.$id || user?.id || 'unknown',
        fileName: f.name,
      });
    } catch (err) {
      console.error('Failed to save file metadata to Appwrite:', err);
    }

    finalize(fileDataUrl, tp, isTelegramUpload, tgMsgId, returnedChatId, tgFileId);

    function finalize(fileData, type, isTelegramUpload, tgMsgId, returnedChatId, fileId) {
      setTimeout(() => {
        onUpload({ 
          id: tgMsgId ? `tg_${tgMsgId}` : Date.now(), 
          name: f.name, 
          type: type, 
          size: normalizeSizeText(f.size), 
          date: new Date().toISOString().split('T')[0],
          url: fileData, // Store locally
          preview: isTelegramUpload ? fileData : null,
          thumb: (type === 'image' || type === 'video') && isTelegramUpload ? fileData : null,
          source: isTelegramUpload ? 'telegram' : 'local',
          tgFileId,
          tgChatId: returnedChatId,
          tgMessageId: tgMsgId
        });
        setProgress((prev) => { const n = { ...prev }; delete n[id]; return n; });
      }, 300);
    }
  };

  const fallbackSimulateUpload = (f, id) => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 20 + 5;
      if (p >= 100) {
        setProgress((prev) => ({ ...prev, [id]: { ...prev[id], prog: 100 } }));
        clearInterval(iv);
        completeUpload(f, id);
      } else {
        setProgress((prev) => ({ ...prev, [id]: { ...prev[id], prog: p } }));
      }
    }, 150);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={close}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} transition={{ type: 'spring' }} onClick={(e) => e.stopPropagation()} className={`w-full max-w-lg rounded-3xl overflow-hidden ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-2xl`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Upload Files</h2>
          <button onClick={close} className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Ic.X /></button>
        </div>
        <div className="p-6">
          {disabled ? (
            <div className={`rounded-2xl border px-5 py-6 text-center ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-600'}`}>
                <Ic.AlertTriangle />
              </div>
              <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Telegram is not configured</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-amber-100/80' : 'text-gray-600'}`}>
                Connect your Telegram bot in Settings before uploading files to the dashboard.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={close} className={`px-4 py-2 rounded-xl text-sm font-bold ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
                  Close
                </button>
                <button onClick={() => { close(); onConfigureTelegram && onConfigureTelegram(); }} className="px-4 py-2 rounded-xl text-sm font-bold bg-[#0088cc] text-white">
                  Open Settings
                </button>
              </div>
            </div>
          ) : (
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop} onClick={() => ref.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${drag ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'border-gray-600/50 hover:border-emerald-400/50' : 'border-gray-300 hover:border-emerald-400'}`}>
            <motion.div animate={drag ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: drag ? Infinity : 0, duration: 1 }} className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${drag ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-700 text-gray-400' : 'bg-emerald-100 text-emerald-500'}`}><Ic.Upload /></motion.div>
            <p className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{drag ? 'Drop files here' : 'Drag & drop files'}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>or click to browse</p>
            <input ref={ref} type="file" multiple onChange={pick} className="hidden" />
          </div>
          )}
          {Object.keys(progress).length > 0 && (
            <div className="mt-5 space-y-3">
              {Object.entries(progress).map(([id, item]) => (
                <div key={id} className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/40' : 'bg-emerald-50/60'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-medium truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{Math.round(item.prog)}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-emerald-100'}`}>
                    <motion.div className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400" initial={{ width: 0 }} animate={{ width: item.prog + '%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
