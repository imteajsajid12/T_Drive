import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';
import { tGrad, fmt, getFileIcon } from '../../utils';

const IMAGE_PREVIEW_CACHE = 'tdrive-image-previews-v1';

// Detect touch-primary devices once at module level.
// (hover:none) is the correct media query — it covers phones/tablets where
// the primary input has no hover capability, unlike desktop mice.
const isTouchDevice =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none)').matches;

const FileCardComponent = ({ file, isGrid, isDark, onPreview, onDelete, idx, isSelected = false, onToggleSelect }) => {
  const TI = getFileIcon(file.name, file.type);

  const [mediaFailed, setMediaFailed]               = useState(false);
  const [mediaLoading, setMediaLoading]             = useState(false);
  const [imageProgress, setImageProgress]           = useState(null);
  const [resolvedImageSource, setResolvedImageSource] = useState('');

  // Reset media state whenever the file changes
  useEffect(() => {
    setMediaFailed(false);
    const hasSource = !!(file?.thumb || file?.url);
    setMediaLoading((file?.type === 'image' || file?.type === 'video') && hasSource);
    setImageProgress(file?.type === 'image' && hasSource ? 0 : null);
    setResolvedImageSource('');
  }, [file?.id]);

  // ── URL helpers ──────────────────────────────────────────────────────────────
  const proxify = (url) => {
    if (!url) return '';
    if (url.startsWith('https://api.telegram.org')) {
      return `/api/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const imageSource = proxify(file.thumb || file.url);
  const videoSource = proxify(file.url   || file.thumb);

  const isImageWithSource = file.type === 'image' && !!imageSource        && !mediaFailed;
  const canShowImage      = file.type === 'image' && !!resolvedImageSource && !mediaFailed;
  const canShowVideo      = file.type === 'video' && !!videoSource         && !mediaFailed;

  // ── Progressive image loading with Cache API ─────────────────────────────────
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

        if (typeof caches !== 'undefined') {
          const store = await caches.open(IMAGE_PREVIEW_CACHE);
          await store.put(imageSource, new Response(blob, {
            headers: { 'Content-Type': blob.type },
          }));
        }

        finishWithObjectUrl(blob);
      } catch (err) {
        if (controller.signal.aborted || !activeLoadRef.current) return;
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

  // ── Shared handlers ───────────────────────────────────────────────────────────
  const handlePreview = (e) => {
    e.stopPropagation();
    onPreview(file);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(file.id);
  };

  const handleToggleSelect = (e) => {
    e.stopPropagation();
    onToggleSelect && onToggleSelect(file.id);
  };

  // ── Grid thumbnail + action bar ───────────────────────────────────────────────
  const ThumbnailSection = () => (
    <div className="relative h-36 overflow-hidden">

      {/* ── Selection checkbox (top-left) ─────────────────────────────────────────
          Desktop: visible on group-hover OR when already selected.
          Touch:   always visible so it's tappable.
      ──────────────────────────────────────────────────────────────────────────── */}
      {onToggleSelect && (
        <button
          type="button"
          onClick={handleToggleSelect}
          aria-label={isSelected ? `Deselect ${file.name}` : `Select ${file.name}`}
          className={`
            absolute top-2 left-2 z-40 w-6 h-6 rounded-md flex items-center justify-center
            border-2 transition-all duration-150
            ${isTouchDevice ? 'opacity-100' : isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            ${isSelected
              ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/40'
              : isDark
                ? 'bg-gray-900/70 border-gray-500 hover:border-emerald-400 backdrop-blur-sm'
                : 'bg-white/80 border-gray-300 hover:border-emerald-500 backdrop-blur-sm'}
          `}
        >
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      )}

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

      {/* Video play hint */}
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

      {/* ── Action bar ─────────────────────────────────────────────────────────
          Mobile/touch  → always visible at bottom (hover never fires on touch).
          Desktop/mouse → slides up from bottom on CSS group-hover.
      ────────────────────────────────────────────────────────────────────── */}
      {isTouchDevice ? (
        // ── Mobile: pinned, always visible ──
        <div
          className="absolute bottom-0 left-0 right-0 z-30 flex items-center gap-1.5 px-2 py-1.5"
          style={{
            background: isDark ? 'rgba(17,24,39,0.80)' : 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            type="button"
            onClick={handlePreview}
            aria-label={`Preview ${file.name}`}
            className={`
              flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg
              text-[11px] font-semibold active:scale-95 transition-colors
              ${isDark
                ? 'bg-gray-700/90 text-gray-200 active:bg-gray-600'
                : 'bg-gray-100   text-gray-700 active:bg-emerald-50 active:text-emerald-700'}
            `}
          >
            <Ic.Eye />
            <span>View</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${file.name}`}
            className={`
              flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg
              text-[11px] font-semibold active:scale-95 transition-colors
              ${isDark
                ? 'bg-red-500/20 text-red-400 active:bg-red-500/40'
                : 'bg-red-50     text-red-500 active:bg-red-100'}
            `}
          >
            <Ic.Trash />
            <span></span>
          </button>
        </div>
      ) : (
        // ── Desktop: slide-up on hover ──
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
                : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'}
            `}
          >
            <Ic.Eye />
            <span></span>
          </button>
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
                : 'bg-red-50     text-red-500 hover:bg-red-100    hover:text-red-700'}
            `}
          >
            <Ic.Trash />
            <span></span>
          </button>
        </div>
      )}
    </div>
  );

  // ── List view thumbnail ───────────────────────────────────────────────────────
  const ListThumb = () => (
    <div className={`
      relative w-12 h-12 rounded-2xl flex items-center justify-center
      flex-shrink-0 shadow-md overflow-hidden
      ${file.type === 'doc'
        ? (isDark ? 'bg-gray-800' : 'bg-gray-100')
        : `bg-gradient-to-br ${tGrad(file.type)} text-white`}
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

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`
        group relative rounded-3xl overflow-hidden cursor-pointer
        transition-all duration-300
        ${isSelected
          ? isDark
            ? 'bg-gray-800/80 border-2 border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
            : 'bg-emerald-50 border-2 border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
          : isDark
            ? 'bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]'
            : 'bg-white border border-gray-100 shadow-sm hover:shadow-xl'}
      `}
      onClick={(e) => {
        // If multi-select is active (parent passes onToggleSelect), clicking the card toggles selection
        if (onToggleSelect) {
          handleToggleSelect(e);
        } else {
          onPreview(file);
        }
      }}
    >
      {/* Decorative glow blobs */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full bg-gradient-to-br ${tGrad(file.type)} opacity-20`} />
        <div className={`absolute bottom-0 left-0 w-32 h-32 blur-[40px] rounded-full bg-gradient-to-tr ${tGrad(file.type)} opacity-20`} />
      </div>

      {/* Grid: thumbnail + action bar */}
      {isGrid && <ThumbnailSection />}

      {/* Info row */}
      <div className={`relative z-10 p-3 sm:p-4 ${!isGrid ? 'flex items-center gap-3 sm:gap-4' : ''}`}>
        {!isGrid && <ListThumb />}

        {/* File name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold truncate text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {file.name}
            </h3>
            {file.star && <span className="text-yellow-400 flex-shrink-0"><Ic.Star /></span>}
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {file.size} • {fmt(file.date)}
          </p>
        </div>

        {/* List: icon-only action buttons — always visible, touch-friendly (min 36×36 tap target) */}
        {!isGrid && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* List-view selection checkbox */}
            {onToggleSelect && (
              <button
                type="button"
                onClick={handleToggleSelect}
                aria-label={isSelected ? `Deselect ${file.name}` : `Select ${file.name}`}
                className={`
                  w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all duration-150 flex-shrink-0
                  ${isSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : isDark
                      ? 'text-gray-500 hover:text-emerald-400 hover:bg-gray-700'
                      : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}
                `}
              >
                {isSelected ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
                  </svg>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handlePreview}
              aria-label={`Preview ${file.name}`}
              title="Preview"
              className={`
                w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-colors
                ${isDark
                  ? 'text-gray-400 hover:bg-gray-700 active:bg-gray-700 hover:text-white active:text-white'
                  : 'text-gray-500 hover:bg-emerald-50 active:bg-emerald-50 hover:text-emerald-700 active:text-emerald-700'}
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
                w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-colors
                ${isDark
                  ? 'text-red-400 hover:bg-red-500/20 active:bg-red-500/20 hover:text-red-300 active:text-red-300'
                  : 'text-red-400 hover:bg-red-50 active:bg-red-50 hover:text-red-600 active:text-red-600'}
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
