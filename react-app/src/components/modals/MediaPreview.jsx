import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Ic } from '../../icons';
import { tGrad, tIcon, fmt, formatTime } from '../../utils';

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

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setVideoPlaying(false);
    setVideoTime(0);
    setVideoDuration(0);
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
        onClick={(e) => e.stopPropagation()} className={`w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tGrad(file.type)} text-white flex items-center justify-center shadow-md`}>
              {tIcon(file.type)()}
            </div>
            <div>
              <h2 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</h2>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{file.size} • {fmt(file.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Ic.Download /></button>
            <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Ic.X /></button>
          </div>
        </div>

        {/* Content */}
        <div className={`relative ${file.type === 'music' ? 'p-8' : ''}`}>
          {/* AUDIO PLAYER */}
          {file.type === 'music' && (
            <div className="flex flex-col items-center">
              <motion.div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl mb-8 flex items-center justify-center overflow-hidden" animate={isPlaying ? { scale: [1, 1.03, 1] } : { scale: 1 }} transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}>
                <motion.div animate={isPlaying ? { rotate: 360 } : {}} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                  <Ic.Music />
                </motion.div>
              </motion.div>
              <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</h3>
              <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Audio Track</p>
              <div className="w-full max-w-md mb-6">
                <div ref={progressRef} onClick={handleProgressClick} className={`h-1.5 rounded-full cursor-pointer mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} role="slider" aria-label="Audio progress">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 relative" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}>
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
                <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105">
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
              <audio ref={audioRef} src={file.preview || ''} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsPlaying(false)} preload="metadata" />
            </div>
          )}

          {/* VIDEO PLAYER */}
          {file.type === 'video' && (
            <div className="relative bg-black rounded-2xl overflow-hidden">
              <video ref={videoRef} src={file.preview} className="w-full aspect-video object-contain bg-black" onClick={toggleVideoPlay} onTimeUpdate={handleVideoTimeUpdate} onLoadedMetadata={handleVideoLoadedMetadata} onEnded={() => setVideoPlaying(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
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
                <img src={file.preview} alt={file.name} className="max-w-full max-h-[60vh] object-contain rounded-lg" draggable={false} />
              </motion.div>
            </div>
          )}

          {/* DOCUMENT VIEWER */}
          {file.type === 'doc' && (
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden" style={{ minHeight: 400 }}>
              {file.preview ? (
                <div className="flex items-center justify-center p-8">
                  <div className={`w-full max-w-md rounded-2xl overflow-hidden shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Ic.FileText />
                        <p className="mt-2 font-bold text-lg">{file.name.split('.').pop().toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{file.size}</p>
                      <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Document preview available</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`w-2 h-2 rounded-full bg-emerald-500`} />
                          <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Ready to view</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${tGrad(file.type)} text-white flex items-center justify-center shadow-lg mb-4`}>
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
        <div className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${tGrad(file.type)} text-white`}>{file.type}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
              <Ic.Download /> Download
            </button>
            <button onClick={() => { onDelete(file.id); onClose(); }} className={`p-2 rounded-xl text-red-500 transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`}><Ic.Trash /></button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
