
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Language, Settings, Wallpaper, FitMode } from './types';
import { translations } from './translations';
import { Logo } from './components/Logo';
import { PhonePreview } from './components/PhonePreview';

// Specialized Video Pool for Category-Specific feel
const ASSET_POOLS = {
  cars: [
    'https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-purple-neon-lights-4240-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-set-of-different-colored-neon-lights-4242-large.mp4'
  ],
  nature: [
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-525-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-4001-large.mp4'
  ],
  sea: [
    'https://assets.mixkit.co/videos/preview/mixkit-waves-of-a-blue-ocean-in-the-sunlight-4247-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-pink-and-purple-liquid-4340-large.mp4'
  ],
  cities: [
    'https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-purple-neon-lights-4240-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-set-of-different-colored-neon-lights-4242-large.mp4'
  ],
  cute: [
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-waves-of-colored-ink-in-water-4334-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-pink-and-purple-liquid-4340-large.mp4'
  ],
  animals: [
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-525-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-4001-large.mp4'
  ]
};

const CATEGORIES = [
  { id: 'all', icon: '✨' },
  { id: 'cars', icon: '🏎️' },
  { id: 'nature', icon: '🌿' },
  { id: 'sea', icon: '🌊' },
  { id: 'cities', icon: '🏙️' },
  { id: 'cute', icon: '🧸' },
  { id: 'animals', icon: '🐶' }
];

// GENERATOR: Creating 6,000 specific metadata entries
const generateLibrary = (): Wallpaper[] => {
  const items: Wallpaper[] = [];
  const itemsPerCategory = 1000;

  CATEGORIES.slice(1).forEach((cat) => {
    const pool = ASSET_POOLS[cat.id as keyof typeof ASSET_POOLS] || ASSET_POOLS.nature;
    for (let i = 1; i <= itemsPerCategory; i++) {
      const videoUrl = pool[i % pool.length];
      const id = `${cat.id}-${i}`;
      items.push({
        id,
        url: videoUrl,
        thumbnail: `https://picsum.photos/seed/${id}/400/600`,
        title: `${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)} #${i}`,
        tags: [cat.id, 'premium', '4k', 'ultra-hd', i % 10 === 0 ? 'exclusive' : 'popular'],
        isLocal: false
      });
    }
  });
  return items;
};

