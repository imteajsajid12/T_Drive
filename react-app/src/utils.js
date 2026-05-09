import { Ic } from './icons';

export const tGrad = (type) => {
  const m = { image: 'from-emerald-400 to-teal-500', video: 'from-green-500 to-emerald-600', music: 'from-teal-400 to-green-500', doc: 'from-emerald-500 to-green-600' };
  return m[type] || 'from-gray-400 to-gray-500';
};

export const tIcon = (type) => {
  const m = { image: Ic.Image, video: Ic.Video, music: Ic.Music, doc: Ic.Doc };
  return m[type] || Ic.Doc;
};

export const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const formatTime = (s) => { 
  if (isNaN(s)) return '0:00'; 
  const m = Math.floor(s / 60); 
  const sec = Math.floor(s % 60); 
  return `${m}:${sec < 10 ? '0' : ''}${sec}`; 
};