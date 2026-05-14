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
export const getFileIcon = (filename, defaultType) => {
  const ext = filename?.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return Ic.Pdf || Ic.Doc;
  if (ext === "doc" || ext === "docx") return Ic.Word || Ic.Doc;
  if (ext === "xls" || ext === "xlsx" || ext === "csv") return Ic.Excel || Ic.Doc;
  if (ext === "ppt" || ext === "pptx") return Ic.Ppt || Ic.Doc;
  if (ext === "mp3" || ext === "wav" || ext === "ogg" || ext === "m4a") return Ic.Music || Ic.Doc;
  if (ext === "mp4" || ext === "avi" || ext === "mkv" || ext === "webm") return Ic.Video || Ic.Doc;
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif" || ext === "webp") return Ic.Image || Ic.Doc;
  return tIcon(defaultType);
};
