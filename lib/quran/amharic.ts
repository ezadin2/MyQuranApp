import { AMHARIC_QURAN_API_URL, QURAN_JSON_API_URL } from "@/constants";
import { Chapter } from "@/types";

type AmharicChapterResponse = {
  chapter: { chapter: number; verse: number; text: string }[];
};

export async function fetchAmharicChapter(id: string): Promise<Chapter> {
  const [baseRes, amRes] = await Promise.all([
    fetch(`${QURAN_JSON_API_URL}/chapters/en/${id}.json`),
    fetch(`${AMHARIC_QURAN_API_URL}/${id}.json`),
  ]);

  if (!baseRes.ok) {
    throw new Error(`Failed to fetch chapter ${id}`);
  }

  if (!amRes.ok) {
    throw new Error(`Failed to fetch Amharic translation for chapter ${id}`);
  }

  const base = (await baseRes.json()) as Chapter;
  const am = (await amRes.json()) as AmharicChapterResponse;
  const amMap = new Map(am.chapter.map((verse) => [verse.verse, verse.text]));

  return {
    ...base,
    verses: base.verses.map((verse) => ({
      ...verse,
      translation: amMap.get(verse.id) ?? verse.translation,
    })),
  };
}

export async function fetchAmharicVerseTranslation(chapterId: number, verseId: number): Promise<string | undefined> {
  const res = await fetch(`${AMHARIC_QURAN_API_URL}/${chapterId}.json`);

  if (!res.ok) {
    return undefined;
  }

  const am = (await res.json()) as AmharicChapterResponse;
  return am.chapter.find((verse) => verse.verse === verseId)?.text;
}