const MASSIVE_LIBRARY = generateLibrary();

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('lumina_settings');
    return saved ? JSON.parse(saved) : {
      language: Language.EN,
      muted: true,
      fitMode: 'cover' as FitMode,
      activeWallpaperId: 'nature-1'
    };
  });

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    const saved = localStorage.getItem('lumina_wallpapers');
    const loaded = saved ? JSON.parse(saved) : [];
    return [...MASSIVE_LIBRARY, ...loaded.map((w: any) => ({ ...w, tags: w.tags || [] }))];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewing, setPreviewing] = useState<Wallpaper | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[settings.language];

  useEffect(() => {
    localStorage.setItem('lumina_settings', JSON.stringify(settings));
  }, [settings]);

  const handleLanguageChange = (lang: Language) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newWallpaper: Wallpaper = {
        id: `local-${Date.now()}`,
        url,
        thumbnail: 'https://picsum.photos/seed/' + Math.random() + '/400/600',
        title: file.name.split('.')[0],
        tags: ['local', 'custom', file.name.toLowerCase()],
        isLocal: true
      };
      const updated = [newWallpaper, ...wallpapers];
      setWallpapers(updated);
      
      const localsOnly = updated.filter(w => w.isLocal);
      localStorage.setItem('lumina_wallpapers', JSON.stringify(localsOnly));
      
      setPreviewing(newWallpaper);
    }
  };

  const filteredWallpapers = useMemo(() => {
    let result = wallpapers;
    
    if (activeCategory !== 'all') {
      result = result.filter(wp => wp.tags.includes(activeCategory));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(wp => 
        wp.title.toLowerCase().includes(query) || 
        wp.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [wallpapers, searchQuery, activeCategory]);

  const currentWallpaper = wallpapers.find(w => w.id === settings.activeWallpaperId) || wallpapers[0];

  return (
    <div className="min-h-screen bg-black text-white pb-20 selection:bg-purple-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <Logo className="w-10 h-10 md:w-12 md:h-12" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent hidden sm:block">
              {t.appName}
            </h1>
          </div>

          <div className="flex-1 max-w-xl relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-purple-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 ring-purple-500/50 focus:bg-neutral-900 border-neutral-700 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select 
              value={settings.language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 ring-purple-500/50 outline-none transition-all cursor-pointer"
            >
              <option value={Language.EN}>EN</option>
              <option value={Language.PT}>PT</option>
              <option value={Language.ES}>ES</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        {/* Hero Section */}
        {!searchQuery && activeCategory === 'all' && (
          <section className="mb-16 grid md:grid-cols-2 gap-12 items-center animate-in slide-in-from-top-4 fade-in duration-700">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                {wallpapers.length.toLocaleString()} {t.totalItems}
              </div>
              <h2 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tighter">
                {t.heroTitle}
              </h2>
              <p className="text-xl text-neutral-400 max-w-lg">
                {t.heroSubtitle}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-purple-600/30 active:scale-95 flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {t.selectVideo}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/*" className="hidden" />
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <PhonePreview videoUrl={currentWallpaper.url} fitMode={settings.fitMode} muted={settings.muted} />
            </div>
          </section>
        )}

        {/* Category Selector */}
        <div className="sticky top-24 z-40 bg-black/50 backdrop-blur-md py-4 -mx-6 px-6 mb-8 scrollbar-hide overflow-x-auto">
          <div className="flex gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap border transition-all ${
                  activeCategory === cat.id 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20' 
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.id === 'all' ? t.allCategories : cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Collection Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
              {t.myWallpapers}
              <span className="text-neutral-600 text-lg">({filteredWallpapers.length})</span>
            </h3>
            {(searchQuery || activeCategory !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-purple-500 hover:text-purple-400 transition-colors text-sm font-bold uppercase tracking-widest"
              >
                Reset
              </button>
            )}
          </div>

          {filteredWallpapers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredWallpapers.map((wp) => (
                <div 
                  key={wp.id} 
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
                  className={`group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden cursor-pointer border-2 transition-all duration-500 ${
                    settings.activeWallpaperId === wp.id ? 'border-purple-500' : 'border-neutral-900 hover:border-neutral-700'
                  }`}
                  onClick={() => setPreviewing(wp)}
                >
                  <img 
                    src={wp.thumbnail} 
                    loading="lazy"
                    alt={wp.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                    <p className="font-bold text-lg leading-tight mb-2">{wp.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {wp.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-wider bg-purple-500/40 text-white px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  {settings.activeWallpaperId === wp.id && (
                    <div className="absolute top-5 right-5 bg-purple-600 rounded-full p-2.5 shadow-2xl border-2 border-white/20">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center space-y-6 bg-neutral-900/10 rounded-[3rem] border-2 border-dashed border-neutral-900">
              <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mx-auto text-neutral-700">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-neutral-400">
                  {t.noResults}
                </p>
                <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="text-purple-500 font-bold hover:underline">
                  Show all wallpapers
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Settings Panel */}
        <section className="bg-neutral-900/40 border border-white/5 rounded-[3rem] p-8 md:p-12 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-extrabold">{t.settings}</h3>
            <Logo className="w-8 h-8 opacity-50" />
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <label className="text-xs font-bold text-neutral-500 block uppercase tracking-[0.2em]">{t.audio}</label>
              <div className="flex items-center justify-between p-5 bg-black/60 rounded-[1.5rem] border border-white/5">
                <span className="font-bold text-lg">{settings.muted ? 'Off' : 'On'}</span>
                <button 
                  onClick={() => setSettings(s => ({ ...s, muted: !s.muted }))}
                  className={`w-14 h-8 rounded-full transition-all duration-300 relative ${settings.muted ? 'bg-neutral-700' : 'bg-purple-600'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.muted ? 'left-1' : 'left-7'}`}></div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-neutral-500 block uppercase tracking-[0.2em]">{t.fitMode}</label>
              <div className="flex bg-black/60 p-1.5 rounded-[1.5rem] border border-white/5">
                {(['cover', 'contain', 'fill'] as FitMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSettings(s => ({ ...s, fitMode: mode }))}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                      settings.fitMode === mode ? 'bg-purple-600 text-white shadow-xl' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {t[mode as keyof typeof t] || mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-neutral-500 block uppercase tracking-[0.2em]">{t.language}</label>
              <div className="grid grid-cols-3 gap-3">
                {[Language.EN, Language.PT, Language.ES].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`py-4 rounded-xl border-2 transition-all duration-300 font-black text-sm ${
                      settings.language === lang 
                      ? 'bg-purple-600/10 border-purple-600 text-purple-400' 
                      : 'bg-black/60 border-transparent text-neutral-500 hover:border-neutral-800'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Preview Modal */}
      {previewing && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-16">
            <div className="scale-90 md:scale-100 transition-transform">
              <PhonePreview videoUrl={previewing.url} fitMode={settings.fitMode} muted={settings.muted} />
            </div>
            
            <div className="flex-1 space-y-10 w-full">
              <div className="space-y-4">
                <div className="flex gap-2">
                  {previewing.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-black uppercase tracking-[0.2em] bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg border border-purple-500/30">
                      {tag}
                    </span>
                  ))}
                </div>
                <h4 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{previewing.title}</h4>
                <p className="text-neutral-500 text-xl font-medium">{t.preview}</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setSettings(s => ({ ...s, activeWallpaperId: previewing.id }));
                    setPreviewing(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white rounded-3xl font-black text-2xl transition-all shadow-2xl shadow-purple-600/40 active:scale-95 flex items-center justify-center gap-4"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {t.setAsWallpaper}
                </button>
                
                <button 
                  onClick={() => setPreviewing(null)}
                  className="w-full py-6 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 rounded-3xl font-black text-2xl transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          
          <button onClick={() => setPreviewing(null)} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="mt-32 border-t border-white/5 py-20 px-6 bg-gradient-to-b from-transparent to-purple-950/10">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          <Logo className="w-20 h-20" />
          <div className="flex gap-8 text-neutral-600 font-black text-xs uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-purple-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-500 transition-colors">Support</a>
          </div>
          <p className="text-neutral-500 font-bold text-center max-w-lg leading-relaxed">
            {t.about}
          </p>
          <div className="text-neutral-800 text-sm font-bold tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Lumina Global Studio • v3.0.0 (6,000+ Wallpapers)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
