'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ic } from '../../icons';
import { getLoginLogs, deleteLoginLog, clearAllLoginLogs } from '../../lib/supabase';
import Swal from 'sweetalert2';

const parseUA = (ua = '') => {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  const browser =
    ua.includes('Edg/')    ? 'Edge'    :
    ua.includes('Chrome/') ? 'Chrome'  :
    ua.includes('Firefox/')? 'Firefox' :
    ua.includes('Safari/') && !ua.includes('Chrome') ? 'Safari' :
    ua.includes('OPR/') || ua.includes('Opera') ? 'Opera' : 'Browser';

  const os =
    ua.includes('Windows NT')              ? 'Windows' :
    ua.includes('Mac OS X')                ? 'macOS'   :
    ua.includes('Android')                 ? 'Android' :
    ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' :
    ua.includes('Linux')                   ? 'Linux'   : 'Unknown OS';

  const device =
    ua.includes('Mobile') || ua.includes('iPhone') ? 'Mobile' :
    ua.includes('Tablet') || ua.includes('iPad')   ? 'Tablet' : 'Desktop';

  return { browser, os, device };
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const EVENT_CONFIG = {
  login:   { label: 'Login',   bg: 'bg-emerald-500/15', text: 'text-emerald-500' },
  logout:  { label: 'Logout',  bg: 'bg-rose-500/15',    text: 'text-rose-500'    },
  attempt: { label: 'Attempt', bg: 'bg-amber-500/15',   text: 'text-amber-500'   },
};

const EventBadge = ({ event }) => {
  const cfg = EVENT_CONFIG[event] || EVENT_CONFIG.attempt;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
      {event === 'login'  && <Ic.LogIn />}
      {event === 'logout' && <Ic.X />}
      {event === 'attempt'&& <Ic.AlertTriangle />}
      {cfg.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const ok = status === 'success';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
      ${ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {ok ? 'Success' : 'Failed'}
    </span>
  );
};

const DeviceIcon = ({ device }) => {
  if (device === 'Mobile') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
  );
  if (device === 'Tablet') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
  );
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  );
};

const RLS_FIX_SQL = `ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY;`;

