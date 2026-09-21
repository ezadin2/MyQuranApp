"use client";

/** Web: localStorage. Native (Capacitor): Preferences (SharedPreferences / UserDefaults). */
async function isNativePlatform(): Promise<boolean> {
  const { Capacitor } = await import("@capacitor/core");
  return Capacitor.isNativePlatform();
}

export async function storageGet(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (await isNativePlatform()) {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key });
    return value;
  }

  return localStorage.getItem(key);
}

export async function storageSet(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return;

  if (await isNativePlatform()) {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key, value });
    return;
  }

  localStorage.setItem(key, value);
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await storageGet(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await storageSet(key, JSON.stringify(value));
}

const KEYS = {
  bookmarks: "qurany:bookmarks",
  favoriteChapters: "qurany:favorite-chapters",
  readingTime: "qurany:reading-time",
  readingGoal: "qurany:reading-goal",
} as const;

export type VerseBookmark = { chapterId: number; verseId: number };
export type ChapterFavorite = { chapterId: number };
export type DailyReadingEntry = { date: string; readingTime: number };

function todayDateKey(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export async function getBookmarkVerses(): Promise<VerseBookmark[]> {
  return readJson(KEYS.bookmarks, []);
}

export async function toggleBookmarkVerse(chapterId: number, verseId: number): Promise<VerseBookmark[]> {
  const list = await getBookmarkVerses();
  const index = list.findIndex((b) => b.chapterId === chapterId && b.verseId === verseId);
  const next =
    index === -1 ? [...list, { chapterId, verseId }] : list.filter((_, i) => i !== index);
  await writeJson(KEYS.bookmarks, next);
  return next;
}

export async function getFavoriteChapters(): Promise<ChapterFavorite[]> {
  return readJson(KEYS.favoriteChapters, []);
}

export async function toggleFavoriteChapter(chapterId: number): Promise<ChapterFavorite[]> {
  const list = await getFavoriteChapters();
  const exists = list.some((c) => c.chapterId === chapterId);
  const next = exists ? list.filter((c) => c.chapterId !== chapterId) : [...list, { chapterId }];
  await writeJson(KEYS.favoriteChapters, next);
  return next;
}

export async function getReadingTimeEntries(): Promise<DailyReadingEntry[]> {
  const entries = await readJson<DailyReadingEntry[]>(KEYS.readingTime, []);
  return entries
    .map((e) => ({ date: e.date, readingTime: e.readingTime }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);
}

export async function addReadingTimeMs(timeMs: number): Promise<void> {
  const entries = await readJson<DailyReadingEntry[]>(KEYS.readingTime, []);
  const today = todayDateKey();
  const index = entries.findIndex((e) => e.date.slice(0, 10) === today);
  if (index === -1) {
    entries.push({ date: today, readingTime: timeMs });
  } else {
    entries[index] = { ...entries[index], readingTime: entries[index].readingTime + timeMs };
  }
  await writeJson(KEYS.readingTime, entries);
}

export async function getDailyReadingGoal(): Promise<{ dailyReadingGoal: number }> {
  const goal = await readJson<{ dailyReadingGoal: number }>(KEYS.readingGoal, { dailyReadingGoal: 30 });
  return { dailyReadingGoal: goal.dailyReadingGoal ?? 30 };
}

export async function setDailyReadingGoal(readingGoal: number): Promise<void> {
  await writeJson(KEYS.readingGoal, { dailyReadingGoal: readingGoal });
}
