const BASE = 'https://api.alquran.cloud/v1';

export async function getAllSurahs() {
  const res = await fetch(`${BASE}/surah`);
  if (!res.ok) throw new Error('Surahs fetch failed');
  const json = await res.json();
  return json.data.map(s => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    revelationType: s.revelationType,
    numberOfAyahs: s.numberOfAyahs,
  }));
}

export async function getSurahWithEditions(surahNumber, translationCode = 'en.asad') {
  const editions = `quran-uthmani,${translationCode},audio/ar.alafasy`;
  const res = await fetch(`${BASE}/surah/${surahNumber}/editions/${editions}`);
  if (!res.ok) throw new Error('Surah editions fetch failed');
  const json = await res.json();
  const [ar, tr, au] = json.data;
  const ayahs = ar.ayahs.map((a, idx) => ({
    arabic: a.text,
    translation: tr?.ayahs?.[idx]?.text || '',
    audio: au?.ayahs?.[idx]?.audio || '',
    numberInSurah: a.numberInSurah,
    key: `${ar.englishName}:${a.numberInSurah}`,
  }));
  return {
    englishName: ar.englishName,
    name: ar.name,
    ayahs,
  };
}

export async function getRandomAyahWithEditions(translationCode = 'en.asad') {
  const r = await fetch(`${BASE}/ayah/random`);
  if (!r.ok) throw new Error('Random ayah failed');
  const rj = await r.json();
  const globalNumber = rj.data.number; // e.g., 1..6236
  const res = await fetch(`${BASE}/ayah/${globalNumber}/editions/quran-uthmani,${translationCode},audio/ar.alafasy`);
  if (!res.ok) throw new Error('Ayah editions failed');
  const json = await res.json();
  const [ar, tr, au] = json.data;
  return {
    arabic: ar.text,
    translation: tr?.text || '',
    audio: au?.audio || '',
    surah: ar.surah?.englishName || 'Surah',
    numberInSurah: ar.numberInSurah,
    key: `${ar.surah?.englishName}:${ar.numberInSurah}`,
  };
}