export const LoginLogPage = ({ isDark, user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);

  const swalBase = {
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#1e293b',
    customClass: {
      popup: 'rounded-3xl shadow-2xl',
      confirmButton: 'px-6 py-2.5 rounded-xl font-bold text-white',
      cancelButton: 'px-6 py-2.5 rounded-xl font-bold',
    },
  };

  const loadLogs = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    setHasPermissionError(false);

    // Supabase RLS blocks INSERT with error 42501 (detectable) but blocks SELECT
    // silently — returning [] with no error. So we persist the RLS flag from the
    // login flow and check it here.
    const rlsFlag = typeof localStorage !== 'undefined' && localStorage.getItem('tDrive:loginLogRLSError');
    if (rlsFlag) {
      setHasPermissionError(true);
      setLogs([]);
      setLoading(false);
      return;
    }

    const data = await getLoginLogs(user.$id, 100);
    // null = explicit error returned (e.g. 42501 on SELECT if RLS ever does surface it, or table missing)
    if (data === null) {
      setHasPermissionError(true);
      setLogs([]);
    } else {
      setLogs(data);
    }
    setLoading(false);
  }, [user?.$id]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleDeleteOne = async (log) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Delete this entry?',
      text: `${EVENT_CONFIG[log.event]?.label || log.event} on ${formatDate(log.created_at)}`,
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      ...swalBase,
    });
    if (!isConfirmed) return;

    setDeletingId(log.id);
    const ok = await deleteLoginLog(log.id);
    if (ok) {
      setLogs(prev => prev.filter(l => l.id !== log.id));
    }
    setDeletingId(null);
  };

  const handleClearAll = async () => {
    if (!logs.length) return;
    const { isConfirmed } = await Swal.fire({
      title: 'Clear all activity logs?',
      text: `This will permanently delete all ${logs.length} log entries.`,
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, clear all',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      ...swalBase,
    });
    if (!isConfirmed) return;

    setClearingAll(true);
    const ok = await clearAllLoginLogs(user.$id);
    if (ok) setLogs([]);
    setClearingAll(false);
  };

  const loginCount  = logs.filter(l => l.event === 'login').length;
  const failCount   = logs.filter(l => l.status === 'failed').length;
  const attemptCount= logs.filter(l => l.event === 'attempt').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>Login Activity</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Every sign-in, sign-out, and failed attempt for your account.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh */}
          <motion.button
            onClick={loadLogs}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors
              ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
            title="Refresh"
          >
            <motion.span animate={loading ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}>
              <Ic.Refresh />
            </motion.span>
          </motion.button>
          {/* Clear all */}
          <motion.button
            onClick={handleClearAll}
            disabled={clearingAll || !logs.length}
            whileHover={logs.length ? { scale: 1.03 } : {}}
            whileTap={logs.length ? { scale: 0.97 } : {}}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${!logs.length
                ? 'opacity-40 cursor-not-allowed bg-red-500/20 text-red-400'
                : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'}`}
          >
            {clearingAll
              ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              : <Ic.Trash />}
            Clear All
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: logs.length,   color: 'blue'    },
          { label: 'Logins',       value: loginCount,    color: 'emerald' },
          { label: 'Attempts',     value: attemptCount,  color: attemptCount > 0 ? 'amber' : 'gray' },
          { label: 'Failed',       value: failCount,     color: failCount  > 0 ? 'red'   : 'gray' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl p-4 text-center shadow-sm
            ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <p className={`text-2xl font-black
              ${color === 'emerald' ? 'text-emerald-500' :
                color === 'red'     ? 'text-red-500'     :
                color === 'amber'   ? 'text-amber-500'   :
                color === 'blue'    ? (isDark ? 'text-blue-400' : 'text-blue-600') :
                isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {value}
            </p>
            <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* RLS / Permission error banner */}
      {hasPermissionError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 border-amber-500/40 p-5 space-y-3
            ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-amber-500 mt-0.5 flex-shrink-0"><Ic.AlertTriangle /></span>
            <div>
              <p className={`font-bold text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                Supabase Row Level Security is blocking access
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                When tables are created in the Supabase Dashboard, RLS is enabled by default with no policies — so reads and writes both fail silently. Run this one line in your Supabase SQL Editor to fix it:
              </p>
            </div>
          </div>
          <div className={`rounded-xl p-3 font-mono text-xs flex items-center justify-between gap-3
            ${isDark ? 'bg-gray-900 text-emerald-400' : 'bg-white text-emerald-700 border border-amber-200'}`}>
            <code>{RLS_FIX_SQL}</code>
            <button
              onClick={async () => {
                await navigator.clipboard?.writeText(RLS_FIX_SQL);
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors
                ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
            >
              Copy SQL
            </button>
          </div>
          <p className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Go to <strong>supabase.com</strong> → your project → <strong>SQL Editor</strong> → paste and run.
            Then come back, log out, log in again, and refresh this page.
          </p>
        </motion.div>
      )}

      {/* Log list */}
      <div className={`rounded-3xl overflow-hidden shadow-sm
        ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>

        {/* Card header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between
          ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <Ic.Clock /> Recent Events
          </h2>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full
            ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className={`w-5 h-5 border-2 border-current border-t-transparent rounded-full
                ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`}
            />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading activity…</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4
              ${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
              <Ic.Activity />
            </div>
            <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-700'}`}>
              {hasPermissionError ? 'Access blocked by RLS' : 'No activity yet'}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {hasPermissionError
                ? 'Fix the RLS issue above, then log out and log back in.'
                : 'Logs will appear here after your next login or logout.'}
            </p>
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-gray-700/50' : 'divide-gray-100'}`}>
            <AnimatePresence initial={false}>
              {logs.map((log, i) => {
                const { browser, os, device } = parseUA(log.user_agent);
                const isDeleting = deletingId === log.id;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: isDeleting ? 0.4 : 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                    transition={{ delay: i < 20 ? i * 0.02 : 0 }}
                    className={`group flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 transition-colors
                      ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}
                  >
                    {/* Event badge */}
                    <div className="flex-shrink-0 w-24">
                      <EventBadge event={log.event} />
                    </div>

                    {/* Device info */}
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-2 text-sm font-semibold
                        ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          <DeviceIcon device={device} />
                        </span>
                        {browser} · {os}
                        <span className={`text-xs font-normal ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          ({device})
                        </span>
                      </div>
                      {log.email && (
                        <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {log.email}
                        </p>
                      )}
                      <p className={`text-[11px] mt-0.5 truncate ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
                         title={log.user_agent || ''}>
                        {log.user_agent
                          ? log.user_agent.slice(0, 68) + (log.user_agent.length > 68 ? '…' : '')
                          : 'No user-agent recorded'}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      <StatusBadge status={log.status} />
                    </div>

                    {/* Time */}
                    <div className="flex-shrink-0 text-right min-w-[100px]">
                      <p className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatDate(log.created_at)}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        {timeAgo(log.created_at)}
                      </p>
                    </div>

                    {/* Delete button — visible on hover */}
                    <div className="flex-shrink-0">
                      <motion.button
                        onClick={() => handleDeleteOne(log)}
                        disabled={isDeleting}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-all
                          ${isDark
                            ? 'text-gray-600 hover:text-red-400 hover:bg-red-500/10'
                            : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}
                        title="Delete this entry"
                      >
                        {isDeleting
                          ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                          : <Ic.Trash />}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
