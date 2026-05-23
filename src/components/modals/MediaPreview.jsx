import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';
import { tGrad, tIcon, fmt, formatTime, getFileIcon } from '../../utils';
import Swal from 'sweetalert2';

export const MediaPreview = ({ file, isOpen, onClose, isDark, onDelete }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const progressRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const videoRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoVolume, setVideoVolume] = useState(0.7);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setVideoPlaying(false);
    setVideoTime(0);
    setVideoDuration(0);
    setMediaError(false);
  }, [file?.id]);

  useEffect(() => {
    if (file?.type === 'music' && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, file]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };

  const handleProgressClick = (e) => {
    if (progressRef.current && audioRef.current && duration) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  const seekForward = () => { if (audioRef.current) { audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration); setCurrentTime(audioRef.current.currentTime); } };
  const seekBack = () => { if (audioRef.current) { audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0); setCurrentTime(audioRef.current.currentTime); } };

  const handleImageMouseDown = (e) => {
    if (zoom > 1) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleImageMouseMove = (e) => {
    if (isDragging.current) {
      setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    }
  };

  const handleImageMouseUp = () => { isDragging.current = false; };
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => {
    setZoom((z) => {
      const newZoom = Math.max(z - 0.25, 1);
      if (newZoom === 1) setPan({ x: 0, y: 0 });
      return newZoom;
    });
  };

  useEffect(() => {
    if (file?.type === 'video' && videoRef.current) {
      videoRef.current.volume = videoVolume;
    }
  }, [videoVolume, file]);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setVideoPlaying(!videoPlaying);
    }
  };

  const handleVideoTimeUpdate = () => { if (videoRef.current) setVideoTime(videoRef.current.currentTime); };
  const handleVideoLoadedMetadata = () => { if (videoRef.current) setVideoDuration(videoRef.current.duration); };

  const handleVideoProgressClick = (e) => {
    if (videoRef.current && videoDuration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoDuration;
      setVideoTime(pos * videoDuration);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.85, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 40 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()} className={`relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>

        <button
          onClick={onClose}
          aria-label="Close preview"
          className={`absolute top-3 right-3 z-20 p-2 rounded-xl transition-colors ${isDark ? 'bg-gray-800/90 hover:bg-gray-700 text-gray-300' : 'bg-white/95 hover:bg-gray-100 text-gray-600'} shadow-lg backdrop-blur-sm`}
        >
          <Ic.X />
        </button>
        
        {/* Header */}
        <div className={`flex items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className={`w-10 h-10 rounded-xl shrink-0 ${file.type === 'doc' ? 'bg-gray-100 dark:bg-gray-800' : `bg-linear-to-br ${tGrad(file.type)} text-white`} flex items-center justify-center shadow-md`}>
              {getFileIcon(file.name, file.type)()}
            </div>
            <div className="min-w-0">
              <h2 title={file.name} className={`font-bold text-sm wrap-break-word ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</h2>
              <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{file.size} • {fmt(file.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Ic.Download /></button>
          </div>
        </div>

        {/* Content */}
        <div className={`relative ${file.type === 'music' ? 'p-8' : ''}`}>
          {/* AUDIO PLAYER */}
          {file.type === 'music' && (
            <div className="flex flex-col items-center">
              <motion.div className="w-48 h-48 rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-2xl mb-8 flex items-center justify-center overflow-hidden" animate={isPlaying ? { scale: [1, 1.03, 1] } : { scale: 1 }} transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}>
                <motion.div animate={isPlaying ? { rotate: 360 } : {}} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="scale-[3] text-white">
                  <Ic.Music />
                </motion.div>
              </motion.div>
              <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</h3>
              <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Audio Track</p>
              <div className="w-full max-w-md mb-6">
                <div ref={progressRef} onClick={handleProgressClick} className={`h-1.5 rounded-full cursor-pointer mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} role="slider" aria-label="Audio progress">
                  <motion.div className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400 relative" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-emerald-500" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 mb-6">
                <button onClick={seekBack} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Ic.SkipBack /></button>
                <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-linear-to-r from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105">
                  {isPlaying ? <Ic.Pause /> : <Ic.Play />}
                </button>
                <button onClick={seekForward} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Ic.SkipForward /></button>
              </div>
              <div className="flex items-center gap-3 w-full max-w-md">
                <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white transition-colors">
                  {isMuted ? <Ic.VolumeX /> : <Ic.Volume />}
                </button>
                <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }} className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-gray-700 accent-emerald-500" />
              </div>
              <audio ref={audioRef} src={file.url || file.preview || ''} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsPlaying(false)} preload="metadata" />
            </div>
          )}

          {/* VIDEO PLAYER */}
          {file.type === 'video' && (
            <div className="relative bg-black rounded-2xl overflow-hidden group">
              <video ref={videoRef} src={file.url || file.preview} className="w-full aspect-video object-contain bg-black" onClick={toggleVideoPlay} onTimeUpdate={handleVideoTimeUpdate} onLoadedMetadata={handleVideoLoadedMetadata} onEnded={() => setVideoPlaying(false)} onError={() => setMediaError(true)} />
              {(!file.url && !file.preview) || mediaError && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white/50 text-sm">Video source unavailable</span>
                 </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div onClick={handleVideoProgressClick} className="h-1 rounded-full cursor-pointer mb-3 bg-white/20 hover:h-1.5 transition-all">
                  <div className="h-full rounded-full bg-emerald-500 relative" style={{ width: videoDuration ? `${(videoTime / videoDuration) * 100}%` : '0%' }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={toggleVideoPlay} className="text-white hover:text-emerald-400 transition-colors">
                      {videoPlaying ? <Ic.Pause /> : <Ic.Play />}
                    </button>
                    <span className="text-white text-xs">{formatTime(videoTime)} / {formatTime(videoDuration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="range" min="0" max="1" step="0.01" value={videoVolume} onChange={(e) => setVideoVolume(parseFloat(e.target.value))} className="w-20 h-1 rounded-full appearance-none cursor-pointer bg-white/20 accent-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IMAGE VIEWER */}
          {file.type === 'image' && (
            <div className="relative bg-black/50 rounded-2xl overflow-hidden flex items-center justify-center" style={{ minHeight: 400 }}>
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button onClick={handleZoomOut} className="p-2 rounded-xl bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"><Ic.ZoomOut /></button>
                <span className="px-2 py-1 rounded-lg bg-black/50 text-white text-xs backdrop-blur-sm">{Math.round(zoom * 100)}%</span>
                <button onClick={handleZoomIn} className="p-2 rounded-xl bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"><Ic.ZoomIn /></button>
              </div>
              <motion.div
                className="cursor-move"
                style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
                onMouseDown={handleImageMouseDown}
                onMouseMove={handleImageMouseMove}
                onMouseUp={handleImageMouseUp}
                onMouseLeave={handleImageMouseUp}
              >
                {mediaError ? (
                  <div className="min-h-80 min-w-80 flex items-center justify-center rounded-lg bg-white/5 border border-white/10">
                    <div className="text-center px-6 py-8">
                      <div className="text-white/80 text-sm font-semibold">Image unavailable</div>
                      <div className="text-white/40 text-xs mt-2">The Telegram URL no longer resolves, but the file record is still in your dashboard.</div>
                    </div>
                  </div>
                ) : (
                  <img src={file.url || file.preview || `https://source.unsplash.com/random/1200x800?${file.name.split('.')[0]}`} onError={() => setMediaError(true)} alt={file.name} className="max-w-full max-h-[60vh] object-contain rounded-lg" draggable={false} />
                )}
              </motion.div>
            </div>
          )}

          {/* DOCUMENT VIEWER */}
          {file.type === 'doc' && (
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden w-full flex items-center justify-center" style={{ minHeight: '60vh' }}>
              {(file.url || file.preview) && file.name.toLowerCase().match(/\.(pdf)$/) ? (
                <object data={file.url || file.preview} type="application/pdf" className="absolute inset-0 w-full h-full border-0 bg-white">
                  <iframe src={file.url || file.preview} className="w-full h-full border-0 bg-white" title="Document Preview" />
                </object>
              ) : (file.url || file.preview) && file.name.toLowerCase().match(/\.(txt|csv)$/) ? (
                <iframe src={file.url || file.preview} className="absolute inset-0 w-full h-full border-0 bg-white" title="Document Preview" />
              ) : (file.url || file.preview) ? (
                <div className="flex justify-center p-8 absolute inset-0 overflow-y-auto bg-gray-50/50">
                  <div className={`w-full max-w-md rounded-2xl overflow-hidden shadow-xl h-fit ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
                    <div className="h-48 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <div className="text-center scale-150">
                        {getFileIcon(file.name, file.type)()}
                        <p className="mt-4 font-bold text-sm text-gray-500">{file.name.split('.').pop().toUpperCase()}</p>
                      </div>
                      <a href={file.url || file.preview} download={file.name} className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors text-sm font-semibold flex items-center gap-2">
                        <Ic.Download /> Download to View
                      </a>
                    </div>
                    <div className="p-6">
                      <h4 className={`font-bold mb-2 break-all ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{file.size}</p>
                      <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-amber-50 text-amber-800'} text-sm`}>
                        <p className="font-semibold mb-1">Preview not natively supported</p>
                        <p className="text-xs opacity-80">Browsers cannot natively preview {file.name.split('.').pop().toUpperCase()} files. Please download the file to view it on your device.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full absolute inset-0">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-linear-to-br ${tGrad(file.type)} text-white flex items-center justify-center shadow-lg mb-4`}>
                      <Ic.FileText />
                    </div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{file.size}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-linear-to-r ${tGrad(file.type)} text-white`}>{file.type}</span>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-400 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all min-w-0">
              <Ic.Download /> Download
            </button>
            <button 
              onClick={() => {
                // SweetAlert2 confirmation for delete
                Swal.fire({
                  title: `Delete "${file.name}"?`,
                  text: 'This will permanently remove the file from your device.',
                  icon: 'warning',
                  iconColor: '#ef4444',
                  showCancelButton: true,
                  confirmButtonColor: '#ef4444',
                  cancelButtonColor: '#6b7280',
                  confirmButtonText: 'Yes, delete it!',
                  cancelButtonText: 'Cancel',
                  reverseButtons: true,
                  customClass: {
                    confirmButton: 'px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105',
                    cancelButton: 'px-6 py-3 rounded-xl font-bold text-gray-300 transition-all hover:scale-105',
                    title: 'text-xl font-bold',
                    text: 'text-gray-300'
                  }
                }).then((result) => {
                  if (result.isConfirmed) {
                    onDelete(file.id);
                    onClose();
                  }
                });
              }} 
              className={`p-2 rounded-xl text-red-500 transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}
            >
              <Ic.Trash />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
