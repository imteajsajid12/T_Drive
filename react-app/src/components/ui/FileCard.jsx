import React from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';
import { tIcon, tGrad, fmt } from '../../utils';

export const FileCard = ({ file, isGrid, isDark, onPreview, onDelete, idx }) => {
  const TI = tIcon(file.type);
  return (
    <motion.div layout initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, delay: idx * 0.04 }} whileHover={{ scale: 1.02, y: -4 }} onClick={() => onPreview(file)} className={`rounded-3xl overflow-hidden cursor-pointer transition-all ${isDark ? 'bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30' : 'bg-white/50 hover:bg-white border border-white/40 shadow-sm hover:shadow-xl'}`}>
      {isGrid && (
        <div className="relative h-32 overflow-hidden">
          {file.thumb ? <img src={file.thumb} alt="" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" /> : <div className={`h-full flex items-center justify-center bg-gradient-to-br ${tGrad(file.type)} opacity-20`}><TI /></div>}
          {file.type === 'video' && <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity"><div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-emerald-600"><Ic.Play /></div></div>}
        </div>
      )}
      <div className={`p-4 ${!isGrid ? 'flex items-center gap-3' : ''}`}>
        {!isGrid && <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tGrad(file.type)} text-white flex items-center justify-center flex-shrink-0 shadow-md`}><TI /></div>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold truncate text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</h3>
            {file.star && <span className="text-yellow-400"><Ic.Star /></span>}
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{file.size} • {fmt(file.date)}</p>
        </div>
        {!isGrid && (
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); onPreview(file); }} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-emerald-50 text-gray-500'}`}><Ic.Eye /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(file.id); }} className={`p-1.5 rounded-lg text-red-400 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-red-50'}`}><Ic.Trash /></button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
