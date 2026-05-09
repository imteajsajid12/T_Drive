import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { Ic } from '../../icons';
import { chartData } from '../../data';
import { StatCard } from '../ui/StatCard';
import { ChartBox } from '../ui/ChartBox';
import { QuickAction } from '../ui/QuickAction';
import { FileCard } from '../ui/FileCard';

export const Dashboard = ({ isDark, files, setFiles, cat, q, openPreview }) => {
  const [cm, setCm] = useState(null); // context menu file id

  const stats = [
    { title: 'Total Files', val: files.length, sub: '+12% this week', color: 'emerald', ic: Ic.FileText },
    { title: 'Used Space', val: '45.2 GB', sub: 'of 100 GB', color: 'blue', ic: Ic.HardDrive },
    { title: 'Shared', val: '12', sub: 'active links', color: 'purple', ic: Ic.Share },
  ];

  const filt = files.filter(f =>  
    (cat === 'home' || cat === 'files' || f.type === cat) &&
    f.name.toLowerCase().includes(q.toLowerCase())
  );

  const star = (id) => { setFiles(files.map(f => f.id === id ? { ...f, star: !f.star } : f)); setCm(null); };

  return (
    <div className="px-4 py-4 md:px-8 md:py-8 w-full space-y-8 max-w-[1920px] mx-auto">
      {/* Header & Stats */}
      {cat === 'home' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div>
            <h1 className={`text-3xl md:text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Welcome back, Alex! 👋</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Here's what's happening with your files today.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s, i) => <StatCard key={i} {...s} isDark={isDark} />)}
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="flex flex-col space-y-8">
        {/* Quick Actions (Home only) */}
        {cat === 'home' && !q && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}><Ic.Star /> Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
              <QuickAction ic={Ic.Folder} label="New Folder" desc="Create directory" grad="from-blue-400 to-indigo-500" isDark={isDark} />
              <QuickAction ic={Ic.Upload} label="Upload" desc="Any file types" grad="from-emerald-400 to-teal-500" isDark={isDark} />
              <QuickAction ic={Ic.Share} label="Shared" desc="View active links" grad="from-purple-400 to-pink-500" isDark={isDark} />
              <QuickAction ic={Ic.Trash} label="Trash" desc="Deleted files" grad="from-red-400 to-rose-500" isDark={isDark} />
            </div>
          </motion.div>
        )}

        {/* Charts Row */}
        {(cat === 'home' || cat === 'analytics') && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartBox label="Storage Usage" isDark={isDark} className="lg:col-span-1">
              <div className="relative w-full aspect-square max-w-[200px] mx-auto mt-4 group cursor-pointer">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} className="relative z-10">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="none" className={isDark ? 'text-gray-700/50' : 'text-gray-100'} />
                    <motion.circle cx="50" cy="50" r="40" stroke="url(#gradient)" strokeWidth="12" fill="none" strokeDasharray="251.2" initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset: 138.16 }} transition={{ duration: 2, ease: "easeOut", delay: 0.2 }} strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#14B8A6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br ${isDark ? 'from-white to-gray-400' : 'from-gray-800 to-gray-500'}`}>45%</motion.span>
                    <span className={`text-[10px] font-bold tracking-widest mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>USED</span>
                  </div>
                </motion.div>
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-75 group-hover:scale-95 transition-transform duration-500" />
              </div>
              <div className="mt-8 space-y-4">
                {[
                  { l: 'Images', v: '15 GB', p: 35, c: 'bg-emerald-500', g: 'from-emerald-400 to-emerald-500' },
                  { l: 'Videos', v: '20 GB', p: 45, c: 'bg-teal-500', g: 'from-teal-400 to-teal-500' },
                  { l: 'Docs', v: '10.2 GB', p: 20, c: 'bg-cyan-500', g: 'from-cyan-400 to-cyan-500' }
                ].map((i, idx) => (
                  <motion.div key={idx} whileHover={{ x: 4, scale: 1.02 }} className="group/item cursor-pointer p-2 -mx-2 rounded-xl transition-colors hover:bg-gray-500/5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className={`font-semibold flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${i.c} shadow-[0_0_8px_rgba(0,0,0,0.2)]`} style={{ boxShadow: `0 0 10px var(--tw-shadow-color)` }} shadow-color={i.c.replace('bg-', '')} />{i.l}
                      </span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{i.v}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} shadow-inner`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${i.p}%` }} transition={{ duration: 1.5, delay: idx * 0.15, type: 'spring' }} className={`h-full bg-gradient-to-r ${i.g} rounded-full relative overflow-hidden group-hover/item:brightness-110`}>
                        <motion.div className="absolute inset-0 bg-white/20" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ChartBox>
            
            <ChartBox label="Activity" isDark={isDark} className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4 -mt-2">
                <span className="text-2xl font-black text-emerald-500">+24%</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>vs last week</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10B981' }}
                    cursor={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="uv" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorUv)" activeDot={{ r: 6, fill: "#10B981", stroke: isDark ? '#1F2937' : '#FFFFFF', strokeWidth: 3 }} filter="url(#glow)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
          </motion.div>
        )}

        {/* Files Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {q ? 'Search Results' : cat === 'home' ? 'Recent Files' : `All ${cat === 'files' ? '' : cat} files`}
            </h2>
            <div className="flex items-center gap-2">
              <button className={`p-2 rounded-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-sm`}><Ic.Grid /></button>
              <button className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Ic.List /></button>
            </div>
          </div>
          
          {filt.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              <AnimatePresence>
                {filt.map((f, i) => (
                  <motion.div key={f.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}>
                    <FileCard file={f} isDark={isDark} onPreview={() => openPreview(f)} isGrid={true} idx={i} onDelete={(id) => setFiles(files.filter(file => file.id !== id))} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className={`p-12 text-center rounded-3xl ${isDark ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-gray-50/50 border border-gray-200 border-dashed'}`}>
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'}`}><Ic.Search /></div>
              <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>No files found</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Try a different search term or category.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
