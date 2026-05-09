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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Quick Actions (Home only) */}
          {cat === 'home' && !q && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}><Ic.Star /> Quick Access</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <QuickAction ic={Ic.Folder} label="New Folder" bg={isDark ? 'bg-blue-500/20' : 'bg-blue-50'} text={isDark ? 'text-blue-400' : 'text-blue-600'} hover={isDark ? 'hover:bg-blue-500/30' : 'hover:bg-blue-100'} />
                <QuickAction ic={Ic.Upload} label="Upload" bg={isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'} text={isDark ? 'text-emerald-400' : 'text-emerald-600'} hover={isDark ? 'hover:bg-emerald-500/30' : 'hover:bg-emerald-100'} />
                <QuickAction ic={Ic.Share} label="Shared" bg={isDark ? 'bg-purple-500/20' : 'bg-purple-50'} text={isDark ? 'text-purple-400' : 'text-purple-600'} hover={isDark ? 'hover:bg-purple-500/30' : 'hover:bg-purple-100'} />
                <QuickAction ic={Ic.Trash} label="Trash" bg={isDark ? 'bg-red-500/20' : 'bg-red-50'} text={isDark ? 'text-red-400' : 'text-red-600'} hover={isDark ? 'hover:bg-red-500/30' : 'hover:bg-red-100'} />
              </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

        {/* Right Sidebar (Charts) */}
        {(cat === 'home' || cat === 'analytics') && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <ChartBox label="Storage Usage" isDark={isDark}>
              <div className="relative w-full aspect-square max-w-[200px] mx-auto mt-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="none" className={isDark ? 'text-gray-700' : 'text-gray-100'} />
                  <motion.circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="none" strokeDasharray="251.2" initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset: 138.16 }} transition={{ duration: 1.5, ease: "easeOut" }} className="text-emerald-500" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>45%</span>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>USED</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { l: 'Images', v: '15 GB', p: 35, c: 'bg-emerald-500' },
                  { l: 'Videos', v: '20 GB', p: 45, c: 'bg-teal-500' },
                  { l: 'Docs', v: '10.2 GB', p: 20, c: 'bg-cyan-500' }
                ].map((i, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${i.c}`} />{i.l}
                      </span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{i.v}</span>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${i.p}%` }} transition={{ duration: 1, delay: idx * 0.1 }} className={`h-full ${i.c} rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </ChartBox>
            
            <ChartBox label="Activity" isDark={isDark}>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="uv" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
          </motion.div>
        )}
      </div>
    </div>
  );
};
