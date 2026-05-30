import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Ic } from '../../icons';
import { chartData } from '../../data';
import { StatCard } from '../ui/StatCard';
import { ChartBox } from '../ui/ChartBox';
import { QuickAction } from '../ui/QuickAction';
import { FileCard } from '../ui/FileCard';
import { useRouter } from 'next/navigation';

export const Dashboard = ({ isDark, files, setFiles, cat, q, setQ, openPreview, user }) => {
  const router = useRouter();
  const [cm, setCm] = useState(null); // context menu file id
  const [isGrid, setIsGrid] = useState(true); // grid or list view state
  const [filterType, setFilterType] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [nameQuery, setNameQuery] = useState(q || '');
  const [minSizeKB, setMinSizeKB] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';

  const computeSize = (sizeStr) => {
    if (!sizeStr) return 0;
    const s = sizeStr.toString().toUpperCase();
    const val = parseFloat(s);
    if (isNaN(val)) return 0;
    if (s.includes('GB')) return val * 1024;
    if (s.includes('MB')) return val;
    if (s.includes('KB')) return val / 1024;
    if (s.includes('B')) return val / (1024 * 1024);
    // Raw numeric values are interpreted as bytes.
    return val / (1024 * 1024);
  };
  const totalMB = files.reduce((acc, f) => acc + computeSize(f.size), 0);
  const usedSpaceStr = totalMB > 1024 ? (totalMB / 1024).toFixed(1) + ' GB' : totalMB.toFixed(1) + ' MB';
  const sharedCount = files.filter(f => f.star).length;
  
  // Storage usage details
  const maxStorageMB = 100 * 1024; // 100 GB
  const storagePercent = Math.min((totalMB / maxStorageMB) * 100, 100).toFixed(0);
  const strokeDashoffset = 251.2 - (251.2 * (storagePercent / 100));

  const categorySizes = { image: 0, video: 0, doc: 0, music: 0, other: 0 };
  files.forEach(f => {
    const size = computeSize(f.size);
    if (f.type in categorySizes) categorySizes[f.type] += size;
    else categorySizes.other += size;
  });

  const getStorageDetails = (type, label, color, gradient) => {
    const size = categorySizes[type];
    const sizeStr = size > 1024 ? (size / 1024).toFixed(1) + ' GB' : size.toFixed(1) + ' MB';
    const percent = totalMB > 0 ? ((size / totalMB) * 100).toFixed(0) : 0;
    return { l: label, v: sizeStr, p: percent, c: color, g: gradient };
  };

  const storageBreakdown = [
    getStorageDetails('image', 'Images', 'bg-emerald-500', 'from-emerald-400 to-emerald-500'),
    getStorageDetails('video', 'Videos', 'bg-teal-500', 'from-teal-400 to-teal-500'),
    getStorageDetails('doc', 'Docs', 'bg-cyan-500', 'from-cyan-400 to-cyan-500'),
    getStorageDetails('music', 'Music', 'bg-blue-500', 'from-blue-400 to-blue-500'),
    getStorageDetails('other', 'Other', 'bg-slate-500', 'from-slate-400 to-slate-500')
  ];

  // Dynamic Chart Data mapping file sizes added each day
  const generateChartData = () => {
    const data = [
      { name: 'Mon', uv: 0 }, { name: 'Tue', uv: 0 }, { name: 'Wed', uv: 0 },
      { name: 'Thu', uv: 0 }, { name: 'Fri', uv: 0 }, { name: 'Sat', uv: 0 }, { name: 'Sun', uv: 0 }
    ];
    files.forEach(f => {
       const d = new Date(f.date);
       if (!isNaN(d.getTime())) {
          let dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
          data[dayIdx].uv += computeSize(f.size);
       }
    });
    return data.map(d => ({ ...d, uv: Math.max(10, Math.round(d.uv)) }));
  };
  const dynamicChartData = generateChartData();
  const dayNameMap = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday'
  };

  const stats = [
    { title: 'Total Files', val: files.length, sub: 'In your drive', color: 'emerald', ic: Ic.FileText },
    { title: 'Used Space', val: usedSpaceStr, sub: 'of 100 GB', color: 'blue', ic: Ic.HardDrive },
    { title: 'Starred', val: sharedCount, sub: 'important files', color: 'purple', ic: Ic.Star },
  ];

  const filt = files.filter(f =>  
    (cat === 'home' || cat === 'files' || f.type === cat) &&
    (filterType === 'all' || f.type === filterType) &&
    f.name.toLowerCase().includes((q || '').toLowerCase()) &&
    (minSizeKB === '' || (() => {
      const sizeMB = computeSize(f.size); // computeSize returns MB
      const minMB = parseFloat(minSizeKB) / 1024; // convert KB -> MB
      return !isNaN(minMB) ? sizeMB >= minMB : true;
    })())
  );

  const sortedByRecent = [...filt].sort((a, b) => {
    const aTime = new Date(a?.date || 0).getTime();
    const bTime = new Date(b?.date || 0).getTime();
    return (isNaN(bTime) ? 0 : bTime) - (isNaN(aTime) ? 0 : aTime);
  });
  const isHomeRecent = cat === 'home' && !q;
  const PAGE_SIZE = 30;
  const shownFiles = isHomeRecent ? sortedByRecent : filt;
  const totalPages = Math.max(1, Math.ceil(shownFiles.length / PAGE_SIZE));
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return shownFiles.slice(start, start + PAGE_SIZE);
  }, [shownFiles, currentPage]);
  const previewableFiles = shownFiles.filter((file) => file.type === 'image' || file.type === 'video');

  useEffect(() => {
    setCurrentPage(1);
  }, [cat, q, filterType, minSizeKB]);

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

  const star = (id) => { setFiles(files.map(f => f.id === id ? { ...f, star: !f.star } : f)); setCm(null); };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="px-4 py-4 md:px-8 md:py-8 w-full space-y-8 max-w-480 mx-auto overflow-hidden"
    >
      {/* Header & Stats */}
      {cat === 'home' && (
        <motion.div variants={itemVariants} className="space-y-8">
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
      <div className="flex flex-col space-y-8">
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
              {shownFiles.length === 0 ? 'No files' : `${Math.min((currentPage - 1) * PAGE_SIZE + 1, shownFiles.length)}-${Math.min(currentPage * PAGE_SIZE, shownFiles.length)} of ${shownFiles.length} files`} {isHomeRecent && filt.length > shownFiles.length ? `(of ${filt.length} total)` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const event = new Event('telegramSyncRequested');
                  window.dispatchEvent(event);
                }}
                className="w-full sm:w-auto flex justify-center items-center h-10 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#0088cc] text-white hover:bg-[#0077b5] transition-colors shadow-lg shadow-[#0088cc]/20 gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg> Sync New
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const event = new Event('telegramFullSyncRequested');
                  window.dispatchEvent(event);
                }}
                className="w-full sm:w-auto flex justify-center items-center h-10 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#0088cc]/80 text-white hover:bg-[#0077b5] transition-colors shadow-lg shadow-[#0088cc]/20 gap-2"
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
            <div className="relative">
              <button onClick={() => { setShowFilter(!showFilter); setNameQuery(q || ''); }} className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm transition-all hover:scale-105 ${isDark ? 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600' : 'bg-white border border-gray-100 text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}>
                <Ic.Filter />
              </button>
              {showFilter && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  className={`absolute right-0 top-full mt-2 min-w-[calc(100vw-2rem)] w-[calc(100vw-2rem)] sm:w-80 max-w-[calc(100vw-2rem)] sm:max-w-[20rem] rounded-2xl shadow-2xl z-20 overflow-hidden ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}
                >
                  <div className={`px-5 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                        <Ic.Search />
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Advanced Search</h3>
                        <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Filter files by name, size, and type</p>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 sm:space-y-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {/* Name Search */}
                    <div className="space-y-2">
                      <label className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Name contains
                      </label>
                      <input 
                        value={nameQuery} 
                        onChange={(e) => setNameQuery(e.target.value)} 
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border ${isDark ? 'bg-gray-700/50 border-gray-600 text-white focus:border-emerald-500 focus:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'}`} 
                        placeholder="e.g. report, image, .jpg" 
                      />
                    </div>
                    
                    {/* Min Size */}
                    <div className="space-y-2">
                      <label className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Minimum size (KB)
                      </label>
                      <div className="relative">
                        <input 
                          value={minSizeKB} 
                          onChange={(e) => setMinSizeKB(e.target.value.replace(/[^0-9.]/g, ''))} 
                          className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border ${isDark ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10'}`} 
                          placeholder="e.g. 100" 
                        />
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>KB</span>
                      </div>
                    </div>
                    
                    {/* Type Filter */}
                    <div className="space-y-2">
                      <label className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        File type
                      </label>
                      <div className={`grid grid-cols-2 sm:grid-cols-5 gap-2 ${isDark ? 'bg-gray-700/30 p-2.5 sm:p-3 rounded-xl' : 'bg-gray-100 p-2.5 sm:p-3 rounded-xl'}`}>
                        {['all','image','video','doc','music'].map((t) => (
                          <button 
                            key={t} 
                            onClick={() => setFilterType(t)} 
                            className={`relative flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[11px] transition-all min-h-13 ${filterType === t 
                              ? (isDark ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200') 
                              : (isDark ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-500 hover:bg-gray-200')}`}
                          >
                            {t === 'all' && <Ic.Grid />}
                            {t === 'image' && <Ic.Image />}
                            {t === 'video' && <Ic.Video />}
                            {t === 'doc' && <Ic.Doc />}
                            {t === 'music' && <Ic.Music />}
                            <span className="font-medium">{t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}</span>
                            {filterType === t && (
                              <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer Actions */}
                  <div className={`px-4 sm:px-5 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <button 
                        onClick={() => { 
                          setFilterType('all'); 
                          setMinSizeKB(''); 
                          setNameQuery(''); 
                          setQ && setQ(''); 
                          setShowFilter(false); 
                        }} 
                        className={`w-full sm:w-auto text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                      >
                        Reset
                      </button>
                      <button 
                        onClick={() => { 
                          setQ && setQ(nameQuery); 
                          setShowFilter(false); 
                        }} 
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105 transition-all"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        
        {shownFiles.length > 0 ? (
            <>
            <motion.div variants={containerVariants} className={isGrid ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" : "flex flex-col gap-3"}>
              <AnimatePresence mode="wait" initial={false}>
                {paginatedFiles.map((f, i) => (
                  <motion.div 
                    key={f.id} 
                    variants={itemVariants}
                    layout 
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(5px)" }} 
                    whileHover={isGrid ? { y: -8, scale: 1.03, zIndex: 10 } : { x: 4, zIndex: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <FileCard file={f} isDark={isDark} onPreview={() => openPreview({ file: f, items: previewableFiles, index: previewableFiles.findIndex((item) => item.id === f.id) })} isGrid={isGrid} idx={i} onDelete={(id) => setFiles(files.filter(file => file.id !== id))} />
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
                    Showing <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{Math.min((currentPage - 1) * PAGE_SIZE + 1, shownFiles.length)}</span> to <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{Math.min(currentPage * PAGE_SIZE, shownFiles.length)}</span> of <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{shownFiles.length}</span> files
                  </p>
                  <div className={`inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full text-[11px] font-bold ${isDark ? 'bg-gray-700/70 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    <Ic.List />
                    <span>{PAGE_SIZE} per page</span>
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
