import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, ChevronLeft, Star, Headphones, Eye, EyeOff, Search, BookOpen } from 'lucide-react';
import { getAllSurahs, getSurahWithEditions } from '../lib/api';
import useLocalStorage from '../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';

export default function SurahExplorer({ translation }) {
  const [surahs, setSurahs] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [surahData, setSurahData] = useState(null);
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [progress, setProgress] = useLocalStorage('ps_progress', {});
  const [favorites, setFavorites] = useLocalStorage('ps_favorites', []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await getAllSurahs();
        if (active) setSurahs(s);
      } catch {
        setError('Failed to load Surahs');
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setReveal(false);
        const data = await getSurahWithEditions(selected.number, translation);
        if (active) {
          setSurahData(data);
          const savedIdx = progress?.[selected.number]?.index || 0;
          setIndex(savedIdx < data.ayahs.length ? savedIdx : 0);
        }
      } catch (e) {
        setError('Failed to load Surah content');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selected, translation]);

  useEffect(() => {
    if (!selected || !surahData) return;
    setProgress({ ...progress, [selected.number]: { index, total: surahData.ayahs.length } });
  }, [index, selected, surahData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(s => s.englishName.toLowerCase().includes(q) || String(s.number).includes(q));
  }, [surahs, query]);

  const curAyah = surahData?.ayahs?.[index];

  const isFav = useMemo(() => {
    if (!curAyah) return false;
    return favorites.some(f => f.key === curAyah.key);
  }, [favorites, curAyah]);

  const toggleFav = () => {
    if (!curAyah) return;
    if (isFav) {
      setFavorites(favorites.filter(f => f.key !== curAyah.key));
    } else {
      setFavorites([{ key: curAyah.key, arabic: curAyah.arabic, translation: curAyah.translation, surah: selected.englishName, numberInSurah: curAyah.numberInSurah }, ...favorites].slice(0,500));
    }
  };

  const onDragEnd = (event, info) => {
    const offset = info.offset.x;
    if (offset < -80) next();
    if (offset > 80) prev();
  };

  const next = () => setIndex((i) => Math.min(i + 1, (surahData?.ayahs?.length || 1) - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  const play = () => {
    if (!curAyah?.audio) return;
    const a = new Audio(curAyah.audio);
    a.play().catch(() => {});
  };

  const progressPct = useMemo(() => {
    if (!surahData?.ayahs?.length) return 0;
    return Math.round(((index + 1) / surahData.ayahs.length) * 100);
  }, [index, surahData]);

  return (
    <section id="surah" className="grid gap-6">
      <div className="rounded-3xl bg-white/30 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-xl shadow-sky-900/10 p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2"><BookOpen size={20}/> Surah Explorer</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-white/10">
              <Search size={16} className="opacity-60"/>
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search Surah name or number" className="bg-transparent outline-none text-sm placeholder:opacity-60"/>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <button key={s.number} onClick={() => setSelected(s)} className="text-left rounded-2xl p-4 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-white/10 hover:scale-[1.01] transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-60">{s.revelationType}</div>
                  <div className="font-semibold">{s.englishName} <span className="opacity-60">({s.name})</span></div>
                </div>
                <div className="text-xs opacity-70">Ayahs: {s.numberOfAyahs}</div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-900/10 dark:bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-purple-500" style={{ width: `${Math.round(((progress?.[s.number]?.index || 0) / (s.numberOfAyahs || 1)) * 100)}%` }}></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} transition={{type:'spring', stiffness:120, damping:20}} className="rounded-3xl bg-white/30 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-xl shadow-sky-900/10 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm opacity-70">Surah {selected.number} • {selected.revelationType}</div>
                <h3 className="text-2xl font-semibold">{selected.englishName} <span className="opacity-70">({selected.name})</span></h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setReveal(r=>!r)} className="px-3 py-2 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 text-sm flex items-center gap-2" aria-label="Toggle reveal translation">
                  {reveal ? <EyeOff size={16}/> : <Eye size={16}/>} {reveal? 'Hide':'Reveal'} Translation
                </button>
                <button onClick={()=>setSelected(null)} className="px-3 py-2 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 text-sm">Close</button>
              </div>
            </div>

            <div className="mt-4">
              {loading && <p className="opacity-70">Loading Surah...</p>}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {surahData && (
                <div>
                  <div className="flex items-center justify-between text-xs opacity-70">
                    <span>Ayah {index + 1} of {surahData.ayahs.length}</span>
                    <span>{Math.round(((index + 1) / surahData.ayahs.length) * 100)}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-900/10 dark:bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-purple-500" style={{ width: `${progressPct}%` }}></div>
                  </div>

                  <div className="mt-4 relative">
                    <motion.div key={index} drag="x" dragConstraints={{left:0,right:0}} onDragEnd={onDragEnd} className="rounded-3xl p-6 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 shadow-lg">
                      <div className="text-2xl md:text-3xl leading-loose">
                        {surahData.ayahs[index].arabic}
                      </div>
                      {reveal && (
                        <div className="mt-3 text-sm md:text-base opacity-90">
                          {surahData.ayahs[index].translation}
                        </div>
                      )}
                      <div className="mt-3 text-xs opacity-70">{surahData.englishName} — Ayah {surahData.ayahs[index].numberInSurah} • {surahData.ayahs[index].key}</div>
                      <div className="mt-4 flex items-center gap-2">
                        <button onClick={prev} className="px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-white/30 dark:border-white/10"><ChevronLeft size={16}/></button>
                        <button onClick={play} className="px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-white/30 dark:border-white/10"><Headphones size={16}/></button>
                        <button onClick={()=>toggleFav()} className={`px-3 py-2 rounded-xl border ${isFav? 'bg-yellow-400/80 text-black border-yellow-300' : 'bg-white/70 dark:bg-slate-900/50 border-white/30 dark:border-white/10'}`}><Star size={16}/></button>
                        <button onClick={next} className="px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-white/30 dark:border-white/10"><ChevronRight size={16}/></button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
