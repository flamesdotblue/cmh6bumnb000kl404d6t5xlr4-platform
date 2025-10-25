import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Volume2 } from 'lucide-react';
import { getRandomAyahWithEditions } from '../lib/api';
import useLocalStorage from '../hooks/useLocalStorage';

export default function DailyVerse({ translation }) {
  const [loading, setLoading] = useState(true);
  const [ayah, setAyah] = useState(null);
  const [error, setError] = useState('');
  const [bookmarks, setBookmarks] = useLocalStorage('ps_bookmarks', []);

  const isBookmarked = useMemo(() => {
    if (!ayah) return false;
    return bookmarks.some(b => b.key === ayah.key);
  }, [bookmarks, ayah]);

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0,10);
    const cacheKey = `ps_daily_${todayKey}_${translation}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAyah(JSON.parse(cached));
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getRandomAyahWithEditions(translation);
        if (active) {
          setAyah(data);
          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
      } catch (e) {
        setError('Failed to load daily verse');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [translation]);

  const toggleBookmark = () => {
    if (!ayah) return;
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(b => b.key !== ayah.key));
    } else {
      setBookmarks([{ key: ayah.key, arabic: ayah.arabic, translation: ayah.translation, surah: ayah.surah, numberInSurah: ayah.numberInSurah }, ...bookmarks].slice(0,200));
    }
  };

  const playAudio = () => {
    if (!ayah?.audio) return;
    const a = new Audio(ayah.audio);
    a.play().catch(() => {});
  };

  return (
    <section id="daily" className="grid">
      <div className="rounded-3xl bg-white/30 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-xl shadow-sky-900/10 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Daily Verse</h2>
            {loading && <p className="opacity-70">Loading...</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {ayah && (
              <div>
                <div className="text-2xl md:text-3xl leading-loose font-[500] tracking-wide text-slate-900 dark:text-slate-100">
                  {ayah.arabic}
                </div>
                <div className="mt-3 text-sm md:text-base text-slate-700 dark:text-slate-300">
                  {ayah.translation}
                </div>
                <div className="mt-3 text-xs opacity-70">{ayah.surah} • Ayah {ayah.numberInSurah} • {ayah.key}</div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={playAudio} title="Play audio" className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 hover:scale-105 transition" aria-label="Play audio">
              <Volume2 size={18} />
            </button>
            <button onClick={toggleBookmark} title="Bookmark" className={`p-2 rounded-xl border hover:scale-105 transition ${isBookmarked ? 'bg-yellow-400/70 border-yellow-300 text-black' : 'bg-white/50 dark:bg-slate-800/60 border-white/30 dark:border-white/10'}`} aria-label="Bookmark">
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
