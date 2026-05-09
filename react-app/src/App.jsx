import React, { useState, useEffect } from 'react';
import { ThemeContext } from './contexts';
import { initialFiles } from './data';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobNav } from './components/layout/MobNav';
import { UploadModal } from './components/modals/UploadModal';
import { MediaPreview } from './components/modals/MediaPreview';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { Dashboard } from './components/pages/Dashboard';
import { LoginPage } from './components/pages/LoginPage';
import { BackgroundBlobs } from './components/ui/Utils';

export default function App() {
  const [auth, setAuth] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mob, setMob] = useState(false);
  const [cat, setCat] = useState('home');
  const [q, setQ] = useState('');
  const [files, setFiles] = useState(initialFiles);
  const [upOpen, setUpOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  const handleUpload = (newFile) => {
    setFiles([newFile, ...files]);
  };

  const handleDelete = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  // ----------------------------------------------------
  // RENDER APP Content
  // ----------------------------------------------------
  if (!auth) return <LoginPage isDark={isDark} onLogin={() => setAuth(true)} />;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <div className={`flex h-screen overflow-hidden transition-colors duration-500 font-sans ${isDark ? 'bg-[#0f172a] text-white selection:bg-emerald-500/30' : 'bg-[#f4f7f6] text-gray-900 selection:bg-emerald-200'}`}>
        
        {/* Background Decorative Blobs */}
        <BackgroundBlobs isDark={isDark} />

        {/* Sidebar Component */}
        <Sidebar 
          cat={cat} 
          setCat={setCat} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          isDark={isDark} 
          mob={mob} 
          setMob={setMob} 
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full h-full pb-16 md:pb-0 overflow-hidden">
          
          {/* Top Navbar */}
          <Navbar 
            isDark={isDark} 
            toggle={() => setIsDark(!isDark)} 
            onMenu={() => setMob(true)} 
            onUp={() => setUpOpen(true)} 
            q={q} 
            setQ={setQ} 
            user={{ name: 'Alex Morgan', email: 'alex@example.com' }} 
            onLogout={() => setAuth(false)} 
          />

          {/* Page Routing/Content */}
          <div className="flex-1 overflow-y-auto w-full h-full pb-8 scroll-smooth" id="scroll-container">
            {cat === 'analytics' ? (
              <AnalyticsPage isDark={isDark} />
            ) : cat === 'settings' ? (
              <SettingsPage isDark={isDark} />
            ) : (
              <Dashboard 
                isDark={isDark} 
                files={files} 
                setFiles={setFiles} 
                cat={cat} 
                q={q} 
                openPreview={(f) => setPreview(f)} 
              />
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobNav 
          cat={cat} 
          setCat={setCat} 
          onUp={() => setUpOpen(true)} 
          isDark={isDark} 
        />

        {/* Modals */}
        <UploadModal 
          open={upOpen} 
          close={() => setUpOpen(false)} 
          isDark={isDark} 
          onUpload={handleUpload} 
        />
        <MediaPreview 
          file={preview} 
          isOpen={!!preview} 
          onClose={() => setPreview(null)} 
          isDark={isDark} 
          onDelete={handleDelete} 
        />

      </div>
    </ThemeContext.Provider>
  );
}
