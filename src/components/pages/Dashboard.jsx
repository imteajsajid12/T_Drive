import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Ic } from '../../icons';
import { StatCard } from '../ui/StatCard';
import { ChartBox } from '../ui/ChartBox';
import { QuickAction } from '../ui/QuickAction';
import { FileCard } from '../ui/FileCard';
import { InfiniteGridBackdrop } from '../ui/the-infinite-grid';
import { useRouter } from 'next/navigation';

// Defined outside component — recreated every render otherwise, causing child re-renders
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } }
};
const dayNameMap = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday'
};

const computeSize = (sizeStr) => {
  if (!sizeStr) return 0;
  const s = sizeStr.toString().toUpperCase();
  const val = parseFloat(s);
  if (isNaN(val)) return 0;
  if (s.includes('GB')) return val * 1024;
  if (s.includes('MB')) return val;
  if (s.includes('KB')) return val / 1024;
  if (s.includes('B')) return val / (1024 * 1024);
  return val / (1024 * 1024);
};

export const Dashboard = ({
  isDark,
  files,
  setFiles,
  cat,
  q,
  setQ,
  openPreview,
  onDelete,
  onDeleteMany,
  user,
  telegramReady = true,
  telegramConfigChecked = true,
  telegramConfigLoading = false,
  onConfigureTelegram
}) => {
  const router = useRouter();
  const [cm, setCm] = useState(null);
  const [isGrid, setIsGrid] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [nameQuery, setNameQuery] = useState(q || '');
  const [minSizeKB, setMinSizeKB] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE_OPTIONS = [12, 24, 48, 100];
  const [pageSize, setPageSize] = useState(() => {
    if (typeof localStorage === 'undefined') return 24;
    const saved = parseInt(localStorage.getItem('tDrive:pageSize'), 10);
    return [12, 24, 48, 100].includes(saved) ? saved : 24;
  });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteProgress, setDeleteProgress] = useState({ active: false, current: 0, total: 0, label: '', done: false });
  const [mounted, setMounted] = useState(false);
  const isSelectMode = selectedIds.size > 0;
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';

  // ── Storage stats — memoized so they only recompute when `files` changes ──────
  const { usedSpaceStr, sharedCount, storagePercent, strokeDashoffset, storageBreakdown } = useMemo(() => {
    const totalMB = files.reduce((acc, f) => acc + computeSize(f.size), 0);
    const usedSpaceStr = totalMB > 1024 ? (totalMB / 1024).toFixed(1) + ' GB' : totalMB.toFixed(1) + ' MB';
    const sharedCount = files.filter(f => f.star).length;
    const maxStorageMB = 100 * 1024;
    const storagePercent = Math.min((totalMB / maxStorageMB) * 100, 100).toFixed(0);
    const strokeDashoffset = 251.2 - (251.2 * (parseFloat(storagePercent) / 100));

    const categorySizes = { image: 0, video: 0, doc: 0, music: 0, other: 0 };
    files.forEach(f => {
      const size = computeSize(f.size);
      if (f.type in categorySizes) categorySizes[f.type] += size;
      else categorySizes.other += size;
    });

    const mkDetail = (type, label, color, gradient) => {
      const size = categorySizes[type];
      const sizeStr = size > 1024 ? (size / 1024).toFixed(1) + ' GB' : size.toFixed(1) + ' MB';
      const percent = totalMB > 0 ? ((size / totalMB) * 100).toFixed(0) : 0;
      return { l: label, v: sizeStr, p: percent, c: color, g: gradient };
    };

    const storageBreakdown = [
      mkDetail('image', 'Images', 'bg-emerald-500', 'from-emerald-400 to-emerald-500'),
      mkDetail('video', 'Videos', 'bg-teal-500', 'from-teal-400 to-teal-500'),
      mkDetail('doc', 'Docs', 'bg-cyan-500', 'from-cyan-400 to-cyan-500'),
      mkDetail('music', 'Music', 'bg-blue-500', 'from-blue-400 to-blue-500'),
      mkDetail('other', 'Other', 'bg-slate-500', 'from-slate-400 to-slate-500'),
    ];

    return { usedSpaceStr, sharedCount, storagePercent, strokeDashoffset, storageBreakdown };
  }, [files]);

  // ── Chart data — only recompute when files list changes ──────────────────────
  const dynamicChartData = useMemo(() => {
    const data = [
      { name: 'Mon', uv: 0 }, { name: 'Tue', uv: 0 }, { name: 'Wed', uv: 0 },
      { name: 'Thu', uv: 0 }, { name: 'Fri', uv: 0 }, { name: 'Sat', uv: 0 }, { name: 'Sun', uv: 0 },
    ];
    files.forEach(f => {
      const d = new Date(f.date);
      if (!isNaN(d.getTime())) {
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
        data[dayIdx].uv += computeSize(f.size);
      }
    });
    return data.map(d => ({ ...d, uv: Math.max(10, Math.round(d.uv)) }));
  }, [files]);

  const stats = useMemo(() => [
    { title: 'Total Files', val: files.length, sub: 'In your drive', color: 'emerald', ic: Ic.FileText },
    { title: 'Used Space', val: usedSpaceStr, sub: 'of 100 GB', color: 'blue', ic: Ic.HardDrive },
    { title: 'Starred', val: sharedCount, sub: 'important files', color: 'purple', ic: Ic.Star },
  ], [files.length, usedSpaceStr, sharedCount]);

  // ── File filtering — memoized, recomputes only when relevant deps change ──────
  const filt = useMemo(() =>
    files.filter(f =>
      (cat === 'home' || cat === 'files' || f.type === cat) &&
      (filterType === 'all' || f.type === filterType) &&
      f.name.toLowerCase().includes((q || '').toLowerCase()) &&
      (minSizeKB === '' || (() => {
        const sizeMB = computeSize(f.size);
        const minMB = parseFloat(minSizeKB) / 1024;
        return !isNaN(minMB) ? sizeMB >= minMB : true;
      })())
    ),
    [files, cat, filterType, q, minSizeKB]
  );

  const isHomeRecent = cat === 'home' && !q;

  const sortedByRecent = useMemo(() =>
    [...filt].sort((a, b) => {
      const aTime = new Date(a?.date || 0).getTime();
      const bTime = new Date(b?.date || 0).getTime();
      return (isNaN(bTime) ? 0 : bTime) - (isNaN(aTime) ? 0 : aTime);
    }),
    [filt]
  );
  const shownFiles = isHomeRecent ? sortedByRecent : filt;
  const totalPages = Math.max(1, Math.ceil(shownFiles.length / pageSize));
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return shownFiles.slice(start, start + pageSize);
  }, [shownFiles, currentPage, pageSize]);
  const previewableFiles = shownFiles.filter((file) => file.type === 'image' || file.type === 'video');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [cat, q, filterType, minSizeKB]);

  useEffect(() => {
    setCurrentPage(1);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tDrive:pageSize', String(pageSize));
    }
  }, [pageSize]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1];
    if (currentPage > 3) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let page = start; page <= end; page += 1) pages.push(page);

    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const goToPage = useCallback((nextPage) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, nextPage)));
  }, [totalPages]);

  // ── Multi-select handlers ─────────────────────────────────────────────────────
  const toggleSelectFile = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllOnPage = useCallback(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      paginatedFiles.forEach(f => next.add(f.id));
      return next;
    });
  }, [paginatedFiles]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const allOnPageSelected = paginatedFiles.length > 0 && paginatedFiles.every(f => selectedIds.has(f.id));

  const handleBulkDelete = useCallback(async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;

    const Swal = (await import('sweetalert2')).default;

    const { isConfirmed } = await Swal.fire({
      title: `Delete ${ids.length} file${ids.length > 1 ? 's' : ''}?`,
      text: 'This will permanently remove the selected files from Telegram and Supabase.',
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, delete ${ids.length}!`,
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

    // Capture names before any deletions — files prop updates after each one
    const fileNames = {};
    ids.forEach(id => {
      const f = files.find(fl => fl.id === id);
      if (f) fileNames[id] = f.name;
    });

    clearSelection();

    const deleteFn = onDeleteMany || onDelete;

    // Sequential to respect Telegram API rate limits — update progress after each
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const label = fileNames[id] || '';
      setDeleteProgress({ active: true, current: i, total: ids.length, label, done: false });
      await deleteFn(id);
    }

    // Hold at 100% briefly so user sees completion, then show done state
    setDeleteProgress({ active: true, current: ids.length, total: ids.length, label: '', done: true });
    await new Promise(r => setTimeout(r, 700));
    setDeleteProgress({ active: false, current: 0, total: 0, label: '', done: false });
  }, [selectedIds, files, onDelete, onDeleteMany, clearSelection, isDark]);
  const telegramLocked = !telegramReady;
  const telegramActionsDisabled = telegramConfigLoading || telegramLocked;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative px-4 py-4 md:px-8 md:py-8 w-full space-y-8 max-w-480 mx-auto"
    >
      <InfiniteGridBackdrop dark={isDark} className="z-0" />
      {telegramConfigChecked && telegramLocked && (
        <motion.div
          variants={itemVariants}
          className={`rounded-3xl border px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-900'}`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Ic.AlertTriangle /> Telegram is not set up yet
            </div>
            <p className={`text-xs ${isDark ? 'text-amber-100/80' : 'text-amber-800'}`}>
              Upload is disabled until you connect a Telegram bot in Settings.
            </p>
          </div>
          <button
            type="button"
            onClick={onConfigureTelegram}
            className={`inline-flex items-center justify-center h-10 px-4 rounded-xl text-xs font-bold transition-colors ${isDark ? 'bg-amber-400 text-gray-900 hover:bg-amber-300' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
          >
            Go to Settings
          </button>
        </motion.div>
      )}
      {telegramConfigLoading && (
        <motion.div
          variants={itemVariants}
          className={`rounded-3xl border px-5 py-4 flex items-center gap-3 ${isDark ? 'bg-gray-800/80 border-gray-700 text-gray-200' : 'bg-white border-gray-100 text-gray-700'}`}
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          <p className="text-sm font-medium">Checking Telegram configuration...</p>
        </motion.div>
      )}

      {/* Toolbar + progress are rendered via React portals (directly into document.body).
          This bypasses the CSS stacking context created by Framer Motion's transform
          animations on the parent motion.div, which would break position:fixed. */}
      {mounted && createPortal(
        <>
          {/* ── Bulk-select toolbar ─────────────────────────────────────────────
              Mobile: full-width bar above mobile nav
              Desktop: centered floating pill
          ───────────────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isSelectMode && (
              <motion.div
                key="bulk-toolbar"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  position: 'fixed',
                  zIndex: 9999,
                  background: isDark ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)'}`,
                  borderRadius: '1rem',
                  boxShadow: isDark
                    ? '0 25px 50px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)'
                    : '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
                className="left-3 right-3 bottom-20 md:left-0 md:right-0 md:mx-auto md:bottom-6 md:w-max"
              >
                {/* Mobile layout (< md) */}
                <div className="flex items-center justify-between gap-2 px-4 py-3 md:hidden">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`flex items-center gap-1.5 text-sm font-black px-3 py-1.5 rounded-xl flex-shrink-0
                      ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {selectedIds.size}
                    </span>
                    <button
                      type="button"
                      onClick={allOnPageSelected ? clearSelection : selectAllOnPage}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors flex-shrink-0
                        ${isDark ? 'bg-gray-700/80 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {allOnPageSelected ? 'Deselect' : 'Select all'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30"
                    >
                      <Ic.Trash />
                      <span>Delete {selectedIds.size}</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      aria-label="Cancel selection"
                      className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors flex-shrink-0
                        ${isDark ? 'text-gray-500 hover:bg-gray-700 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                    >
                      <Ic.X />
                    </button>
                  </div>
                </div>

                {/* Desktop layout (≥ md) */}
                <div className="hidden md:flex items-center gap-3 px-5 py-3">
                  <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {selectedIds.size} selected
                  </span>
                  <button
                    type="button"
                    onClick={allOnPageSelected ? clearSelection : selectAllOnPage}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors
                      ${isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
                  >
                    {allOnPageSelected ? 'Deselect page' : 'Select page'}
                  </button>
                  <div className={`w-px h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30"
                  >
                    <Ic.Trash />
                    Delete {selectedIds.size}
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    aria-label="Cancel selection"
                    className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors
                      ${isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                  >
                    <Ic.X />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Delete progress overlay ──────────────────────────────────────────── */}
          <AnimatePresence>
            {deleteProgress.active && (
              <motion.div
                key="delete-progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 99999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <motion.div
                  initial={{ scale: 0.86, opacity: 0, y: 28 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 16 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                  style={{
                    width: '100%',
                    maxWidth: '22rem',
                    margin: '0 1rem',
                    padding: '2rem',
                    borderRadius: '1.5rem',
                    boxShadow: '0 32px 64px -12px rgba(0,0,0,0.6)',
                    background: isDark ? '#0f172a' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  {/* Icon */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: '1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: deleteProgress.done ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
                    }}>
                      {deleteProgress.done ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          style={{ color: '#10b981' }}
                        >
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ color: '#ef4444' }}
                        >
                          <Ic.Trash />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <p style={{
                    fontSize: '1.25rem', fontWeight: 900, textAlign: 'center',
                    marginBottom: '0.25rem',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}>
                    {deleteProgress.done ? 'All Done!' : 'Deleting Files…'}
                  </p>

                  {/* Subtitle */}
                  <p style={{
                    fontSize: '0.875rem', textAlign: 'center', marginBottom: '1.5rem',
                    color: isDark ? '#94a3b8' : '#64748b',
                  }}>
                    {deleteProgress.done
                      ? `${deleteProgress.total} file${deleteProgress.total > 1 ? 's' : ''} removed`
                      : `Processing ${deleteProgress.current + 1} of ${deleteProgress.total}`}
                  </p>

                  {/* Progress bar track */}
                  <div style={{
                    height: 10, borderRadius: 999, overflow: 'hidden', marginBottom: '0.75rem',
                    background: isDark ? '#1e293b' : '#f1f5f9',
                  }}>
                    <motion.div
                      style={{
                        height: '100%', borderRadius: 999,
                        background: deleteProgress.done
                          ? 'linear-gradient(90deg,#10b981,#14b8a6)'
                          : 'linear-gradient(90deg,#ef4444,#f43f5e)',
                      }}
                      animate={{
                        width: deleteProgress.done
                          ? '100%'
                          : `${deleteProgress.total > 0
                              ? Math.max(4, (deleteProgress.current / deleteProgress.total) * 100)
                              : 4}%`,
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Bottom row: filename + percentage */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.7rem', color: isDark ? '#475569' : '#94a3b8',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      maxWidth: '68%',
                    }}>
                      {!deleteProgress.done && deleteProgress.label
                        ? `"${deleteProgress.label.length > 32 ? deleteProgress.label.slice(0, 32) + '…' : deleteProgress.label}"`
                        : ''}
                    </span>
                    <span style={{
                      fontSize: '1.1rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                      color: deleteProgress.done
                        ? (isDark ? '#34d399' : '#059669')
                        : (isDark ? '#f8fafc' : '#0f172a'),
                    }}>
                      {deleteProgress.done
                        ? '100%'
                        : `${deleteProgress.total > 0
                            ? Math.round((deleteProgress.current / deleteProgress.total) * 100)
                            : 0}%`}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}

      {/* Header & Stats */}
      {cat === 'home' && (
        <motion.div variants={itemVariants} className="relative z-10 space-y-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`text-3xl md:text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}
            >
              Welcome back, {displayName}! 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Here's what's happening with your files today.
            </motion.p>
          </div>
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {stats.map((s, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 400 }}>
                <StatCard {...s} isDark={isDark} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="relative z-10 flex flex-col space-y-8">
        {/* Quick Actions (Home only) */}
        {cat === 'home' && !q && (
          <motion.div variants={itemVariants}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}><Ic.Star /> Quick Access</h2>
            <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {[
                { ic: Ic.Image, label: "Images", desc: "View all images", grad: "from-emerald-400 to-teal-500", route: "/dashboard/images" },
                { ic: Ic.Video, label: "Videos", desc: "View all videos", grad: "from-blue-400 to-indigo-500", route: "/dashboard/videos" },
                { ic: Ic.Music, label: "Music", desc: "View all music", grad: "from-purple-400 to-pink-500", route: "/dashboard/music" },
                { ic: Ic.Doc, label: "Documents", desc: "View all docs", grad: "from-red-400 to-rose-500", route: "/dashboard/documents" }
              ].map((action, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <QuickAction {...action} isDark={isDark} onClick={() => router.push(action.route)} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Charts Row */}
        {(cat === 'home' || cat === 'analytics') && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartBox label="Storage Usage" isDark={isDark} className="lg:col-span-1">
              <div className="relative w-full aspect-square max-w-50 mx-auto mt-4 group cursor-pointer">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} className="relative z-10">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="none" className={isDark ? 'text-gray-700/50' : 'text-gray-100'} />
                    <motion.circle cx="50" cy="50" r="40" stroke="url(#gradient)" strokeWidth="12" fill="none" strokeDasharray="251.2" initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset }} transition={{ duration: 2, ease: "easeOut", delay: 0.2 }} strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#14B8A6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className={`text-4xl font-black bg-clip-text text-transparent bg-linear-to-br ${isDark ? 'from-white to-gray-400' : 'from-gray-800 to-gray-500'}`}>{storagePercent}%</motion.span>
                    <span className={`text-[10px] font-bold tracking-widest mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>USED</span>
                  </div>
                </motion.div>
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-75 group-hover:scale-95 transition-transform duration-500" />
              </div>
              <div className="mt-8 space-y-4">
                {storageBreakdown.map((i, idx) => (
                  <motion.div key={idx} whileHover={{ x: 4, scale: 1.02 }} className="group/item cursor-pointer p-2 -mx-2 rounded-xl transition-colors hover:bg-gray-500/5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className={`font-semibold flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${i.c} shadow-[0_0_8px_rgba(0,0,0,0.2)]`} style={{ boxShadow: `0 0 10px var(--tw-shadow-color)` }} shadow-color={i.c.replace('bg-', '')} />{i.l}
                      </span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{i.v}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} shadow-inner`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${i.p}%` }} transition={{ duration: 1.5, delay: idx * 0.15, type: 'spring' }} className={`h-full bg-linear-to-r ${i.g} rounded-full relative overflow-hidden group-hover/item:brightness-110`}>
                        <motion.div className="absolute inset-0 bg-white/20" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ChartBox>
            
            <ChartBox label="Activity" isDark={isDark} className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3 -mt-1">
                <span className="text-2xl md:text-3xl font-black text-emerald-500">+24%</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>vs last week</span>
              </div>
              <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Weekly upload activity by day</p>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dynamicChartData} margin={{ top: 8, right: 10, left: -14, bottom: 18 }}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid vertical={false} stroke={isDark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)'} strokeDasharray="4 4" />
                  <YAxis hide domain={[0, 'dataMax + 20']} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={12}
                    tickMargin={10}
                    height={32}
                    padding={{ left: 12, right: 12 }}
                    tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10B981' }}
                    labelFormatter={(label) => dayNameMap[label] || label}
                    formatter={(value) => [`${value} MB`, 'Uploaded']}
                    cursor={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="uv" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorUv)" activeDot={{ r: 6, fill: "#10B981", stroke: isDark ? '#1F2937' : '#FFFFFF', strokeWidth: 3 }} filter="url(#glow)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
          </motion.div>
        )}

      {/* Files Section */}
      <motion.div variants={itemVariants} className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-gray-200/20 dark:border-gray-700/50 pb-4">
          <div>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              <Ic.Folder /> {q ? 'Search Results' : cat === 'home' ? 'Recent Files' : `${cat.charAt(0).toUpperCase() + cat.slice(1)} Files`}
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {shownFiles.length === 0 ? 'No files' : `${Math.min((currentPage - 1) * pageSize + 1, shownFiles.length)}–${Math.min(currentPage * pageSize, shownFiles.length)} of ${shownFiles.length} files`} {isHomeRecent && filt.length > shownFiles.length ? `(of ${filt.length} total)` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (telegramActionsDisabled) return;
                  const event = new Event('telegramSyncRequested');
                  window.dispatchEvent(event);
                }}
                disabled={telegramActionsDisabled}
                className={`w-full sm:w-auto flex justify-center items-center h-10 px-4 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-lg gap-2 ${telegramActionsDisabled ? 'bg-[#0088cc]/40 text-white/70 cursor-not-allowed shadow-[#0088cc]/10' : 'bg-[#0088cc] text-white hover:bg-[#0077b5] shadow-[#0088cc]/20'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg> Sync New
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (telegramActionsDisabled) return;
                  const event = new Event('telegramFullSyncRequested');
                  window.dispatchEvent(event);
                }}
                disabled={telegramActionsDisabled}
                className={`w-full sm:w-auto flex justify-center items-center h-10 px-4 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-lg gap-2 ${telegramActionsDisabled ? 'bg-[#0088cc]/30 text-white/60 cursor-not-allowed shadow-[#0088cc]/10' : 'bg-[#0088cc]/80 text-white hover:bg-[#0077b5] shadow-[#0088cc]/20'}`}
                title="Force full sync - fetches all files from Telegram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Full Sync
              </motion.button>
            </div>
            <div className={`flex p-1 rounded-xl shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
              <button onClick={() => setIsGrid(true)} className={`p-2 rounded-lg transition-colors ${isGrid ? (isDark ? 'bg-gray-700 text-emerald-400 shadow-sm' : 'bg-gray-100 text-emerald-600 shadow-sm') : (isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50')}`}>
                <Ic.Grid />
              </button>
              <button onClick={() => setIsGrid(false)} className={`p-2 rounded-lg transition-colors ${!isGrid ? (isDark ? 'bg-gray-700 text-emerald-400 shadow-sm' : 'bg-gray-100 text-emerald-600 shadow-sm') : (isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50')}`}>
                <Ic.List />
              </button>
            </div>
            {/* ── Filter button + dropdown ─────────────────────────────────────── */}
            <div className="relative">
              <button
                onClick={() => { setShowFilter(!showFilter); setNameQuery(q || ''); }}
                className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm transition-all hover:scale-105
                  ${showFilter
                    ? (isDark ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border border-emerald-300 text-emerald-600')
                    : (isDark ? 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600' : 'bg-white border border-gray-100 text-gray-500 hover:text-gray-800 hover:border-gray-300')}`}
              >
                <Ic.Filter />
              </button>

              <AnimatePresence>
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                    // Fixed positioning keeps the panel inside the viewport regardless of parent overflow
                    className={`
                      absolute right-0 top-full mt-2 z-50
                      w-[min(calc(100vw-2rem),22rem)]
                      rounded-2xl shadow-2xl border
                      ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
                    `}
                    // Stop clicks from bubbling to the document (would close it)
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                          <Ic.Filter />
                        </div>
                        <div>
                          <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Filter Files</h3>
                          <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Search by name, size, and type</p>
                        </div>
                        <button
                          onClick={() => setShowFilter(false)}
                          className={`ml-auto p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                        >
                          <Ic.X />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto overscroll-contain">

                      {/* Name Search */}
                      <div className="space-y-1.5">
                        <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Name contains
                        </label>
                        <input
                          value={nameQuery}
                          onChange={(e) => setNameQuery(e.target.value)}
                          placeholder="e.g. report, image, .jpg"
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all border
                            ${isDark
                              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500'
                              : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'}`}
                        />
                      </div>

                      {/* Min Size */}
                      <div className="space-y-1.5">
                        <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                          Minimum size (KB)
                        </label>
                        <div className="relative">
                          <input
                            value={minSizeKB}
                            onChange={(e) => setMinSizeKB(e.target.value.replace(/[^0-9.]/g, ''))}
                            placeholder="e.g. 100"
                            className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm outline-none transition-all border
                              ${isDark
                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'}`}
                          />
                          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>KB</span>
                        </div>
                      </div>

                      {/* File Type */}
                      <div className="space-y-1.5">
                        <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                          File type
                        </label>
                        {/* 5-column grid — always 5 cols so all buttons sit in one row */}
                        <div className={`grid grid-cols-5 gap-1.5 p-2 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          {[
                            { key: 'all',   label: 'All',    Icon: Ic.Grid  },
                            { key: 'image', label: 'Image',  Icon: Ic.Image },
                            { key: 'video', label: 'Video',  Icon: Ic.Video },
                            { key: 'doc',   label: 'Doc',    Icon: Ic.Doc   },
                            { key: 'music', label: 'Music',  Icon: Ic.Music },
                          ].map(({ key, label, Icon }) => {
                            const active = filterType === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setFilterType(key)}
                                className={`
                                  relative flex flex-col items-center justify-center gap-1
                                  py-2.5 px-1 rounded-lg text-[10px] font-semibold
                                  transition-all duration-150 select-none
                                  ${active
                                    ? (isDark
                                        ? 'bg-emerald-500/25 text-emerald-400 ring-1 ring-emerald-500/60 shadow-sm'
                                        : 'bg-white text-emerald-700 ring-1 ring-emerald-300 shadow-sm')
                                    : (isDark
                                        ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                        : 'text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm')}
                                `}
                              >
                                <Icon />
                                <span className="leading-none">{label}</span>
                                {active && (
                                  <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className={`px-4 py-3 border-t flex items-center justify-between gap-3 ${isDark ? 'border-gray-700 bg-gray-900/60' : 'border-gray-100 bg-gray-50'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterType('all');
                          setMinSizeKB('');
                          setNameQuery('');
                          setQ && setQ('');
                          setShowFilter(false);
                        }}
                        className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors
                          ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setQ && setQ(nameQuery);
                          setShowFilter(false);
                        }}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-105 transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {shownFiles.length > 0 ? (
            <>
            <motion.div
              layout
              variants={containerVariants}
              className={isGrid ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" : "flex flex-col gap-3"}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {paginatedFiles.map((f, i) => (
                  <motion.div
                    key={f.id}
                    variants={itemVariants}
                    layout="position"
                    exit={{ opacity: 0, scale: 0.75, filter: 'blur(4px)', transition: { duration: 0.18 } }}
                  >
                    <FileCard file={f} isDark={isDark} onPreview={() => openPreview({ file: f, items: previewableFiles, index: previewableFiles.findIndex((item) => item.id === f.id) })} isGrid={isGrid} idx={i} onDelete={onDelete} isSelected={selectedIds.has(f.id)} onToggleSelect={toggleSelectFile} isSelectMode={isSelectMode} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`mt-6 rounded-3xl p-4 sm:p-5 ${isDark ? 'bg-gray-800/40 border border-gray-700/40' : 'bg-white/60 border border-white/60 shadow-sm'} backdrop-blur-xl`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Showing <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{Math.min((currentPage - 1) * pageSize + 1, shownFiles.length)}</span> to <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{Math.min(currentPage * pageSize, shownFiles.length)}</span> of <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{shownFiles.length}</span> files
                  </p>
                  {/* Per-page selector */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`text-[11px] font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Per page</span>
                    <div className={`flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-gray-700/60' : 'bg-gray-100'}`}>
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPageSize(size)}
                          className={`min-w-8 h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all
                            ${pageSize === size
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/25'
                              : isDark
                                ? 'text-gray-400 hover:bg-gray-600 hover:text-white'
                                : 'text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-sm'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 sm:hidden">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold ${currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      Prev
                    </button>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{currentPage} / {totalPages}</span>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold ${currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      Next
                    </button>
                  </div>

                  <div className="hidden sm:flex items-center justify-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-xl transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-600'}`}
                      aria-label="First page"
                    >
                      <Ic.ChevronsLeft />
                    </button>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-xl transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-600'}`}
                      aria-label="Previous page"
                    >
                      <Ic.ChevronLeft />
                    </button>

                    <div className="flex items-center gap-1 mx-1 flex-wrap justify-center">
                      {pageNumbers.map((page, index) => {
                        if (page === '...') {
                          return <span key={`ellipsis-${index}`} className={`px-2 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>...</span>;
                        }

                        const isActive = page === currentPage;
                        return (
                          <motion.button
                            key={page}
                            whileHover={{ scale: isActive ? 1 : 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => goToPage(page)}
                            className={`relative min-w-9 h-9 px-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-linear-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25' : isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activePage"
                                className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-400 rounded-xl"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                              />
                            )}
                            <span className="relative z-10">{page}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-xl transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-600'}`}
                      aria-label="Next page"
                    >
                      <Ic.ChevronRight />
                    </button>
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-xl transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-600'}`}
                      aria-label="Last page"
                    >
                      <Ic.ChevronsRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            </>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-12 text-center rounded-3xl ${isDark ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-gray-50/50 border border-gray-200 border-dashed'}`}>
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'}`}><Ic.Search /></motion.div>
              <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>No files found</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Try a different search term or category.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
