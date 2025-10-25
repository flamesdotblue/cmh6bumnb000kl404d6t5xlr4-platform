import { useEffect, useMemo, useState } from 'react';
import HeaderNav from './components/HeaderNav';
import HeroSpline from './components/HeroSpline';
import DailyVerse from './components/DailyVerse';
import SurahExplorer from './components/SurahExplorer';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [translation, setTranslation] = useState(() => localStorage.getItem('translation') || 'en.asad');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('translation', translation);
  }, [translation]);

  const actions = useMemo(() => ({ theme, setTheme, translation, setTranslation }), [theme, translation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100">
      <HeaderNav actions={actions} />
      <section className="relative h-[60vh] w-full">
        <HeroSpline />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-slate-900/10 to-slate-950/70 dark:via-slate-900/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-3xl mx-auto text-center px-6">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight drop-shadow-lg">
              PulseSoul
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-100/90 dark:text-slate-200/90">
              A modern, calming Quran experience with glassmorphism, flashcards, audio, bookmarks, and progress.
            </p>
          </div>
        </div>
      </section>

      <main className="relative -mt-16 md:-mt-24 z-10 px-4 pb-24">
        <div className="max-w-6xl mx-auto grid gap-6">
          <DailyVerse translation={translation} />
          <SurahExplorer translation={translation} />
        </div>
      </main>
    </div>
  );
}
