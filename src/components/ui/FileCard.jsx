import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';
import { tIcon, tGrad, fmt, getFileIcon } from '../../utils';

export const FileCard = ({ file, isGrid, isDark, onPreview, onDelete, idx }) => {
  const TI = getFileIcon(file.name, file.type);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    setMediaFailed(false);
    const sourceExists = !!(file?.thumb || file?.url);
    setMediaLoading((file?.type === 'image' || file?.type === 'video') && sourceExists);
  }, [file?.id]);

  const proxify = (url) => {
    if (!url) return '';
    if (url.startsWith('https://api.telegram.org')) {
      return `/api/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };
  const imageSource = proxify(file.thumb || file.url);
  const videoSource = proxify(file.url || file.thumb);
  const canShowImage = file.type === 'image' && imageSource && !mediaFailed;
  const canShowVideo = file.type === 'video' && videoSource && !mediaFailed;

  return (
    <motion.div layout initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, delay: idx * 0.04 }} whileHover={{ scale: 1.02, y: -4 }} onClick={() => onPreview(file)} className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${isDark ? 'bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]' : 'bg-white border border-gray-100 shadow-sm hover:shadow-xl'}`}>
      <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full bg-gradient-to-br ${tGrad(file.type)} opacity-20`} />
        <div className={`absolute bottom-0 left-0 w-32 h-32 blur-[40px] rounded-full bg-gradient-to-tr ${tGrad(file.type)} opacity-20`} />
      </motion.div>
      {isGrid && (
        <div className="relative h-36 overflow-hidden">
          {(canShowImage || canShowVideo) && mediaLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-8 w-8 rounded-full border-3 border-white/40 border-t-emerald-400"
              />
            </div>
          )}
          {canShowImage ? (
            <img
              src={imageSource}
              alt=""
              onLoad={() => setMediaLoading(false)}
              onError={() => {
                setMediaFailed(true);
                setMediaLoading(false);
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : canShowVideo ? (
            <video
              src={videoSource}
              onLoadedData={() => setMediaLoading(false)}
              onError={() => {
                setMediaFailed(true);
                setMediaLoading(false);
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
              preload="metadata"
              muted
              playsInline
            />
          ) : (
            <div className={`relative h-full flex items-center justify-center ${file.type === 'doc' ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700' : ''} transition-all duration-500`}>
              {file.type !== 'doc' && (
                <div className={`absolute inset-0 bg-gradient-to-br ${tGrad(file.type)} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
              )}
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }} className={`relative z-10 ${file.type === 'doc' ? 'opacity-100' : 'opacity-80 text-emerald-600 dark:text-emerald-400'} scale-[2.5]`}><TI /></motion.div>
            </div>
          )}
          {file.type === 'video' && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition-all duration-300"><motion.div whileHover={{ scale: 1.1 }} className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-emerald-600 shadow-lg"><Ic.Play /></motion.div></div>}
        </div>
      )}
      <div className={`relative z-10 p-5 ${!isGrid ? 'flex items-center gap-4' : ''}`}>
        {!isGrid && (
          <div className={`relative w-12 h-12 rounded-2xl ${file.type === 'doc' ? 'bg-gray-100 dark:bg-gray-800' : `bg-gradient-to-br ${tGrad(file.type)} text-white`} flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden`}>
            {(canShowImage || canShowVideo) && mediaLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-4 w-4 rounded-full border-2 border-white/50 border-t-emerald-300"
                />
              </div>
            )}
            {canShowImage ? (
              <img
                src={imageSource}
                alt=""
                onLoad={() => setMediaLoading(false)}
                onError={() => {
                  setMediaFailed(true);
                  setMediaLoading(false);
                }}
                className="w-full h-full object-cover"
              />
            ) : canShowVideo ? (
              <video
                src={videoSource}
                onLoadedData={() => setMediaLoading(false)}
                onError={() => {
                  setMediaFailed(true);
                  setMediaLoading(false);
                }}
                className="w-full h-full object-cover pointer-events-none"
                preload="metadata"
                muted
                playsInline
              />
            ) : (
              <motion.div whileHover={{ scale: 1.2, rotate: 10 }} transition={{ type: "spring" }}><TI /></motion.div>
            )}
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }} />
          </div>
        )}
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
