import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';
import { tGrad, fmt, getFileIcon } from '../../utils';

const IMAGE_PREVIEW_CACHE = 'tdrive-image-previews-v1';

// ─────────────────────────────────────────────────────────────────────────────
// FileCard
// Displays a single file in either grid or list layout.
//
// Key design decisions:
//   • The action bar (Preview + Delete) in grid view uses plain CSS group-hover,
//     NOT Framer Motion variants on the outer wrapper. Framer Motion's whileHover
//     on a parent causes pointer-event timing issues that make the action bar
//     flicker or disappear after the first delete (because AnimatePresence
//     re-mounts remaining cards and their hover state is reset mid-animation).
//   • onDelete is passed straight through to App.handleDelete which owns the
//     Swal confirmation + Telegram + Supabase cleanup.
// ─────────────────────────────────────────────────────────────────────────────

const FileCardComponent = ({ file, isGrid, isDark, onPreview, onDelete, idx }) => {
  const TI = getFileIcon(file.name, file.type);

  const [mediaFailed, setMediaFailed]         = useState(false);
  const [mediaLoading, setMediaLoading]       = useState(false);
  const [imageProgress, setImageProgress]     = useState(null);
  const [resolvedImageSource, setResolvedImageSource] = useState('');

  // Reset media state whenever the file changes
  useEffect(() => {
    setMediaFailed(false);
    const hasSource = !!(file?.thumb || file?.url);
    setMediaLoading((file?.type === 'image' || file?.type === 'video') && hasSource);
    setImageProgress(file?.type === 'image' && hasSource ? 0 : null);
    setResolvedImageSource('');
  }, [file?.id]);

  // ── URL helpers ─────────────────────────────────────────────────────────────
  const proxify = (url) => {
    if (!url) return '';
    if (url.startsWith('https://api.telegram.org')) {
      return `/api/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const imageSource = proxify(file.thumb || file.url);
  const videoSource = proxify(file.url   || file.thumb);

  const isImageWithSource = file.type === 'image' && !!imageSource && !mediaFailed;
  const canShowImage      = file.type === 'image' && !!resolvedImageSource && !mediaFailed;
  const canShowVideo      = file.type === 'video' && !!videoSource         && !mediaFailed;

  // ── Progressive image loading with Cache API ────────────────────────────────
  const activeLoadRef = useRef(false);

  useEffect(() => {
    if (file?.type !== 'image' || !imageSource || typeof window === 'undefined') return;

    const controller = new AbortController();
    activeLoadRef.current = true;
    let objectUrlToCleanup = '';

    const finishWithObjectUrl = (blob) => {
      objectUrlToCleanup = URL.createObjectURL(blob);
      if (!activeLoadRef.current) return;
      setResolvedImageSource(objectUrlToCleanup);
      setImageProgress(100);
      setMediaLoading(false);
    };

    const loadImage = async () => {
      try {
        // Try Cache API first
        if (typeof caches !== 'undefined') {
          const store = await caches.open(IMAGE_PREVIEW_CACHE);
          const cached = await store.match(imageSource);
          if (cached?.ok) {
            finishWithObjectUrl(await cached.blob());
            return;
          }
        }

        const response = await fetch(imageSource, { signal: controller.signal });
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

        const totalBytes = Number(response.headers.get('Content-Length') || 0);
        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;

        while (activeLoadRef.current) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            if (totalBytes > 0) {
              setImageProgress(Math.min(95, Math.round((received / totalBytes) * 100)));
            } else {
              setImageProgress(prev => Math.min(95, Math.max(15, (prev ?? 10) + 3)));
            }
          }
        }

        const blob = new Blob(chunks, {
          type: response.headers.get('Content-Type') || 'image/*',
        });

        // Store in Cache API for future renders
        if (typeof caches !== 'undefined') {
          const store = await caches.open(IMAGE_PREVIEW_CACHE);
          await store.put(imageSource, new Response(blob, {
            headers: { 'Content-Type': blob.type },
          }));
        }

        finishWithObjectUrl(blob);
      } catch (err) {
        if (controller.signal.aborted || !activeLoadRef.current) return;
        // Fall back to direct URL if progressive load fails
        setResolvedImageSource(imageSource);
        setMediaLoading(false);
        setImageProgress(null);
      }
    };

    loadImage();

    return () => {
      activeLoadRef.current = false;
      controller.abort();
      if (objectUrlToCleanup) URL.revokeObjectURL(objectUrlToCleanup);
    };
  }, [file?.type, imageSource]);

  // ── Shared handlers ──────────────────────────────────────────────────────────
  const handlePreview = (e) => {
    e.stopPropagation();
    onPreview(file);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(file.id);
  };

  // ── Thumbnail section (used in grid view) ────────────────────────────────────
  const ThumbnailSection = () => (
    <div className="relative h-36 overflow-hidden">
      {/* Loading overlay */}
      {(isImageWithSource || canShowVideo) && mediaLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          {isImageWithSource ? (
            <div className="w-[78%] max-w-[240px]">
              <div className="h-2 rounded-full bg-black/35 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${imageProgress ?? 20}%` }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                />
              </div>
              <p className="mt-2 text-center text-[11px] font-medium text-white/90">
                Loading {imageProgress != null ? `${imageProgress}%` : '…'}
              </p>
            </div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-8 w-8 rounded-full border-[3px] border-white/40 border-t-emerald-400"
            />
          )}
        </div>
      )}

      {/* Media content */}
      {canShowImage ? (
        <img
          src={resolvedImageSource}
          alt={file.name}
          onLoad={() => setMediaLoading(false)}
          onError={() => { setMediaFailed(true); setMediaLoading(false); }}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : canShowVideo ? (
        <video
          src={videoSource}
          onLoadedData={() => setMediaLoading(false)}
          onError={() => { setMediaFailed(true); setMediaLoading(false); }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
          preload="metadata"
          muted
          playsInline
        />
      ) : (
        <div className={`relative h-full flex items-center justify-center ${
          file.type === 'doc' ? (isDark ? 'bg-gray-800' : 'bg-gray-100') : ''
        } transition-all duration-500`}>
          {file.type !== 'doc' && (
            <div className={`absolute inset-0 bg-gradient-to-br ${tGrad(file.type)} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
          )}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`relative z-10 scale-[2.5] ${
              file.type === 'doc' ? '' : 'opacity-80 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <TI />
          </motion.div>
        </div>
      )}

      {/* Video play icon */}
      {file.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition-all duration-300 z-10">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-emerald-600 shadow-lg"
          >
            <Ic.Play />
          </motion.div>
        </div>
      )}

      {/* ── Action bar — slides up from bottom on hover ──────────────────────
          Uses pure CSS group-hover so it works reliably even after list
          re-renders triggered by deletions. Framer Motion whileHover on the
          outer card wrapper was causing the bar to stay hidden after the
          AnimatePresence exit animation of a sibling card completed.
      ─────────────────────────────────────────────────────────────────────── */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 z-30
          flex items-center justify-between gap-2 px-3 py-2
          translate-y-full opacity-0
          group-hover:translate-y-0 group-hover:opacity-100
          transition-all duration-200 ease-out
          ${isDark ? 'bg-gray-900/85' : 'bg-white/90'} backdrop-blur-md
        `}
      >
        {/* Preview */}
        <button
          type="button"
          onClick={handlePreview}
          aria-label={`Preview ${file.name}`}
          title="Preview"
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
            transition-colors active:scale-95
            ${isDark
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
            }
          `}
        >
          <Ic.Eye />
          <span>Preview</span>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${file.name}`}
          title="Delete file"
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
            transition-colors active:scale-95
            ${isDark
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300'
              : 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700'
            }
          `}
        >
          <Ic.Trash />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );

  // ── List view thumbnail ──────────────────────────────────────────────────────
  const ListThumb = () => (
    <div className={`
      relative w-12 h-12 rounded-2xl flex items-center justify-center
      flex-shrink-0 shadow-md overflow-hidden
      ${file.type === 'doc' ? (isDark ? 'bg-gray-800' : 'bg-gray-100') : `bg-gradient-to-br ${tGrad(file.type)} text-white`}
    `}>
      {(isImageWithSource || canShowVideo) && mediaLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25">
          {isImageWithSource ? (
            <div className="w-8 h-8 rounded-lg bg-black/40 p-1.5">
              <div className="h-full w-full rounded bg-black/20 overflow-hidden">
                <motion.div
                  initial={{ height: '0%' }}
                  animate={{ height: `${imageProgress ?? 20}%` }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full bg-emerald-300"
                />
              </div>
            </div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-4 w-4 rounded-full border-2 border-white/50 border-t-emerald-300"
            />
          )}
        </div>
      )}

      {canShowImage ? (
        <img
          src={resolvedImageSource}
          alt={file.name}
          onLoad={() => setMediaLoading(false)}
          onError={() => { setMediaFailed(true); setMediaLoading(false); }}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      ) : canShowVideo ? (
        <video
          src={videoSource}
          onLoadedData={() => setMediaLoading(false)}
          onError={() => { setMediaFailed(true); setMediaLoading(false); }}
          className="w-full h-full object-cover pointer-events-none"
          preload="metadata"
          muted
          playsInline
        />
      ) : (
        <motion.div whileHover={{ scale: 1.2, rotate: 10 }} transition={{ type: 'spring' }}>
          <TI />
        </motion.div>
      )}

      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
      />
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      // Use a plain div as the group root — no Framer Motion whileHover here.
      // The parent motion.div in Dashboard handles the lift/scale animation.
      // Keeping "group" on this element lets CSS group-hover work on children
      // without any interference from Framer Motion pointer events.
      className={`
        group relative rounded-3xl overflow-hidden cursor-pointer
        transition-all duration-300
        ${isDark
          ? 'bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]'
          : 'bg-white border border-gray-100 shadow-sm hover:shadow-xl'
        }
      `}
      onClick={() => onPreview(file)}
    >
      {/* Decorative glow blobs on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full bg-gradient-to-br ${tGrad(file.type)} opacity-20`} />
        <div className={`absolute bottom-0 left-0 w-32 h-32 blur-[40px] rounded-full bg-gradient-to-tr ${tGrad(file.type)} opacity-20`} />
      </div>

      {/* Grid thumbnail + action bar */}
      {isGrid && <ThumbnailSection />}

      {/* Info row */}
      <div className={`relative z-10 p-4 ${!isGrid ? 'flex items-center gap-4' : ''}`}>
        {!isGrid && <ListThumb />}

        {/* File name + size/date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold truncate text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {file.name}
            </h3>
            {file.star && <span className="text-yellow-400 flex-shrink-0"><Ic.Star /></span>}
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {file.size} • {fmt(file.date)}
          </p>
        </div>

        {/* List view action buttons */}
        {!isGrid && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={handlePreview}
              aria-label={`Preview ${file.name}`}
              title="Preview"
              className={`
                p-2 rounded-xl transition-colors
                ${isDark
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                }
              `}
            >
              <Ic.Eye />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-label={`Delete ${file.name}`}
              title="Delete file"
              className={`
                p-2 rounded-xl transition-colors
                ${isDark
                  ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
                  : 'text-red-400 hover:bg-red-50 hover:text-red-600'
                }
              `}
            >
              <Ic.Trash />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const FileCard = React.memo(FileCardComponent);
