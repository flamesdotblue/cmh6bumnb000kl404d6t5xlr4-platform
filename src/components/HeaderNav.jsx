import { Moon, Sun, Star, BookOpen, Search } from 'lucide-react';

export default function HeaderNav({ actions }) {
  const { theme, setTheme, translation, setTranslation } = actions;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-b border-white/20 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-400/70 to-purple-500/70 shadow-lg shadow-sky-500/10 backdrop-blur-xl border border-white/30"></div>
          <span className="font-semibold tracking-tight">PulseSoul</span>
        </div>

        <nav className="ml-6 hidden md:flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <a href="#daily" className="hover:text-sky-500 flex items-center gap-1"><Star size={16}/>Daily</a>
          <a href="#surah" className="hover:text-sky-500 flex items-center gap-1"><BookOpen size={16}/>Surahs</a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-white/10 backdrop-blur-xl">
            <Search size={16} className="opacity-60"/>
            <span className="text-xs opacity-70">Search available in Surahs</span>
          </div>
          <select
            aria-label="Translation"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="text-sm px-3 py-2 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-white/10 backdrop-blur-xl focus:outline-none"
          >
            <option value="en.asad">English (Asad)</option>
            <option value="en.sahih">English (Sahih Intl)</option>
            <option value="ur.jalandhry">Urdu (Jalandhry)</option>
            <option value="ur.meer">Urdu (Meer)</option>
            <option value="hi.hindi">Hindi</option>
          </select>
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-white/10 backdrop-blur-xl hover:scale-[1.02] transition"
          >
            {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>
      </div>
    </header>
  );
}
