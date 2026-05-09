import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';

export const UploadModal = ({ open, close, isDark, onUpload }) => {
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState({});
  const ref = useRef(null);
  if (!open) return null;

  const drop = (e) => { e.preventDefault(); setDrag(false); handleFiles(Array.from(e.dataTransfer.files)); };
  const pick = (e) => { handleFiles(Array.from(e.target.files)); };
  const handleFiles = (fs) => {
    fs.forEach((f) => {
      const id = Date.now() + Math.random();
      setProgress((p) => ({ ...p, [id]: { name: f.name, prog: 0 } }));
      let p = 0;
      const iv = setInterval(() => {
        p += Math.random() * 20 + 5;
        if (p >= 100) {
          p = 100; clearInterval(iv);
          const tp = f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : f.type.startsWith('audio') ? 'music' : 'doc';
          setTimeout(() => {
            onUpload({ id: Date.now(), name: f.name, type: tp, size: (f.size / 1048576).toFixed(1) + ' MB', date: new Date().toISOString().split('T')[0] });
            setProgress((prev) => { const n = { ...prev }; delete n[id]; return n; });
          }, 300);
        } else { setProgress((prev) => ({ ...prev, [id]: { ...prev[id], prog: p } })); }
      }, 150);
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={close}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} transition={{ type: 'spring' }} onClick={(e) => e.stopPropagation()} className={`w-full max-w-lg rounded-3xl overflow-hidden ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-2xl`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Upload Files</h2>
          <button onClick={close} className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Ic.X /></button>
        </div>
        <div className="p-6">
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop} onClick={() => ref.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${drag ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'border-gray-600/50 hover:border-emerald-400/50' : 'border-gray-300 hover:border-emerald-400'}`}>
            <motion.div animate={drag ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: drag ? Infinity : 0, duration: 1 }} className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${drag ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-700 text-gray-400' : 'bg-emerald-100 text-emerald-500'}`}><Ic.Upload /></motion.div>
            <p className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{drag ? 'Drop files here' : 'Drag & drop files'}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>or click to browse</p>
            <input ref={ref} type="file" multiple onChange={pick} className="hidden" />
          </div>
          {Object.keys(progress).length > 0 && (
            <div className="mt-5 space-y-3">
              {Object.entries(progress).map(([id, item]) => (
                <div key={id} className={`p-3 rounded-xl ${isDark ? 'bg-gray-700/40' : 'bg-emerald-50/60'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-medium truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{Math.round(item.prog)}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-emerald-100'}`}>
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" initial={{ width: 0 }} animate={{ width: item.prog + '%' }} />
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
